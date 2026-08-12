/**
 * SmartCare — Auth Data Access Layer
 *
 * Server-only. Provides authenticated user context for Server Components,
 * Server Actions, and Route Handlers.
 *
 * Pattern:
 *   getCurrentUser()  → returns ProfileDTO | null (no redirect)
 *   requireAuth()     → returns ProfileDTO or redirects to /login
 *   requireRole()     → returns ProfileDTO or redirects to /unauthorized
 *
 * All functions call supabase.auth.getUser() — this verifies the JWT with
 * Supabase Auth (network call) and is the AUTHORITATIVE check. Never use
 * getSession() for security decisions in Server Components.
 */
import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileDTO } from "@/types";
import type { UserRole } from "@/types/database";

/**
 * Returns the current authenticated user's profile, or null if not logged in.
 * Safe to call in any Server Component — does not redirect.
 */
export async function getCurrentUser(): Promise<ProfileDTO | null> {
  const supabase = await createSupabaseServerClient();

  // getUser() verifies the JWT with Supabase Auth — authoritative check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, full_name, avatar_url, is_active")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) return null;

  return profile as ProfileDTO;
}

/**
 * Returns the current user's profile or redirects to /login.
 * Use in protected Server Components and Server Actions.
 */
export async function requireAuth(): Promise<ProfileDTO> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.is_active) {
    redirect("/login?error=account-deactivated");
  }

  return user;
}

/**
 * Returns the current user's profile or redirects if the role doesn't match.
 * Use at the top of role-specific Server Components.
 */
export async function requireRole(role: UserRole): Promise<ProfileDTO> {
  const user = await requireAuth();

  if (user.role !== role) {
    // Redirect to their correct dashboard rather than a generic error page
    redirect(getDashboardPath(user.role));
  }

  return user;
}

/**
 * Returns the canonical dashboard path for a given role.
 */
export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "doctor":
      return "/doctor";
    case "patient":
    default:
      return "/patient";
  }
}
