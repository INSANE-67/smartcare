"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const RequestConnectionSchema = z.object({
  doctorId: z.string().uuid("Invalid doctor ID"),
  notes: z.string().max(1000).optional(),
});

/**
 * Patient initiates a connection request to a doctor.
 */
export async function requestConnectionAction(
  prevState: unknown,
  formData: FormData
) {
  const validated = RequestConnectionSchema.safeParse({
    doctorId: formData.get("doctorId"),
    notes: formData.get("notes"),
  });

  if (!validated.success) {
    return { error: "Invalid form data. Please check the inputs." };
  }

  const { doctorId, notes } = validated.data;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  // 1. Verify the patient doesn't already have an active or pending relationship
  const { data: existing, error: existingError } = await supabase
    .from("doctor_patient_relationships")
    .select("id")
    .eq("patient_id", user.id)
    .eq("doctor_id", doctorId)
    .in("status", ["active", "pending"])
    .maybeSingle();

  if (existingError) {
    return { error: "Failed to check existing relationships." };
  }
  if (existing) {
    return { error: "You already have an active or pending request with this doctor." };
  }

  // 2. Insert the relationship
  // We use `as never` to bypass strict typing issues similar to the profile updates
  const { error: insertError } = await supabase
    .from("doctor_patient_relationships")
    .insert({
      doctor_id: doctorId,
      patient_id: user.id,
      status: "pending",
      initiated_by: user.id,
      initiator_role: "patient",
      notes: notes || null,
    } as never);

  if (insertError) {
    console.error("requestConnectionAction error:", insertError);
    return { error: "Failed to send connection request. Please try again." };
  }

  revalidatePath("/patient/doctors");
  revalidatePath("/patient/relationships");
  return { success: "Connection request sent successfully." };
}

const UpdateStatusSchema = z.object({
  relationshipId: z.string().uuid("Invalid relationship ID"),
  status: z.enum(["active", "rejected", "revoked"]),
});

/**
 * Doctor accepts or rejects a connection request.
 * Requires the Admin Client to bypass patient-only RLS update restrictions.
 * MUST thoroughly verify the doctor is the acting user before updating.
 */
export async function updateRelationshipStatusAction(
  prevState: unknown,
  formData: FormData
) {
  const validated = UpdateStatusSchema.safeParse({
    relationshipId: formData.get("relationshipId"),
    status: formData.get("status"),
  });

  if (!validated.success) {
    return { error: "Invalid action." };
  }

  const { relationshipId, status } = validated.data;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  // 1. Fetch the relationship using the ADMIN client to bypass RLS,
  //    or use the normal client (normal client works for SELECT because
  //    doctors have SELECT access to their own relationships).
  const { data: relationshipData, error: fetchError } = await supabase
    .from("doctor_patient_relationships")
    .select("id, doctor_id, status")
    .eq("id", relationshipId)
    .single();

  const relationship = relationshipData as unknown as { doctor_id: string; status: string };

  if (fetchError || !relationship) {
    return { error: "Relationship not found." };
  }

  // 2. Security Check: Is the acting user the doctor for this relationship?
  if (relationship.doctor_id !== user.id) {
    return { error: "Unauthorized. You do not own this relationship." };
  }

  // 3. Status validation: Only update if it's pending (or active if revoking)
  if (relationship.status === "revoked" || relationship.status === "rejected") {
    return { error: "Cannot update a terminal relationship." };
  }
  if (status === "active" && relationship.status !== "pending") {
    return { error: "Can only accept pending requests." };
  }

  // 4. Perform the update using the ADMIN client
  const adminClient = createSupabaseAdminClient();
  
  const { error: updateError } = await adminClient
    .from("doctor_patient_relationships")
    .update({ status } as never)
    .eq("id", relationshipId);

  if (updateError) {
    console.error("updateRelationshipStatusAction error:", updateError);
    return { error: "Failed to update relationship status." };
  }

  revalidatePath("/doctor/patients");
  return { success: "Relationship status updated." };
}
