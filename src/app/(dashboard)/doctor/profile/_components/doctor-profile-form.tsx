"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  updateProfileAction,
  updateDoctorProfileAction,
  type ProfileActionState,
} from "@/lib/actions/profile";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import type { ProfileRow, DoctorRow, Gender } from "@/types/database";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
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
        label
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

interface DoctorProfileFormProps {
  profile: ProfileRow;
  doctorProfile: DoctorRow | null;
  avatarSignedUrl: string | null;
}

export function DoctorProfileForm({
  profile,
  doctorProfile,
  avatarSignedUrl,
}: DoctorProfileFormProps) {
  const [profileState, profileAction] = useActionState(updateProfileAction, initialState);
  const [doctorState, doctorAction] = useActionState(
    updateDoctorProfileAction,
    initialState
  );

  return (
    <div className="profile-layout">
      {/* Avatar */}
      <section className="profile-section" aria-labelledby="avatar-hd">
        <h2 id="avatar-hd" className="profile-section-title">Photo</h2>
        <AvatarUpload currentSrc={avatarSignedUrl} name={profile.full_name} />
      </section>

      {/* Personal info */}
      <section className="profile-section" aria-labelledby="personal-hd">
        <h2 id="personal-hd" className="profile-section-title">Personal information</h2>

        {profileState.success && (
          <div className="profile-banner profile-banner-success" role="status" aria-live="polite">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" />
            </svg>
            Personal information updated.
          </div>
        )}
        {profileState.error && (
          <div className="profile-banner profile-banner-error" role="alert">
            {profileState.error}
          </div>
        )}

        <form action={profileAction} noValidate className="profile-form">
          <div className="profile-form-grid">
            <div className="profile-field profile-field-full">
              <label htmlFor="doc-full-name" className="profile-label">Full name</label>
              <input
                id="doc-full-name"
                name="full_name"
                type="text"
                defaultValue={profile.full_name}
                required
                className={`profile-input ${profileState.fieldErrors?.full_name ? "profile-input-error" : ""}`}
              />
              {profileState.fieldErrors?.full_name && (
                <p className="profile-field-error" role="alert">
                  {profileState.fieldErrors.full_name[0]}
                </p>
              )}
            </div>

            <div className="profile-field">
              <label htmlFor="doc-phone" className="profile-label">Phone number</label>
              <input
                id="doc-phone"
                name="phone"
                type="tel"
                defaultValue={profile.phone ?? ""}
                placeholder="+1 555 000 0000"
                className="profile-input"
              />
            </div>

            <div className="profile-field">
              <label htmlFor="doc-dob" className="profile-label">Date of birth</label>
              <input
                id="doc-dob"
                name="date_of_birth"
                type="date"
                defaultValue={profile.date_of_birth ?? ""}
                className="profile-input"
              />
            </div>

            <div className="profile-field">
              <label htmlFor="doc-gender" className="profile-label">Gender</label>
              <select
                id="doc-gender"
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

          <div className="profile-actions">
            <SubmitButton label="Save personal info" />
          </div>
        </form>
      </section>

      {/* Doctor professional info */}
      <section className="profile-section" aria-labelledby="professional-hd">
        <h2 id="professional-hd" className="profile-section-title">Professional information</h2>

        {/* Verification status badge */}
        <div className="profile-verification-row">
          <span className="profile-meta-label">Verification status</span>
          {doctorProfile?.is_verified ? (
            <span className="profile-badge profile-badge-verified">
              ✓ Verified
            </span>
          ) : (
            <span className="profile-badge profile-badge-pending">
              ⏳ Pending verification
            </span>
          )}
        </div>

        {doctorProfile?.license_number && (
          <div className="profile-readonly-field">
            <span className="profile-meta-label">License number</span>
            <span className="profile-meta-value profile-monospace">
              {doctorProfile.license_number}
            </span>
          </div>
        )}

        {!doctorProfile && (
          <div className="profile-banner profile-banner-info">
            Your doctor profile has not been created yet. Contact an admin to set up
            your license and specialty information.
          </div>
        )}

        {doctorProfile && (
          <>
            {doctorState.success && (
              <div className="profile-banner profile-banner-success" role="status" aria-live="polite">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" />
                </svg>
                Professional information updated.
              </div>
            )}
            {doctorState.error && (
              <div className="profile-banner profile-banner-error" role="alert">
                {doctorState.error}
              </div>
            )}

            <form action={doctorAction} noValidate className="profile-form">
              <div className="profile-form-grid">
                <div className="profile-field">
                  <label htmlFor="doc-specialty" className="profile-label">Specialty</label>
                  <input
                    id="doc-specialty"
                    name="specialty"
                    type="text"
                    defaultValue={doctorProfile.specialty}
                    required
                    placeholder="e.g. Cardiology"
                    className={`profile-input ${doctorState.fieldErrors?.specialty ? "profile-input-error" : ""}`}
                  />
                  {doctorState.fieldErrors?.specialty && (
                    <p className="profile-field-error" role="alert">
                      {doctorState.fieldErrors.specialty[0]}
                    </p>
                  )}
                </div>

                <div className="profile-field">
                  <label htmlFor="doc-department" className="profile-label">Department</label>
                  <input
                    id="doc-department"
                    name="department"
                    type="text"
                    defaultValue={doctorProfile.department ?? ""}
                    placeholder="e.g. Internal Medicine"
                    className="profile-input"
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="doc-years" className="profile-label">Years of experience</label>
                  <input
                    id="doc-years"
                    name="years_of_experience"
                    type="number"
                    min={0}
                    max={60}
                    defaultValue={doctorProfile.years_of_experience ?? ""}
                    placeholder="0"
                    className={`profile-input ${doctorState.fieldErrors?.years_of_experience ? "profile-input-error" : ""}`}
                  />
                  {doctorState.fieldErrors?.years_of_experience && (
                    <p className="profile-field-error" role="alert">
                      {doctorState.fieldErrors.years_of_experience[0]}
                    </p>
                  )}
                </div>

                <div className="profile-field profile-field-full">
                  <label htmlFor="doc-bio" className="profile-label">
                    Bio
                    <span className="profile-label-hint"> — visible to patients</span>
                  </label>
                  <textarea
                    id="doc-bio"
                    name="bio"
                    rows={4}
                    defaultValue={doctorProfile.bio ?? ""}
                    placeholder="A brief description of your background, approach, and areas of expertise..."
                    className={`profile-input profile-textarea ${doctorState.fieldErrors?.bio ? "profile-input-error" : ""}`}
                    maxLength={1000}
                  />
                  {doctorState.fieldErrors?.bio && (
                    <p className="profile-field-error" role="alert">
                      {doctorState.fieldErrors.bio[0]}
                    </p>
                  )}
                </div>
              </div>

              <div className="profile-actions">
                <SubmitButton label="Save professional info" />
              </div>
            </form>
          </>
        )}
      </section>

      {/* Read-only metadata */}
      <section className="profile-section" aria-labelledby="meta-hd">
        <h2 id="meta-hd" className="profile-section-title">Account details</h2>
        <div className="profile-meta-grid">
          <div className="profile-meta-item">
            <span className="profile-meta-label">Account type</span>
            <span className="profile-badge profile-badge-doctor">Doctor</span>
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
      </section>
    </div>
  );
}
