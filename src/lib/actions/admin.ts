"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/dal/admin";
import { createNotification } from "@/lib/dal/notifications";
import type { ActionResponse } from "@/types/index";

export async function approveDoctorAction(doctorId: string): Promise<ActionResponse<void>> {
  try {
    await requireAdmin();
    const supabase = await createSupabaseServerClient();
    const currentUserId = (await supabase.auth.getUser()).data.user?.id;

    // 1. Update doctor status in doctors table (by id or profile_id)
    let profileId = doctorId;
    const { data: updatedDoctor, error: _updateDocError } = await supabase
      .from("doctors")
      .update({
        is_verified: true,
        verification_status: "approved",
        verified_by: currentUserId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        verified_at: new Date().toISOString() as any,
      } as never)
      .or(`id.eq.${doctorId},profile_id.eq.${doctorId}`)
      .select("profile_id")
      .maybeSingle();

    if (updatedDoctor?.profile_id) {
      profileId = updatedDoctor.profile_id;
    }

    // 2. Update profiles table if it has is_verified
    try {
      await supabase
        .from("profiles")
        .update({ is_verified: true } as never)
        .eq("id", profileId);
    } catch (profErr) {
      console.warn("Could not update is_verified on profiles table:", profErr);
    }

    // 3. Notify the doctor using admin notification client
    try {
      await createNotification({
        user_id: profileId,
        title: "Application Approved",
        message: "Congratulations! Your doctor profile has been verified and approved.",
        type: "relationship_request_accepted",
        related_entity_id: doctorId,
      });
    } catch (notifErr) {
      console.warn("Could not create approval notification:", notifErr);
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/doctors/pending");
    revalidatePath("/admin/pending-doctors");
    revalidatePath("/doctor");
    revalidatePath("/doctor/pending");

    return { success: true, data: undefined };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}

const rejectSchema = z.object({
  doctorId: z.string().uuid(),
  reason: z.string().min(1, "Reason is required"),
});

export async function rejectDoctorAction(formData: FormData): Promise<ActionResponse<void>> {
  try {
    await requireAdmin();
    const supabase = await createSupabaseServerClient();

    const parsed = rejectSchema.safeParse({
      doctorId: formData.get("doctorId"),
      reason: formData.get("reason"),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const { doctorId, reason } = parsed.data;

    // 1. Update doctor status
    const { data: doctor, error: updateError } = await supabase
      .from("doctors")
      .update({
        is_verified: false,
        verification_status: "rejected",
        rejection_reason: reason,
        rejected_by: (await supabase.auth.getUser()).data.user?.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rejected_at: new Date().toISOString() as any,
      } as never)
      .eq("id", doctorId)
      .select("profile_id")
      .single();

    if (updateError || !doctor) {
      return { success: false, error: updateError?.message || "Failed to reject doctor" };
    }

    // 2. Notify the doctor using admin notification client
    await createNotification({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user_id: (doctor as any).profile_id,
      title: "Application Rejected",
      message: `Your doctor application was not approved. Reason: ${reason}`,
      type: "relationship_request_rejected", // Reusing existing enum type
      related_entity_id: doctorId,
    });

    revalidatePath("/admin/doctors/pending");
    return { success: true, data: undefined };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}
