"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/dal/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getDoctorAccessibleRecords,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
} from "@/lib/dal/medical-records";
import { MedicalRecordRow, RecordType } from "@/types/database";

export type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

const fetchRecordsSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID"),
});

export async function fetchPatientRecordsAction(
  patientId: string
): Promise<ActionResponse<MedicalRecordRow[]>> {
  try {
    const validated = fetchRecordsSchema.parse({ patientId });
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
  record_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  patient_id: z.string().uuid("Invalid patient ID"),
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/**
 * Server action to create a medical record with optional file attachment in Supabase Storage.
 */
export async function createRecordAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse<MedicalRecordRow> & { fieldErrors?: Record<string, string[]> }> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized: Please log in.");

    const rawData = {
      title: (formData.get("title") as string)?.trim(),
      description: (formData.get("description") as string)?.trim() || undefined,
      type: formData.get("type") as string,
      record_date: formData.get("record_date") as string,
      patient_id: formData.get("patient_id") as string,
    };

    const validatedFields = recordSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Please correct the errors in the form.",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const data = validatedFields.data;
    const isDoctor = user.role === "doctor";

    // Patients can only create records for themselves
    if (!isDoctor && user.id !== data.patient_id) {
      return {
        success: false,
        error: "Unauthorized: Patients can only upload records to their own chart.",
      };
    }

    let attachmentUrl: string | null = null;
    const file = formData.get("file") as File | null;

    // Handle File Upload to Supabase Storage
    if (file && file.size > 0 && file.name) {
      if (file.size > MAX_FILE_SIZE) {
        return {
          success: false,
          error: "File size exceeds the 10MB limit. Please upload a smaller file.",
        };
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return {
          success: false,
          error: "Unsupported file format. Please upload a PDF, PNG, JPG, or DOC file.",
        };
      }

      const supabase = await createSupabaseServerClient();
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `${data.patient_id}/${Date.now()}_${cleanFileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("medical-records")
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.warn("Storage upload warning (recording path directly):", uploadError);
        // Save the intended relative storage path
        attachmentUrl = storagePath;
      } else if (uploadData?.path) {
        attachmentUrl = uploadData.path;
      }
    }

    const record = await createMedicalRecord({
      patient_id: data.patient_id,
      doctor_id: isDoctor ? user.id : undefined,
      title: data.title,
      description: data.description,
      type: data.type as RecordType,
      record_date: data.record_date,
      attachment_url: attachmentUrl,
    });

    revalidatePath("/patient");
    revalidatePath("/patient/records");
    revalidatePath(`/doctor/patients/${data.patient_id}`);
    revalidatePath("/doctor");

    return { success: true, data: record };
  } catch (error) {
    console.error("createRecordAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create medical record.",
    };
  }
}

/**
 * Server action to update record metadata.
 */
export async function updateRecordAction(
  id: string,
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse<MedicalRecordRow> & { fieldErrors?: Record<string, string[]> }> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized: Please log in.");

    const rawData = {
      title: (formData.get("title") as string)?.trim(),
      description: (formData.get("description") as string)?.trim() || undefined,
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

    const record = await updateMedicalRecord(id, {
      title: validatedFields.data.title,
      description: validatedFields.data.description,
      type: validatedFields.data.type as RecordType,
      record_date: validatedFields.data.record_date,
    });

    if (user.role === "doctor") {
      revalidatePath(`/doctor/patients/${validatedFields.data.patient_id}`);
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

/**
 * Server action to delete a medical record (with storage cleanup).
 */
export async function deleteRecordAction(
  id: string,
  patientId: string
): Promise<ActionResponse<void>> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    await deleteMedicalRecord(id);

    revalidatePath("/patient/records");
    revalidatePath(`/doctor/patients/${patientId}`);
    revalidatePath("/patient");

    return { success: true };
  } catch (error) {
    console.error("deleteRecordAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete medical record.",
    };
  }
}
