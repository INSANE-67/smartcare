import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./auth";
import type { AppointmentInsert, AppointmentRow, AppointmentUpdate } from "@/types/database";

/**
 * Returns appointments for the currently authenticated patient.
 */
export async function getPatientAppointments(): Promise<AppointmentRow[]> {
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();

  if (!user || user.role !== "patient") {
    throw new Error("Unauthorized: Only patients can fetch their appointments");
  }

  // RLS ensures they only see their own appointments
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("appointment_date", { ascending: false })
    .order("appointment_time", { ascending: false });

  if (error) {
    console.error("Error fetching patient appointments:", error);
    throw new Error("Failed to fetch appointments");
  }

  return data as AppointmentRow[];
}

/**
 * Returns appointments for the currently authenticated doctor.
 */
export async function getDoctorAppointments(): Promise<AppointmentRow[]> {
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();

  if (!user || user.role !== "doctor") {
    throw new Error("Unauthorized: Only doctors can fetch their appointments");
  }

  // RLS ensures they only see appointments assigned to them
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true });

  if (error) {
    console.error("Error fetching doctor appointments:", error);
    throw new Error("Failed to fetch appointments");
  }

  return data as AppointmentRow[];
}

/**
 * Returns a specific appointment by ID.
 * Access is protected by RLS (patient can only see theirs, doctor theirs).
 */
export async function getAppointmentById(id: string): Promise<AppointmentRow | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    console.error(`Error fetching appointment ${id}:`, error);
    throw new Error("Failed to fetch appointment");
  }

  return data as AppointmentRow;
}

/**
 * Creates a new appointment.
 * RLS ensures the patient has an active relationship with the doctor.
 */
export async function createAppointment(appointment: AppointmentInsert): Promise<AppointmentRow> {
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();

  if (!user || user.role !== "patient") {
    throw new Error("Unauthorized: Only patients can book appointments");
  }

  // Ensure patient is booking for themselves
  if (appointment.patient_id !== user.id) {
    throw new Error("Unauthorized: Cannot book appointment for another patient");
  }

  const { data, error } = await supabase
    .from("appointments")
    .insert(appointment as never)
    .select()
    .single();

  if (error) {
    console.error("Error creating appointment:", error);
    throw new Error("Failed to book appointment. Please make sure you have an active relationship with this doctor.");
  }

  return data as AppointmentRow;
}

/**
 * Updates an appointment (status, notes).
 * Patients can only update status to cancelled if it's pending.
 * Doctors can confirm, complete, reject, and add notes.
 */
export async function updateAppointment(id: string, updates: AppointmentUpdate): Promise<AppointmentRow> {
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("appointments")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating appointment ${id}:`, error);
    throw new Error("Failed to update appointment");
  }

  return data as AppointmentRow;
}
