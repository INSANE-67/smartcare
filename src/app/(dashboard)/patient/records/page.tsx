import type { Metadata } from "next";
import { requireRole } from "@/lib/dal/auth";
import { getPatientMedicalRecords } from "@/lib/dal/medical-records";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import {
  FileText,
  Plus,
  Download,
  Eye,
  ArrowRight,
  ShieldCheck,
  Search,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Medical Records (EHR) — SmartCare",
  description: "Secure electronic health records, diagnostic summaries, and medical imaging documents.",
};

interface PatientRecordsPageProps {
  searchParams?: Promise<{ q?: string; category?: string }>;
}

export default async function PatientRecordsPage({ searchParams }: PatientRecordsPageProps) {
  await requireRole("patient");
  const sParams = searchParams ? await searchParams : {};
  const searchQuery = (sParams?.q || "").toLowerCase().trim();
  const selectedCategory = (sParams?.category || "all").toLowerCase();

  const allRecords = await getPatientMedicalRecords();

  const categories = [
    { key: "all", label: "All Records" },
    { key: "lab_result", label: "Lab Reports" },
    { key: "prescription", label: "Prescriptions" },
    { key: "imaging", label: "Scans & Imaging" },
    { key: "vaccination", label: "Vaccinations" },
    { key: "discharge_summary", label: "Discharge Summaries" },
    { key: "clinical_note", label: "General Documents" },
  ];

  // Apply searching and filtering
  const filteredRecords = allRecords.filter((rec) => {
    const matchesCategory =
      selectedCategory === "all" ||
      rec.type.toLowerCase() === selectedCategory;

    const matchesSearch =
      !searchQuery ||
      rec.title.toLowerCase().includes(searchQuery) ||
      (rec.description && rec.description.toLowerCase().includes(searchQuery)) ||
      (rec.doctorName && rec.doctorName.toLowerCase().includes(searchQuery));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8DED2]">
        <div className="space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#777777] font-semibold">
            Health Record Archival
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
            Electronic Health Records (EHR)
          </h1>
          <p className="text-xs text-[#555555]">
            Encrypted diagnostic reports, lab summaries, and clinical encounter documents.
          </p>
        </div>

        <Link
          href="/patient/records/new"
          className="btn-primary py-2.5 px-5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Record</span>
        </Link>
      </div>

      {/* ── Category Filter Bar ── */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.key;
          return (
            <Link
              key={cat.key}
              href={cat.key === "all" ? "/patient/records" : `/patient/records?category=${cat.key}`}
              className={`text-xs font-medium px-4 py-2 rounded-full border transition-all ${
                isActive
                  ? "bg-[#111111] text-white border-[#111111] shadow-xs"
                  : "bg-white border-[#E8DED2] text-[#555555] hover:text-[#111111] hover:bg-[#FAF7F2]"
              }`}
            >
              {cat.label}
            </Link>
          );
        })}
      </div>

      {/* ── Records Table ── */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-[22px] border border-[#E8DED2] p-8 shadow-xs">
          <EmptyState
            icon={FileText}
            title={searchQuery || selectedCategory !== "all" ? "No matching records found" : "No health records uploaded"}
            description={
              searchQuery || selectedCategory !== "all"
                ? "Try adjusting your search query or selecting another category filter."
                : "You don't have any medical records uploaded yet. Securely upload your diagnostic files and prescriptions."
            }
            actionHref="/patient/records/new"
            actionLabel="Upload Medical Record"
          />
        </div>
      ) : (
        <div className="bg-white rounded-[22px] border border-[#E8DED2] overflow-hidden shadow-xs">
          <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#E8DED2] flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#555555] font-semibold">
              Archived Documents ({filteredRecords.length})
            </span>
          </div>

          <div className="divide-y divide-[#E8DED2]">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAF7F2]/50 transition-colors"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] text-[#111111] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/patient/records/${record.id}`}
                        className="font-serif font-bold text-base text-[#111111] hover:underline truncate"
                      >
                        {record.title}
                      </Link>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#FAF7F2] border border-[#E8DED2] text-[#555555] uppercase">
                        {record.type}
                      </span>
                    </div>

                    {record.description && (
                      <p className="text-xs text-[#555555] line-clamp-1">
                        {record.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#777777] font-mono">
                      <span>Date: {new Date(record.record_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      <span>&bull;</span>
                      <span>By {record.uploadedByName || "Patient"}</span>
                      {record.fileExt && (
                        <>
                          <span>&bull;</span>
                          <span className="uppercase font-bold text-[#111111]">
                            {record.fileExt}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 md:self-center">
                  {record.signedUrl && (
                    <>
                      <a
                        href={record.signedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary py-2 px-3 rounded-full text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </a>
                      <a
                        href={record.signedUrl}
                        download={record.fileName || "record.pdf"}
                        className="btn-secondary py-2 px-3 rounded-full text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </>
                  )}
                  <Link
                    href={`/patient/records/${record.id}`}
                    className="btn-secondary py-2 px-3.5 rounded-full text-xs font-medium inline-flex items-center gap-1 shadow-2xs"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}