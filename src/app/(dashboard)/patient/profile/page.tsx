import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/dal/auth";
import { getFullProfile, getAvatarSignedUrl } from "@/lib/dal/profile";
import { PatientProfileForm } from "./_components/patient-profile-form";

export const metadata: Metadata = {
  title: "My Profile — SmartCare",
  description: "View and update your SmartCare patient profile.",
};

export default async function PatientProfilePage() {
  // Authoritative role check — non-patients redirected to their dashboard
  await requireRole("patient");

  const [profile, ] = await Promise.all([getFullProfile()]);

  if (!profile) {
    redirect("/login");
  }

  const avatarSignedUrl = await getAvatarSignedUrl(profile.avatar_url);

  return (
    <div className="dash-content">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">My Profile</h1>
          <p className="dash-page-subtitle">Manage your personal information and photo</p>
        </div>
      </div>

      <PatientProfileForm profile={profile} avatarSignedUrl={avatarSignedUrl} />
    </div>
  );
}
