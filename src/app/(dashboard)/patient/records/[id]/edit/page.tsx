import type { Metadata } from "next";
import { requireRole } from "@/lib/dal/auth";
import { getMedicalRecord } from "@/lib/dal/medical-records";
import { MedicalRecordForm } from "@/components/ui/medical-record-form";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Edit Medical Record — SmartCare",
  description: "Edit an existing medical record.",
};

export default async function EditPatientRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("patient");
  const { id } = await params;

  const record = await getMedicalRecord(id);

  if (!record || record.patient_id !== user.id) {
    notFound();
  }

  return (
    <div className="dash-content max-w-3xl">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Edit Medical Record</h1>
          <p className="dash-page-subtitle">
            Update the details of your medical record.
          </p>
        </div>
        <div className="dash-page-actions">
          <Link href={`/patient/records/${id}`} className="dash-btn dash-btn-secondary">
            &larr; Back to Record
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
        <MedicalRecordForm 
          patientId={user.id} 
          initialData={record} 
          returnTo={`/patient/records/${id}`} 
        />
      </div>
    </div>
  );
}
