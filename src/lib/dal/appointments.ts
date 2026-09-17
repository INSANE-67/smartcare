import "server-only";

import { createSupabaseServerClient, createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./auth";
import type { AppointmentInsert, AppointmentRow, AppointmentUpdate } from "@/types/database";

export interface PatientAppointmentDTO extends AppointmentRow {
  doctorName: string;
  specialty: string;
}

/**
 * Returns appointments for the currently authenticated patient with resolved doctor metadata.
 *
 * KEY: appointments.doctor_id references profiles.id directly (migration 008).
 * So doctor_id IS the doctor's profile UUID — query profiles directly by it,
 * and query doctors by profile_id = doctor_id for specialty info.
 */
export async function getPatientAppointments(): Promise<PatientAppointmentDTO[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // 1. Fetch all appointments for this patient
  const { data: appointments, error } = (await supabase
    .from("appointments")
    .select("*")
    .eq("patient_id", user.id)
    .order("appointment_date", { ascending: false })) as {
    data: AppointmentRow[] | null;
    error: unknown;
  };

  if (error || !appointments || appointments.length === 0) return [];

  // 2. doctor_id IS profiles.id — collect unique doctor profile IDs
  const doctorProfileIds = Array.from(
    new Set(appointments.map((a) => a.doctor_id).filter(Boolean))
  );

  // 3. Fetch profiles for all doctor profile IDs directly
  const { data: profiles } = (await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url")
    .in("id", doctorProfileIds)) as {
    data: { id: string; full_name: string; email: string; avatar_url: string | null }[] | null;
    error: unknown;
  };

  // 4. Fetch doctors table for specialty info using profile_id = doctor_id
  const { data: doctorRows } = (await supabase
    .from("doctors")
    .select("profile_id, specialty, department")
    .in("profile_id", doctorProfileIds)) as {
    data: { profile_id: string; specialty: string; department: string | null }[] | null;
    error: unknown;
  };

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const doctorMap = new Map((doctorRows ?? []).map((d) => [d.profile_id, d]));

  return appointments.map((apt) => {
    const profile = profileMap.get(apt.doctor_id);
    const doctorRow = doctorMap.get(apt.doctor_id);

    const rawName = profile?.full_name?.trim() || profile?.email?.split("@")[0] || "";
    const doctorName = rawName
      ? rawName.toLowerCase().startsWith("dr")
        ? rawName
        : `Dr. ${rawName}`
      : "Doctor";

    return {
      ...apt,
      doctorName,
      specialty: doctorRow?.specialty || "General Practice",
    };
  });
}

/**
 * Returns appointments for the currently authenticated doctor.
 * Matches both user.id (profiles.id) and doctors.id to guarantee 100% visibility.
 */
export async function getDoctorAppointments(): Promise<AppointmentRow[]> {
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();

  if (!user || user.role !== "doctor") {
    throw new Error("Unauthorized: Only doctors can fetch their appointments");
  }

  // Resolve all identifiers for this doctor
  const { data: docRow } = (await supabase
    .from("doctors")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle()) as { data: { id: string } | null; error: unknown };

  const doctorMatchIds = Array.from(new Set([user.id, docRow?.id].filter(Boolean))) as string[];

  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .in("doctor_id", doctorMatchIds)
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true });

  if (error) {
    console.error("Error fetching doctor appointments:", error);
    throw new Error("Failed to fetch appointments");
  }

  return (data || []) as AppointmentRow[];
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
