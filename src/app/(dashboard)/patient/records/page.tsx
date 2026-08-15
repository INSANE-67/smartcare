import type { Metadata } from "next";
import { requireRole } from "@/lib/dal/auth";
import { getPatientMedicalRecords } from "@/lib/dal/medical-records";

export const metadata: Metadata = {
  title: "My Medical Records — SmartCare",
  description: "View and manage your medical records.",
};

export default async function PatientRecordsPage() {
  await requireRole("patient");
  const records = await getPatientMedicalRecords();

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
          <h1 className="dash-page-title">Medical Records</h1>
          <p className="dash-page-subtitle">
            View your clinical notes, lab results, and prescriptions.
          </p>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="dash-empty-state">
          <div className="dash-empty-state-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
            </svg>
          </div>
          <h3 className="dash-empty-state-title">No records found</h3>
          <p className="dash-empty-state-desc">
            You don&apos;t have any medical records uploaded yet. Records added by you or your active doctors will appear here.
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
