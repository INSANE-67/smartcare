"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import { checkDoctorVerificationAction } from "@/lib/actions/doctor";

/**
 * Manual "Check Status" button for the /doctor/pending screen.
 *
 * Design:
 *  - Fires ONLY on explicit user click (no auto-polling, no setInterval, no useEffect).
 *  - Calls checkDoctorVerificationAction() which returns a plain boolean.
 *  - If verified  → router.push('/doctor')  (hard navigation, clears pending page)
 *  - If still pending → shows a brief "Still pending" feedback then resets
 *
 * This avoids the RSC loop that occurred when the previous action called
 * revalidatePath + redirect unconditionally: the layout would bounce the
 * unverified doctor back to /doctor/pending, triggering another RSC fetch cycle.
 */
export function CheckStatusButton() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "checking" | "still-pending">("idle");

  async function handleCheckStatus() {
    setState("checking");
    try {
      const isVerified = await checkDoctorVerificationAction();
      if (isVerified) {
        // Verified — navigate to /doctor and refresh the router
        router.push("/doctor");
        router.refresh();
      } else {
        // Still pending — show feedback, reset after 2 s
        setState("still-pending");
        setTimeout(() => setState("idle"), 2000);
      }
    } catch (err) {
      console.error("CheckStatusButton: verification check failed", err);
      setState("idle");
    }
  }

  const isChecking = state === "checking";
  const isStillPending = state === "still-pending";

  return (
    <button
      id="check-doctor-status-btn"
      type="button"
      onClick={handleCheckStatus}
      disabled={isChecking || isStillPending}
      className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold text-xs rounded-xl transition-colors disabled:opacity-60"
    >
      {isChecking ? (
        <>
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Checking Status…</span>
        </>
      ) : isStillPending ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
          <span>Still under review</span>
        </>
      ) : (
        <>
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Check Status</span>
        </>
      )}
    </button>
  );
}
