import type { Metadata } from "next";
import { requireRole } from "@/lib/dal/auth";
import { checkActiveRelationship } from "@/lib/dal/relationships";
import { getMedicalRecord } from "@/lib/dal/medical-records";
import { MedicalRecordForm } from "@/components/ui/medical-record-form";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Edit Patient Record — SmartCare",
  description: "Edit an existing medical record for your patient.",
};

export default async function EditDoctorPatientRecordPage({
  params,
}: {
  params: Promise<{ id: string; recordId: string }>;
}) {
  const user = await requireRole("doctor");
  const { id: patientId, recordId } = await params;

  const hasAccess = await checkActiveRelationship(patientId);
  if (!hasAccess) {
    notFound();
  }

  const record = await getMedicalRecord(recordId);
  
  // A doctor can only edit records that THEY created for this patient.
  if (!record || record.patient_id !== patientId || record.doctor_id !== user.id) {
    notFound();
  }

  return (
    <div className="dash-content max-w-3xl">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Edit Patient Record</h1>
          <p className="dash-page-subtitle">
            Update the details of this medical record.
          </p>
        </div>
        <div className="dash-page-actions">
          <Link href={`/doctor/patients/${patientId}/records/${recordId}`} className="dash-btn dash-btn-secondary">
            &larr; Back to Record
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
        <MedicalRecordForm 
          patientId={patientId} 
          initialData={record} 
          returnTo={`/doctor/patients/${patientId}/records/${recordId}`} 
        />
      </div>
    </div>
  );
}
