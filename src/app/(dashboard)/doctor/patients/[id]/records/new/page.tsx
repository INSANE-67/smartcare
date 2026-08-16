import type { Metadata } from "next";
import { requireRole } from "@/lib/dal/auth";
import { checkActiveRelationship } from "@/lib/dal/relationships";
import { MedicalRecordForm } from "@/components/ui/medical-record-form";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Add Patient Record — SmartCare",
  description: "Create a new medical record for your patient.",
};

export default async function NewDoctorPatientRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("doctor");
  const { id: patientId } = await params;

  const hasAccess = await checkActiveRelationship(patientId);
  if (!hasAccess) {
    notFound();
  }

  return (
    <div className="dash-content max-w-3xl">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Add Patient Record</h1>
          <p className="dash-page-subtitle">
            Create a new clinical note, lab result, or prescription for this patient.
          </p>
        </div>
        <div className="dash-page-actions">
          <Link href={`/doctor/patients/${patientId}/records`} className="dash-btn dash-btn-secondary">
            &larr; Back to Records
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
        <MedicalRecordForm 
          patientId={patientId} 
          returnTo={`/doctor/patients/${patientId}/records`} 
        />
      </div>
    </div>
  );
}
