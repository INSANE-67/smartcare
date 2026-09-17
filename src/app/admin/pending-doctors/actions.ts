"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/dal/admin";

/**
 * Approves a doctor by setting is_verified = true on both the doctors row
 * and the corresponding profiles row.
 *
 * @param doctorRowId  - PK of the doctors table row (doctors.id)
 * @param profileId    - FK from doctors.profile_id → profiles.id
 */
export async function approveDoctor(doctorRowId: string, profileId: string) {
  try {
    await requireAdmin();

    // Use admin client if available (bypasses RLS on profiles/doctors)
    const supabase = await createSupabaseServerClient();
    let client = supabase;
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        client = createSupabaseAdminClient() as unknown as typeof supabase;
      }
    } catch {
      // Fall back to authenticated admin user client
    }

    // 1. Update the doctors row by its own PK — unambiguous
    const { error: docError } = await client
      .from("doctors")
      .update({
        is_verified: true,
        verification_status: "approved",
        verified_at: new Date().toISOString(),
      })
      .eq("id", doctorRowId);

    if (docError) {
      console.error("Failed to approve doctor in doctors table:", docError);
      return { success: false, error: docError.message };
    }

    // 2. Sync profiles.is_verified using the profile_id FK — unambiguous
    const { error: profileError } = await client
      .from("profiles")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ is_verified: true } as any)
      .eq("id", profileId);

    if (profileError) {
      // Non-fatal — the doctors table is the source of truth for verification
      console.warn("Could not sync profiles.is_verified:", profileError.message);
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/pending-doctors");
    revalidatePath("/doctor");
    revalidatePath("/doctor/pending");

    return { success: true };
  } catch (err: unknown) {
    console.error("Error in approveDoctor action:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to approve doctor" };
  }
}

/**
 * Rejects a doctor registration by removing their profile and auth user.
 *
 * @param profileId - profiles.id (= auth.users.id)
 */
export async function rejectDoctor(profileId: string) {
  try {
    await requireAdmin();
    const supabase = await createSupabaseServerClient();
    let client = supabase;
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        client = createSupabaseAdminClient() as unknown as typeof supabase;
      }
    } catch {
      // Fall back
    }

    // 1. Update doctors row to rejected (prefer soft-delete over hard delete)
    await client
      .from("doctors")
      .update({ verification_status: "rejected", is_verified: false } as never)
      .eq("profile_id", profileId);

    // 2. Delete user from auth schema if possible
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const adminSupabase = createSupabaseAdminClient();
        await adminSupabase.auth.admin.deleteUser(profileId);
      }
    } catch (authErr) {
      console.warn("Could not delete auth user on rejection:", authErr);
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/pending-doctors");
    revalidatePath("/admin");

    return { success: true };
  } catch (err: unknown) {
    console.error("Error in rejectDoctor action:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to reject doctor" };
  }
}
