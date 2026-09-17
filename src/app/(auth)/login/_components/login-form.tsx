"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { loginAction, type AuthActionState } from "@/lib/actions/auth";

// ─── Submit Button Component ───────────────────────────────────────────────

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      id="login-submit-btn"
      type="submit"
      disabled={pending}
      className="btn-primary w-full py-3.5 px-6 rounded-full text-sm font-medium justify-center gap-2 shadow-md transition-all disabled:opacity-60"
      aria-busy={pending}
    >
      {pending ? (
        <>
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Signing in…</span>
        </>
      ) : (
        <>
          <span>Sign in</span>
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );
}

// ─── Login Form Component ──────────────────────────────────────────────────

const initialState: AuthActionState = {};

interface LoginFormProps {
  message?: string;
  urlError?: string;
  redirectTo?: string;
}

export function LoginForm({ message, urlError, redirectTo }: LoginFormProps) {
  const [state, formAction] = useActionState(loginAction, initialState);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className="space-y-5">
      {/* Status banner (e.g. signup confirmation) */}
      {message && (
        <div className="p-3.5 rounded-xl bg-[#FAF5EF] border border-[#E7DDD1] text-xs text-[#111111] flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#111111] shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Error banner */}
      {(urlError || state.error) && (
        <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#991B1B] shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            {urlError === "account-deactivated"
              ? "Your account has been deactivated. Please contact support."
              : urlError === "auth-callback-failed"
              ? "Authentication failed. Please try again."
              : state.error}
          </span>
        </div>
      )}

      <form action={formAction} noValidate className="space-y-4">
        {redirectTo && <input type="hidden" name="redirect" value={redirectTo} />}

        {/* Email Field */}
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="block text-xs font-semibold text-[#111111]">
            Email address
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="name@example.com"
            className={`w-full px-3.5 py-2.5 rounded-xl bg-white border ${
              state.fieldErrors?.email ? "border-red-400" : "border-[#E7DDD1]"
            } text-xs text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all`}
            aria-describedby={state.fieldErrors?.email ? "login-email-error" : undefined}
          />
          {state.fieldErrors?.email && (
            <p id="login-email-error" className="text-[11px] text-red-600 font-medium pt-0.5">
              {state.fieldErrors.email[0]}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label htmlFor="login-password" className="block text-xs font-semibold text-[#111111]">
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className={`w-full px-3.5 py-2.5 rounded-xl bg-white border ${
              state.fieldErrors?.password ? "border-red-400" : "border-[#E7DDD1]"
            } text-xs text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all`}
            aria-describedby={state.fieldErrors?.password ? "login-password-error" : undefined}
          />
          {state.fieldErrors?.password && (
            <p id="login-password-error" className="text-[11px] text-red-600 font-medium pt-0.5">
              {state.fieldErrors.password[0]}
            </p>
          )}
        </div>

        {/* Remember Me & Forgot Password Row */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-[#E7DDD1] text-[#111111] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#111111]"
            />
            <span className="text-xs text-[#555555]">Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-xs text-[#111111] font-medium hover:underline underline-offset-2 transition-all"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <SubmitButton />
        </div>
      </form>

      {/* Switch to Signup */}
      <p className="text-center text-xs text-[#555555] pt-2">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-[#111111] font-semibold underline underline-offset-2 hover:text-[#333333] transition-colors"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}
