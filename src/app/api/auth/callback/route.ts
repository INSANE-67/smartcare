import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Auth callback route for Supabase email confirmation and OAuth flows.
 *
 * Supabase redirects here after:
 *   - Email confirmation (magic link / email OTP)
 *   - OAuth provider callback (Google, GitHub, etc.)
 *
 * The `code` query param is a PKCE auth code that must be exchanged for a
 * session via exchangeCodeForSession(). On success, the session cookies are
 * set and the user is redirected to their dashboard.
 *
 * Reference: https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  // `next` can be set by our login action to preserve the intended destination
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Session is now set in cookies — redirect to dashboard (role redirect happens there)
      return NextResponse.redirect(new URL(next, origin));
    }

    // Exchange failed — redirect to login with error
    return NextResponse.redirect(
      new URL("/login?error=auth-callback-failed", origin)
    );
  }

  // No code present — malformed callback
  return NextResponse.redirect(new URL("/login?error=missing-auth-code", origin));
}
