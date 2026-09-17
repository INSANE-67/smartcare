import type { Metadata } from "next";
import { requireRole } from "@/lib/dal/auth";
import { getPatientAppointments } from "@/lib/dal/appointments";
import type { AppointmentStatus } from "@/types/database";
import Link from "next/link";
import { AppointmentStatusBadge } from "@/components/ui/appointment-status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CancelAppointmentButton } from "@/components/ui/cancel-appointment-button";
import { Calendar, CalendarPlus, Clock, ArrowRight, Stethoscope } from "lucide-react";

export const metadata: Metadata = {
  title: "My Appointments — SmartCare",
  description: "View and manage your patient appointments.",
};

export default async function PatientAppointmentsPage() {
  await requireRole("patient");
  const appointments = await getPatientAppointments();

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8DED2]">
        <div className="space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#777777] font-semibold">
            Consultation History
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
            My Scheduled Appointments
          </h1>
          <p className="text-xs text-[#555555]">
            Track upcoming consultations, physician responses, and completed visit history.
          </p>
        </div>

        <Link
          href="/patient/book"
          className="btn-primary py-2.5 px-5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 shadow-xs"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Book New Consultation</span>
        </Link>
      </div>

      {/* ── Content ── */}
      {appointments.length === 0 ? (
        <div className="bg-white rounded-[22px] border border-[#E8DED2] p-8 shadow-xs">
          <EmptyState
            icon={Calendar}
            title="No appointments scheduled"
            description="You don't have any active consultations on file. Book a visit with a verified doctor."
            actionHref="/patient/book"
            actionLabel="Book a Visit"
          />
        </div>
      ) : (
        <div className="bg-white rounded-[22px] border border-[#E8DED2] overflow-hidden shadow-xs">
          <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#E8DED2] flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#555555] font-semibold">
              All Records ({appointments.length})
            </span>
          </div>

          <div className="divide-y divide-[#E8DED2]">
            {appointments.map((appointment) => {
              const canCancel = appointment.status === "pending" || appointment.status === "confirmed";

              return (
                <div
                  key={appointment.id}
                  className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAF7F2]/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Time Slot Box */}
                    <div className="px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] text-center min-w-[80px] shrink-0">
                      <p className="font-serif text-sm font-bold text-[#111111]">
                        {appointment.appointment_time.slice(0, 5)}
                      </p>
                      <p className="text-[10px] font-mono text-[#777777] uppercase mt-0.5">
                        {new Date(appointment.appointment_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>

                    {/* Appointment Information */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif text-base font-bold text-[#111111]">
                          {appointment.doctorName}
                        </h3>
                        <span className="text-xs text-[#555555] font-medium">
                          &bull; {appointment.specialty}
                        </span>
                        <AppointmentStatusBadge status={appointment.status as AppointmentStatus} />
                      </div>

                      <p className="text-xs text-[#555555]">
                        <span className="font-semibold text-[#111111]">Reason: </span>
                        {appointment.reason}
                      </p>

                      <p className="text-[11px] text-[#777777] font-mono">
                        Booked on {new Date(appointment.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 sm:self-center">
                    {canCancel && (
                      <CancelAppointmentButton id={appointment.id} />
                    )}

                    <Link
                      href={`/patient/appointments/${appointment.id}`}
                      className="btn-secondary py-2 px-4 rounded-full text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
