"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { signupAction, type AuthActionState } from "@/lib/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      id="signup-submit-btn"
      type="submit"
      disabled={pending}
      className="auth-submit-btn"
      aria-busy={pending}
    >
      {pending ? (
        <>
          <span className="auth-spinner" aria-hidden="true" />
          <span>Creating account…</span>
        </>
      ) : (
        "Create account"
      )}
    </button>
  );
}

const initialState: AuthActionState = {};

export function SignupForm() {
  const [state, formAction] = useActionState(signupAction, initialState);

  return (
    <>
      {state.error && (
        <div className="auth-banner auth-banner-error" role="alert" aria-live="assertive">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {state.error}
        </div>
      )}

      <form action={formAction} noValidate className="auth-form">
        {/* Full name */}
        <div className="auth-field">
          <label htmlFor="signup-name" className="auth-label">
            Full name
          </label>
          <input
            id="signup-name"
            name="full_name"
            type="text"
            autoComplete="name"
            required
            placeholder="Jane Smith"
            className={`auth-input ${state.fieldErrors?.full_name ? "auth-input-error" : ""}`}
            aria-describedby={state.fieldErrors?.full_name ? "signup-name-error" : undefined}
          />
          {state.fieldErrors?.full_name && (
            <p id="signup-name-error" className="auth-field-error" role="alert">
              {state.fieldErrors.full_name[0]}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="auth-field">
          <label htmlFor="signup-email" className="auth-label">
            Email address
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className={`auth-input ${state.fieldErrors?.email ? "auth-input-error" : ""}`}
            aria-describedby={state.fieldErrors?.email ? "signup-email-error" : undefined}
          />
          {state.fieldErrors?.email && (
            <p id="signup-email-error" className="auth-field-error" role="alert">
              {state.fieldErrors.email[0]}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="auth-field">
          <label htmlFor="signup-password" className="auth-label">
            Password
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Min 8 chars, letters + numbers"
            className={`auth-input ${state.fieldErrors?.password ? "auth-input-error" : ""}`}
            aria-describedby={state.fieldErrors?.password ? "signup-password-error" : undefined}
          />
          {state.fieldErrors?.password && (
            <p id="signup-password-error" className="auth-field-error" role="alert">
              {state.fieldErrors.password[0]}
            </p>
          )}
        </div>

        {/* Confirm password */}
        <div className="auth-field">
          <label htmlFor="signup-confirm" className="auth-label">
            Confirm password
          </label>
          <input
            id="signup-confirm"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="••••••••"
            className={`auth-input ${state.fieldErrors?.confirm_password ? "auth-input-error" : ""}`}
            aria-describedby={state.fieldErrors?.confirm_password ? "signup-confirm-error" : undefined}
          />
          {state.fieldErrors?.confirm_password && (
            <p id="signup-confirm-error" className="auth-field-error" role="alert">
              {state.fieldErrors.confirm_password[0]}
            </p>
          )}
        </div>

        <p className="auth-terms">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="auth-link">Terms of Service</Link> and{" "}
          <Link href="/privacy" className="auth-link">Privacy Policy</Link>.
          <br />
          <span className="auth-terms-note">
            All accounts are registered as patients. Doctor access requires admin verification.
          </span>
        </p>

        <SubmitButton />
      </form>

      <p className="auth-switch">
        Already have an account?{" "}
        <Link href="/login" className="auth-link">
          Sign in
        </Link>
      </p>
    </>
  );
}
