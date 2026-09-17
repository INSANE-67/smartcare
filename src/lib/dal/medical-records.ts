import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MedicalRecordRow, RecordType } from "@/types/database";
import { checkActiveRelationship } from "./relationships";

export interface MedicalRecordDTO extends MedicalRecordRow {
  doctorName?: string | null;
  patientName?: string | null;
  uploadedByName?: string | null;
  fileName?: string | null;
  fileExt?: string | null;
  signedUrl?: string | null;
}

/**
 * Generates a signed URL for a file stored in the 'medical-records' bucket.
 */
async function generateSignedUrl(
  supabase: any,
  attachmentPath: string | null
): Promise<string | null> {
  if (!attachmentPath) return null;
  
  // If it's already a full URL or data URI, return as-is
  if (attachmentPath.startsWith("http://") || attachmentPath.startsWith("https://")) {
    return attachmentPath;
  }

  try {
    const { data, error } = await supabase.storage
      .from("medical-records")
      .createSignedUrl(attachmentPath, 3600); // 1 hour expiration

    if (error || !data?.signedUrl) {
      return null;
    }
    return data.signedUrl;
  } catch (err) {
    console.warn("Could not generate signed URL for medical record:", err);
    return null;
  }
}

/**
 * Helper to extract a clean filename from a storage path.
 */
function extractFileName(path: string | null): { fileName: string | null; fileExt: string | null } {
  if (!path) return { fileName: null, fileExt: null };
  const parts = path.split("/");
  const rawFileName = parts[parts.length - 1] || path;
  // Remove timestamp prefix if present: "1724400000000_filename.pdf" -> "filename.pdf"
  const cleanName = rawFileName.replace(/^\d+_[a-z0-9]+_/, "").replace(/^\d+_/, "");
  const fileExt = cleanName.includes(".") ? cleanName.split(".").pop()?.toUpperCase() || null : null;
  return { fileName: cleanName, fileExt };
}

/**
 * Retrieves the authenticated patient's medical records with resolved metadata and signed URLs.
 */
export async function getPatientMedicalRecords(): Promise<MedicalRecordDTO[]> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("medical_records")
    .select("*")
    .eq("patient_id", user.id)
    .order("record_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) return [];

  // Gather doctor IDs
  const doctorIds = Array.from(new Set(data.map((r) => r.doctor_id).filter(Boolean))) as string[];
  const { data: doctorProfiles } = doctorIds.length > 0
    ? await supabase.from("profiles").select("id, full_name").in("id", doctorIds)
    : { data: [] };

  const doctorMap = new Map((doctorProfiles || []).map((d) => [d.id, d.full_name || "Doctor"]));

  const dtos: MedicalRecordDTO[] = await Promise.all(
    data.map(async (rec) => {
      const { fileName, fileExt } = extractFileName(rec.attachment_url);
      const signedUrl = await generateSignedUrl(supabase, rec.attachment_url);
      const rawDocName = rec.doctor_id ? doctorMap.get(rec.doctor_id) || "Doctor" : null;
      const doctorName = rawDocName
        ? rawDocName.startsWith("Dr.") ? rawDocName : `Dr. ${rawDocName}`
        : null;

      return {
        ...rec,
        doctorName,
        uploadedByName: doctorName || "Patient (Self-Uploaded)",
        fileName,
        fileExt,
        signedUrl,
      };
    })
  );

  return dtos;
}

/**
 * Retrieves a patient's medical records for an attending doctor with signed URLs.
 */
export async function getDoctorAccessibleRecords(patientId: string): Promise<MedicalRecordDTO[]> {
  const hasAccess = await checkActiveRelationship(patientId);
  if (!hasAccess) {
    throw new Error("Unauthorized: No active relationship with this patient.");
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("medical_records")
    .select("*")
    .eq("patient_id", patientId)
    .order("record_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) return [];

  // Fetch profiles for patient and doctors
  const doctorIds = Array.from(new Set(data.map((r) => r.doctor_id).filter(Boolean))) as string[];
  const allProfileIds = Array.from(new Set([patientId, ...doctorIds]));

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", allProfileIds);

  const profileMap = new Map((profiles || []).map((p) => [p.id, p.full_name || "User"]));
  const patientName = profileMap.get(patientId) || "Patient";

  const dtos: MedicalRecordDTO[] = await Promise.all(
    data.map(async (rec) => {
      const { fileName, fileExt } = extractFileName(rec.attachment_url);
      const signedUrl = await generateSignedUrl(supabase, rec.attachment_url);
      const rawDocName = rec.doctor_id ? profileMap.get(rec.doctor_id) : null;
      const doctorName = rawDocName
        ? rawDocName.startsWith("Dr.") ? rawDocName : `Dr. ${rawDocName}`
        : null;

      return {
        ...rec,
        doctorName,
        patientName,
        uploadedByName: doctorName || patientName,
        fileName,
        fileExt,
        signedUrl,
      };
    })
  );

  return dtos;
}

/**
 * Retrieves a single medical record by ID with resolved metadata and signed URL.
 */
export async function getMedicalRecord(id: string): Promise<MedicalRecordDTO | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("medical_records")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  // Resolve doctor and patient profiles
  const profileIds = [data.patient_id, data.doctor_id].filter(Boolean) as string[];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", profileIds);

  const profileMap = new Map((profiles || []).map((p) => [p.id, p.full_name || "User"]));

  const { fileName, fileExt } = extractFileName(data.attachment_url);
  const signedUrl = await generateSignedUrl(supabase, data.attachment_url);
  const rawDocName = data.doctor_id ? profileMap.get(data.doctor_id) : null;
  const doctorName = rawDocName
    ? rawDocName.startsWith("Dr.") ? rawDocName : `Dr. ${rawDocName}`
    : null;

  return {
    ...data,
    doctorName,
    patientName: profileMap.get(data.patient_id) || "Patient",
    uploadedByName: doctorName || profileMap.get(data.patient_id) || "Self-Uploaded",
    fileName,
    fileExt,
    signedUrl,
  };
}

export async function createMedicalRecord(record: {
  patient_id: string;
  doctor_id?: string;
  title: string;
  description?: string;
  type: RecordType;
  record_date: string;
  attachment_url?: string | null;
}): Promise<MedicalRecordRow> {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from("medical_records")
    .insert(record as never)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to create medical record.");
  }
  return data;
}

export async function updateMedicalRecord(
  id: string,
  updates: {
    title?: string;
    description?: string;
    type?: RecordType;
    record_date?: string;
    attachment_url?: string | null;
  }
): Promise<MedicalRecordRow> {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from("medical_records")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to update medical record.");
  }
  return data;
}

export async function deleteMedicalRecord(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();

  // 1. Get attachment_url if present so we can remove file from storage
  const { data: record } = await supabase
    .from("medical_records")
    .select("attachment_url")
    .eq("id", id)
    .maybeSingle();

  // 2. Delete database row
  const { error } = await supabase
    .from("medical_records")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message || "Failed to delete medical record.");
  }

  // 3. Remove file from storage (best-effort)
  if (record?.attachment_url) {
    try {
      await supabase.storage
        .from("medical-records")
        .remove([record.attachment_url]);
    } catch (storageErr) {
      console.warn("Failed to remove file from storage:", storageErr);
    }
  }
}
