import { requireRole } from "@/lib/dal/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";
import Link from "next/link";
import { Stethoscope, ArrowRight, Calendar, User } from "lucide-react";

export const metadata = {
  title: "My Doctors — SmartCare",
};

export default async function PatientRelationshipsPage() {
  const user = await requireRole("patient");
  const supabase = await createSupabaseServerClient();

  // A doctor is "My Doctor" when the patient has any non-cancelled appointment with them
  const { data: appointments } = await supabase
    .from("appointments")
    .select("doctor_id, status, created_at")
    .eq("patient_id", user.id)
    .in("status", ["pending", "confirmed", "completed"]);

  const doctorIds: string[] = Array.from(
    new Set(
      (appointments ?? [])
        .map((a) => a.doctor_id)
        .filter((id): id is string => Boolean(id))
    )
  );

  let myDoctors: {
    id: string;
    profile_id: string;
    full_name: string;
    specialty: string;
    avatar_url: string | null | undefined;
  }[] = [];

  if (doctorIds.length > 0) {
    const { data: doctors } = await supabase
      .from("doctors")
      .select("id, specialty, profile_id")
      .in("profile_id", doctorIds);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", doctorIds);

    const profilesMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    const doctorsMap = new Map((doctors ?? []).map((d) => [d.profile_id, d]));

    myDoctors = doctorIds.map((pId) => {
      const profile = profilesMap.get(pId);
      const doc = doctorsMap.get(pId);
      const rawName = profile?.full_name?.trim() || "Doctor";
      const displayName = rawName.toLowerCase().startsWith("dr")
        ? rawName
        : `Dr. ${rawName}`;

      return {
        id: doc?.id || pId,
        profile_id: pId,
        full_name: displayName,
        specialty: doc?.specialty || "General Practice",
        avatar_url: profile?.avatar_url,
      };
    });
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#111111]">
            My Doctors
          </h1>
          <p className="mt-1.5 text-sm text-[#777777]">
            Healthcare providers you have scheduled or completed consultations with.
          </p>
        </div>
        <Link
          href="/patient/doctors"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#111111] hover:bg-[#2a2a2a] text-white font-semibold text-sm rounded-full transition-colors shadow-xs self-start sm:self-auto"
        >
          <Stethoscope className="w-4 h-4" />
          <span>Find a Doctor</span>
        </Link>
      </div>

      {/* ── Doctors List / Empty State ── */}
      <div className="bg-white border border-[#E8DED2] rounded-2xl shadow-xs overflow-hidden">
        {myDoctors.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center p-14 text-center">
            <div className="w-14 h-14 rounded-full bg-[#FAF7F2] border border-[#E8DED2] flex items-center justify-center mb-4">
              <Stethoscope className="w-6 h-6 text-[#777777]" />
            </div>
            <h3 className="text-base font-bold text-[#111111]">
              No connected doctors yet
            </h3>
            <p className="mt-1.5 text-sm text-[#777777] max-w-sm mx-auto">
              You haven&apos;t booked an appointment with any doctors yet. Browse our
              verified directory to find a specialist and schedule your first visit.
            </p>
            <div className="mt-6">
              <Link
                href="/patient/doctors"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#111111] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2a2a2a] transition-colors shadow-xs"
              >
                <span>Browse &amp; Book</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Doctors list */
          <ul className="divide-y divide-[#F0EBE3]">
            {myDoctors.map((doc) => (
              <li
                key={doc.profile_id}
                className="p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 hover:bg-[#FAF7F2] transition-colors"
              >
                {/* Avatar */}
                <div className="shrink-0">
                  <Avatar src={doc.avatar_url || null} name={doc.full_name} size={56} />
                </div>

                {/* Name + specialty */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <h3 className="font-serif text-base font-bold text-[#111111] truncate">
                    {doc.full_name}
                  </h3>
                  <p className="text-xs font-semibold text-[#555555] uppercase tracking-wider mt-0.5">
                    {doc.specialty}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <Link
                    href={`/patient/doctors/${doc.profile_id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#E8DED2] rounded-xl text-xs font-semibold text-[#555555] hover:bg-[#FAF7F2] hover:border-[#CCBBAA] hover:text-[#111111] transition-all"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href={`/patient/book/${doc.profile_id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#111111] hover:bg-[#2a2a2a] text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Again</span>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
