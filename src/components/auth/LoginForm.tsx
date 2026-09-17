"use client";

import { useState, useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, AlertCircle, CheckCircle2, ArrowLeft, Lock, Mail, UserCheck, Stethoscope, ShieldCheck } from "lucide-react";
import { loginAction, type AuthActionState } from "@/lib/actions/auth";
import { PortalSelector, type PortalType } from "./PortalSelector";
import { toast } from "sonner";

function SubmitButton({ portal }: { portal: PortalType }) {
  const { pending } = useFormStatus();

  return (
    <button
      id="login-submit-btn"
      type="submit"
      disabled={pending}
      className="btn-primary w-full py-3.5 px-6 rounded-full text-sm font-medium justify-center gap-2 shadow-md transition-all disabled:opacity-60 cursor-pointer"
      aria-busy={pending}
    >
      {pending ? (
        <>
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Authenticating…</span>
        </>
      ) : (
        <>
          <span>
            {portal === "doctor"
              ? "Sign in to Doctor Portal"
              : portal === "admin"
              ? "Access Admin Console"
              : "Sign in as Patient"}
          </span>
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );
}

const initialState: AuthActionState = {};

interface LoginFormProps {
  message?: string;
  urlError?: string;
  redirectTo?: string;
  initialPortal?: PortalType;
}

export function LoginForm({ message, urlError, redirectTo, initialPortal = "patient" }: LoginFormProps) {
  const [selectedPortal, setSelectedPortal] = useState<PortalType>(initialPortal);
  const [rememberMe, setRememberMe] = useState(false);
  const [state, formAction] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error]);

  const portalDetails = {
    patient: {
      heading: "Sign in as Patient",
      subtitle: "Access your appointments, prescriptions, and health records securely.",
      icon: UserCheck,
      signupLink: "/signup",
      signupText: "Create patient account",
    },
    doctor: {
      heading: "Sign in as Doctor",
      subtitle: "Access physician workstation, patient charts, and clinical encounters.",
      icon: Stethoscope,
      signupLink: "/signup?role=doctor",
      signupText: "Register as medical provider",
    },
    admin: {
      heading: "Sign in as Administrator",
      subtitle: "Access clinical management, verification queues, and audit controls.",
      icon: ShieldCheck,
      signupLink: null,
      signupText: null,
    },
  }[selectedPortal];

  return (
    <div className="space-y-6">
      {/* ── Multi-Portal Tabs ── */}
      <div className="space-y-1">
        <PortalSelector selectedPortal={selectedPortal} onSelect={setSelectedPortal} />
      </div>

      {/* ── Dynamic Header Based on Selected Portal ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedPortal}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="space-y-1.5"
        >
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest text-[#777777] uppercase font-semibold">
              {selectedPortal} Portal
            </span>
          </div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-[#111111]">
            {portalDetails.heading}
          </h2>
          <p className="text-xs text-[#555555] font-sans leading-relaxed">
            {portalDetails.subtitle}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* ── Status Banners ── */}
      {message && (
        <div className="p-3.5 rounded-xl bg-[#FAF5EF] border border-[#E7DDD1] text-xs text-[#111111] flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#111111] shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {(urlError || state.error) && (
        <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#991B1B] shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            {urlError === "account-deactivated"
              ? "Your account has been deactivated. Please contact administration."
              : urlError === "auth-callback-failed"
              ? "Authentication failed. Please try again."
              : state.error}
          </span>
        </div>
      )}

      {/* ── Form ── */}
      <form action={formAction} noValidate className="space-y-4">
        {/* Hidden Portal Indicator */}
        <input type="hidden" name="portal" value={selectedPortal} />
        {redirectTo && <input type="hidden" name="redirect" value={redirectTo} />}

        {/* Email Field */}
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="block text-xs font-semibold text-[#111111]">
            Email address
          </label>
          <div className="relative">
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="name@example.com"
              className={`w-full pl-3.5 pr-3.5 py-2.5 rounded-xl bg-white border ${
                state.fieldErrors?.email ? "border-red-400" : "border-[#E7DDD1]"
              } text-xs text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all`}
              aria-describedby={state.fieldErrors?.email ? "login-email-error" : undefined}
            />
          </div>
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
          <div className="relative">
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className={`w-full pl-3.5 pr-3.5 py-2.5 rounded-xl bg-white border ${
                state.fieldErrors?.password ? "border-red-400" : "border-[#E7DDD1]"
              } text-xs text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all`}
              aria-describedby={state.fieldErrors?.password ? "login-password-error" : undefined}
            />
          </div>
          {state.fieldErrors?.password && (
            <p id="login-password-error" className="text-[11px] text-red-600 font-medium pt-0.5">
              {state.fieldErrors.password[0]}
            </p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
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
          <SubmitButton portal={selectedPortal} />
        </div>
      </form>

      {/* ── Switch Links & Back to Home ── */}
      <div className="space-y-3 pt-2 text-center border-t border-[#E7DDD1]/70">
        {portalDetails.signupLink && (
          <p className="text-xs text-[#555555]">
            Don&apos;t have an account?{" "}
            <Link
              href={portalDetails.signupLink}
              className="text-[#111111] font-semibold underline underline-offset-2 hover:text-[#333333] transition-colors"
            >
              {portalDetails.signupText}
            </Link>
          </p>
        )}

        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#777777] hover:text-[#111111] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
