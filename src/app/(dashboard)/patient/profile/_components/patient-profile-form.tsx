"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateProfileAction, type ProfileActionState } from "@/lib/actions/profile";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import type { ProfileRow, Gender } from "@/types/database";
import { CheckCircle2, AlertCircle, User, Phone, Calendar, Heart, ShieldAlert, Sparkles } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      id="profile-save-btn"
      type="submit"
      disabled={pending}
      className="btn-primary py-3 px-8 rounded-full text-xs font-medium inline-flex items-center gap-2 shadow-xs transition-all disabled:opacity-60 cursor-pointer"
      aria-busy={pending}
    >
      {pending ? (
        <>
          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Saving Profile…</span>
        </>
      ) : (
        "Save Profile Changes"
      )}
    </button>
  );
}

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const initialState: ProfileActionState = {};

interface PatientProfileFormProps {
  profile: ProfileRow;
  avatarSignedUrl: string | null;
}

export function PatientProfileForm({ profile, avatarSignedUrl }: PatientProfileFormProps) {
  const [state, formAction] = useActionState(updateProfileAction, initialState);

  return (
    <div className="space-y-8">
      {/* Avatar Section */}
      <section className="bg-white rounded-[24px] border border-[#E8DED2] p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="font-serif text-lg font-bold text-[#111111]">
          Profile Photograph
        </h2>
        <p className="text-xs text-[#555555]">
          A clear photo helps doctors identify you during appointments.
        </p>
        <AvatarUpload currentSrc={avatarSignedUrl} name={profile.full_name} />
      </section>

      {/* Main Info Form */}
      <section className="bg-white rounded-[24px] border border-[#E8DED2] p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="font-serif text-lg font-bold text-[#111111]">
          Personal &amp; Clinical Information
        </h2>

        {state.success && (
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DED2] text-xs text-[#111111] flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#111111] shrink-0" />
            <span>Profile details updated successfully.</span>
          </div>
        )}

        {state.error && (
          <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#991B1B] shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} noValidate className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="profile-full-name" className="block text-xs font-semibold text-[#111111]">
                Full Legal Name
              </label>
              <input
                id="profile-full-name"
                name="full_name"
                type="text"
                defaultValue={profile.full_name}
                required
                className={`w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border ${
                  state.fieldErrors?.full_name ? "border-red-400" : "border-[#E8DED2]"
                } text-xs text-[#111111] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all`}
              />
              {state.fieldErrors?.full_name && (
                <p className="text-[11px] text-red-600 font-medium">{state.fieldErrors.full_name[0]}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label htmlFor="profile-phone" className="block text-xs font-semibold text-[#111111]">
                Phone Number
              </label>
              <input
                id="profile-phone"
                name="phone"
                type="tel"
                defaultValue={profile.phone ?? ""}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DED2] text-xs text-[#111111] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-1.5">
              <label htmlFor="profile-dob" className="block text-xs font-semibold text-[#111111]">
                Date of Birth
              </label>
              <input
                id="profile-dob"
                name="date_of_birth"
                type="date"
                defaultValue={profile.date_of_birth ?? ""}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DED2] text-xs text-[#111111] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all"
              />
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label htmlFor="profile-gender" className="block text-xs font-semibold text-[#111111]">
                Gender
              </label>
              <select
                id="profile-gender"
                name="gender"
                defaultValue={profile.gender ?? ""}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DED2] text-xs text-[#111111] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all"
              >
                <option value="">Not specified</option>
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Blood Group */}
            <div className="space-y-1.5">
              <label htmlFor="profile-blood-group" className="block text-xs font-semibold text-[#111111]">
                Blood Group
              </label>
              <select
                id="profile-blood-group"
                name="blood_group"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                defaultValue={(profile as any).blood_group ?? ""}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DED2] text-xs text-[#111111] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all"
              >
                <option value="">Select blood group</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Account Metadata Note */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] flex items-center justify-between text-xs text-[#555555]">
            <span>Account Status: <strong className="text-[#111111]">Active Patient</strong></span>
            <span className="font-mono text-[11px]">
              Member since {new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
            </span>
          </div>

          <div>
            <SubmitButton />
          </div>
        </form>
      </section>
    </div>
  );
}
