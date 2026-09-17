import { Metadata } from "next";
import Link from "next/link";
import {
  Calendar,
  FileText,
  ShieldCheck,
  Stethoscope,
  Check,
  Lock,
  ArrowRight,
  UserCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Platform Capabilities — SmartCare",
  description: "Comprehensive features engineered for modern clinical workflows and patient care.",
};

export default function FeaturesPage() {
  return (
    <div className="py-20 lg:py-28 px-6 bg-[#FAF7F2]">
      <div className="container mx-auto max-w-5xl space-y-16">
        {/* ── Page Header ── */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E8DED2] shadow-xs text-xs font-semibold text-[#111111]">
            <span>Built for Modern Healthcare</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#111111]">
            Comprehensive clinical capabilities
          </h1>
          <p className="font-sans text-base sm:text-lg text-[#555555] max-w-2xl mx-auto leading-relaxed">
            SmartCare integrates scheduling, electronic health records, diagnostic archives, and physician workstation tools into one unified platform.
          </p>
        </div>

        {/* ── Capabilities Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Section 1: For Patients */}
          <div className="card-saas p-8 sm:p-10 rounded-[22px] bg-white border border-[#E8DED2] space-y-6">
            <div className="w-12 h-12 rounded-[16px] bg-[#FAF7F2] border border-[#E8DED2] text-[#111111] flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#111111]">
                For Patients
              </h2>
              <p className="text-xs text-[#555555] mt-1">
                Seamless health access and total visibility over your medical history.
              </p>
            </div>

            <ul className="space-y-4 pt-2">
              {[
                { title: "Direct Specialist Scheduling", desc: "Browse accredited physicians, verify specialties, and book appointments 24/7." },
                { title: "Personal Health Record Vault", desc: "View and securely download diagnostic reports, lab panels, and imaging files." },
                { title: "Consultation History & Notes", desc: "Access comprehensive encounter notes and treatment recommendations from your doctor." },
                { title: "Instant Status Notifications", desc: "Receive immediate updates when appointments are confirmed, rescheduled, or completed." },
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FAF7F2] border border-[#E8DED2] text-[#111111] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-[#111111]">{item.title}</p>
                    <p className="text-xs text-[#555555] leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 2: For Healthcare Providers */}
          <div className="card-saas p-8 sm:p-10 rounded-[22px] bg-white border border-[#E8DED2] space-y-6">
            <div className="w-12 h-12 rounded-[16px] bg-[#FAF7F2] border border-[#E8DED2] text-[#111111] flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#111111]">
                For Healthcare Providers
              </h2>
              <p className="text-xs text-[#555555] mt-1">
                Optimized physician workstation with high clinical density and minimal administrative overhead.
              </p>
            </div>

            <ul className="space-y-4 pt-2">
              {[
                { title: "Clinical Encounter Workstation", desc: "Review upcoming patients, triage consultation requests, and conduct visits." },
                { title: "Diagnostic Document Uploads", desc: "Attach PDF lab reports, radiology imaging, and discharge summaries to patient EHR charts." },
                { title: "Structured Consultation Notes", desc: "Record clinical diagnoses, subjective findings, and treatment plans in standard format." },
                { title: "Availability & Practice Management", desc: "Define consultation hours and manage active care patient relationships seamlessly." },
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FAF7F2] border border-[#E8DED2] text-[#111111] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-[#111111]">{item.title}</p>
                    <p className="text-xs text-[#555555] leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Security Architecture Card ── */}
        <div className="card-saas p-8 sm:p-10 rounded-[22px] bg-white border border-[#E8DED2] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8DED2]">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#111111] text-white flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#111111]">
                  Data Integrity &amp; Compliance Architecture
                </h2>
                <p className="text-xs text-[#555555]">
                  Cryptographic standards ensuring your clinical information is safe.
                </p>
              </div>
            </div>
            <span className="badge-neutral self-start sm:self-center">
              ISO/EHR Architecture
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div className="space-y-2">
              <p className="text-sm font-bold text-[#111111]">Row-Level Security (RLS)</p>
              <p className="text-xs text-[#555555] leading-relaxed">
                Database-level authorization rules guarantee patient records are strictly accessible only by the patient and their active attending physician.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold text-[#111111]">Signed Storage Tokens</p>
              <p className="text-xs text-[#555555] leading-relaxed">
                Uploaded diagnostic scans and PDF lab documents are served through temporary signed URLs expiring after 60 minutes.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold text-[#111111]">Audit Trail Logging</p>
              <p className="text-xs text-[#555555] leading-relaxed">
                Full trace history tracking who authored records, scheduled visits, and modified consultation plans.
              </p>
            </div>
          </div>
        </div>

        {/* ── Bottom Call To Action ── */}
        <div className="text-center pt-8">
          <Link
            href="/signup"
            className="btn-primary text-sm px-8 py-3.5 inline-flex"
          >
            <span>Create Your Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
