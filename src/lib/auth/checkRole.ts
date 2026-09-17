import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { UserRole } from "@/types";

export interface RoleCheckResult {
  userId: string;
  role: UserRole;
  fullName: string;
  isVerified: boolean;
  isActive: boolean;
}

/**
 * Checks the authenticated user's profile role and clinical verification status.
 */
export async function checkUserRole(userId: string): Promise<RoleCheckResult | null> {
  const supabase = await createSupabaseServerClient();

  // 1. Query profile
  const { data: profile, error } = (await supabase
    .from("profiles")
    .select("id, role, full_name, is_active")
    .eq("id", userId)
    .maybeSingle()) as {
    data: { id: string; role: UserRole; full_name: string; is_active: boolean } | null;
    error: unknown;
  };

  if (error || !profile) {
    return null;
  }

  let isVerified = profile.role !== "doctor";

  // 2. If physician, check doctor table verification
  if (profile.role === "doctor") {
    const { data: doctorRecord } = (await supabase
      .from("doctors")
      .select("is_verified, verification_status")
      .eq("profile_id", profile.id)
      .maybeSingle()) as {
      data: { is_verified: boolean; verification_status: string } | null;
      error: unknown;
    };

    if (doctorRecord) {
      isVerified =
        doctorRecord.is_verified === true ||
        doctorRecord.verification_status === "approved";
    }
  }

  return {
    userId: profile.id,
    role: profile.role || "patient",
    fullName: profile.full_name || "User",
    isVerified,
    isActive: profile.is_active !== false,
  };
}

/**
 * Verifies if user has specific required role.
 */
export async function verifyRoleAccess(
  userId: string,
  requiredRole: "patient" | "doctor" | "admin"
): Promise<{ allowed: boolean; reason?: string; redirectUrl?: string }> {
  const userRoleData = await checkUserRole(userId);
  if (!userRoleData) {
    return { allowed: false, reason: "User profile not found." };
  }

  if (!userRoleData.isActive) {
    return { allowed: false, reason: "Account is inactive. Contact administration." };
  }

  if (requiredRole === "doctor") {
    if (userRoleData.role !== "doctor" && userRoleData.role !== "admin") {
      return {
        allowed: false,
        reason: "Access restricted. This portal requires a verified Doctor account.",
      };
    }
    if (userRoleData.role === "doctor" && !userRoleData.isVerified) {
      return {
        allowed: false,
        reason: "Your doctor account is awaiting administrative verification.",
        redirectUrl: "/doctor/pending",
      };
    }
    return { allowed: true, redirectUrl: "/doctor" };
  }

  if (requiredRole === "admin") {
    if (userRoleData.role !== "admin") {
      return {
        allowed: false,
        reason: "Access restricted. Administrator credentials are required.",
      };
    }
    return { allowed: true, redirectUrl: "/admin" };
  }

  // Patient portal
  return { allowed: true, redirectUrl: "/patient" };
}
