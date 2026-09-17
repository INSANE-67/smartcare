import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/dal/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";
import { DoctorSearchBar } from "./_components/doctor-search-bar";
import { Stethoscope, CheckCircle2, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Doctor Directory — SmartCare",
};

interface DoctorRecord {
  id: string;
  profile_id: string;
  specialty: string;
  department?: string | null;
  is_verified?: boolean;
  clinic_name?: string | null;
  years_of_experience?: number | null;
}

interface ProfileRecord {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  role?: string | null;
}

interface FormattedDoctor {
  id: string;
  profile_id: string;
  full_name: string;
  specialty: string;
  department?: string | null;
  avatar_url?: string | null;
  is_verified?: boolean;
  clinic_name?: string | null;
  years_of_experience?: number | null;
}

export default async function DoctorDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; specialty?: string }>;
}) {
  await requireRole("patient");
  const supabase = await createSupabaseServerClient();

  const resolvedParams = await searchParams;
  const search = resolvedParams.search || "";
  const specialty = resolvedParams.specialty || "";

  // Fetch doctor profiles and doctors table rows in parallel
  const [profilesRes, doctorsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role, is_verified")
      .eq("role", "doctor"),
    supabase
      .from("doctors")
      .select(
        "id, profile_id, specialty, department, is_verified, clinic_name, years_of_experience"
      ),
  ]);

  const doctorProfiles =
    (profilesRes.data as (ProfileRecord & { is_verified?: boolean })[] | null) ?? [];
  const doctorsData = (doctorsRes.data as DoctorRecord[] | null) ?? [];

  if (profilesRes.error) console.error("[PROFILES FETCH ERROR]", profilesRes.error);
  if (doctorsRes.error) console.error("[DOCTORS FETCH ERROR]", doctorsRes.error);

  const docMap = new Map<string, DoctorRecord>(doctorsData.map((d) => [d.profile_id, d]));

  const processedProfileIds = new Set<string>();
  const combinedDoctors: FormattedDoctor[] = [];

  for (const prof of doctorProfiles) {
    processedProfileIds.add(prof.id);
    const doc = docMap.get(prof.id);
    const rawName = prof.full_name?.trim() || "Doctor";
    const displayName = rawName.toLowerCase().startsWith("dr") ? rawName : `Dr. ${rawName}`;

    combinedDoctors.push({
      id: doc?.id || prof.id,
      profile_id: prof.id,
      full_name: displayName,
      specialty: doc?.specialty || "General Practice",
      department: doc?.department || null,
      avatar_url: prof.avatar_url || null,
      is_verified: doc?.is_verified ?? prof.is_verified ?? true,
      clinic_name: doc?.clinic_name || null,
      years_of_experience: doc?.years_of_experience || null,
    });
  }

  for (const doc of doctorsData) {
    if (!processedProfileIds.has(doc.profile_id)) {
      combinedDoctors.push({
        id: doc.id,
        profile_id: doc.profile_id,
        full_name: "Dr. Specialist",
        specialty: doc.specialty || "General Practice",
        department: doc.department || null,
        avatar_url: null,
        is_verified: doc.is_verified ?? true,
        clinic_name: doc.clinic_name || null,
        years_of_experience: doc.years_of_experience || null,
      });
    }
  }

  const searchTerm = (resolvedParams?.search || "").toLowerCase().trim();
  const specialtyTerm = (resolvedParams?.specialty || "").toLowerCase().trim();

  const formattedDoctors = combinedDoctors.filter((doc) => {
    if (specialtyTerm && !(doc.specialty || "").toLowerCase().includes(specialtyTerm))
      return false;
    if (!searchTerm) return true;
    if (searchTerm === "doctor" || searchTerm === "dr" || searchTerm === "dr.") return true;
    return (
      (doc.full_name || "").toLowerCase().includes(searchTerm) ||
      (doc.specialty || "").toLowerCase().includes(searchTerm) ||
      (doc.department || "").toLowerCase().includes(searchTerm) ||
      (doc.clinic_name || "").toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#111111]">
            Doctor Directory
          </h1>
          <p className="mt-1.5 text-sm text-[#777777]">
            Browse and book appointments with verified healthcare specialists.
          </p>
        </div>
        <Link
          href="/patient/relationships"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E8DED2] text-[#111111] text-sm font-semibold rounded-full hover:border-[#111111] hover:shadow-xs transition-all shadow-xs self-start sm:self-auto"
        >
          <Stethoscope className="w-4 h-4" />
          <span>My Doctors</span>
        </Link>
      </div>

      {/* ── Search & Filter ── */}
      <DoctorSearchBar
        initialSearch={search}
        initialSpecialty={specialty}
        placeholder="Search by name, specialty, or department…"
      />

      {/* ── Doctor Grid / Empty State ── */}
      {formattedDoctors.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-14 text-center border border-dashed border-[#E8DED2] rounded-2xl bg-white">
          <div className="w-14 h-14 rounded-full bg-[#FAF7F2] border border-[#E8DED2] flex items-center justify-center mb-4">
            <Stethoscope className="w-6 h-6 text-[#777777]" />
          </div>
          <h3 className="text-base font-bold text-[#111111]">No doctors found</h3>
          <p className="mt-1.5 text-sm text-[#777777] max-w-sm mx-auto">
            {search || specialty
              ? "No doctors match your filters. Try adjusting your search."
              : "There are no doctors listed in the directory yet."}
          </p>
          {(search || specialty) && (
            <div className="mt-6">
              <Link
                href="/patient/doctors"
                className="inline-flex items-center justify-center rounded-full bg-[#111111] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2a2a2a] transition-colors shadow-xs"
              >
                Clear Filters
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {formattedDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className="group bg-white border border-[#E8DED2] rounded-2xl p-6 shadow-xs hover:border-[#CCBBAA] hover:shadow-md transition-all flex flex-col items-center text-center"
            >
              {/* Avatar + verification badge */}
              <div className="relative mb-4 mt-1">
                <Avatar src={doctor.avatar_url ?? null} name={doctor.full_name} size={72} />
                {doctor.is_verified && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center border border-[#E8DED2] shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-[#111111]" />
                  </div>
                )}
              </div>

              {/* Name */}
              <h3 className="font-serif text-lg font-bold text-[#111111] leading-tight group-hover:text-[#444444] transition-colors">
                {doctor.full_name}
              </h3>

              {/* Specialty */}
              <p className="mt-1 text-xs font-semibold text-[#555555] uppercase tracking-wider">
                {doctor.specialty}
              </p>

              {/* Department */}
              {doctor.department && (
                <p className="mt-0.5 text-xs text-[#777777]">{doctor.department}</p>
              )}

              {/* Years of experience */}
              {doctor.years_of_experience != null && (
                <p className="mt-1 text-[11px] text-[#AAAAAA] font-medium">
                  {doctor.years_of_experience}+ years experience
                </p>
              )}

              {/* Divider + Action buttons */}
              <div className="mt-auto pt-4 border-t border-[#F0EBE3] w-full flex items-center gap-2.5 mt-5">
                <Link
                  href={`/patient/doctors/${doctor.profile_id}`}
                  className="flex-1 inline-flex items-center justify-center py-2 px-3 border border-[#E8DED2] rounded-xl text-xs font-semibold text-[#555555] hover:bg-[#FAF7F2] hover:border-[#CCBBAA] hover:text-[#111111] transition-all"
                >
                  View Profile
                </Link>
                <Link
                  href={`/patient/book/${doctor.profile_id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-[#111111] hover:bg-[#2a2a2a] text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
