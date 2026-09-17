import type { Metadata } from "next";
import { requireRole } from "@/lib/dal/auth";
import { getDoctorAppointments } from "@/lib/dal/appointments";
import Link from "next/link";
import { AppointmentStatusBadge } from "@/components/ui/appointment-status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { UpdateAppointmentStatusForm } from "@/components/ui/update-appointment-status-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Calendar, Clock, User, ArrowRight, Video } from "lucide-react";

export const metadata: Metadata = {
  title: "Doctor Appointments — SmartCare",
  description: "Manage clinical consultations and patient schedules.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DoctorAppointmentsPage() {
  await requireRole("doctor");
  
  const appointments = await getDoctorAppointments();
  
  // Fetch patient profiles directly
  const patientIds = Array.from(new Set(appointments.map((a) => a.patient_id).filter(Boolean)));
  const supabase = await createSupabaseServerClient();
  const { data: patientProfiles } = patientIds.length > 0
    ? await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", patientIds)
    : { data: [] };

  const patientMap = new Map(
    (patientProfiles || []).map((p) => [p.id, p.full_name || "Patient"])
  );

  const pendingCount = appointments.filter((a) => a.status === "pending").length;
  const confirmedCount = appointments.filter((a) => a.status === "confirmed").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8DED2]">
        <div className="space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#777777] font-semibold">
            Clinical Schedule
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
            Consultation Queue &amp; Encounters
          </h1>
          <p className="text-xs text-[#555555]">
            Review patient bookings, confirm consultation requests, and document encounters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E8DED2] text-[#111111] font-mono font-semibold">
            {pendingCount} Pending Triage
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-[#111111] text-white font-mono font-semibold">
            {confirmedCount} Confirmed
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      {appointments.length === 0 ? (
        <div className="bg-white rounded-[22px] border border-[#E8DED2] p-8 shadow-xs">
          <EmptyState
            icon={Calendar}
            title="No appointments scheduled"
            description="You don't have any appointments in your queue. When patients book clinical sessions, they will appear here."
          />
        </div>
      ) : (
        <div className="bg-white rounded-[22px] border border-[#E8DED2] overflow-hidden shadow-xs">
          <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#E8DED2] flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#555555] font-semibold">
              All Scheduled Encounters ({appointments.length})
            </span>
          </div>

          <div className="divide-y divide-[#E8DED2]">
            {appointments.map((appointment) => {
              const patientName = patientMap.get(appointment.patient_id) || "Patient";

              return (
                <div
                  key={appointment.id}
                  className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#FAF7F2]/40 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Time Slot Box */}
                    <div className="px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] text-center min-w-[76px] shrink-0">
                      <p className="font-serif text-sm font-bold text-[#111111]">
                        {appointment.appointment_time.slice(0, 5)}
                      </p>
                      <p className="text-[10px] font-mono text-[#777777] uppercase mt-0.5">
                        {new Date(appointment.appointment_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>

                    {/* Consultation Metadata */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif font-bold text-[#111111] text-base">
                          {patientName}
                        </h3>
                        <AppointmentStatusBadge status={appointment.status} />
                      </div>

                      <p className="text-xs text-[#555555] line-clamp-1">
                        <span className="font-semibold text-[#111111]">Reason: </span>
                        {appointment.reason}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-[#777777] font-mono">
                        <span>Booked on {new Date(appointment.created_at).toLocaleDateString()}</span>
                        <Link
                          href={`/doctor/patients/${appointment.patient_id}`}
                          className="text-[#111111] underline hover:text-[#555555] inline-flex items-center gap-1 font-sans"
                        >
                          <User className="w-3 h-3" />
                          <span>View Patient EHR</span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2 lg:self-center">
                    <UpdateAppointmentStatusForm id={appointment.id} status={appointment.status} />

                    {appointment.status === "confirmed" && (
                      <Link
                        href={`/doctor/appointments/${appointment.id}/consultation`}
                        className="btn-primary py-1.5 px-3.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Encounter Room</span>
                      </Link>
                    )}

                    <Link
                      href={`/doctor/appointments/${appointment.id}`}
                      className="btn-secondary py-1.5 px-3.5 rounded-full text-xs font-medium inline-flex items-center gap-1"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3 h-3" />
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
