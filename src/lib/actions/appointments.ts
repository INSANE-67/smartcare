"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/dal/auth";
import { createAppointment, updateAppointment } from "@/lib/dal/appointments";
import type { ActionResponse } from "@/types";
import type { AppointmentRow } from "@/types/database";

const BookAppointmentSchema = z.object({
  doctor_id: z.string().uuid("Invalid doctor ID"),
  appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  appointment_time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  reason: z.string().min(1, "Reason is required"),
});

const CompleteAppointmentSchema = z.object({
  notes: z.string().min(1, "Consultation notes are required for completion"),
});

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

    const appointment = await createAppointment({
      patient_id: user.id,
      doctor_id: validatedFields.data.doctor_id,
      appointment_date: validatedFields.data.appointment_date,
      appointment_time: validatedFields.data.appointment_time,
      reason: validatedFields.data.reason,
      status: "pending",
      notes: null,
    });

    revalidatePath("/patient/appointments");
    return { success: true, data: appointment };
  } catch (error: unknown) {
    console.error("Booking error:", error);
    const message = error instanceof Error ? error.message : "Failed to book appointment.";
    return { success: false, error: message };
  }
}

export async function cancelAppointmentAction(
  id: string
): Promise<ActionResponse<AppointmentRow>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "patient") {
      throw new Error("Unauthorized");
    }

    // Only 'pending' status should be allowed to be cancelled by patient, enforced by RLS
    const appointment = await updateAppointment(id, {
      status: "cancelled",
    });

    revalidatePath("/patient/appointments");
    revalidatePath(`/patient/appointments/${id}`);
    return { success: true, data: appointment };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to cancel appointment.";
    return { success: false, error: message };
  }
}

export async function confirmAppointmentAction(
  id: string
): Promise<ActionResponse<AppointmentRow>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "doctor") {
      throw new Error("Unauthorized");
    }

    const appointment = await updateAppointment(id, {
      status: "confirmed",
    });

    revalidatePath("/doctor/appointments");
    revalidatePath(`/doctor/appointments/${id}`);
    return { success: true, data: appointment };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to confirm appointment.";
    return { success: false, error: message };
  }
}

export async function rejectAppointmentAction(
  id: string
): Promise<ActionResponse<AppointmentRow>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "doctor") {
      throw new Error("Unauthorized");
    }

    const appointment = await updateAppointment(id, {
      status: "rejected",
    });

    revalidatePath("/doctor/appointments");
    revalidatePath(`/doctor/appointments/${id}`);
    return { success: true, data: appointment };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to reject appointment.";
    return { success: false, error: message };
  }
}

export async function completeAppointmentAction(
  id: string,
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse<AppointmentRow> & { fieldErrors?: Record<string, string[]> }> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "doctor") {
      throw new Error("Unauthorized");
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

    revalidatePath("/doctor/appointments");
    revalidatePath(`/doctor/appointments/${id}`);
    return { success: true, data: appointment };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to complete appointment.";
    return { success: false, error: message };
  }
}
