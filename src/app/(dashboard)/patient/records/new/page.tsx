import type { Metadata } from "next";
import { requireRole } from "@/lib/dal/auth";
import { MedicalRecordForm } from "@/components/ui/medical-record-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Add Medical Record — SmartCare",
  description: "Add a new medical record to your profile.",
};

export default async function NewPatientRecordPage() {
  const user = await requireRole("patient");

  return (
    <div className="dash-content max-w-3xl">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Add Medical Record</h1>
          <p className="dash-page-subtitle">
            Create a new clinical note, lab result, or prescription record.
          </p>
        </div>
        <div className="dash-page-actions">
          <Link href="/patient/records" className="dash-btn dash-btn-secondary">
            &larr; Back to Records
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
        <MedicalRecordForm patientId={user.id} returnTo="/patient/records" />
      </div>
    </div>
  );
}
