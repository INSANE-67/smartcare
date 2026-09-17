import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/dal/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAvatarSignedUrl } from "@/lib/dal/profile";
import { BookingForm } from "./_components/booking-form";
import {
  ArrowLeft,
  Stethoscope,
  Building2,
  Award,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface BookAppointmentPageProps {
  params: Promise<{ doctorId: string }>;
}

export async function generateMetadata({
  params,
}: BookAppointmentPageProps): Promise<Metadata> {
  const { doctorId } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", doctorId)
    .maybeSingle();

  return {
    title: profile?.full_name
      ? `Book Appointment with Dr. ${profile.full_name} — SmartCare`
      : "Book Appointment — SmartCare",
    description: "Schedule a virtual or in-person clinical consultation.",
  };
}

export default async function BookAppointmentPage({
  params,
}: BookAppointmentPageProps) {
  await requireRole("patient");
  const { doctorId } = await params;
  const supabase = await createSupabaseServerClient();

  // 1. Fetch doctor details
  let doctorData: {
    profile_id: string;
    full_name: string;
    specialty: string;
    department?: string | null;
    years_of_experience?: number | null;
    bio?: string | null;
    avatar_url?: string | null;
    clinic_name?: string | null;
    clinic_address?: string | null;
  } | null = null;

  const { data: docByProfile } = await supabase
    .from("doctors")
    .select(
      `
      id,
      profile_id,
      specialty,
      department,
      years_of_experience,
      bio,
      clinic_name,
      clinic_address,
      is_verified,
      profiles:profiles!doctors_profile_id_fkey (
        id,
        full_name,
        avatar_url,
        role
      )
    `
    )
    .or(`profile_id.eq.${doctorId},id.eq.${doctorId}`)
    .maybeSingle();

  if (docByProfile) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawProfile = docByProfile.profiles as any;
    const avatarSignedUrl = await getAvatarSignedUrl(rawProfile.avatar_url);
    doctorData = {
      profile_id: docByProfile.profile_id,
      full_name: rawProfile.full_name,
      specialty: docByProfile.specialty || "General Practice",
      department: docByProfile.department,
      years_of_experience: docByProfile.years_of_experience,
      bio: docByProfile.bio,
      avatar_url: avatarSignedUrl,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      clinic_name: (docByProfile as any).clinic_name,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      clinic_address: (docByProfile as any).clinic_address,
    };
  } else {
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role")
      .eq("id", doctorId)
      .eq("role", "doctor")
      .maybeSingle();

    if (profileRow) {
      const { data: docRow } = await supabase
        .from("doctors")
        .select("specialty, department, years_of_experience, bio, clinic_name, clinic_address, is_verified")
        .eq("profile_id", profileRow.id)
        .maybeSingle();

      const avatarSignedUrl = await getAvatarSignedUrl(profileRow.avatar_url);
      doctorData = {
        profile_id: profileRow.id,
        full_name: profileRow.full_name,
        specialty: docRow?.specialty || "General Medicine",
        department: docRow?.department,
        years_of_experience: docRow?.years_of_experience,
        bio: docRow?.bio,
        avatar_url: avatarSignedUrl,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        clinic_name: (docRow as any)?.clinic_name,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        clinic_address: (docRow as any)?.clinic_address,
      };
    }
  }

  if (!doctorData) {
    notFound();
  }

  const initials =
    doctorData.full_name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "DR";

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      {/* ── Back Link ── */}
      <div>
        <Link
          href="/patient/book"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#555555] hover:text-[#111111] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Doctors Directory</span>
        </Link>
      </div>

      {/* ── Doctor Header Card ── */}
      <div className="bg-white rounded-[24px] border border-[#E8DED2] p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
        {/* Avatar */}
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-[#111111] text-white font-bold text-2xl flex items-center justify-center shadow-sm shrink-0">
          {initials}
        </div>

        {/* Doctor Details */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-[#FAF7F2] text-[#111111] border border-[#E8DED2]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified Healthcare Provider</span>
          </div>

          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#111111] tracking-tight">
            Book Appointment with Dr. {doctorData.full_name}
          </h1>

          <p className="text-xs sm:text-sm font-semibold text-[#555555] flex items-center justify-center md:justify-start gap-2">
            <Stethoscope className="w-4 h-4 text-[#111111]" />
            <span>{doctorData.specialty}</span>
            {doctorData.department && (
              <>
                <span className="text-[#E8DED2]">&bull;</span>
                <span className="text-[#777777] font-normal">
                  {doctorData.department}
                </span>
              </>
            )}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4 border-t border-[#E8DED2] text-xs text-[#555555]">
            {doctorData.years_of_experience && (
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#111111]" />
                <span>{doctorData.years_of_experience}+ Years Experience</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#111111]" />
              <span>30 Min Consultations</span>
            </div>
            {doctorData.clinic_name && (
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#111111]" />
                <span>{doctorData.clinic_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Booking Form ── */}
      <div className="space-y-4">
        <div className="px-1">
          <h2 className="font-serif text-xl font-bold text-[#111111] tracking-tight">
            Appointment Details
          </h2>
          <p className="text-xs text-[#555555]">
            Select your preferred consultation date, time slot, and reason for your visit.
          </p>
        </div>

        <BookingForm
          doctorId={doctorData.profile_id}
          doctorName={doctorData.full_name}
          doctorSpecialty={doctorData.specialty}
        />
      </div>
    </div>
  );
}
