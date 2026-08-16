import type { Metadata } from "next";
import { requireRole } from "@/lib/dal/auth";
import { getDoctorAppointments } from "@/lib/dal/appointments";
import { getDoctorRelationships } from "@/lib/dal/relationships";
import Link from "next/link";
import { AppointmentStatusBadge } from "@/components/ui/appointment-status-badge";

export const metadata: Metadata = {
  title: "Appointments — SmartCare",
  description: "Manage your patient appointments.",
};

export default async function DoctorAppointmentsPage() {
  await requireRole("doctor");
  
  const appointments = await getDoctorAppointments();
  
  // Fetch relationships to map patient names
  const relationships = await getDoctorRelationships();
  const patientMap = new Map(
    relationships.map(r => [r.other_party.id, r.other_party.full_name])
  );

  return (
    <div className="dash-content">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Appointments</h1>
          <p className="dash-page-subtitle">
            Review and manage your patient appointments.
          </p>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="dash-empty-state">
          <div className="dash-empty-state-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="dash-empty-state-title">No appointments found</h3>
          <p className="dash-empty-state-desc">
            You don&apos;t have any appointments scheduled yet. When patients book sessions with you, they will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {appointments.map((appointment) => (
            <Link key={appointment.id} href={`/doctor/appointments/${appointment.id}`} className="block group">
              <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-colors h-full flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <AppointmentStatusBadge status={appointment.status} />
                  <span className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {new Date(appointment.appointment_date).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {patientMap.get(appointment.patient_id) || "Unknown Patient"}
                </h3>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  {appointment.appointment_time.slice(0, 5)}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                  {appointment.reason}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
