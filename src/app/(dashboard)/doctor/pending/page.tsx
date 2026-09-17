import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { CheckStatusButton } from "./_components/check-status-button";
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  Lock,
  Mail,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Account Pending Approval — SmartCare",
  description: "Your medical provider account is currently pending administrative verification.",
};

export default async function DoctorPendingApprovalPage() {
  // Wrap in try/catch — the UI card must always render even if the auth
  // query is slow or fails (Supabase cold-start, network blip, etc.).
  let user: Awaited<ReturnType<typeof getCurrentUser>> = null;
  try {
    user = await getCurrentUser();
  } catch (err) {
    console.error("DoctorPendingApprovalPage: getCurrentUser failed", err);
  }

  if (!user) {
    redirect("/login");
  }

  // Redirect verified doctors to /doctor
  if (user.role === "doctor" && user.is_verified) {
    redirect("/doctor");
  }

  // Redirect wrong roles away.
  if (user.role === "patient") {
    redirect("/patient");
  } else if (user.role === "admin") {
    redirect("/admin");
  }

  // Safe fallback for name so the UI never shows "undefined"
  const displayName = user.full_name || "Doctor";

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-br from-amber-500/10 via-teal-500/10 to-emerald-500/10 dark:from-amber-500/20 dark:via-teal-500/10 dark:to-emerald-500/10 border-b border-amber-200/50 dark:border-amber-900/40 p-8 text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-3 border border-amber-300 dark:border-amber-800/60">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Verification In Progress</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Account Pending Approval
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
            Welcome to SmartCare, <span className="font-semibold text-slate-900 dark:text-white">{displayName}</span>. Your medical provider credentials have been received and are currently undergoing compliance review.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Status Timeline */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Application Status
            </h2>

            <div className="space-y-3 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950/40">
              {/* Step 1 */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    Provider Profile Created
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Registration information submitted successfully.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Medical License &amp; NPI Review</span>
                    <span className="text-[10px] bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.2 rounded-full">
                      In Review
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Our compliance team is verifying your state medical license.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-center gap-3 opacity-60">
                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    Doctor Workspace Activation
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Unlocks EHR reviews, patient directories, and consultations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Notice */}
          <div className="p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/40 flex items-start gap-3 text-xs text-teal-800 dark:text-teal-300">
            <Mail className="w-4 h-4 flex-shrink-0 mt-0.5 text-teal-600 dark:text-teal-400" />
            <p className="leading-relaxed">
              Reviews typically take between <strong className="font-semibold">24 to 48 business hours</strong>. You will receive an email once your account is fully verified.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <CheckStatusButton />

            <div className="w-full sm:w-auto">
              <LogoutButton className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-semibold text-xs rounded-xl border border-red-200/60 dark:border-red-800/40 transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
