import type { Metadata } from "next";
import { requireRole } from "@/lib/dal/auth";
import { getAppointmentById } from "@/lib/dal/appointments";
import { getDoctorRelationships } from "@/lib/dal/relationships";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppointmentStatusBadge } from "@/components/ui/appointment-status-badge";
import { UpdateAppointmentStatusForm } from "@/components/ui/update-appointment-status-form";

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

  // Fetch patient name
  const relationships = await getDoctorRelationships();
  const patientRel = relationships.find(r => r.other_party.id === appointment.patient_id);
  const patientName = patientRel?.other_party.full_name || "Unknown Patient";

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
          <Link href="/doctor/appointments" className="dash-btn dash-btn-secondary">
            &larr; Back
          </Link>
          <UpdateAppointmentStatusForm id={appointment.id} status={appointment.status} />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Patient</h3>
            <p className="text-base font-medium text-slate-900 dark:text-slate-100">{patientName}</p>
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
          
          {appointment.notes && (
            <div className="md:col-span-2 mt-4 pt-6 border-t border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Consultation Notes</h3>
              <div className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap mt-2 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
                {appointment.notes}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
