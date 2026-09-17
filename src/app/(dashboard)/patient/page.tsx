import type { Metadata } from "next";
import { requireRole } from "@/lib/dal/auth";
import { getPatientRelationships } from "@/lib/dal/relationships";
import { getPatientMedicalRecords } from "@/lib/dal/medical-records";
import { getPatientAppointments } from "@/lib/dal/appointments";
import { getPatientPrescriptions } from "@/lib/dal/prescriptions";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { AppointmentStatusBadge } from "@/components/ui/appointment-status-badge";
import {
  Calendar,
  CalendarPlus,
  Users,
  FileText,
  FileUp,
  Search,
  ArrowRight,
  Pill,
  Download,
  Eye,
  Bell,
  Activity,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Patient Dashboard — SmartCare",
  description: "Enterprise clinical patient dashboard — appointments, care team, and health records.",
};

export default async function PatientDashboardPage() {
  const user = await requireRole("patient");

  // Fetch live clinical data in parallel from Supabase DAL
  const [relationships, medicalRecords, appointments, prescriptions] = await Promise.all([
    getPatientRelationships().catch(() => []),
    getPatientMedicalRecords().catch(() => []),
    getPatientAppointments().catch(() => []),
    getPatientPrescriptions().catch(() => []),
  ]);

  const activeDoctorsCount = relationships.filter((r) => r.status === "active").length;
  const recordsCount = medicalRecords.length;
  const activePrescriptions = prescriptions.filter((p) => p.status === "active");

  const nowStr = new Date().toISOString().split("T")[0];
  const upcomingAppointments = appointments
    .filter((a) => a.appointment_date >= nowStr && a.status !== "cancelled" && a.status !== "rejected")
    .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date));

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
            <span>Health Record # {user.id.slice(0, 8).toUpperCase()}</span>
          </div>

          <div className="space-y-1">
            <p className="text-base sm:text-lg font-medium text-[#666666] font-sans">
              {timeGreeting},
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#111111] leading-tight">
              {user.full_name}
            </h1>
          </div>

          <p className="text-sm sm:text-base text-[#666666] leading-relaxed pt-1">
            Welcome back. You have{" "}
            <strong className="text-[#111111] font-semibold">
              {upcomingAppointments.length} upcoming {upcomingAppointments.length === 1 ? "appointment" : "appointments"}
            </strong>{" "}
            and{" "}
            <strong className="text-[#111111] font-semibold">
              {recordsCount} archived medical {recordsCount === 1 ? "record" : "records"}
            </strong>{" "}
            on file.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/patient/book"
            className="btn-primary py-3.5 px-7 rounded-full text-xs font-semibold inline-flex items-center gap-2 shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Book Appointment</span>
          </Link>
          <Link
            href="/patient/records/new"
            className="btn-secondary py-3.5 px-7 rounded-full text-xs font-semibold inline-flex items-center gap-2 shadow-2xs hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <FileUp className="w-4 h-4 text-[#111111]" />
            <span>Upload Record</span>
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
              Upcoming Visits
            </p>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#111111] tracking-tight">
              {upcomingAppointments.length}
            </h3>
            <p className="text-xs text-[#666666]">
              {upcomingAppointments.length > 0 ? "Scheduled consultations" : "No visits scheduled"}
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
              Medical Records
            </p>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#111111] tracking-tight">
              {recordsCount}
            </h3>
            <p className="text-xs text-[#666666]">
              {recordsCount > 0 ? "Encrypted EHR documents" : "No records uploaded"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] flex items-center justify-center text-[#111111] shrink-0 shadow-2xs">
            <FileText className="w-5 h-5 stroke-[1.75]" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-[18px] border border-[#E8DED2] p-6 shadow-xs flex items-center justify-between gap-4 hover:-translate-y-0.5 transition-transform duration-200">
          <div className="space-y-1">
            <p className="text-xs font-mono uppercase tracking-wider text-[#666666] font-semibold">
              Active Prescriptions
            </p>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#111111] tracking-tight">
              {activePrescriptions.length}
            </h3>
            <p className="text-xs text-[#666666]">
              {activePrescriptions.length > 0 ? "Current medications" : "None prescribed"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] flex items-center justify-center text-[#111111] shrink-0 shadow-2xs">
            <Pill className="w-5 h-5 stroke-[1.75]" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-[18px] border border-[#E8DED2] p-6 shadow-xs flex items-center justify-between gap-4 hover:-translate-y-0.5 transition-transform duration-200">
          <div className="space-y-1">
            <p className="text-xs font-mono uppercase tracking-wider text-[#666666] font-semibold">
              Connected Doctors
            </p>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#111111] tracking-tight">
              {activeDoctorsCount}
            </h3>
            <p className="text-xs text-[#666666]">
              {activeDoctorsCount > 0 ? "Care team physicians" : "Find specialist"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] flex items-center justify-center text-[#111111] shrink-0 shadow-2xs">
            <Users className="w-5 h-5 stroke-[1.75]" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          TWO-COLUMN MAIN GRID: LEFT (70% - Span 8) / RIGHT (30% - Span 4)
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── LEFT COLUMN (70% — Span 8) ── */}
        <div className="lg:col-span-8 space-y-8">
          {/* Card 1: Upcoming Appointments */}
          <div className="bg-white rounded-[18px] border border-[#E8DED2] p-7 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#E8DED2] pb-5">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#111111]">
                  Upcoming Appointments
                </h2>
                <p className="text-xs text-[#666666] mt-0.5">
                  Scheduled clinical visits and physician consultations.
                </p>
              </div>
              <Link
                href="/patient/appointments"
                className="text-xs font-semibold text-[#111111] hover:underline inline-flex items-center gap-1"
              >
                <span>View history</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {upcomingAppointments.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No Upcoming Consultations"
                description="You don't have any appointments scheduled with your care team."
                actionHref="/patient/book"
                actionLabel="Book an Appointment"
              />
            ) : (
              <div className="divide-y divide-[#E8DED2]">
                {upcomingAppointments.slice(0, 3).map((apt) => (
                  <div
                    key={apt.id}
                    className="py-4.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF7F2]/40 rounded-xl px-2 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Date Badge */}
                      <div className="w-14 h-14 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] flex flex-col items-center justify-center text-center shrink-0">
                        <span className="text-[10px] font-mono uppercase font-bold text-[#777777]">
                          {new Date(apt.appointment_date).toLocaleDateString("en-US", { month: "short" })}
                        </span>
                        <span className="font-serif text-lg font-bold text-[#111111] leading-none">
                          {new Date(apt.appointment_date).getDate()}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h4 className="font-serif text-base font-bold text-[#111111]">
                            {apt.doctorName}
                          </h4>
                          <span className="text-xs text-[#666666] font-medium">
                            &bull; {apt.specialty}
                          </span>
                          <AppointmentStatusBadge status={apt.status} />
                        </div>
                        <p className="text-xs text-[#555555]">
                          Time: <strong className="font-mono text-[#111111]">{apt.appointment_time.slice(0, 5)}</strong> &bull; Reason: {apt.reason}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <Link
                        href={`/patient/appointments/${apt.id}`}
                        className="btn-secondary py-2 px-4 rounded-full text-xs font-semibold shadow-2xs"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 2: Recent Medical Records */}
          <div className="bg-white rounded-[18px] border border-[#E8DED2] p-7 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#E8DED2] pb-5">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#111111]">
                  Recent Medical Records
                </h2>
                <p className="text-xs text-[#666666] mt-0.5">
                  Diagnostic lab results, imaging scans, and clinical notes.
                </p>
              </div>
              <Link
                href="/patient/records"
                className="text-xs font-semibold text-[#111111] hover:underline inline-flex items-center gap-1"
              >
                <span>View all records</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {medicalRecords.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No Health Records on File"
                description="Securely store and manage your electronic diagnostic files and prescriptions."
                actionHref="/patient/records/new"
                actionLabel="Upload Medical Record"
              />
            ) : (
              <div className="divide-y divide-[#E8DED2]">
                {medicalRecords.slice(0, 4).map((record) => (
                  <div key={record.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] flex items-center justify-center text-[#111111] shrink-0 mt-0.5">
                        <FileText className="w-5 h-5 stroke-[1.75]" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="font-serif font-bold text-sm text-[#111111] truncate">{record.title}</p>
                        <p className="text-xs text-[#666666]">
                          Type: <span className="font-medium text-[#111111]">{record.type}</span> &bull; {new Date(record.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {record.signedUrl && (
                        <>
                          <a
                            href={record.signedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary py-1.5 px-3 rounded-full text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Preview</span>
                          </a>
                          <a
                            href={record.signedUrl}
                            download={record.fileName || "record.pdf"}
                            className="btn-secondary py-1.5 px-3 rounded-full text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Download</span>
                          </a>
                        </>
                      )}
                      <Link
                        href={`/patient/records/${record.id}`}
                        className="btn-secondary py-1.5 px-3.5 rounded-full text-xs font-medium inline-flex items-center gap-1 shadow-2xs"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 3: Recent Prescriptions */}
          <div className="bg-white rounded-[18px] border border-[#E8DED2] p-7 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#E8DED2] pb-5">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#111111]">
                  Recent Prescriptions
                </h2>
                <p className="text-xs text-[#666666] mt-0.5">
                  Active medications prescribed by your healthcare providers.
                </p>
              </div>
              <Link
                href="/patient/prescriptions"
                className="text-xs font-semibold text-[#111111] hover:underline inline-flex items-center gap-1"
              >
                <span>Full medication list</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {prescriptions.length === 0 ? (
              <EmptyState
                icon={Pill}
                title="No Prescriptions Issued"
                description="Prescribed medications from doctor encounters will appear here."
              />
            ) : (
              <div className="divide-y divide-[#E8DED2]">
                {prescriptions.slice(0, 3).map((rx) => (
                  <div key={rx.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-bold text-sm text-[#111111]">{rx.medication_name}</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#FAF7F2] border border-[#E8DED2] text-[#111111] font-semibold">
                          {rx.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#666666]">
                        Dosage: <strong className="text-[#111111]">{rx.dosage}</strong> &bull; Frequency: {rx.frequency}
                      </p>
                      {rx.notes && (
                        <p className="text-xs text-[#777777] italic">
                          &ldquo;{rx.notes}&rdquo;
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-mono text-[#777777] shrink-0">
                      Started {new Date(rx.start_date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 4: Health Timeline & Activity */}
          <div className="bg-white rounded-[18px] border border-[#E8DED2] p-7 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#E8DED2] pb-5">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#111111]">
                  Health Activity Timeline
                </h2>
                <p className="text-xs text-[#666666] mt-0.5">
                  Chronological record of consultations, uploads, and encounters.
                </p>
              </div>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8DED2]">
              <div className="relative space-y-1">
                <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#111111] ring-4 ring-white" />
                <p className="text-xs font-bold text-[#111111]">Account Synchronized</p>
                <p className="text-xs text-[#666666]">
                  Patient profile active with encrypted EHR vault access.
                </p>
                <span className="text-[10px] font-mono text-[#777777]">Today</span>
              </div>

              {recordsCount > 0 && (
                <div className="relative space-y-1">
                  <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#111111] ring-4 ring-white" />
                  <p className="text-xs font-bold text-[#111111]">Medical Document Uploaded</p>
                  <p className="text-xs text-[#666666]">
                    {medicalRecords[0]?.title || "Diagnostic summary"} archived into patient chart.
                  </p>
                  <span className="text-[10px] font-mono text-[#777777]">
                    {new Date(medicalRecords[0]?.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              )}

              {appointments.length > 0 && (
                <div className="relative space-y-1">
                  <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#111111] ring-4 ring-white" />
                  <p className="text-xs font-bold text-[#111111]">Consultation Scheduled</p>
                  <p className="text-xs text-[#666666]">
                    Appointment booked with Dr. {appointments[0]?.doctorName || "Care Provider"}.
                  </p>
                  <span className="text-[10px] font-mono text-[#777777]">
                    {new Date(appointments[0]?.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (30% — Span 4) ── */}
        <div className="lg:col-span-4 space-y-8">
          {/* Card 1: Quick Actions Hub */}
          <div className="bg-white rounded-[18px] border border-[#E8DED2] p-7 sm:p-8 shadow-xs space-y-5">
            <h3 className="font-serif text-xl font-bold text-[#111111]">
              Quick Actions
            </h3>

            <div className="space-y-3">
              <Link
                href="/patient/book"
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] hover:bg-[#F5EFE6] text-xs font-bold text-[#111111] transition-all hover:translate-x-1"
              >
                <div className="flex items-center gap-3">
                  <CalendarPlus className="w-4 h-4 text-[#111111]" />
                  <span>Book Consultation</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#777777]" />
              </Link>

              <Link
                href="/patient/records/new"
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] hover:bg-[#F5EFE6] text-xs font-bold text-[#111111] transition-all hover:translate-x-1"
              >
                <div className="flex items-center gap-3">
                  <FileUp className="w-4 h-4 text-[#111111]" />
                  <span>Upload Medical Record</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#777777]" />
              </Link>

              <Link
                href="/patient/doctors"
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] hover:bg-[#F5EFE6] text-xs font-bold text-[#111111] transition-all hover:translate-x-1"
              >
                <div className="flex items-center gap-3">
                  <Search className="w-4 h-4 text-[#111111]" />
                  <span>Find Care Specialist</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#777777]" />
              </Link>
            </div>
          </div>

          {/* Card 3: Notifications & Reminders */}
          <div className="bg-white rounded-[18px] border border-[#E8DED2] p-7 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DED2] pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#111111]" />
                <h3 className="font-serif text-lg font-bold text-[#111111]">
                  Notifications
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E8DED2] text-[#111111]">
                Live Feed
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] space-y-1">
                <p className="text-xs font-bold text-[#111111]">EHR Security Active</p>
                <p className="text-[11px] text-[#666666]">
                  Signed URLs protect all diagnostic report downloads.
                </p>
              </div>

              {upcomingAppointments.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] space-y-1">
                  <p className="text-xs font-bold text-[#111111]">Upcoming Consultation</p>
                  <p className="text-[11px] text-[#666666]">
                    Dr. {upcomingAppointments[0]?.doctorName} on {new Date(upcomingAppointments[0]?.appointment_date).toLocaleDateString()}.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Card 4: Connected Doctors / Care Team */}
          <div className="bg-white rounded-[18px] border border-[#E8DED2] p-7 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DED2] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#111111]">
                My Care Team
              </h3>
              <Link
                href="/patient/doctors"
                className="text-xs font-semibold text-[#111111] hover:underline"
              >
                Directory &rarr;
              </Link>
            </div>

            {relationships.length === 0 ? (
              <p className="text-xs text-[#666666] leading-relaxed">
                You have not connected with any physicians yet. Explore the doctor directory to select a specialist.
              </p>
            ) : (
              <div className="space-y-3">
                {relationships.slice(0, 3).map((rel) => (
                  <div key={rel.id} className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#111111] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {rel.other_party.full_name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#111111] truncate">{rel.other_party.full_name}</p>
                        <p className="text-[11px] text-[#666666] capitalize">{rel.status} Specialist</p>
                      </div>
                    </div>
                    <Link
                      href={`/patient/book?doctor_id=${rel.other_party.id}`}
                      className="btn-primary py-1.5 px-3.5 rounded-full text-[11px] font-semibold shrink-0"
                    >
                      Book
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
