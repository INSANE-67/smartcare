import type { Metadata } from "next";
import { requireRole } from "@/lib/dal/auth";
import { getConsultationNoteByAppointmentId } from "@/lib/dal/consultation_notes";
import { getAppointmentById } from "@/lib/dal/appointments";
import { getDoctorRelationships } from "@/lib/dal/relationships";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

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

  // Fetch patient name
  const relationships = await getDoctorRelationships();
  const patientRel = relationships.find(r => r.other_party.id === appointment.patient_id);
  const patientName = patientRel?.other_party.full_name || "Unknown Patient";

  return (
    <div className="dash-content max-w-4xl">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Consultation Note</h1>
          <p className="dash-page-subtitle">
            {patientName} • {new Date(appointment.appointment_date).toLocaleDateString()}
          </p>
        </div>
        <div className="dash-page-actions flex gap-3">
          <Link href={`/doctor/appointments/${appointmentId}`} className="dash-btn dash-btn-secondary">
            &larr; Back to Appointment
          </Link>
          <Link href={`/doctor/appointments/${appointmentId}/consultation/edit`} className="dash-btn dash-btn-primary">
            Edit Note
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm space-y-8">
        <div>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Diagnosis</h3>
          <p className="text-base text-slate-900 dark:text-slate-100 whitespace-pre-wrap">{note.diagnosis}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Symptoms</h3>
          <p className="text-base text-slate-900 dark:text-slate-100 whitespace-pre-wrap">{note.symptoms}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Observations</h3>
          <p className="text-base text-slate-900 dark:text-slate-100 whitespace-pre-wrap">{note.observations}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Treatment Plan</h3>
          <p className="text-base text-slate-900 dark:text-slate-100 whitespace-pre-wrap">{note.treatment_plan}</p>
        </div>

        {note.follow_up_date && (
          <div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Follow-up Date</h3>
            <p className="text-base text-slate-900 dark:text-slate-100">{new Date(note.follow_up_date).toLocaleDateString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}
