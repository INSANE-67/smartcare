"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { ArrowRight, AlertCircle, User, Stethoscope } from "lucide-react";
import { signupAction, type AuthActionState } from "@/lib/actions/auth";

type Role = "patient" | "doctor";

function SubmitButton({ role }: { role: Role }) {
  const { pending } = useFormStatus();
  return (
    <button
      id="signup-submit-btn"
      type="submit"
      disabled={pending}
      className="btn-primary w-full py-3.5 px-6 rounded-full text-sm font-medium justify-center gap-2 shadow-md transition-all disabled:opacity-60"
      aria-busy={pending}
    >
      {pending ? (
        <>
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Creating account…</span>
        </>
      ) : (
        <>
          <span>{role === "doctor" ? "Register as Doctor" : "Create account"}</span>
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );
}

const initialState: AuthActionState = {};

const INPUT_CLASS =
  "w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E7DDD1] text-xs text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all";
const INPUT_ERROR_CLASS =
  "w-full px-3.5 py-2.5 rounded-xl bg-white border border-red-400 text-xs text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-400 transition-all";

export function SignupForm() {
  const [state, formAction] = useActionState(signupAction, initialState);
  const [role, setRole] = useState<Role>("patient");

  return (
    <div className="space-y-5">
      {/* Error banner */}
      {state.error && (
        <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#991B1B] shrink-0 mt-0.5" />
          <span className="leading-relaxed">{state.error}</span>
        </div>
      )}

      {/* Role selector */}
      <div
        role="group"
        aria-label="Account type"
        className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#F5F0EB] border border-[#E7DDD1]"
      >
        <button
          id="signup-role-patient"
          type="button"
          onClick={() => setRole("patient")}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all ${
            role === "patient"
              ? "bg-white text-[#111111] shadow-sm"
              : "text-[#777777] hover:text-[#333333]"
          }`}
          aria-pressed={role === "patient"}
        >
          <User className="w-3.5 h-3.5" />
          Patient
        </button>
        <button
          id="signup-role-doctor"
          type="button"
          onClick={() => setRole("doctor")}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all ${
            role === "doctor"
              ? "bg-white text-[#111111] shadow-sm"
              : "text-[#777777] hover:text-[#333333]"
          }`}
          aria-pressed={role === "doctor"}>
          <Stethoscope className="w-3.5 h-3.5" />
          Doctor
        </button>
      </div>

      {/* Doctor notice */}
      {role === "doctor" && (
        <div className="p-3 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] text-[11px] text-[#0369A1] leading-relaxed">
          Doctor accounts require admin verification before you can access the full dashboard.
          You&apos;ll be redirected to a pending page after registration.
        </div>
      )}

      <form action={formAction} noValidate className="space-y-4">
        {/* Hidden role input — submitted with the form */}
        <input type="hidden" name="role" value={role} />

        {/* Full name */}
        <div className="space-y-1.5">
          <label htmlFor="signup-name" className="block text-xs font-semibold text-[#111111]">
            Full name
          </label>
          <input
            id="signup-name"
            name="full_name"
            type="text"
            autoComplete="name"
            required
            placeholder={role === "doctor" ? "Dr. Jane Smith" : "Jane Smith"}
            className={state.fieldErrors?.full_name ? INPUT_ERROR_CLASS : INPUT_CLASS}
            aria-describedby={state.fieldErrors?.full_name ? "signup-name-error" : undefined}
          />
          {state.fieldErrors?.full_name && (
            <p id="signup-name-error" className="text-[11px] text-red-600 font-medium pt-0.5">
              {state.fieldErrors.full_name[0]}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="signup-email" className="block text-xs font-semibold text-[#111111]">
            Email address
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="name@example.com"
            className={state.fieldErrors?.email ? INPUT_ERROR_CLASS : INPUT_CLASS}
            aria-describedby={state.fieldErrors?.email ? "signup-email-error" : undefined}
          />
          {state.fieldErrors?.email && (
            <p id="signup-email-error" className="text-[11px] text-red-600 font-medium pt-0.5">
              {state.fieldErrors.email[0]}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="signup-password" className="block text-xs font-semibold text-[#111111]">
            Password
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Min 8 chars, letters + numbers"
            className={state.fieldErrors?.password ? INPUT_ERROR_CLASS : INPUT_CLASS}
            aria-describedby={state.fieldErrors?.password ? "signup-password-error" : undefined}
          />
          {state.fieldErrors?.password && (
            <p id="signup-password-error" className="text-[11px] text-red-600 font-medium pt-0.5">
              {state.fieldErrors.password[0]}
            </p>
          )}
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <label htmlFor="signup-confirm" className="block text-xs font-semibold text-[#111111]">
            Confirm password
          </label>
          <input
            id="signup-confirm"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="••••••••"
            className={state.fieldErrors?.confirm_password ? INPUT_ERROR_CLASS : INPUT_CLASS}
            aria-describedby={
              state.fieldErrors?.confirm_password ? "signup-confirm-error" : undefined
            }
          />
          {state.fieldErrors?.confirm_password && (
            <p id="signup-confirm-error" className="text-[11px] text-red-600 font-medium pt-0.5">
              {state.fieldErrors.confirm_password[0]}
            </p>
          )}
        </div>

        {/* ── Doctor-only fields ─────────────────────────────────────────── */}
        {role === "doctor" && (
          <>
            {/* Specialty */}
            <div className="space-y-1.5">
              <label
                htmlFor="signup-specialty"
                className="block text-xs font-semibold text-[#111111]"
              >
                Specialty
              </label>
              <input
                id="signup-specialty"
                name="specialty"
                type="text"
                autoComplete="off"
                placeholder="e.g. Cardiology, General Practice"
                className={state.fieldErrors?.specialty ? INPUT_ERROR_CLASS : INPUT_CLASS}
                aria-describedby={
                  state.fieldErrors?.specialty ? "signup-specialty-error" : undefined
                }
              />
              {state.fieldErrors?.specialty && (
                <p
                  id="signup-specialty-error"
                  className="text-[11px] text-red-600 font-medium pt-0.5"
                >
                  {state.fieldErrors.specialty[0]}
                </p>
              )}
            </div>

            {/* Medical license / NPI */}
            <div className="space-y-1.5">
              <label
                htmlFor="signup-license"
                className="block text-xs font-semibold text-[#111111]"
              >
                Medical license / NPI number{" "}
                <span className="text-[#777777] font-normal">(required)</span>
              </label>
              <input
                id="signup-license"
                name="medical_license"
                type="text"
                autoComplete="off"
                placeholder="e.g. MD-123456 or NPI 1234567890"
                className={state.fieldErrors?.medical_license ? INPUT_ERROR_CLASS : INPUT_CLASS}
                aria-describedby={
                  state.fieldErrors?.medical_license ? "signup-license-error" : undefined
                }
              />
              {state.fieldErrors?.medical_license && (
                <p
                  id="signup-license-error"
                  className="text-[11px] text-red-600 font-medium pt-0.5"
                >
                  {state.fieldErrors.medical_license[0]}
                </p>
              )}
            </div>
          </>
        )}

        <p className="text-[11px] text-[#777777] leading-relaxed pt-1">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="text-[#111111] underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-[#111111] underline">
            Privacy Policy
          </Link>
          .
        </p>

        {/* Submit Button */}
        <div className="pt-2">
          <SubmitButton role={role} />
        </div>
      </form>

      {/* Switch to Login */}
      <p className="text-center text-xs text-[#555555] pt-2">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[#111111] font-semibold underline underline-offset-2 hover:text-[#333333] transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
