/**
 * Supabase Proxy Client
 *
 * Used EXCLUSIVELY in proxy.ts (Next.js 16's renamed middleware).
 *
 * proxy.ts runs in a different execution context from Server Components:
 *   - It receives a NextRequest object (not next/headers)
 *   - It must return a NextResponse to forward cookies to the browser
 *   - It cannot use the server client (which depends on next/headers)
 *
 * This client reads the auth session from the incoming request cookies
 * and forwards any refreshed tokens in the outgoing response.
 *
 * IMPORTANT: Only perform optimistic checks here (cookie reads).
 * Do NOT make database calls in proxy.ts — that would run on every
 * request and cause severe performance issues.
 *
 * The authoritative auth check happens in (dashboard)/layout.tsx.
 */
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database";

export function createSupabaseProxyClient(request: NextRequest) {
  // Start with a pass-through response — proxy.ts will modify this
  // or replace it with a redirect if needed.
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Forward refreshed session cookies on both the request and response
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  return { supabase, response };
}
