import type { Metadata } from "next";
import { requireRole } from "@/lib/dal/auth";
import { getAppointmentById } from "@/lib/dal/appointments";
import { getConsultationNoteByAppointmentId } from "@/lib/dal/consultation_notes";
import { getDoctorRelationships } from "@/lib/dal/relationships";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, UserCircle, CalendarDays } from "lucide-react";
import { ConsultationNoteForm } from "@/components/ui/consultation-note-form";

export const metadata: Metadata = {
  title: "Create Consultation Note — SmartCare",
  description: "Create a new consultation note for this appointment.",
};

export default async function NewConsultationNotePage({
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

  const existingNote = await getConsultationNoteByAppointmentId(appointmentId);
  if (existingNote) {
    redirect(`/doctor/appointments/${appointmentId}/consultation`);
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

        {/* Title + Meta row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
              Create Consultation Note
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
        </div>
      </div>

      {/* ── Form Card ── */}
      <div className="bg-white border border-[#E8DED2] rounded-[18px] p-7 sm:p-8 shadow-xs">
        <ConsultationNoteForm
          appointmentId={appointment.id}
          patientId={appointment.patient_id}
        />
      </div>
    </div>
  );
}
