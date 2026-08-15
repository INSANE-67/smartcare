import type { Metadata } from "next";
import { requireRole } from "@/lib/dal/auth";
import { getDoctorAccessibleRecords } from "@/lib/dal/medical-records";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Patient Records — SmartCare",
  description: "View clinical records for your patient.",
};

export default async function DoctorPatientRecordsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("doctor");
  const { id: patientId } = await params;

  let records = [];
  try {
    records = await getDoctorAccessibleRecords(patientId);
  } catch {
    // If the DAL throws (no active relationship), we can show a forbidden state or 404.
    return (
      <div className="dash-content">
        <div className="dash-empty-state">
          <div className="dash-empty-state-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="dash-empty-state-title">Access Denied</h3>
          <p className="dash-empty-state-desc">
            You do not have an active relationship with this patient. You can only view records of active patients.
          </p>
          <div className="mt-6">
            <Link href="/doctor/patients" className="dash-btn dash-btn-primary">
              Return to Patients
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="dash-content">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Patient Records</h1>
          <p className="dash-page-subtitle">
            Reviewing clinical history for this patient.
          </p>
        </div>
        <div className="dash-page-actions">
          <Link href="/doctor/patients" className="dash-btn dash-btn-secondary">
            &larr; Back to Patients
          </Link>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="dash-empty-state">
          <div className="dash-empty-state-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="dash-empty-state-title">No records found</h3>
          <p className="dash-empty-state-desc">
            This patient has no clinical records or attachments yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {records.map((record) => (
            <div key={record.id} className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {formatType(record.type)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(record.record_date).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {record.title}
              </h3>
              {record.description && (
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-3">
                  {record.description}
                </p>
              )}
              {record.attachment_url && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <a
                    href={record.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    View Attachment
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
