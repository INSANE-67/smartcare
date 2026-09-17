"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/dal/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateAppointment, getAppointmentById } from "@/lib/dal/appointments";
import { createNotification } from "@/lib/dal/notifications";
import type { ActionResponse } from "@/types";
import type { AppointmentRow } from "@/types/database";

const BookAppointmentSchema = z.object({
  doctor_id: z.string().uuid("Invalid doctor ID"),
  appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  appointment_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format"),
  reason: z.string().min(1, "Reason is required"),
});

const CompleteAppointmentSchema = z.object({
  notes: z.string().min(1, "Consultation notes are required for completion"),
});

import { bookAppointment } from "@/actions/appointments";
export { bookAppointment };

/**
 * Creates an appointment directly using user authentication context with full validation:
 * - Prevents past appointments
 * - Prevents double booking for same doctor/time
 */
export async function createAppointment(data: {
  doctorId: string;
  appointmentDate: string;
  appointmentTime?: string;
  reason?: string;
}) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized: Please log in again." };
    }

    // 1. Validate past appointments (prevent dates before today)
    const todayStr = new Date().toISOString().split("T")[0];
    if (data.appointmentDate < todayStr) {
      return { success: false, error: "Cannot book appointments in the past. Please select today or a future date." };
    }

    // 2. Resolve doctor profile ID (appointments.doctor_id references profiles.id)
    let targetDoctorProfileId = data.doctorId;
    const { data: docProfile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", data.doctorId)
      .maybeSingle();

    if (!docProfile || docProfile.role !== "doctor") {
      const { data: docRow } = await supabase
        .from("doctors")
        .select("profile_id")
        .eq("id", data.doctorId)
        .maybeSingle();

      if (docRow?.profile_id) {
        targetDoctorProfileId = docRow.profile_id;
      } else {
        return { success: false, error: "Selected doctor was not found or is inactive." };
      }
    }

    const formattedTime = (data.appointmentTime || "09:00:00").length === 5 
      ? `${data.appointmentTime}:00` 
      : (data.appointmentTime || "09:00:00");

    // 3. Prevent Double Booking for the same doctor, date, and time
    const { data: existingSlots } = await supabase
      .from("appointments")
      .select("id, status")
      .eq("doctor_id", targetDoctorProfileId)
      .eq("appointment_date", data.appointmentDate)
      .eq("appointment_time", formattedTime)
      .not("status", "in", '("cancelled","rejected")');

    if (existingSlots && existingSlots.length > 0) {
      return {
        success: false,
        error: "This time slot is already booked for this doctor. Please choose a different time or date.",
      };
    }

    // 4. Insert appointment
    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert({
        patient_id: user.id,
        doctor_id: targetDoctorProfileId,
        appointment_date: data.appointmentDate,
        appointment_time: formattedTime,
        status: "pending",
        reason: data.reason || "",
        notes: null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating appointment:", error);
      return { success: false, error: error.message };
    }

    // Revalidate relevant dashboards
    revalidatePath("/patient");
    revalidatePath("/patient/appointments");
    revalidatePath("/doctor");
    revalidatePath("/doctor/appointments");
    revalidatePath("/admin");

    return { success: true, data: appointment };
  } catch (err: unknown) {
    console.error("createAppointment unexpected error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to create appointment" };
  }
}

export async function bookAppointmentAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse<AppointmentRow> & { fieldErrors?: Record<string, string[]> }> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "patient") {
      throw new Error("Unauthorized: Only patients can book appointments");
    }

    const rawData = {
      doctor_id: formData.get("doctor_id"),
      appointment_date: formData.get("appointment_date"),
      appointment_time: formData.get("appointment_time"),
      reason: formData.get("reason"),
    };

    const validatedFields = BookAppointmentSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Please fix the errors in the form.",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const res = await createAppointment({
      doctorId: validatedFields.data.doctor_id,
      appointmentDate: validatedFields.data.appointment_date,
      appointmentTime: validatedFields.data.appointment_time,
      reason: validatedFields.data.reason,
    });

    if (!res.success || !res.data) {
      return { success: false, error: res.error || "Failed to book appointment." };
    }

    try {
      await createNotification({
        user_id: res.data.doctor_id,
        title: "New Appointment Request",
        message: `A patient has requested an appointment on ${validatedFields.data.appointment_date} at ${validatedFields.data.appointment_time}.`,
        type: "appointment_requested",
        related_entity_id: res.data.id,
      });
    } catch (notifErr) {
      console.warn("Failed to create appointment notification:", notifErr);
    }

    revalidatePath("/patient");
    revalidatePath("/patient/appointments");
    revalidatePath("/doctor");
    revalidatePath("/doctor/appointments");

    return { success: true, data: res.data as AppointmentRow };
  } catch (error: unknown) {
    console.error("Booking error:", error);
    const message = error instanceof Error ? error.message : "Failed to book appointment.";
    return { success: false, error: message };
  }
}

/**
 * Patient Action: Cancel an appointment.
 * Only allowed if appointment is in 'pending' or 'confirmed' status.
 */
export async function cancelAppointmentAction(
  id: string
): Promise<ActionResponse<AppointmentRow>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "patient") {
      throw new Error("Unauthorized: Only patients can cancel appointments");
    }

    // Verify existing appointment status
    const currentAppointment = await getAppointmentById(id);
    if (!currentAppointment) {
      throw new Error("Appointment not found");
    }

    if (currentAppointment.status !== "pending" && currentAppointment.status !== "confirmed") {
      throw new Error(`Cannot cancel appointment with status '${currentAppointment.status}'. Only pending or confirmed appointments can be cancelled.`);
    }

    const appointment = await updateAppointment(id, {
      status: "cancelled",
    });

    try {
      await createNotification({
        user_id: appointment.doctor_id,
        title: "Appointment Cancelled",
        message: `An appointment on ${appointment.appointment_date} at ${appointment.appointment_time} was cancelled by the patient.`,
        type: "appointment_cancelled",
        related_entity_id: appointment.id,
      });
    } catch (notifErr) {
      console.warn("Failed to notify doctor of cancellation:", notifErr);
    }

    revalidatePath("/patient");
    revalidatePath("/patient/appointments");
    revalidatePath(`/patient/appointments/${id}`);
    revalidatePath("/doctor");
    revalidatePath("/doctor/appointments");
    revalidatePath(`/doctor/appointments/${id}`);
    revalidatePath("/admin");

    return { success: true, data: appointment };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to cancel appointment.";
    return { success: false, error: message };
  }
}

/**
 * Doctor Action: Confirm an appointment.
 * Only allowed if appointment is in 'pending' status.
 */
export async function confirmAppointmentAction(
  id: string
): Promise<ActionResponse<AppointmentRow>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "doctor") {
      throw new Error("Unauthorized: Only doctors can confirm appointments");
    }

    const currentAppointment = await getAppointmentById(id);
    if (!currentAppointment) {
      throw new Error("Appointment not found");
    }

    if (currentAppointment.status !== "pending") {
      throw new Error(`Cannot confirm appointment with status '${currentAppointment.status}'. Only pending appointments can be confirmed.`);
    }

    const appointment = await updateAppointment(id, {
      status: "confirmed",
    });

    try {
      await createNotification({
        user_id: appointment.patient_id,
        title: "Appointment Confirmed",
        message: `Your appointment on ${appointment.appointment_date} at ${appointment.appointment_time} has been confirmed.`,
        type: "appointment_confirmed",
        related_entity_id: appointment.id,
      });
    } catch (notifErr) {
      console.warn("Failed to notify patient of confirmation:", notifErr);
    }

    revalidatePath("/patient");
    revalidatePath("/patient/appointments");
    revalidatePath(`/patient/appointments/${id}`);
    revalidatePath("/doctor");
    revalidatePath("/doctor/appointments");
    revalidatePath(`/doctor/appointments/${id}`);
    revalidatePath("/admin");

    return { success: true, data: appointment };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to confirm appointment.";
    return { success: false, error: message };
  }
}

/**
 * Doctor Action: Reject an appointment.
 * Only allowed if appointment is in 'pending' status.
 */
export async function rejectAppointmentAction(
  id: string
): Promise<ActionResponse<AppointmentRow>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "doctor") {
      throw new Error("Unauthorized: Only doctors can reject appointments");
    }

    const currentAppointment = await getAppointmentById(id);
    if (!currentAppointment) {
      throw new Error("Appointment not found");
    }

    if (currentAppointment.status !== "pending") {
      throw new Error(`Cannot reject appointment with status '${currentAppointment.status}'. Only pending appointments can be rejected.`);
    }

    const appointment = await updateAppointment(id, {
      status: "rejected",
    });

    try {
      await createNotification({
        user_id: appointment.patient_id,
        title: "Appointment Declined",
        message: `Your appointment request for ${appointment.appointment_date} at ${appointment.appointment_time} was declined.`,
        type: "appointment_rejected",
        related_entity_id: appointment.id,
      });
    } catch (notifErr) {
      console.warn("Failed to notify patient of rejection:", notifErr);
    }

    revalidatePath("/patient");
    revalidatePath("/patient/appointments");
    revalidatePath(`/patient/appointments/${id}`);
    revalidatePath("/doctor");
    revalidatePath("/doctor/appointments");
    revalidatePath(`/doctor/appointments/${id}`);
    revalidatePath("/admin");

    return { success: true, data: appointment };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to reject appointment.";
    return { success: false, error: message };
  }
}

/**
 * Doctor Action: Complete an appointment with optional clinical notes.
 * Only allowed if appointment is in 'confirmed' status.
 */
export async function completeAppointmentAction(
  id: string,
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse<AppointmentRow> & { fieldErrors?: Record<string, string[]> }> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "doctor") {
      throw new Error("Unauthorized: Only doctors can complete appointments");
    }

    const currentAppointment = await getAppointmentById(id);
    if (!currentAppointment) {
      throw new Error("Appointment not found");
    }

    if (currentAppointment.status !== "confirmed") {
      throw new Error(`Cannot complete appointment with status '${currentAppointment.status}'. Only confirmed appointments can be completed.`);
    }

    const rawData = {
      notes: formData.get("notes"),
    };

    const validatedFields = CompleteAppointmentSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Please fix the errors in the form.",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const appointment = await updateAppointment(id, {
      status: "completed",
      notes: validatedFields.data.notes,
    });

    try {
      await createNotification({
        user_id: appointment.patient_id,
        title: "Appointment Completed",
        message: `Your appointment on ${appointment.appointment_date} has been marked as completed. Consultation notes are now available.`,
        type: "appointment_confirmed",
        related_entity_id: appointment.id,
      });
    } catch (notifErr) {
      console.warn("Failed to notify patient of completion:", notifErr);
    }

    revalidatePath("/patient");
    revalidatePath("/patient/appointments");
    revalidatePath(`/patient/appointments/${id}`);
    revalidatePath("/doctor");
    revalidatePath("/doctor/appointments");
    revalidatePath(`/doctor/appointments/${id}`);
    revalidatePath("/admin");

    return { success: true, data: appointment };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to complete appointment.";
    return { success: false, error: message };
  }
}
