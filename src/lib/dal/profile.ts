/**
 * SmartCare — Profile Data Access Layer
 *
 * Server-only. Provides full profile data for authenticated users.
 *
 * Separation from auth.ts:
 *   auth.ts    → authentication state (who are you?)
 *   profile.ts → profile data      (what is your full profile?)
 *
 * getCurrentUser() in auth.ts returns only the minimal ProfileDTO needed
 * for layout/auth checks. These functions return the full row for profile
 * management pages.
 */
import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileRow, DoctorRow } from "@/types/database";

// ─── Full profile (all editable fields) ──────────────────────────────────────

/**
 * Returns the complete profiles row for the currently authenticated user.
 * Used on profile management pages where all fields need to be pre-filled.
 * Returns null if not authenticated or profile not found.
 */
export async function getFullProfile(): Promise<ProfileRow | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, role, full_name, avatar_url, phone, date_of_birth, gender, is_active, created_at, updated_at"
    )
    .eq("id", user.id)
    .single();

  if (error || !data) return null;

  return data as ProfileRow;
}

// ─── Doctor profile ───────────────────────────────────────────────────────────

/**
 * Returns the doctors row for the currently authenticated doctor.
 * Returns null if the user has no doctor record.
 */
export async function getDoctorProfile(): Promise<DoctorRow | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data, error } = await supabase
    .from("doctors")
    .select(
      "id, profile_id, license_number, specialty, department, years_of_experience, bio, is_verified, verified_by, verified_at, created_at, updated_at"
    )
    .eq("profile_id", user.id)
    .single();

  // PGRST116 = no rows — doctor record does not exist yet
  if (error?.code === "PGRST116") return null;
  if (error || !data) return null;

  return data as DoctorRow;
}

// ─── Avatar signed URL ────────────────────────────────────────────────────────

/**
 * Returns a 1-hour signed URL for a private avatar stored in Supabase Storage.
 * Falls back to null if the path is empty or signing fails.
 *
 * @param avatarPath — the storage object path stored in profiles.avatar_url
 *                     e.g. "abc123/avatar.jpg"  (relative to the bucket)
 */
export async function getAvatarSignedUrl(
  avatarPath: string | null
): Promise<string | null> {
  if (!avatarPath) return null;

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.storage
    .from("avatars")
    .createSignedUrl(avatarPath, 3600);

  if (error || !data?.signedUrl) return null;

  return data.signedUrl;
}

// ─── Profile Updates (Phase 3/4) ──────────────────────────────────────────────

export async function updateProfile(userId: string, data: Partial<ProfileRow>): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update(data as never)
    .eq("id", userId);

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }
}

export async function updateDoctorProfile(profileId: string, data: Partial<DoctorRow>): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("doctors")
    .update(data as never)
    .eq("profile_id", profileId);

  if (error) {
    throw new Error(`Failed to update doctor profile: ${error.message}`);
  }
}
