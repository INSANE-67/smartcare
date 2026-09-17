import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/dal/auth";
import { getFullProfile, getAvatarSignedUrl } from "@/lib/dal/profile";
import { PatientProfileForm } from "./_components/patient-profile-form";

export const metadata: Metadata = {
  title: "My Patient Profile — SmartCare",
  description: "View and update your SmartCare personal information, emergency contacts, and clinical profile.",
};

export default async function PatientProfilePage() {
  await requireRole("patient");
  const profile = await getFullProfile();

  if (!profile) {
    redirect("/login");
  }

  const avatarSignedUrl = await getAvatarSignedUrl(profile.avatar_url);

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* ── Header ── */}
      <div className="space-y-1 pb-6 border-b border-[#E8DED2]">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#777777] font-semibold">
          Patient Demographics &amp; Vitals
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
          Personal Profile &amp; Medical Intake
        </h1>
        <p className="text-xs text-[#555555]">
          Manage your personal details, emergency contacts, and baseline clinical info.
        </p>
      </div>

      <PatientProfileForm profile={profile} avatarSignedUrl={avatarSignedUrl} />
    </div>
  );
}
