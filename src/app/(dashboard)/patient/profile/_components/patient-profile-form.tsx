"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateProfileAction, type ProfileActionState } from "@/lib/actions/profile";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import type { ProfileRow, Gender } from "@/types/database";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      id="profile-save-btn"
      type="submit"
      disabled={pending}
      className="profile-save-btn"
      aria-busy={pending}
    >
      {pending ? (
        <>
          <span className="auth-spinner auth-spinner-sm" aria-hidden="true" />
          Saving…
        </>
      ) : (
        "Save changes"
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

const initialState: ProfileActionState = {};

interface PatientProfileFormProps {
  profile: ProfileRow;
  avatarSignedUrl: string | null;
}

export function PatientProfileForm({ profile, avatarSignedUrl }: PatientProfileFormProps) {
  const [state, formAction] = useActionState(updateProfileAction, initialState);

  return (
    <div className="profile-layout">
      {/* Avatar section */}
      <section className="profile-section" aria-labelledby="avatar-section-heading">
        <h2 id="avatar-section-heading" className="profile-section-title">Photo</h2>
        <AvatarUpload currentSrc={avatarSignedUrl} name={profile.full_name} />
      </section>

      {/* Profile info form */}
      <section className="profile-section" aria-labelledby="info-section-heading">
        <h2 id="info-section-heading" className="profile-section-title">Personal information</h2>

        {state.success && (
          <div className="profile-banner profile-banner-success" role="status" aria-live="polite">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" />
            </svg>
            Profile updated successfully.
          </div>
        )}

        {state.error && (
          <div className="profile-banner profile-banner-error" role="alert">
            {state.error}
          </div>
        )}

        <form action={formAction} noValidate className="profile-form">
          <div className="profile-form-grid">
            {/* Full name */}
            <div className="profile-field profile-field-full">
              <label htmlFor="profile-full-name" className="profile-label">Full name</label>
              <input
                id="profile-full-name"
                name="full_name"
                type="text"
                defaultValue={profile.full_name}
                required
                className={`profile-input ${state.fieldErrors?.full_name ? "profile-input-error" : ""}`}
                aria-describedby={state.fieldErrors?.full_name ? "profile-name-err" : undefined}
              />
              {state.fieldErrors?.full_name && (
                <p id="profile-name-err" className="profile-field-error" role="alert">
                  {state.fieldErrors.full_name[0]}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="profile-field">
              <label htmlFor="profile-phone" className="profile-label">Phone number</label>
              <input
                id="profile-phone"
                name="phone"
                type="tel"
                defaultValue={profile.phone ?? ""}
                placeholder="+1 555 000 0000"
                className="profile-input"
              />
            </div>

            {/* Date of birth */}
            <div className="profile-field">
              <label htmlFor="profile-dob" className="profile-label">Date of birth</label>
              <input
                id="profile-dob"
                name="date_of_birth"
                type="date"
                defaultValue={profile.date_of_birth ?? ""}
                className={`profile-input ${state.fieldErrors?.date_of_birth ? "profile-input-error" : ""}`}
                aria-describedby={state.fieldErrors?.date_of_birth ? "profile-dob-err" : undefined}
              />
              {state.fieldErrors?.date_of_birth && (
                <p id="profile-dob-err" className="profile-field-error" role="alert">
                  {state.fieldErrors.date_of_birth[0]}
                </p>
              )}
            </div>

            {/* Gender */}
            <div className="profile-field">
              <label htmlFor="profile-gender" className="profile-label">Gender</label>
              <select
                id="profile-gender"
                name="gender"
                defaultValue={profile.gender ?? ""}
                className="profile-input profile-select"
              >
                <option value="">Not specified</option>
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Read-only metadata */}
          <div className="profile-meta-grid">
            <div className="profile-meta-item">
              <span className="profile-meta-label">Account type</span>
              <span className="profile-meta-value profile-badge profile-badge-patient">Patient</span>
            </div>
            <div className="profile-meta-item">
              <span className="profile-meta-label">Member since</span>
              <span className="profile-meta-value">
                {new Date(profile.created_at).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="profile-actions">
            <SubmitButton />
          </div>
        </form>
      </section>
    </div>
  );
}
