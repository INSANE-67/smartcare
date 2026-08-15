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
