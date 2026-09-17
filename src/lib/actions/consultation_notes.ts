"use server";

import { z } from "zod";
import { createConsultationNote, updateConsultationNote } from "@/lib/dal/consultation_notes";
import { getAppointmentById } from "@/lib/dal/appointments";
import { getCurrentUser } from "@/lib/dal/auth";
import { createNotification } from "@/lib/dal/notifications";
import { revalidatePath } from "next/cache";

const consultationNoteSchema = z.object({
  appointment_id: z.string().uuid("Invalid appointment ID"),
  patient_id: z.string().uuid("Invalid patient ID"),
  diagnosis: z.string().min(1, "Diagnosis is required"),
  symptoms: z.string().min(1, "Symptoms are required"),
  observations: z.string().min(1, "Observations are required"),
  treatment_plan: z.string().min(1, "Treatment plan is required"),
  follow_up_date: z.string().optional().nullable(),
});

export type ConsultationNoteActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    [key: string]: string[];
  };
};

export async function createConsultationNoteAction(
  prevState: ConsultationNoteActionState,
  formData: FormData
): Promise<ConsultationNoteActionState> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "doctor") {
      return { success: false, error: "Unauthorized" };
    }

    const rawData = {
      appointment_id: formData.get("appointment_id") as string,
      patient_id: formData.get("patient_id") as string,
      diagnosis: formData.get("diagnosis") as string,
      symptoms: formData.get("symptoms") as string,
      observations: formData.get("observations") as string,
      treatment_plan: formData.get("treatment_plan") as string,
      follow_up_date: formData.get("follow_up_date") ? (formData.get("follow_up_date") as string) : null,
    };

    const validatedFields = consultationNoteSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Please fix the errors in the form.",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    // Verify the appointment belongs to this doctor and patient and is completed
    const appointment = await getAppointmentById(validatedFields.data.appointment_id);
    if (!appointment || appointment.doctor_id !== user.id || appointment.patient_id !== validatedFields.data.patient_id) {
      return {
        success: false,
        error: "You can only create notes for appointments assigned to you.",
      };
    }
    
    if (appointment.status !== 'completed') {
      return {
        success: false,
        error: "You can only create consultation notes for completed appointments.",
      };
    }

    const note = await createConsultationNote({
      ...validatedFields.data,
      follow_up_date: validatedFields.data.follow_up_date ?? null,
    });

    await createNotification({
      user_id: validatedFields.data.patient_id,
      title: "Consultation Note Added",
      message: `A consultation note has been added for your appointment.`,
      type: "consultation_note_added",
      related_entity_id: note.id,
    });

    revalidatePath(`/doctor/appointments/${validatedFields.data.appointment_id}`);
    revalidatePath(`/doctor/appointments/${validatedFields.data.appointment_id}/consultation`);
    
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to create consultation note:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create consultation note. Please try again.",
    };
  }
}

export async function updateConsultationNoteAction(
  id: string,
  prevState: ConsultationNoteActionState,
  formData: FormData
): Promise<ConsultationNoteActionState> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "doctor") {
      return { success: false, error: "Unauthorized" };
    }

    const rawData = {
      appointment_id: formData.get("appointment_id") as string,
      patient_id: formData.get("patient_id") as string,
      diagnosis: formData.get("diagnosis") as string,
      symptoms: formData.get("symptoms") as string,
      observations: formData.get("observations") as string,
      treatment_plan: formData.get("treatment_plan") as string,
      follow_up_date: formData.get("follow_up_date") ? (formData.get("follow_up_date") as string) : null,
    };

    const validatedFields = consultationNoteSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Please fix the errors in the form.",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    // We omit patient_id as it shouldn't change
    const { appointment_id, patient_id: _patient_id, ...updateData } = validatedFields.data;

    await updateConsultationNote(id, {
      ...updateData,
      follow_up_date: updateData.follow_up_date ?? null,
    });

    revalidatePath(`/doctor/appointments/${appointment_id}`);
    revalidatePath(`/doctor/appointments/${appointment_id}/consultation`);

    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to update consultation note:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update consultation note. Please try again.",
    };
  }
}
