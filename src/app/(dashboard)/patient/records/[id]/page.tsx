import type { Metadata } from "next";
import { requireRole } from "@/lib/dal/auth";
import { getMedicalRecord } from "@/lib/dal/medical-records";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteRecordButton } from "@/components/ui/delete-record-button";

export const metadata: Metadata = {
  title: "Medical Record Details — SmartCare",
  description: "View details of your medical record.",
};

export default async function PatientRecordDetailsPage({
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

  const formatType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="dash-content max-w-4xl">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">{record.title}</h1>
          <p className="dash-page-subtitle">
            {formatType(record.type)} • {new Date(record.record_date).toLocaleDateString()}
          </p>
        </div>
        <div className="dash-page-actions flex gap-3">
          <Link href="/patient/records" className="dash-btn dash-btn-secondary">
            &larr; Back
          </Link>
          <Link href={`/patient/records/${id}/edit`} className="dash-btn dash-btn-primary">
            Edit
          </Link>
          <DeleteRecordButton id={record.id} patientId={user.id} returnTo="/patient/records" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Description</h3>
          <div className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
            {record.description || <span className="italic text-slate-400">No description provided.</span>}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Record Type</h3>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{formatType(record.type)}</p>
          </div>
          <div>
            <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Date</h3>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{new Date(record.record_date).toLocaleDateString()}</p>
          </div>
          <div>
            <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Added On</h3>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{new Date(record.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Last Updated</h3>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{new Date(record.updated_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
