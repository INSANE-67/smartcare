"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { loginAction, type AuthActionState } from "@/lib/actions/auth";

// ─── Submit Button ─────────────────────────────────────────────────────────

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      id="login-submit-btn"
      type="submit"
      disabled={pending}
      className="auth-submit-btn"
      aria-busy={pending}
    >
      {pending ? (
        <>
          <span className="auth-spinner" aria-hidden="true" />
          <span>Signing in…</span>
        </>
      ) : (
        "Sign in"
      )}
    </button>
  );
}

// ─── Login Form ────────────────────────────────────────────────────────────

const initialState: AuthActionState = {};

interface LoginFormProps {
  /** Pre-fill from query params, e.g. ?message= from signup redirect */
  message?: string;
  /** Error from URL params, e.g. ?error=account-deactivated */
  urlError?: string;
  /** Pre-fill the redirect destination after login */
  redirectTo?: string;
}

export function LoginForm({ message, urlError, redirectTo }: LoginFormProps) {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <>
      {/* Status messages from query params (e.g. post-signup redirect) */}
      {message && (
        <div className="auth-banner auth-banner-info" role="status" aria-live="polite">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {message}
        </div>
      )}

      {/* Error from query params or server action */}
      {(urlError || state.error) && (
        <div className="auth-banner auth-banner-error" role="alert" aria-live="assertive">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {urlError === "account-deactivated"
            ? "Your account has been deactivated. Please contact support."
            : urlError === "auth-callback-failed"
              ? "Authentication failed. Please try again."
              : state.error}
        </div>
      )}

      <form action={formAction} noValidate className="auth-form">
        {/* Hidden redirect destination — passed through to server action context via cookie in layout */}
        {redirectTo && (
          <input type="hidden" name="redirect" value={redirectTo} />
        )}

        {/* Email */}
        <div className="auth-field">
          <label htmlFor="login-email" className="auth-label">
            Email address
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className={`auth-input ${state.fieldErrors?.email ? "auth-input-error" : ""}`}
            aria-describedby={state.fieldErrors?.email ? "login-email-error" : undefined}
          />
          {state.fieldErrors?.email && (
            <p id="login-email-error" className="auth-field-error" role="alert">
              {state.fieldErrors.email[0]}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="auth-field">
          <div className="auth-label-row">
            <label htmlFor="login-password" className="auth-label">
              Password
            </label>
            <Link href="/forgot-password" className="auth-link auth-link-sm">
              Forgot password?
            </Link>
          </div>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className={`auth-input ${state.fieldErrors?.password ? "auth-input-error" : ""}`}
            aria-describedby={state.fieldErrors?.password ? "login-password-error" : undefined}
          />
          {state.fieldErrors?.password && (
            <p id="login-password-error" className="auth-field-error" role="alert">
              {state.fieldErrors.password[0]}
            </p>
          )}
        </div>

        <SubmitButton />
      </form>

      <p className="auth-switch">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="auth-link">
          Create one
        </Link>
      </p>
    </>
  );
}
