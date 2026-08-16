import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./auth";
import type { ConsultationNoteInsert, ConsultationNoteRow, ConsultationNoteUpdate } from "@/types/database";

/**
 * Returns a consultation note by appointment ID, if the user is authorized.
 */
export async function getConsultationNoteByAppointmentId(appointmentId: string): Promise<ConsultationNoteRow | null> {
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("consultation_notes")
    .select("*")
    .eq("appointment_id", appointmentId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching consultation note:", error);
    throw new Error("Failed to fetch consultation note");
  }

  return data as ConsultationNoteRow | null;
}

/**
 * Returns a consultation note by its own ID.
 */
export async function getConsultationNoteById(id: string): Promise<ConsultationNoteRow | null> {
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("consultation_notes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching consultation note:", error);
    throw new Error("Failed to fetch consultation note");
  }

  return data as ConsultationNoteRow | null;
}

/**
 * Creates a new consultation note.
 */
export async function createConsultationNote(note: Omit<ConsultationNoteInsert, "doctor_id">): Promise<ConsultationNoteRow> {
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();

  if (!user || user.role !== "doctor") {
    throw new Error("Unauthorized: Only doctors can create consultation notes");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("consultation_notes") as any)
    .insert({
      ...note,
      doctor_id: user.id, // Enforce doctor ID on the server side
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating consultation note:", error);
    throw new Error("Failed to create consultation note");
  }

  return data as ConsultationNoteRow;
}

/**
 * Updates an existing consultation note.
 */
export async function updateConsultationNote(id: string, updates: ConsultationNoteUpdate): Promise<ConsultationNoteRow> {
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();

  if (!user || user.role !== "doctor") {
    throw new Error("Unauthorized: Only doctors can update consultation notes");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("consultation_notes") as any)
    .update(updates)
    .eq("id", id)
    .eq("doctor_id", user.id) // Ensure they own it
    .select()
    .single();

  if (error) {
    console.error("Error updating consultation note:", error);
    throw new Error("Failed to update consultation note");
  }

  return data as ConsultationNoteRow;
}
