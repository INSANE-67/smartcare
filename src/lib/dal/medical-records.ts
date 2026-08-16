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

export async function getMedicalRecord(id: string): Promise<MedicalRecordRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("medical_records")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}

export async function createMedicalRecord(record: {
  patient_id: string;
  doctor_id?: string;
  title: string;
  description?: string;
  type: string;
  record_date: string;
}): Promise<MedicalRecordRow> {
  const supabase = await createSupabaseServerClient();
  
  // RLS will ensure that the current user has permission to insert
  const { data, error } = await supabase
    .from("medical_records")
    .insert(record as never)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to create medical record.");
  }
  return data;
}

export async function updateMedicalRecord(
  id: string,
  updates: {
    title?: string;
    description?: string;
    type?: string;
    record_date?: string;
  }
): Promise<MedicalRecordRow> {
  const supabase = await createSupabaseServerClient();
  
  // RLS will ensure that the current user has permission to update this record
  const { data, error } = await supabase
    .from("medical_records")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to update medical record.");
  }
  return data;
}

export async function deleteMedicalRecord(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  
  // RLS will ensure that the current user has permission to delete this record
  // (Only patients should be able to delete their own records based on RLS)
  const { error } = await supabase
    .from("medical_records")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message || "Failed to delete medical record.");
  }
}
