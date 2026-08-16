"use server";

import { z } from "zod";
import { getDoctorAccessibleRecords } from "@/lib/dal/medical-records";
import { MedicalRecordRow } from "@/types/database";

const fetchRecordsSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID"),
});

export type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Server action to fetch medical records for a specific patient.
 * Useful if we want to load records on demand from the client,
 * though Server Components calling the DAL directly is preferred for initial load.
 */
export async function fetchPatientRecordsAction(
  patientId: string
): Promise<ActionResponse<MedicalRecordRow[]>> {
  try {
    const validated = fetchRecordsSchema.parse({ patientId });
    // This DAL function will throw if there is no active relationship
    const records = await getDoctorAccessibleRecords(validated.patientId);
    return { success: true, data: records };
  } catch (error) {
    console.error("fetchPatientRecordsAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch medical records.",
    };
  }
}

const recordSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().optional(),
  type: z.enum(["clinical_note", "lab_result", "prescription", "imaging", "other"]),
  record_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  patient_id: z.string().uuid("Invalid patient ID"),
});

export async function createRecordAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse<MedicalRecordRow> & { fieldErrors?: Record<string, string[]> }> {
  try {
    const { getCurrentUser } = await import("@/lib/dal/auth");
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const rawData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as string,
      record_date: formData.get("record_date") as string,
      patient_id: formData.get("patient_id") as string,
    };

    const validatedFields = recordSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const data = validatedFields.data;
    const isDoctor = user.role === "doctor";

    const { createMedicalRecord } = await import("@/lib/dal/medical-records");
    
    const record = await createMedicalRecord({
      patient_id: data.patient_id,
      doctor_id: isDoctor ? user.id : undefined,
      title: data.title,
      description: data.description,
      type: data.type,
      record_date: data.record_date,
    });

    const { revalidatePath } = await import("next/cache");
    if (isDoctor) {
      revalidatePath(`/doctor/patients/${data.patient_id}/records`);
    } else {
      revalidatePath("/patient/records");
    }

    return { success: true, data: record };
  } catch (error) {
    console.error("createRecordAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create medical record.",
    };
  }
}

export async function updateRecordAction(
  id: string,
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse<MedicalRecordRow> & { fieldErrors?: Record<string, string[]> }> {
  try {
    const rawData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as string,
      record_date: formData.get("record_date") as string,
      patient_id: formData.get("patient_id") as string,
    };

    const validatedFields = recordSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { updateMedicalRecord } = await import("@/lib/dal/medical-records");
    const record = await updateMedicalRecord(id, validatedFields.data);

    const { getCurrentUser } = await import("@/lib/dal/auth");
    const user = await getCurrentUser();
    const { revalidatePath } = await import("next/cache");
    
    if (user?.role === "doctor") {
      revalidatePath(`/doctor/patients/${validatedFields.data.patient_id}/records`);
      revalidatePath(`/doctor/patients/${validatedFields.data.patient_id}/records/${id}`);
    } else {
      revalidatePath("/patient/records");
      revalidatePath(`/patient/records/${id}`);
    }

    return { success: true, data: record };
  } catch (error) {
    console.error("updateRecordAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update medical record.",
    };
  }
}

export async function deleteRecordAction(
  id: string,
  patientId: string
): Promise<ActionResponse<void>> {
  try {
    const { deleteMedicalRecord } = await import("@/lib/dal/medical-records");
    await deleteMedicalRecord(id);

    const { getCurrentUser } = await import("@/lib/dal/auth");
    const user = await getCurrentUser();
    const { revalidatePath } = await import("next/cache");
    
    if (user?.role === "doctor") {
      revalidatePath(`/doctor/patients/${patientId}/records`);
    } else {
      revalidatePath("/patient/records");
    }

    return { success: true };
  } catch (error) {
    console.error("deleteRecordAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete medical record.",
    };
  }
}
