import type { Metadata } from "next";
import { requireRole } from "@/lib/dal/auth";
import { getAppointmentById } from "@/lib/dal/appointments";
import { getConsultationNoteByAppointmentId } from "@/lib/dal/consultation_notes";
import { getPatientRelationships } from "@/lib/dal/relationships";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppointmentStatusBadge } from "@/components/ui/appointment-status-badge";
import { CancelAppointmentButton } from "@/components/ui/cancel-appointment-button";

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

  // Fetch doctor name
  const relationships = await getPatientRelationships();
  const doctorRel = relationships.find(r => r.other_party.id === appointment.doctor_id);
  const doctorName = doctorRel?.other_party.full_name || "Unknown Doctor";

  return (
    <div className="dash-content max-w-4xl">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Appointment Details</h1>
          <div className="dash-page-subtitle flex items-center gap-3 mt-2">
            <span>{new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time.slice(0, 5)}</span>
            <AppointmentStatusBadge status={appointment.status} />
          </div>
        </div>
        <div className="dash-page-actions flex gap-3">
          <Link href="/patient/appointments" className="dash-btn dash-btn-secondary">
            &larr; Back
          </Link>
          {appointment.status === "pending" && (
            <CancelAppointmentButton id={appointment.id} />
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Doctor</h3>
            <p className="text-base font-medium text-slate-900 dark:text-slate-100">{doctorName}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Status</h3>
            <p className="text-base font-medium text-slate-900 dark:text-slate-100 capitalize">{appointment.status}</p>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Reason for Visit</h3>
            <div className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap mt-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
              {appointment.reason}
            </div>
          </div>
          
          {consultationNote ? (
            <div className="md:col-span-2 mt-4 pt-6 border-t border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Consultation Note</h3>
                <Link href={`/patient/appointments/${appointment.id}/consultation`} className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                  View Full Note &rarr;
                </Link>
              </div>
              <div className="text-slate-900 dark:text-slate-100 mt-2 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <p className="font-semibold mb-2">Diagnosis:</p>
                <p className="mb-4 text-sm">{consultationNote.diagnosis}</p>
                
                <p className="font-semibold mb-2">Treatment Plan:</p>
                <p className="text-sm whitespace-pre-wrap">{consultationNote.treatment_plan}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
