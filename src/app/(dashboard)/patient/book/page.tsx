import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/dal/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";
import { Calendar, Stethoscope, CheckCircle2, ArrowRight } from "lucide-react";
import { DoctorSearchBar } from "../doctors/_components/doctor-search-bar";

export const metadata: Metadata = {
  title: "Book Appointment — Choose a Doctor — SmartCare",
  description: "Browse verified doctors and book a clinical consultation.",
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

export default async function BookDoctorDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; specialty?: string }>;
}) {
  await requireRole("patient");
  const supabase = await createSupabaseServerClient();

  const resolvedParams = await searchParams;
  const search = resolvedParams.search || "";
  const specialty = resolvedParams.specialty || "";

  // 1. Fetch doctor profiles and doctors table rows in parallel
  const [profilesRes, doctorsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role, is_verified")
      .eq("role", "doctor"),
    supabase
      .from("doctors")
      .select("id, profile_id, specialty, department, is_verified, clinic_name, years_of_experience"),
  ]);

  const doctorProfiles = (profilesRes.data as (ProfileRecord & { is_verified?: boolean })[] | null) ?? [];
  const doctorsData = (doctorsRes.data as DoctorRecord[] | null) ?? [];

  if (profilesRes.error) {
    console.error(
      "[PROFILES FETCH ERROR]",
      JSON.stringify(profilesRes.error, Object.getOwnPropertyNames(profilesRes.error), 2)
    );
  }
  if (doctorsRes.error) {
    console.error(
      "[DOCTORS FETCH ERROR]",
      JSON.stringify(doctorsRes.error, Object.getOwnPropertyNames(doctorsRes.error), 2)
    );
  }

  // 2. Build map of doctor records by profile_id
  const docMap = new Map<string, DoctorRecord>(
    doctorsData.map((d) => [d.profile_id, d])
  );

  // 3. Construct unified doctor list starting from doctor profiles
  const processedProfileIds = new Set<string>();
  const combinedDoctors: FormattedDoctor[] = [];

  for (const prof of doctorProfiles) {
    processedProfileIds.add(prof.id);
    const doc = docMap.get(prof.id);
    const rawName = prof.full_name?.trim() || "Doctor";
    const displayName = rawName.toLowerCase().startsWith("dr")
      ? rawName
      : `Dr. ${rawName}`;

    combinedDoctors.push({
      id: prof.id,
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

  // Also include any doctors from `doctors` table not in `doctorProfiles` (defensive fallback)
  for (const doc of doctorsData) {
    if (!processedProfileIds.has(doc.profile_id)) {
      combinedDoctors.push({
        id: doc.profile_id,
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

  // 4. Extract searchParams safely and filter
  const searchTerm = (resolvedParams?.search || "").toLowerCase().trim();
  const specialtyTerm = (resolvedParams?.specialty || "").toLowerCase().trim();

  const formattedDoctors = combinedDoctors.filter((doc) => {
    if (specialtyTerm) {
      const docSpecialty = (doc.specialty || "").toLowerCase();
      if (!docSpecialty.includes(specialtyTerm)) return false;
    }

    if (!searchTerm) return true;

    if (searchTerm === "doctor" || searchTerm === "dr" || searchTerm === "dr.") {
      return true;
    }

    const name = (doc.full_name || "").toLowerCase();
    const specialty = (doc.specialty || "").toLowerCase();
    const dept = (doc.department || "").toLowerCase();
    const clinic = (doc.clinic_name || "").toLowerCase();

    return (
      name.includes(searchTerm) ||
      specialty.includes(searchTerm) ||
      dept.includes(searchTerm) ||
      clinic.includes(searchTerm)
    );
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Book an Appointment
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Select a healthcare specialist to view availability and schedule your visit.
        </p>
      </div>

      {/* Search & Filter */}
      <DoctorSearchBar
        initialSearch={search}
        initialSpecialty={specialty}
        placeholder="Search doctor by name or specialty..."
      />

      {/* Doctors Grid */}
      {formattedDoctors.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20">
          <div className="p-3 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full mb-4">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            No doctors found
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {search || specialty
              ? "No doctors match your search. Try clearing your filters."
              : "There are currently no doctors available for booking."}
          </p>
          {(search || specialty) && (
            <div className="mt-6">
              <Link
                href="/patient/book"
                className="inline-flex items-center justify-center rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 transition-colors shadow-sm"
              >
                Clear Filters
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formattedDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className="group bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:border-teal-400 dark:hover:border-teal-500 hover:shadow-md transition-all p-6 flex flex-col text-center items-center"
            >
              <div className="relative mb-4">
                <Avatar
                  src={doctor.avatar_url ?? null}
                  name={doctor.full_name}
                  size={72}
                />
                {doctor.is_verified && (
                  <div className="absolute -bottom-1 -right-1 p-0.5 bg-white dark:bg-slate-800 rounded-full shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-teal-500" />
                  </div>
                )}
              </div>

              <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {doctor.full_name}
              </h3>
              <p className="text-teal-600 dark:text-teal-400 font-medium text-sm mb-1">
                {doctor.specialty}
              </p>
              {doctor.department && (
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-3">
                  {doctor.department}
                </p>
              )}

              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/80 w-full flex items-center justify-center gap-3">
                <Link
                  href={`/patient/doctors/${doctor.profile_id}`}
                  className="flex-1 inline-flex items-center justify-center py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  Profile
                </Link>
                <Link
                  href={`/patient/book/${doctor.profile_id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Visit</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
