import type { Metadata } from "next";
import { requireRole } from "@/lib/dal/auth";
import { getPatientRelationships } from "@/lib/dal/relationships";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BookAppointmentForm } from "@/components/ui/book-appointment-form";
import Link from "next/link";
import { ArrowLeft, Search, CalendarPlus } from "lucide-react";

export const metadata: Metadata = {
  title: "Book Appointment — SmartCare",
  description: "Request a new appointment with your doctor.",
};

export default async function BookAppointmentPage() {
  await requireRole("patient");
  const supabase = await createSupabaseServerClient();
  
  // Fetch active relationships to populate the doctor dropdown
  const relationships = await getPatientRelationships();
  let activeDoctors = relationships
    .filter(r => r.status === "active" && r.other_party)
    .map(r => ({
      id: r.other_party.id,
      name: r.other_party.full_name,
    }));

  // Fallback to all verified doctors in directory
  if (activeDoctors.length === 0) {
    const [profilesRes, docsRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name").eq("role", "doctor"),
      supabase.from("doctors").select("id, profile_id, specialty"),
    ]);

    const profs = (profilesRes.data || []) as { id: string; full_name: string }[];
    const docs = (docsRes.data || []) as { id: string; profile_id: string; specialty: string }[];
    const docMap = new Map(docs.map((d) => [d.profile_id, d]));

    if (profs.length > 0) {
      activeDoctors = profs.map((p) => {
        const doc = docMap.get(p.id);
        const name = p.full_name || "Doctor";
        return {
          id: p.id,
          name: `${name.startsWith("Dr.") ? name : `Dr. ${name}`} &bull; ${doc?.specialty || "General Practice"}`,
        };
      });
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/patient/appointments"
              className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Appointments</span>
            </Link>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Schedule Clinical Consultation
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Request an encounter with a verified healthcare specialist.
          </p>
        </div>

        <Link
          href="/patient/doctors"
          className="btn btn-secondary text-xs"
        >
          <Search className="w-4 h-4" />
          <span>Browse Directory</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-xs">
        <BookAppointmentForm doctors={activeDoctors} />
      </div>
    </div>
  );
}
