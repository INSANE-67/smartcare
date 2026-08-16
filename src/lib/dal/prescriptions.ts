import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./auth";
import type { PrescriptionInsert, PrescriptionRow, PrescriptionUpdate } from "@/types/database";

/**
 * Returns prescriptions for the currently authenticated patient.
 */
export async function getPatientPrescriptions(): Promise<PrescriptionRow[]> {
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();

  if (!user || user.role !== "patient") {
    throw new Error("Unauthorized: Only patients can fetch their prescriptions");
  }

  // RLS ensures they only see their own prescriptions
  const { data, error } = await supabase
    .from("prescriptions")
    .select("*")
    .order("start_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching patient prescriptions:", error);
    throw new Error("Failed to fetch prescriptions");
  }

  return data as PrescriptionRow[];
}

/**
 * Returns prescriptions for a specific patient.
 * RLS ensures the doctor can only read this if they have an active relationship
 * or they issued the prescription.
 */
export async function getPrescriptionsForPatient(patientId: string): Promise<PrescriptionRow[]> {
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();

  if (!user || user.role !== "doctor") {
    throw new Error("Unauthorized: Only doctors can fetch a patient's prescriptions");
  }

  const { data, error } = await supabase
    .from("prescriptions")
    .select("*")
    .eq("patient_id", patientId)
    .order("status", { ascending: true }) // active first, then completed, discontinued
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Error fetching prescriptions for patient:", error);
    throw new Error("Failed to fetch prescriptions");
  }

  return data as PrescriptionRow[];
}

/**
 * Returns a specific prescription by ID.
 * RLS applies.
 */
export async function getPrescriptionById(id: string): Promise<PrescriptionRow | null> {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from("prescriptions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found / no access
    console.error("Error fetching prescription:", error);
    throw new Error("Failed to fetch prescription");
  }

  return data as PrescriptionRow;
}

/**
 * Creates a new prescription.
 * RLS ensures the current user is a doctor with an active relationship to the patient.
 */
export async function createPrescription(prescription: PrescriptionInsert): Promise<PrescriptionRow> {
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();

  if (!user || user.role !== "doctor") {
    throw new Error("Unauthorized: Only doctors can create prescriptions");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("prescriptions") as any)
    .insert({
      ...prescription,
      doctor_id: user.id, // Enforce doctor ID on the server side
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating prescription:", error);
    throw new Error("Failed to create prescription");
  }

  return data as PrescriptionRow;
}

/**
 * Updates an existing prescription.
 * RLS ensures only the issuing doctor can edit it.
 */
export async function updatePrescription(id: string, updates: PrescriptionUpdate): Promise<PrescriptionRow> {
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();

  if (!user || user.role !== "doctor") {
    throw new Error("Unauthorized: Only doctors can update prescriptions");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("prescriptions") as any)
    .update(updates)
    .eq("id", id)
    // Extra safety check in application layer (RLS handles this too)
    .eq("doctor_id", user.id) 
    .select()
    .single();

  if (error) {
    console.error("Error updating prescription:", error);
    throw new Error("Failed to update prescription");
  }

  return data as PrescriptionRow;
}
