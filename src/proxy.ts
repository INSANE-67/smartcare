/**
 * SmartCare — Proxy (Next.js 16)
 *
 * Replaces middleware.ts. Handles:
 *   1. Session token refresh  — keeps Supabase session cookies fresh
 *   2. Unauthenticated guard — redirect to /login for protected routes
 *   3. Authenticated guard  — redirect logged-in users away from auth pages
 *
 * IMPORTANT: This file performs only OPTIMISTIC checks using the session
 * cookie. The authoritative auth check (DB round-trip via getUser()) happens
 * in (dashboard)/layout.tsx via the DAL. Never rely on proxy alone for
 * security decisions — always verify inside Server Components and Server Actions.
 *
 * DO NOT make database calls here. Proxy runs on every request and must be fast.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseProxyClient } from "@/lib/supabase/proxy-client";

// Auth pages — redirect to /dashboard if already authenticated
const AUTH_PATHS = new Set(["/login", "/signup", "/forgot-password"]);

// Protected path prefixes — redirect to /login if not authenticated
const PROTECTED_PREFIXES = ["/patient", "/doctor", "/admin", "/dashboard"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function proxy(request: NextRequest) {
  const { supabase, response } = createSupabaseProxyClient(request);

  // Refresh the session — this updates response cookies if the token was rotated.
  // Using getSession() (cookie-only, no network) for proxy performance.
  // The authoritative getUser() call happens in (dashboard)/layout.tsx.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;
  const isAuthenticated = !!session;

  // Authenticated user visiting an auth page → send to role dispatcher
  if (isAuthenticated && AUTH_PATHS.has(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Unauthenticated user visiting a protected route → send to login
  if (!isAuthenticated && isProtected(pathname)) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the intended destination so we can redirect back after login
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // All other cases: pass through with (potentially refreshed) session cookies
  return response;
}

export const config = {
  matcher: [
    /*
     * Run proxy on all paths EXCEPT:
     *   - _next/static  (compiled assets)
     *   - _next/image   (image optimisation)
     *   - favicon.ico   (browser tab icon)
     *   - public assets with file extensions (images, fonts, etc.)
     *
     * api/auth/callback is in PUBLIC_PATHS — proxy runs but passes through.
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};
