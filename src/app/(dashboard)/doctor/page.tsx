import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/dal/auth";
import { getDoctorDashboardData } from "@/lib/dal/doctor";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Calendar,
  ClipboardList,
  FileText,
  Clock,
  ArrowRight,
  UploadCloud,
  Bot,
  Video,
  Users,
  Bell,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Physician Workstation — SmartCare",
  description: "Enterprise physician clinical dashboard — consultation schedules, triage, and patient charts.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DoctorDashboardPage() {
  await requireRole("doctor");

  // Fetch live dashboard metrics, today's schedule, and recent clinical notes
  const { doctorInfo, stats, todayAppointments, insights } = await getDoctorDashboardData();

  console.log("=== DOCTOR DASHBOARD RENDERING AUDIT ===");
  console.log("todayAppointments.length:", todayAppointments.length);
  console.log("stats.todayAppointmentsCount:", stats.todayAppointmentsCount);
  console.log("stats.pendingReviewsCount:", stats.pendingReviewsCount);
  console.log("stats.waitingRoomCount:", stats.waitingRoomCount);
  console.log("First appointment object reaching page:", todayAppointments[0] ?? null);

  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  // Dynamic time greeting
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto">
      {/* ══════════════════════════════════════════════════════════════════════
          TOP HERO / SPACIOUS WELCOME SECTION
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white rounded-[18px] border border-[#E8DED2] p-8 sm:p-10 lg:p-12 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-8 transition-all">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E8DED2] text-xs font-mono font-semibold text-[#111111]">
            <span className="w-2 h-2 rounded-full bg-[#111111]" />
            <span>
              Accredited Provider &bull;{" "}
              {doctorInfo.licenseNumber
                ? `Lic #${doctorInfo.licenseNumber}`
                : `Lic #${doctorInfo.id ? doctorInfo.id.slice(0, 7).toUpperCase() : "VERIFIED"}`}
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-base sm:text-lg font-medium text-[#666666] font-sans">
              {timeGreeting},
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#111111] leading-tight">
              {doctorInfo.doctorDisplayName}
            </h1>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-xs text-[#666666]">
              <span className="font-semibold text-[#111111]">{doctorInfo.specialty}</span>
              {doctorInfo.department && (
                <>
                  <span className="text-[#999999]">&bull;</span>
                  <span>{doctorInfo.department}</span>
                </>
              )}
              {doctorInfo.clinicName && (
                <>
                  <span className="text-[#999999]">&bull;</span>
                  <span>{doctorInfo.clinicName}</span>
                </>
              )}
              {doctorInfo.yearsOfExperience != null && (
                <>
                  <span className="text-[#999999]">&bull;</span>
                  <span>{doctorInfo.yearsOfExperience} yrs experience</span>
                </>
              )}
            </div>
          </div>

          <p className="text-sm sm:text-base text-[#666666] leading-relaxed pt-1">
            Clinical schedule for <strong className="text-[#111111] font-semibold">{todayFormatted}</strong>. You have{" "}
            <strong className="text-[#111111] font-semibold">
              {stats.todayAppointmentsCount} {stats.todayAppointmentsCount === 1 ? "consultation" : "consultations"} scheduled today
            </strong>{" "}
            and{" "}
            <strong className="text-[#111111] font-semibold">
              {stats.pendingReviewsCount} pending {stats.pendingReviewsCount === 1 ? "request" : "requests"}
            </strong>{" "}
            awaiting triage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/doctor/appointments"
            className="btn-primary py-3.5 px-7 rounded-full text-xs font-semibold inline-flex items-center gap-2 shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Master Schedule</span>
          </Link>
          <Link
            href="/doctor/patients"
            className="btn-secondary py-3.5 px-7 rounded-full text-xs font-semibold inline-flex items-center gap-2 shadow-2xs hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <Users className="w-4 h-4 text-[#111111]" />
            <span>Patient EHR Directory</span>
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
              Today&apos;s Consults
            </p>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#111111] tracking-tight">
              {stats.todayAppointmentsCount}
            </h3>
            <p className="text-xs text-[#666666]">
              {stats.todayAppointmentsCount > 0 ? "Booked clinical sessions" : "No consultations today"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] flex items-center justify-center text-[#111111] shrink-0 shadow-2xs">
            <Calendar className="w-5 h-5 stroke-[1.75]" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-[18px] border border-[#E8DED2] p-6 shadow-xs flex items-center justify-between gap-4 hover:-translate-y-0.5 transition-transform duration-200">
          <div className="space-y-1">
            <p className="text-xs font-mono uppercase tracking-wider text-[#666666] font-semibold">
              Pending Triage
            </p>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#111111] tracking-tight">
              {stats.pendingReviewsCount}
            </h3>
            <p className="text-xs text-[#666666]">
              {stats.pendingReviewsCount > 0 ? "Awaiting physician review" : "All requests triaged"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] flex items-center justify-center text-[#111111] shrink-0 shadow-2xs">
            <ClipboardList className="w-5 h-5 stroke-[1.75]" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-[18px] border border-[#E8DED2] p-6 shadow-xs flex items-center justify-between gap-4 hover:-translate-y-0.5 transition-transform duration-200">
          <div className="space-y-1">
            <p className="text-xs font-mono uppercase tracking-wider text-[#666666] font-semibold">
              Clinical Summaries
            </p>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#111111] tracking-tight">
              {stats.aiSummariesCount}
            </h3>
            <p className="text-xs text-[#666666]">
              Encounter notes on file
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] flex items-center justify-center text-[#111111] shrink-0 shadow-2xs">
            <FileText className="w-5 h-5 stroke-[1.75]" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-[18px] border border-[#E8DED2] p-6 shadow-xs flex items-center justify-between gap-4 hover:-translate-y-0.5 transition-transform duration-200">
          <div className="space-y-1">
            <p className="text-xs font-mono uppercase tracking-wider text-[#666666] font-semibold">
              Waiting Queue
            </p>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#111111] tracking-tight">
              {stats.waitingRoomCount}
            </h3>
            <p className="text-xs text-[#666666]">
              {stats.waitingRoomCount > 0 ? "Confirmed patients" : "Queue operational"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] flex items-center justify-center text-[#111111] shrink-0 shadow-2xs">
            <Clock className="w-5 h-5 stroke-[1.75]" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          TWO-COLUMN MAIN GRID: LEFT (70% - Span 8) / RIGHT (30% - Span 4)
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── LEFT COLUMN (70% — Span 8) ── */}
        <div className="lg:col-span-8 space-y-8">
          {/* Card 1: Consultation Schedule */}
          <div className="bg-white rounded-[18px] border border-[#E8DED2] p-7 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#E8DED2] pb-5">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#111111]">
                  {stats.todayAppointmentsCount > 0
                    ? "Today's Consultation Schedule"
                    : "Scheduled Consultation Queue"}
                </h2>
                <p className="text-xs text-[#666666] mt-0.5">
                  Scheduled patient encounters, telehealth links, and visit notes.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-[#111111] px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E8DED2]">
                {todayAppointments.length} {todayAppointments.length === 1 ? "Consultation" : "Consultations"}
              </span>
            </div>

            {todayAppointments.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No Consultations Scheduled"
                description="When patients book appointments from the directory, their clinical intake details and encounter controls will populate here."
                actionHref="/doctor/appointments"
                actionLabel="View Master Calendar"
              />
            ) : (
              <div className="divide-y divide-[#E8DED2]">
                {todayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="py-4.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF7F2]/40 rounded-xl px-2 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Time / Date Badge */}
                      <div className="w-16 h-14 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] flex flex-col items-center justify-center text-center shrink-0">
                        <span className="font-serif text-base font-bold text-[#111111] leading-none">
                          {apt.time}
                        </span>
                        <span className="text-[9px] font-mono uppercase text-[#777777] mt-0.5 truncate max-w-[56px]">
                          {apt.dateBadge || apt.duration}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h4 className="font-serif text-base font-bold text-[#111111]">
                            {apt.patientName}
                          </h4>
                          {(apt.patientAge != null || apt.patientGender) && (
                            <span className="text-xs text-[#666666]">
                              ({apt.patientAge ? `${apt.patientAge}y` : ""}{apt.patientAge && apt.patientGender ? ", " : ""}{apt.patientGender || ""})
                            </span>
                          )}
                          {apt.isUrgent && (
                            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]">
                              Urgent
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full border ${
                              (apt.status ?? "").toLowerCase() === "pending"
                                ? "bg-[#FEF9C3] text-[#854D0E] border-[#FEF08A]"
                                : (apt.status ?? "").toLowerCase() === "confirmed"
                                ? "bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]"
                                : "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]"
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#555555]">
                          Type: {apt.type} &bull; <span className="font-semibold text-[#111111]">{apt.status}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {(apt.status ?? "").toLowerCase() === "pending" ? (
                        <Link
                          href="/doctor/appointments"
                          className="btn-secondary py-2 px-4 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs"
                        >
                          <span>Review Request</span>
                        </Link>
                      ) : (
                        <Link
                          href={`/doctor/appointments/${apt.id}/consultation`}
                          className="btn-primary py-2 px-4 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Open Encounter</span>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 2: Recent Clinical Summaries */}
          <div className="bg-white rounded-[18px] border border-[#E8DED2] p-7 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#E8DED2] pb-5">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#111111]">
                  Recent Clinical Summaries
                </h2>
                <p className="text-xs text-[#666666] mt-0.5">
                  Archived patient SOAP notes, diagnostic orders, and encounter logs.
                </p>
              </div>
              <Link
                href="/doctor/patients"
                className="text-xs font-semibold text-[#111111] hover:underline inline-flex items-center gap-1"
              >
                <span>All Patient Records</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {insights.length === 0 ? (
              <p className="text-xs text-[#666666]">
                No recent clinical notes recorded yet. Completed appointments will generate automatic EHR logs here.
              </p>
            ) : (
              <div className="divide-y divide-[#E8DED2]">
                {insights.slice(0, 4).map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-[#111111] truncate">{item.title}</p>
                      <span className="text-[10px] font-mono text-[#777777] uppercase font-semibold">{item.badge}</span>
                    </div>
                    <p className="text-xs text-[#666666] line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                    <p className="text-[10px] text-[#777777] font-mono">{item.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN (30% — Span 4) ── */}
        <div className="lg:col-span-4 space-y-8">
          {/* Card 1: Quick Clinical Actions */}
          <div className="bg-white rounded-[18px] border border-[#E8DED2] p-7 sm:p-8 shadow-xs space-y-5">
            <h3 className="font-serif text-xl font-bold text-[#111111]">
              Workstation Tools
            </h3>

            <div className="space-y-3">
              <Link
                href="/doctor/appointments"
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] hover:bg-[#F5EFE6] text-xs font-bold text-[#111111] transition-all hover:translate-x-1"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[#111111]" />
                  <span>Review Booking Requests</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#777777]" />
              </Link>

              <Link
                href="/doctor/patients"
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] hover:bg-[#F5EFE6] text-xs font-bold text-[#111111] transition-all hover:translate-x-1"
              >
                <div className="flex items-center gap-3">
                  <UploadCloud className="w-4 h-4 text-[#111111]" />
                  <span>Attach Diagnostic Report</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#777777]" />
              </Link>

              <Link
                href="/doctor/settings"
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] hover:bg-[#F5EFE6] text-xs font-bold text-[#111111] transition-all hover:translate-x-1"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#111111]" />
                  <span>Manage Clinic Availability</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#777777]" />
              </Link>
            </div>
          </div>

          {/* Card 2: AI Clinical Assistant */}
          <div className="bg-white rounded-[18px] border border-[#E8DED2] p-7 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-[#111111]">
              <Sparkles className="w-4 h-4 text-[#111111]" />
              <span className="text-[11px] font-mono tracking-widest uppercase font-bold text-[#111111]">
                AI Clinical Scribe
              </span>
            </div>

            <h4 className="font-serif text-xl font-bold text-[#111111] leading-snug">
              Automated Encounter Documentation
            </h4>

            <p className="text-xs text-[#666666] leading-relaxed font-sans">
              Convert consultation audio or intake notes into structured EHR SOAP summaries in seconds.
            </p>

            <div className="pt-2">
              <Link
                href="/doctor/patients"
                className="btn-primary w-full py-3 px-5 rounded-full text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-xs hover:-translate-y-0.5 transition-all"
              >
                <Bot className="w-4 h-4 text-white" />
                <span>Open Clinical Scribe</span>
              </Link>
            </div>
          </div>

          {/* Card 3: Physician Notifications */}
          <div className="bg-white rounded-[18px] border border-[#E8DED2] p-7 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DED2] pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#111111]" />
                <h3 className="font-serif text-lg font-bold text-[#111111]">
                  Physician Alerts
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E8DED2] text-[#111111]">
                Live
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] space-y-1">
                <p className="text-xs font-bold text-[#111111]">Triage Queue Operational</p>
                <p className="text-[11px] text-[#666666]">
                  {stats.pendingReviewsCount} new booking requests awaiting review.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
