import { requireAuth } from "@/lib/dal/auth";
import { getFullProfile } from "@/lib/dal/profile";
import { updatePatientSettingsAction, changePasswordAction } from "@/lib/actions/settings";
import { Settings, Shield, Bell, Lock, User, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Account Settings — SmartCare",
  description: "Manage your personal profile information, security credentials, and notifications.",
};

export default async function PatientSettingsPage() {
  await requireAuth();
  const profile = await getFullProfile();

  if (!profile) return null;

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      {/* ── Header ── */}
      <div className="space-y-1 pb-6 border-b border-[#E8DED2]">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#777777] font-semibold">
          Preferences &amp; Security
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
          Account Settings
        </h1>
        <p className="text-xs text-[#666666]">
          Manage your personal information, notification preferences, and login security credentials.
        </p>
      </div>

      <div className="space-y-8">
        {/* Profile Information Settings */}
        <section className="bg-white rounded-[18px] border border-[#E8DED2] p-7 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 border-b border-[#E8DED2] pb-4">
            <User className="w-5 h-5 text-[#111111]" />
            <h2 className="font-serif text-xl font-bold text-[#111111]">
              Personal Information
            </h2>
          </div>

          <form action={updatePatientSettingsAction as unknown as undefined} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#111111]">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  defaultValue={profile.full_name}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DED2] text-xs text-[#111111] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#111111]">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={profile.phone || ""}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DED2] text-xs text-[#111111] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#111111]">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  defaultValue={profile.date_of_birth || ""}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DED2] text-xs text-[#111111] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#111111]">
                  Gender
                </label>
                <select
                  name="gender"
                  defaultValue={profile.gender || ""}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DED2] text-xs text-[#111111] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all"
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="btn-primary py-2.5 px-6 rounded-full text-xs font-semibold shadow-xs cursor-pointer"
              >
                Save Personal Changes
              </button>
            </div>
          </form>
        </section>

        {/* Security / Password Change */}
        <section className="bg-white rounded-[18px] border border-[#E8DED2] p-7 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 border-b border-[#E8DED2] pb-4">
            <Lock className="w-5 h-5 text-[#111111]" />
            <h2 className="font-serif text-xl font-bold text-[#111111]">
              Login &amp; Password Security
            </h2>
          </div>

          <form action={changePasswordAction as unknown as undefined} className="space-y-5 max-w-md">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#111111]">
                Current Password
              </label>
              <input
                type="password"
                name="current_password"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DED2] text-xs text-[#111111] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#111111]">
                New Password
              </label>
              <input
                type="password"
                name="new_password"
                required
                minLength={8}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DED2] text-xs text-[#111111] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#111111]">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirm_password"
                required
                minLength={8}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DED2] text-xs text-[#111111] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="btn-secondary py-2.5 px-6 rounded-full text-xs font-semibold shadow-2xs cursor-pointer"
              >
                Update Password
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
