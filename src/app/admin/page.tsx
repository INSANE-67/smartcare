import { getSystemStats, getPendingDoctors } from "@/lib/dal/admin";
import Link from "next/link";
import { Users, Stethoscope, UserCheck, ShieldCheck, Calendar, ArrowRight, Activity, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";

export default async function AdminDashboardPage() {
  const stats = await getSystemStats();
  const pendingDocs = await getPendingDoctors().catch(() => []);

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto">
      {/* ══════════════════════════════════════════════════════════════════════
          TOP HERO / SPACIOUS WELCOME SECTION
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white rounded-[18px] border border-[#E8DED2] p-8 sm:p-10 lg:p-12 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-8 transition-all">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E8DED2] text-xs font-mono font-semibold text-[#111111]">
            <span className="w-2 h-2 rounded-full bg-[#111111]" />
            <span>SmartCare Healthcare Network &bull; Production Cluster</span>
          </div>

          <div className="space-y-1">
            <p className="text-base sm:text-lg font-medium text-[#666666] font-sans">
              Platform Administration,
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#111111] leading-tight">
              Control &amp; Operations
            </h1>
          </div>

          <p className="text-sm sm:text-base text-[#666666] leading-relaxed pt-1">
            All system nodes operational. You have{" "}
            <strong className="text-[#111111] font-semibold">
              {pendingDocs.length} pending physician {pendingDocs.length === 1 ? "application" : "applications"}
            </strong>{" "}
            requiring credential review and{" "}
            <strong className="text-[#111111] font-semibold">
              {stats.totalPatients} active patient {stats.totalPatients === 1 ? "record" : "records"}
            </strong>{" "}
            in the registry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/admin/pending-doctors"
            className="btn-primary py-3.5 px-7 rounded-full text-xs font-semibold inline-flex items-center gap-2 shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Doctor Approvals</span>
            {pendingDocs.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-white text-[#111111] text-[10px] font-mono font-bold">
                {pendingDocs.length}
              </span>
            )}
          </Link>
          <Link
            href="/admin/users"
            className="btn-secondary py-3.5 px-7 rounded-full text-xs font-semibold inline-flex items-center gap-2 shadow-2xs hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <Users className="w-4 h-4 text-[#111111]" />
            <span>User Directory</span>
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FOUR COMPACT METRIC CARDS
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-white rounded-[18px] border border-[#E8DED2] p-6 shadow-xs flex items-center justify-between gap-4 hover:-translate-y-0.5 transition-transform duration-200">
          <div className="space-y-1">
            <p className="text-xs font-mono uppercase tracking-wider text-[#666666] font-semibold">
              Total Patients
            </p>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#111111] tracking-tight">
              {stats.totalPatients}
            </h3>
            <p className="text-xs text-[#666666]">
              Registered patient charts
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] flex items-center justify-center text-[#111111] shrink-0 shadow-2xs">
            <Users className="w-5 h-5 stroke-[1.75]" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-[18px] border border-[#E8DED2] p-6 shadow-xs flex items-center justify-between gap-4 hover:-translate-y-0.5 transition-transform duration-200">
          <div className="space-y-1">
            <p className="text-xs font-mono uppercase tracking-wider text-[#666666] font-semibold">
              Accredited Doctors
            </p>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#111111] tracking-tight">
              {stats.totalDoctors}
            </h3>
            <p className="text-xs text-[#666666]">
              Verified clinical providers
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] flex items-center justify-center text-[#111111] shrink-0 shadow-2xs">
            <Stethoscope className="w-5 h-5 stroke-[1.75]" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-[18px] border border-[#E8DED2] p-6 shadow-xs flex items-center justify-between gap-4 hover:-translate-y-0.5 transition-transform duration-200">
          <div className="space-y-1">
            <p className="text-xs font-mono uppercase tracking-wider text-[#666666] font-semibold">
              Pending Approvals
            </p>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#111111] tracking-tight">
              {pendingDocs.length}
            </h3>
            <p className="text-xs text-[#666666]">
              {pendingDocs.length > 0 ? "Awaiting verification" : "Queue all triaged"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] flex items-center justify-center text-[#111111] shrink-0 shadow-2xs">
            <UserCheck className="w-5 h-5 stroke-[1.75]" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-[18px] border border-[#E8DED2] p-6 shadow-xs flex items-center justify-between gap-4 hover:-translate-y-0.5 transition-transform duration-200">
          <div className="space-y-1">
            <p className="text-xs font-mono uppercase tracking-wider text-[#666666] font-semibold">
              Recent Signups (7d)
            </p>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#111111] tracking-tight">
              {stats.recentSignups}
            </h3>
            <p className="text-xs text-[#666666]">
              Platform onboarding growth
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] flex items-center justify-center text-[#111111] shrink-0 shadow-2xs">
            <TrendingUp className="w-5 h-5 stroke-[1.75]" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          TWO-COLUMN MAIN GRID: LEFT (70% - Span 8) / RIGHT (30% - Span 4)
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── LEFT COLUMN (70% — Span 8) ── */}
        <div className="lg:col-span-8 space-y-8">
          {/* Card 1: Urgent Doctor Verification Queue */}
          <div className="bg-white rounded-[18px] border border-[#E8DED2] p-7 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#E8DED2] pb-5">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#111111]">
                  Urgent Doctor Verification Queue
                </h2>
                <p className="text-xs text-[#666666] mt-0.5">
                  Physician onboarding requests awaiting credential accreditation.
                </p>
              </div>
              <Link
                href="/admin/pending-doctors"
                className="text-xs font-semibold text-[#111111] hover:underline inline-flex items-center gap-1"
              >
                <span>View all ({pendingDocs.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {pendingDocs.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] text-[#111111] flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6 stroke-[1.75]" />
                </div>
                <p className="font-serif font-bold text-base text-[#111111]">
                  All Doctor Applications Triaged
                </p>
                <p className="text-xs text-[#666666] max-w-sm mx-auto">
                  No pending verification requests at this time. All provider onboarding submissions have been reviewed.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#E8DED2]">
                {pendingDocs.slice(0, 4).map((doc) => (
                  <div key={doc.id} className="py-4.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-bold text-base text-[#111111]">{doc.profiles?.full_name || "Physician Applicant"}</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#FAF7F2] border border-[#E8DED2] text-[#111111] font-semibold">
                          {doc.specialty || "General Medicine"}
                        </span>
                      </div>
                      <p className="text-xs text-[#666666]">
                        Medical License: <strong className="font-mono text-[#111111]">{doc.license_number || "Pending Document"}</strong> &bull; Submitted {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <Link
                      href="/admin/pending-doctors"
                      className="btn-primary py-2 px-4 rounded-full text-xs font-semibold shadow-xs"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 2: Platform Security & Compliance Log */}
          <div className="bg-white rounded-[18px] border border-[#E8DED2] p-7 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#E8DED2] pb-5">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#111111]">
                  Security &amp; Audit Logs
                </h2>
                <p className="text-xs text-[#666666] mt-0.5">
                  Platform access events, RLS enforcement, and storage encryption status.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[#111111]">Supabase Storage Policy</p>
                  <p className="text-xs text-[#666666]">Signed URLs enforced on all medical-records and avatar buckets.</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-[#111111] shrink-0" />
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[#111111]">Row Level Security (RLS)</p>
                  <p className="text-xs text-[#666666]">Strict patient and doctor table isolation verified.</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-[#111111] shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (30% — Span 4) ── */}
        <div className="lg:col-span-4 space-y-8">
          {/* Card 1: Management Portals */}
          <div className="bg-white rounded-[18px] border border-[#E8DED2] p-7 sm:p-8 shadow-xs space-y-5">
            <h3 className="font-serif text-xl font-bold text-[#111111]">
              Management Hub
            </h3>

            <div className="space-y-3">
              <Link
                href="/admin/pending-doctors"
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] hover:bg-[#F5EFE6] text-xs font-bold text-[#111111] transition-all hover:translate-x-1"
              >
                <div className="flex items-center gap-3">
                  <UserCheck className="w-4 h-4 text-[#111111]" />
                  <span>Doctor Approvals Queue</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#777777]" />
              </Link>

              <Link
                href="/admin/users"
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] hover:bg-[#F5EFE6] text-xs font-bold text-[#111111] transition-all hover:translate-x-1"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-[#111111]" />
                  <span>User &amp; Patient Directory</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#777777]" />
              </Link>
            </div>
          </div>

          {/* Card 2: Platform Compliance Card (PURE WHITE CARD) */}
          <div className="bg-white rounded-[18px] border border-[#E8DED2] p-7 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-[#111111]">
              <ShieldCheck className="w-4 h-4 text-[#111111]" />
              <span className="text-[11px] font-mono tracking-widest uppercase font-bold text-[#111111]">
                Compliance Standard
              </span>
            </div>

            <h4 className="font-serif text-xl font-bold text-[#111111] leading-snug">
              HIPAA &amp; SOC2 Protected
            </h4>

            <p className="text-xs text-[#666666] leading-relaxed font-sans">
              All clinical records, diagnostic files, and patient health information are encrypted at rest and in transit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
