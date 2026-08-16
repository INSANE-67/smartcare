import type { Metadata } from "next";
import { requireRole } from "@/lib/dal/auth";
import { getAppointmentById } from "@/lib/dal/appointments";
import { getConsultationNoteByAppointmentId } from "@/lib/dal/consultation_notes";
import { getDoctorRelationships } from "@/lib/dal/relationships";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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

  // Fetch patient name
  const relationships = await getDoctorRelationships();
  const patientRel = relationships.find(r => r.other_party.id === appointment.patient_id);
  const patientName = patientRel?.other_party.full_name || "Unknown Patient";

  return (
    <div className="dash-content max-w-4xl">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Create Consultation Note</h1>
          <p className="dash-page-subtitle">
            {patientName} • {new Date(appointment.appointment_date).toLocaleDateString()}
          </p>
        </div>
        <div className="dash-page-actions">
          <Link href={`/doctor/appointments/${appointmentId}`} className="dash-btn dash-btn-secondary">
            &larr; Back to Appointment
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <ConsultationNoteForm 
          appointmentId={appointment.id} 
          patientId={appointment.patient_id} 
        />
      </div>
    </div>
  );
}
