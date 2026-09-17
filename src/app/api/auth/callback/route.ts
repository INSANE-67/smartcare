import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDashboardPath } from "@/lib/dal/auth";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (next && next !== "/dashboard") {
        return NextResponse.redirect(new URL(next, origin));
      }

      // Query profile to determine authoritative role path
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = (await supabase
          .from("profiles")
          .select("id, role")
          .eq("id", user.id)
          .maybeSingle()) as {
          data: { id: string; role: import("@/types").UserRole } | null;
        };

        if (profile) {
          let is_verified = true;
          if (profile.role === "doctor") {
            const { data: doc } = await supabase
              .from("doctors")
              .select("is_verified, verification_status")
              .eq("profile_id", profile.id)
              .maybeSingle();

            if (doc) {
              is_verified = doc.is_verified === true || doc.verification_status === "approved";
            } else {
              is_verified = user.user_metadata?.is_verified === true;
            }
          }

          return NextResponse.redirect(
            new URL(getDashboardPath(profile.role, is_verified), origin)
          );
        }
      }

      return NextResponse.redirect(new URL("/patient", origin));
    }

    // Exchange failed — redirect to login with error
    return NextResponse.redirect(
      new URL("/login?error=auth-callback-failed", origin)
    );
  }

  // No code present — malformed callback
  return NextResponse.redirect(new URL("/login?error=missing-auth-code", origin));
}
