import type { Metadata } from "next";
import { requireRole } from "@/lib/dal/auth";
import { getMedicalRecord } from "@/lib/dal/medical-records";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Eye, FileText, Calendar, User, Clock, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Health Record Details — SmartCare",
  description: "View diagnostic record details, attachments, and clinical interpretations.",
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

  const formatCategory = (type: string) => {
    switch (type) {
      case "clinical_note": return "Clinical Note";
      case "lab_result": return "Lab Result";
      case "prescription": return "Prescription";
      case "imaging": return "Radiology / Imaging";
      default: return "Diagnostic Record";
    }
  };

  const isPdf = record.fileExt === "PDF" || record.attachment_url?.toLowerCase().endsWith(".pdf");
  const isImage = ["PNG", "JPG", "JPEG", "WEBP"].includes(record.fileExt || "") || 
    /\.(png|jpe?g|webp)$/i.test(record.attachment_url || "");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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
            {record.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Record ID: {record.id}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {record.signedUrl && (
            <>
              <a
                href={record.signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary text-xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Open Preview</span>
              </a>
              <a
                href={record.signedUrl}
                download={record.fileName || "medical-record.pdf"}
                className="btn btn-primary text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </a>
            </>
          )}
        </div>
      </div>

      {/* ── Record Overview Panel ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-xs space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Category
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {formatCategory(record.type)}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Encounter Date
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {new Date(record.record_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Uploaded By
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {record.uploadedByName || "Care Team"}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              File Format
            </span>
            <p className="text-sm font-mono font-semibold text-slate-900 dark:text-white">
              {record.fileExt || "EHR Entry"}
            </p>
          </div>
        </div>

        {/* Description / Findings */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
            Clinical Notes &amp; Findings
          </span>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
            {record.description || "No specific findings or notes documented."}
          </div>
        </div>

        {/* In-browser Document Preview */}
        {record.signedUrl && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Document Preview
            </h3>

            {isImage ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={record.signedUrl}
                  alt={record.title}
                  className="max-h-[500px] rounded object-contain"
                />
              </div>
            ) : isPdf ? (
              <div className="w-full h-[500px] rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800">
                <iframe
                  src={record.signedUrl}
                  className="w-full h-full border-none"
                  title="Document Preview"
                />
              </div>
            ) : (
              <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                  This file format ({record.fileExt || "Document"}) can be downloaded to your device.
                </p>
                <a
                  href={record.signedUrl}
                  download={record.fileName || "document"}
                  className="btn btn-secondary text-xs inline-flex"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Attached File</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Read-Only Notice for Patient */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <span>Official Health Record &bull; Stored securely via EHR Cloud</span>
          <span>Created on {new Date(record.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
