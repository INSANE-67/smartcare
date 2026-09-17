import type { Metadata } from "next";
import { requireRole } from "@/lib/dal/auth";
import { getAppointmentById } from "@/lib/dal/appointments";
import { getConsultationNoteByAppointmentId } from "@/lib/dal/consultation_notes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppointmentStatusBadge } from "@/components/ui/appointment-status-badge";
import { UpdateAppointmentStatusForm } from "@/components/ui/update-appointment-status-form";
import { Calendar, Clock, ArrowLeft, User, FileText, Video, CheckCircle2, XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Appointment Details — SmartCare",
  description: "View and manage appointment details.",
};

export default async function DoctorAppointmentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("doctor");
  const { id } = await params;

  const appointment = await getAppointmentById(id);

  if (!appointment || appointment.doctor_id !== user.id) {
    notFound();
  }

  const consultationNote = await getConsultationNoteByAppointmentId(appointment.id);

  // Fetch patient profile directly
  const supabase = await createSupabaseServerClient();
  const { data: patientProf } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", appointment.patient_id)
    .maybeSingle();

  const patientName = patientProf?.full_name || "Patient";

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-6">
      {/* ── Header & Actions ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/doctor/appointments"
              className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Appointments</span>
            </Link>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Clinical Encounter Details
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Appointment ID: {appointment.id}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UpdateAppointmentStatusForm id={appointment.id} status={appointment.status} />

          {appointment.status === "confirmed" && (
            <Link
              href={`/doctor/appointments/${appointment.id}/consultation`}
              className="btn btn-primary text-xs"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Open Encounter Room</span>
            </Link>
          )}

          <Link
            href={`/doctor/patients/${appointment.patient_id}`}
            className="btn btn-secondary text-xs"
          >
            <User className="w-3.5 h-3.5" />
            <span>Patient EHR Chart</span>
          </Link>
        </div>
      </div>

      {/* ── Status Banner (Read-only states) ── */}
      {appointment.status === "completed" && (
        <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-lg flex items-center gap-2.5 text-xs text-green-800 dark:text-green-300">
          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
          <span>Encounter completed. The consultation note is officially recorded in the patient&apos;s medical record.</span>
        </div>
      )}

      {appointment.status === "cancelled" && (
        <div className="p-3 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
          <XCircle className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <span>This appointment was cancelled by the patient and is read-only.</span>
        </div>
      )}

      {appointment.status === "rejected" && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg flex items-center gap-2.5 text-xs text-red-800 dark:text-red-300">
          <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
          <span>This appointment request was declined.</span>
        </div>
      )}

      {/* ── Details Panel ── */}
      <div className="bg-white border border-[#E8DED2] rounded-[18px] p-6 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Patient Record
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{patientName}</p>
            <Link
              href={`/doctor/patients/${appointment.patient_id}`}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium mt-0.5 inline-block"
            >
              Open Medical History &rarr;
            </Link>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Date &amp; Time
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {new Date(appointment.appointment_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {appointment.appointment_time.slice(0, 5)} (30 min slot)
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Status &amp; Intake
            </span>
            <div className="mt-1">
              <AppointmentStatusBadge status={appointment.status} />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Created on {new Date(appointment.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Reason for Visit */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
            Reported Symptoms / Reason for Visit
          </span>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
            {appointment.reason || "No specific reason provided by patient."}
          </div>
        </div>

        {/* Consultation Notes Section */}
        {consultationNote ? (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Documented Consultation Note
                </h3>
              </div>
              <Link
                href={`/doctor/appointments/${appointment.id}/consultation`}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Edit Note &rarr;
              </Link>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-md space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">
                  Clinical Diagnosis:
                </span>
                <p className="text-slate-700 dark:text-slate-300">{consultationNote.diagnosis}</p>
              </div>

              <div>
                <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">
                  Treatment &amp; Prescriptions Plan:
                </span>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{consultationNote.treatment_plan}</p>
              </div>
            </div>
          </div>
        ) : appointment.status === "completed" ? (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-md border border-dashed border-slate-300 dark:border-slate-700 text-center">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                This encounter was marked completed. Attach detailed clinical consultation notes if required.
              </p>
              <Link
                href={`/doctor/appointments/${appointment.id}/consultation/new`}
                className="btn btn-primary text-xs inline-flex"
              >
                Create Formal Consultation Note
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
