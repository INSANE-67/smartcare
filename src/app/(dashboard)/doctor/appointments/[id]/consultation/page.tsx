import type { Metadata } from "next";
import { requireRole } from "@/lib/dal/auth";
import { getConsultationNoteByAppointmentId } from "@/lib/dal/consultation_notes";
import { getAppointmentById } from "@/lib/dal/appointments";
import { getDoctorRelationships } from "@/lib/dal/relationships";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, UserCircle, CalendarDays, Pencil } from "lucide-react";

export const metadata: Metadata = {
  title: "Consultation Note — SmartCare",
  description: "View consultation note for appointment.",
};

export default async function DoctorConsultationNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("doctor");
  const { id: appointmentId } = await params;

  const appointment = await getAppointmentById(appointmentId);
  if (!appointment || appointment.doctor_id !== user.id) {
    notFound();
  }

  const note = await getConsultationNoteByAppointmentId(appointmentId);
  if (!note) {
    redirect(`/doctor/appointments/${appointmentId}/consultation/new`);
  }

  // Resolve patient name from care relationships
  const relationships = await getDoctorRelationships();
  const patientRel = relationships.find(r => r.other_party.id === appointment.patient_id);
  const patientName = patientRel?.other_party.full_name?.trim() || null;

  const formattedDate = new Date(appointment.appointment_date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="dash-content max-w-3xl">
      {/* ── Page Header ── */}
      <div className="mb-8">
        {/* Breadcrumb */}
        <Link
          href={`/doctor/appointments/${appointmentId}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#777777] hover:text-[#111111] transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Appointment</span>
        </Link>

        {/* Title + Actions row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
              Consultation Note
            </h1>

            {/* Patient + date chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E8DED2] text-xs font-medium text-[#555555]">
                <UserCircle className="w-3.5 h-3.5 text-[#111111]" />
                {patientName ?? (
                  <span className="text-[#777777] italic">
                    Patient #{appointment.patient_id.slice(0, 8).toUpperCase()}
                  </span>
                )}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E8DED2] text-xs font-medium text-[#555555]">
                <CalendarDays className="w-3.5 h-3.5 text-[#111111]" />
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Edit action */}
          <Link
            href={`/doctor/appointments/${appointmentId}/consultation/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#111111] text-white text-xs font-semibold hover:bg-[#2a2a2a] transition-colors shadow-xs self-start"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Note
          </Link>
        </div>
      </div>

      {/* ── Note Card ── */}
      <div className="bg-white border border-[#E8DED2] rounded-[18px] p-7 sm:p-8 shadow-xs space-y-7">
        {/* Diagnosis */}
        <div>
          <p className="text-[11px] font-mono uppercase tracking-widest text-[#777777] font-semibold mb-2">
            Diagnosis
          </p>
          <p className="text-sm text-[#111111] leading-relaxed whitespace-pre-wrap">
            {note.diagnosis}
          </p>
        </div>

        <hr className="border-[#E8DED2]" />

        {/* Symptoms */}
        <div>
          <p className="text-[11px] font-mono uppercase tracking-widest text-[#777777] font-semibold mb-2">
            Reported Symptoms
          </p>
          <p className="text-sm text-[#111111] leading-relaxed whitespace-pre-wrap">
            {note.symptoms}
          </p>
        </div>

        <hr className="border-[#E8DED2]" />

        {/* Observations */}
        <div>
          <p className="text-[11px] font-mono uppercase tracking-widest text-[#777777] font-semibold mb-2">
            Clinical Observations
          </p>
          <p className="text-sm text-[#111111] leading-relaxed whitespace-pre-wrap">
            {note.observations}
          </p>
        </div>

        <hr className="border-[#E8DED2]" />

        {/* Treatment Plan */}
        <div>
          <p className="text-[11px] font-mono uppercase tracking-widest text-[#777777] font-semibold mb-2">
            Treatment Plan
          </p>
          <p className="text-sm text-[#111111] leading-relaxed whitespace-pre-wrap">
            {note.treatment_plan}
          </p>
        </div>

        {/* Follow-up date (conditional) */}
        {note.follow_up_date && (
          <>
            <hr className="border-[#E8DED2]" />
            <div>
              <p className="text-[11px] font-mono uppercase tracking-widest text-[#777777] font-semibold mb-2">
                Follow-up Date
              </p>
              <p className="text-sm font-semibold text-[#111111]">
                {new Date(note.follow_up_date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
