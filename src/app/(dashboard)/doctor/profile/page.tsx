import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/dal/auth";
import { getFullProfile, getDoctorProfile, getAvatarSignedUrl } from "@/lib/dal/profile";
import { DoctorProfileForm } from "./_components/doctor-profile-form";

export const metadata: Metadata = {
  title: "My Profile — SmartCare",
  description: "View and update your SmartCare doctor profile and professional information.",
};

export default async function DoctorProfilePage() {
  // Authoritative role check
  await requireRole("doctor");

  // Fetch base profile and doctor record in parallel
  const [profile, doctorProfile] = await Promise.all([
    getFullProfile(),
    getDoctorProfile(),
  ]);

  if (!profile) {
    redirect("/login");
  }

  const avatarSignedUrl = await getAvatarSignedUrl(profile.avatar_url);

  return (
    <div className="dash-content">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">My Profile</h1>
          <p className="dash-page-subtitle">
            Manage your personal information and professional details
          </p>
        </div>
        {doctorProfile?.is_verified && (
          <span className="dash-admin-badge" style={{ borderColor: "hsl(152 76% 40% / 0.3)", background: "hsl(152 76% 40% / 0.1)", color: "hsl(152 76% 55%)" }}>
            ✓ Verified Doctor
          </span>
        )}
      </div>

      <DoctorProfileForm
        profile={profile}
        doctorProfile={doctorProfile}
        avatarSignedUrl={avatarSignedUrl}
      />
    </div>
  );
}
