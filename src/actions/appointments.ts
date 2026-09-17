"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/dal/auth";
import { createNotification } from "@/lib/dal/notifications";

/**
 * Converts a time string like "09:00 AM" or "02:30 PM" or "14:00" to "HH:MM:SS" 24-hour format.
 */
function parseTimeTo24Hour(timeStr: string): string {
  if (!timeStr) return "09:00:00";

  // Already 24h format (e.g. "09:00" or "14:30")
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) {
    return timeStr.length === 5 ? `${timeStr}:00` : timeStr;
  }

  // Handle "09:00 AM" or "2:30 PM"
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const period = match[3].toUpperCase();

    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, "0")}:${minutes}:00`;
  }

  return "09:00:00";
}

export type BookAppointmentResult = {
  success: boolean;
  error?: string;
  appointmentId?: string;
};

/**
 * Server Action to book an appointment with a verified doctor.
 * Includes:
 * - Past date validation
 * - Double booking validation
 * - Notification triggers
 * - Dashboard revalidation
 */
export async function bookAppointment(
  formData: FormData,
  doctorId: string
): Promise<BookAppointmentResult> {
  const user = await getCurrentUser();

  if (!user || user.role !== "patient") {
    return {
      success: false,
      error: "Unauthorized: You must be logged in as a patient to book an appointment.",
    };
  }

  const rawDate = formData.get("appointment_date") as string;
  const rawTime = formData.get("appointment_time") as string;
  const reason = (formData.get("reason") as string)?.trim();

  if (!rawDate?.trim()) {
    return { success: false, error: "Please select an appointment date." };
  }
  if (!rawTime?.trim()) {
    return { success: false, error: "Please select a time slot." };
  }
  if (!reason) {
    return { success: false, error: "Please provide a reason for the consultation." };
  }

  // 1. Prevent past appointments
  const todayStr = new Date().toISOString().split("T")[0];
  if (rawDate < todayStr) {
    return { success: false, error: "Cannot book appointments in the past. Please select today or a future date." };
  }

  const supabase = await createSupabaseServerClient();

  // 2. Resolve the doctor's profile_id (appointments.doctor_id references profiles.id)
  let targetDoctorProfileId = doctorId;

  const { data: doctorProfile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", doctorId)
    .maybeSingle();

  if (!doctorProfile || doctorProfile.role !== "doctor") {
    const { data: docRow } = await supabase
      .from("doctors")
      .select("profile_id")
      .eq("id", doctorId)
      .maybeSingle();

    if (docRow?.profile_id) {
      targetDoctorProfileId = docRow.profile_id;
    } else {
      return { success: false, error: "Selected doctor was not found or is inactive." };
    }
  }

  const formattedTime = parseTimeTo24Hour(rawTime);

  // 3. Prevent Double Booking
  const { data: existingSlots } = await supabase
    .from("appointments")
    .select("id, status")
    .eq("doctor_id", targetDoctorProfileId)
    .eq("appointment_date", rawDate)
    .eq("appointment_time", formattedTime)
    .neq("status", "cancelled")
    .neq("status", "rejected");

  if (existingSlots && existingSlots.length > 0) {
    return {
      success: false,
      error: "This time slot is already booked for this doctor. Please choose a different time or date.",
    };
  }

  // 4. Insert appointment
  const { data: appointment, error: aptError } = await supabase
    .from("appointments")
    .insert({
      patient_id: user.id,
      doctor_id: targetDoctorProfileId,
      appointment_date: rawDate,
      appointment_time: formattedTime,
      reason,
      status: "pending",
      notes: null,
    })
    .select("id")
    .single();

  if (aptError) {
    console.error("Error inserting appointment:", aptError);
    return {
      success: false,
      error: aptError.message || "Failed to schedule appointment. Please try again.",
    };
  }

  // 5. Notify the doctor
  try {
    await createNotification({
      user_id: targetDoctorProfileId,
      title: "New Appointment Request",
      message: `${user.full_name || "A patient"} requested an appointment on ${rawDate} at ${rawTime}.`,
      type: "appointment_requested",
      related_entity_id: appointment.id,
    });
  } catch (notifErr) {
    console.warn("Failed to create doctor notification:", notifErr);
  }

  revalidatePath("/patient");
  revalidatePath("/patient/appointments");
  revalidatePath("/doctor");
  revalidatePath("/doctor/appointments");
  revalidatePath("/admin");

  redirect("/patient/appointments?booked=true");
}
