import type { Metadata } from "next";
import { requireRole } from "@/lib/dal/auth";
import { getAppointmentById } from "@/lib/dal/appointments";
import { getConsultationNoteByAppointmentId } from "@/lib/dal/consultation_notes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppointmentStatusBadge } from "@/components/ui/appointment-status-badge";
import { CancelAppointmentButton } from "@/components/ui/cancel-appointment-button";
import { Calendar, Clock, ArrowLeft, Stethoscope, User, FileText, CheckCircle2, XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Appointment Details — SmartCare",
  description: "View details of your appointment.",
};

export default async function PatientAppointmentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("patient");
  const { id } = await params;

  const appointment = await getAppointmentById(id);

  if (!appointment || appointment.patient_id !== user.id) {
    notFound();
  }

  const consultationNote = await getConsultationNoteByAppointmentId(appointment.id);

  // Fetch doctor metadata
  let doctorName = "Physician";
  let specialty = "Clinical Specialist";

  if (appointment?.doctor_id) {
    const supabase = await createSupabaseServerClient();
    const { data: prof } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", appointment.doctor_id)
      .maybeSingle();

    const rawName = prof?.full_name?.trim() || "";
    doctorName = rawName
      ? rawName.toLowerCase().startsWith("dr")
        ? rawName
        : `Dr. ${rawName}`
      : "Doctor";

    const { data: docRow } = await supabase
      .from("doctors")
      .select("specialty, department")
      .eq("profile_id", appointment.doctor_id)
      .maybeSingle();

    if (docRow?.specialty) {
      specialty = docRow.specialty;
    }
  }

  const canCancel = appointment.status === "pending" || appointment.status === "confirmed";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ── Header & Navigation ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/patient/appointments"
              className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Appointments</span>
            </Link>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Clinical Consultation Details
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Appointment ID: {appointment.id}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canCancel && (
            <CancelAppointmentButton id={appointment.id} />
          )}
        </div>
      </div>

      {/* ── Read-only Status Alert Banners ── */}
      {appointment.status === "completed" && (
        <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-lg flex items-center gap-2.5 text-xs text-green-800 dark:text-green-300">
          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
          <span>This encounter has been completed by your physician. Clinical consultation notes are available below.</span>
        </div>
      )}

      {appointment.status === "cancelled" && (
        <div className="p-3 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
          <XCircle className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <span>This appointment was cancelled and is closed for changes.</span>
        </div>
      )}

      {appointment.status === "rejected" && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg flex items-center gap-2.5 text-xs text-red-800 dark:text-red-300">
          <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
          <span>This appointment request was declined by the physician. You may book another consultation time slot.</span>
        </div>
      )}

      {/* ── Appointment Metadata Card ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Attending Physician
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{doctorName}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">{specialty}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Consultation Schedule
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {new Date(appointment.appointment_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {appointment.appointment_time.slice(0, 5)} (Standard 30 min)
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Current Status
            </span>
            <div className="mt-1">
              <AppointmentStatusBadge status={appointment.status} />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Requested on {new Date(appointment.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Reason for Visit */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
            Reason for Clinical Visit
          </span>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
            {appointment.reason || "No detailed reason specified."}
          </div>
        </div>

        {/* Clinical Consultation Notes (if completed) */}
        {consultationNote ? (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Physician Consultation Note
                </h3>
              </div>
              <Link
                href={`/patient/appointments/${appointment.id}/consultation`}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Full Encounter Record &rarr;
              </Link>
            </div>

            <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-md space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">
                  Diagnosis / Assessment:
                </span>
                <p className="text-slate-700 dark:text-slate-300">{consultationNote.diagnosis}</p>
              </div>

              <div>
                <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">
                  Treatment Plan:
                </span>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{consultationNote.treatment_plan}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
