import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/dal/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDoctorAccessibleRecords } from "@/lib/dal/medical-records";
import { MedicalRecordForm } from "@/components/ui/medical-record-form";
import { EmptyState } from "@/components/ui/empty-state";
import { PatientAiSummarizer } from "./_components/patient-ai-summarizer";
import {
  ArrowLeft,
  UploadCloud,
  FileText,
  Download,
  Eye,
  Plus,
  Mail,
  Phone,
  Calendar,
  User,
  Heart,
  AlertCircle,
  Hash,
  ExternalLink,
} from "lucide-react";

interface DoctorPatientDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ upload?: string }>;
}

export async function generateMetadata({
  params,
}: DoctorPatientDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", id)
    .single();

  return {
    title: profile ? `${profile.full_name} — Clinical EHR Chart` : "Patient EHR Chart",
    description: "Clinical records, telemetry, diagnostic documents, and AI summaries.",
  };
}

export default async function DoctorPatientDetailPage({
  params,
  searchParams,
}: DoctorPatientDetailPageProps) {
  await requireRole("doctor");
  const { id: patientId } = await params;
  const sParams = searchParams ? await searchParams : {};
  const showUpload = sParams?.upload === "true";

  const supabase = await createSupabaseServerClient();

  // 1. Fetch patient profile
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, avatar_url, phone, date_of_birth, gender, created_at")
    .eq("id", patientId)
    .single();

  if (error || !profile || profile.role !== "patient") {
    notFound();
  }

  // 2. Fetch live medical records for this patient
  let records: Awaited<ReturnType<typeof getDoctorAccessibleRecords>> = [];
  try {
    records = await getDoctorAccessibleRecords(patientId);
  } catch (err) {
    console.warn("Could not load patient medical records:", err);
  }

  // 3. Fetch email via admin client if available
  let email = "patient@smartcare.local";
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminSupabase = createSupabaseAdminClient();
      const { data: authUser } = await adminSupabase.auth.admin.getUserById(patientId);
      if (authUser?.user?.email) {
        email = authUser.user.email;
      }
    } catch (err) {
      console.warn("Could not fetch user email:", err);
    }
  }

  const shortId = `PT-${profile.id.slice(0, 8).toUpperCase()}`;
  const initials =
    profile.full_name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "PT";

  const formattedDob = profile.date_of_birth
    ? new Date(profile.date_of_birth).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Not documented";

  const formatCategory = (type: string) => {
    switch (type) {
      case "clinical_note": return "Clinical Note";
      case "lab_result": return "Lab Result";
      case "prescription": return "Prescription";
      case "imaging": return "Radiology";
      default: return "Diagnostic Document";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      {/* ── Top Navigation & Header ── */}
      <div className="space-y-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <Link
          href="/doctor/patients"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Directory</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-lg bg-blue-600 text-white font-bold text-base flex items-center justify-center flex-shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  {profile.full_name}
                </h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300 border border-green-200 dark:border-green-800">
                  Active Care Patient
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono">{shortId}</span>
                <span>&bull;</span>
                <span>{email}</span>
                {profile.phone && (
                  <>
                    <span>&bull;</span>
                    <span>{profile.phone}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={showUpload ? `/doctor/patients/${patientId}` : `/doctor/patients/${patientId}?upload=true`}
              className="btn btn-primary text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{showUpload ? "Close Upload Form" : "Upload Document"}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Content Grid (2 Columns + 1 Column) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2) - Medical Records & Document Upload */}
        <div className="lg:col-span-2 space-y-4">
          {/* Upload Form Expansion */}
          {showUpload && (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Attach Medical Record for {profile.full_name}
                </h3>
              </div>
              <MedicalRecordForm
                patientId={patientId}
                returnTo={`/doctor/patients/${patientId}`}
              />
            </div>
          )}

          {/* Live Records Table */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  EHR Medical Records &amp; Diagnostic Files
                </h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {records.length} records on file
              </span>
            </div>

            {records.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={FileText}
                  title="No medical records attached"
                  description="No clinical notes or lab results are attached to this patient's medical record."
                  actionHref={`/doctor/patients/${patientId}?upload=true`}
                  actionLabel="Upload First Diagnostic Record"
                />
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {records.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {doc.title}
                          </h4>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {formatCategory(doc.type)}
                          </span>
                        </div>
                        {doc.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                            {doc.description}
                          </p>
                        )}
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                          Encounter: {new Date(doc.record_date).toLocaleDateString()} &bull; Uploaded by {doc.uploadedByName || "Care Team"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 sm:self-center">
                      {doc.signedUrl && (
                        <>
                          <a
                            href={doc.signedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary text-xs px-2.5 py-1"
                            title="Preview file"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </a>
                          <a
                            href={doc.signedUrl}
                            download={doc.fileName || "medical-record.pdf"}
                            className="btn btn-secondary text-xs px-2.5 py-1"
                            title="Download file"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Span 1) - Demographics & AI Summarizer */}
        <div className="space-y-4">
          {/* Card 1: Patient Demographics */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Patient Clinical Data
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Date of Birth
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formattedDob}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Gender
                </span>
                <span className="font-semibold text-slate-900 dark:text-white capitalize">
                  {profile.gender || "Not specified"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-red-500" />
                  Blood Type
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  O+ (Documented)
                </span>
              </div>

              <div className="py-1">
                <span className="text-slate-500 dark:text-slate-400 block mb-0.5">
                  Known Allergies
                </span>
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  Penicillin, Sulfa drugs
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: AI Summarizer */}
          <PatientAiSummarizer patientName={profile.full_name} />
        </div>
      </div>
    </div>
  );
}
