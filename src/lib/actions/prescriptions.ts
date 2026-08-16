"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createPrescription, updatePrescription } from "@/lib/dal/prescriptions";
import { getDoctorRelationships } from "@/lib/dal/relationships";
import type { PrescriptionRow, PrescriptionStatus, ActionResponse } from "@/types/index";

// Zod schemas for validation
const prescriptionSchema = z.object({
  patient_id: z.string().uuid("Invalid patient ID"),
  medication_name: z.string().min(2, "Medication name is required").max(255),
  dosage: z.string().min(1, "Dosage is required").max(100),
  frequency: z.string().min(1, "Frequency is required").max(100),
  start_date: z.string().date("Invalid start date"),
  end_date: z.string().date("Invalid end date").nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  status: z.enum(["active", "completed", "discontinued"]).default("active"),
});

export async function createPrescriptionAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse<PrescriptionRow> & { fieldErrors?: Record<string, string[]> }> {
  try {
    const rawData = {
      patient_id: formData.get("patient_id") as string,
      medication_name: formData.get("medication_name") as string,
      dosage: formData.get("dosage") as string,
      frequency: formData.get("frequency") as string,
      start_date: formData.get("start_date") as string,
      end_date: formData.get("end_date") ? (formData.get("end_date") as string) : null,
      notes: formData.get("notes") ? (formData.get("notes") as string) : null,
      status: (formData.get("status") || "active") as string,
    };

    const validatedFields = prescriptionSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Please fix the errors in the form.",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    // Verify doctor has an active relationship with this patient
    // (RLS also catches this, but doing it here provides a better error message)
    const relationships = await getDoctorRelationships();
    const hasActiveRel = relationships.some(
      (r) => r.other_party.id === validatedFields.data.patient_id && r.status === "active"
    );

    if (!hasActiveRel) {
      return {
        success: false,
        error: "You can only prescribe medication to patients with whom you have an active relationship.",
      };
    }

    const prescription = await createPrescription({
      patient_id: validatedFields.data.patient_id,
      doctor_id: "", // Filled by DAL
      medication_name: validatedFields.data.medication_name,
      dosage: validatedFields.data.dosage,
      frequency: validatedFields.data.frequency,
      start_date: validatedFields.data.start_date,
      end_date: validatedFields.data.end_date || null,
      notes: validatedFields.data.notes || null,
      status: validatedFields.data.status as PrescriptionStatus,
    });

    revalidatePath(`/doctor/patients/${validatedFields.data.patient_id}`);
    revalidatePath(`/doctor/patients/${validatedFields.data.patient_id}/prescriptions`);

    return { success: true, data: prescription };
  } catch (error) {
    console.error("Failed to create prescription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred.",
    };
  }
}

const updatePrescriptionSchema = z.object({
  id: z.string().uuid("Invalid prescription ID"),
  patient_id: z.string().uuid(), // Need this for revalidation path
  medication_name: z.string().min(2, "Medication name is required").max(255),
  dosage: z.string().min(1, "Dosage is required").max(100),
  frequency: z.string().min(1, "Frequency is required").max(100),
  start_date: z.string().date("Invalid start date"),
  end_date: z.string().date("Invalid end date").nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  status: z.enum(["active", "completed", "discontinued"]),
});

export async function updatePrescriptionAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse<PrescriptionRow> & { fieldErrors?: Record<string, string[]> }> {
  try {
    const rawData = {
      id: formData.get("id") as string,
      patient_id: formData.get("patient_id") as string,
      medication_name: formData.get("medication_name") as string,
      dosage: formData.get("dosage") as string,
      frequency: formData.get("frequency") as string,
      start_date: formData.get("start_date") as string,
      end_date: formData.get("end_date") ? (formData.get("end_date") as string) : null,
      notes: formData.get("notes") ? (formData.get("notes") as string) : null,
      status: formData.get("status") as string,
    };

    const validatedFields = updatePrescriptionSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Please fix the errors in the form.",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const prescription = await updatePrescription(validatedFields.data.id, {
      medication_name: validatedFields.data.medication_name,
      dosage: validatedFields.data.dosage,
      frequency: validatedFields.data.frequency,
      start_date: validatedFields.data.start_date,
      end_date: validatedFields.data.end_date || null,
      notes: validatedFields.data.notes || null,
      status: validatedFields.data.status,
    });

    revalidatePath(`/doctor/patients/${validatedFields.data.patient_id}`);
    revalidatePath(`/doctor/patients/${validatedFields.data.patient_id}/prescriptions`);
    revalidatePath(`/doctor/patients/${validatedFields.data.patient_id}/prescriptions/${validatedFields.data.id}`);

    return { success: true, data: prescription };
  } catch (error) {
    console.error("Failed to update prescription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred.",
    };
  }
}
