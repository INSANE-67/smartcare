import type { Metadata } from "next";
import { requireRole } from "@/lib/dal/auth";
import { MedicalRecordForm } from "@/components/ui/medical-record-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Upload Health Record — SmartCare",
  description: "Upload a diagnostic file, lab result, or clinical report to your EHR record.",
};

export default async function NewPatientRecordPage() {
  const user = await requireRole("patient");

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/patient/records"
              className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Health Records</span>
            </Link>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Upload Diagnostic Health Record
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Attach lab reports, discharge summaries, or imaging files to your medical record.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-xs">
        <MedicalRecordForm patientId={user.id} returnTo="/patient/records" />
      </div>
    </div>
  );
}
