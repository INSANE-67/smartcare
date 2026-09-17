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

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";
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

  // Query 1: fetch the profile row
  let profile: { id: string; role: UserRole; full_name: string; avatar_url: string | null; is_active: boolean; is_verified?: boolean } | null = null;
  try {
    const { data } = (await supabase
      .from("profiles")
      .select("id, role, full_name, avatar_url, is_active, is_verified")
      .eq("id", user.id)
      .maybeSingle()) as {
      data: { id: string; role: UserRole; full_name: string; avatar_url: string | null; is_active: boolean; is_verified?: boolean } | null;
      error: unknown;
    };
    profile = data;
  } catch (fetchErr) {
    console.warn("Failed to fetch profile in getCurrentUser:", fetchErr);
  }

  // Self-heal: If profile row is missing, automatically insert a basic profile record
  if (!profile) {
    const rawName =
      (user.user_metadata?.full_name as string)?.trim() ||
      user.email?.split("@")[0] ||
      "Patient";
    const fullName = rawName.length >= 2 ? rawName : `${rawName} User`;
    const userRole = (user.user_metadata?.role as UserRole) || "patient";

    try {
      let profileClient = supabase;
      if (hasServiceRoleKey()) {
        try {
          profileClient = createSupabaseAdminClient() as unknown as typeof supabase;
        } catch {
          // Fall back to user client
        }
      }

      const { data: createdProfile } = (await profileClient
        .from("profiles")
        .upsert(
          {
            id: user.id,
            full_name: fullName,
            role: userRole,
            is_active: true,
            is_verified: userRole !== "doctor" || user.user_metadata?.is_verified === true,
          } as never,
          { onConflict: "id" }
        )
        .select("id, role, full_name, avatar_url, is_active, is_verified")
        .maybeSingle()) as {
        data: { id: string; role: UserRole; full_name: string; avatar_url: string | null; is_active: boolean; is_verified?: boolean } | null;
        error: unknown;
      };

      profile = createdProfile || {
        id: user.id,
        role: userRole,
        full_name: fullName,
        avatar_url: (user.user_metadata?.avatar_url as string) || null,
        is_active: true,
        is_verified: userRole !== "doctor" || user.user_metadata?.is_verified === true,
      };
    } catch {
      profile = {
        id: user.id,
        role: userRole,
        full_name: fullName,
        avatar_url: (user.user_metadata?.avatar_url as string) || null,
        is_active: true,
        is_verified: userRole !== "doctor" || user.user_metadata?.is_verified === true,
      };
    }
  }

  let is_verified = profile.role !== "doctor" || profile.is_verified === true;
  let medical_license: string | null = null;

  // Query 2 (doctors only): fetch the doctor row by profile_id
  if (profile.role === "doctor") {
    try {
      const { data: doctorRecord, error: docError } = (await supabase
        .from("doctors")
        .select("is_verified, license_number")
        .eq("profile_id", user.id)
        .maybeSingle()) as {
        data: { is_verified: boolean; license_number: string | null } | null;
        error: unknown;
      };

      if (docError) {
        console.warn("Doctor record lookup error in getCurrentUser:", docError);
      }

      if (doctorRecord) {
        is_verified = doctorRecord.is_verified === true || profile.is_verified === true;
        medical_license = doctorRecord.license_number ?? null;
      } else {
        is_verified = profile.is_verified === true || user.user_metadata?.is_verified === true;
        medical_license =
          user.user_metadata?.license_number ??
          user.user_metadata?.medical_license ??
          null;
      }

      console.log("[AUTH DOCTOR VERIFICATION RESOLUTION]", {
        userId: user.id,
        profileIsVerified: profile.is_verified,
        doctorRecord,
        finalIsVerified: is_verified,
      });
    } catch (err) {
      console.warn("Doctor verification exception:", err);
      is_verified = profile.is_verified === true || user.user_metadata?.is_verified === true;
    }
  }

  return {
    ...profile,
    email: user.email ?? null,
    is_verified,
    medical_license,
  } as ProfileDTO;
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
 * Also verifies doctor verification status.
 * Use at the top of role-specific Server Components.
 *
 * Path-aware: reads the current pathname so it never creates a redirect loop
 * between /doctor and /doctor/pending.
 */
export async function requireRole(role: UserRole): Promise<ProfileDTO> {
  const user = await requireAuth();

  // Wrong role → send to their own dashboard
  if (user.role !== role) {
    redirect(getDashboardPath(user.role, user.is_verified));
  }

  // Unverified doctor attempting to access protected doctor routes
  if (role === "doctor" && user.is_verified === false) {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") ?? "";
    const onPendingPage = pathname.startsWith("/doctor/pending");

    if (!onPendingPage) {
      redirect("/doctor/pending");
    }
  }

  return user;
}

/**
 * Returns the canonical dashboard path for a given role and verification state.
 */
export function getDashboardPath(role: UserRole, is_verified?: boolean): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "doctor":
      return is_verified === false ? "/doctor/pending" : "/doctor";
    case "patient":
    default:
      return "/patient";
  }
}
