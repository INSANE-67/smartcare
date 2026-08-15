import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MedicalRecordRow } from "@/types/database";
import { checkActiveRelationship } from "./relationships";

/**
 * Retrieves the authenticated patient's medical records.
 */
export async function getPatientMedicalRecords(): Promise<MedicalRecordRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("medical_records")
    .select("*")
    .eq("patient_id", user.id)
    .order("record_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data;
}

/**
 * Retrieves a patient's medical records for a doctor, provided there is an active relationship.
 */
export async function getDoctorAccessibleRecords(patientId: string): Promise<MedicalRecordRow[]> {
  // Centralized permission check
  const hasAccess = await checkActiveRelationship(patientId);
  if (!hasAccess) {
    throw new Error("Unauthorized: No active relationship with this patient.");
  }

  const supabase = await createSupabaseServerClient();

  // The RLS policy also enforces the relationship check, providing defense in depth.
  const { data, error } = await supabase
    .from("medical_records")
    .select("*")
    .eq("patient_id", patientId)
    .order("record_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data;
}
