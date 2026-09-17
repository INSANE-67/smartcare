"use client";

import { useTransition, useState } from "react";
import { approveDoctor, rejectDoctor } from "../actions";
import { Check, X, Loader2 } from "lucide-react";

interface DoctorVerificationActionsProps {
  /** doctors.id — PK of the doctors row, used to UPDATE doctors table */
  doctorRowId: string;
  /** profiles.id — FK from doctors.profile_id, used to UPDATE profiles table */
  profileId: string;
  doctorName: string;
}

export function DoctorVerificationActions({
  doctorRowId,
  profileId,
  doctorName,
}: DoctorVerificationActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleApprove = () => {
    setActionType("approve");
    setErrorMessage(null);
    startTransition(async () => {
      // Pass both IDs — action updates doctors by doctorRowId, profiles by profileId
      const res = await approveDoctor(doctorRowId, profileId);
      if (res.success) {
        setDone(true);
      } else {
        setErrorMessage(res.error || "Failed to approve doctor.");
        setActionType(null);
      }
    });
  };

  const handleReject = () => {
    if (!confirm(`Are you sure you want to reject the registration for ${doctorName}?`)) {
      return;
    }
    setActionType("reject");
    setErrorMessage(null);
    startTransition(async () => {
      const res = await rejectDoctor(profileId);
      if (res.success) {
        setDone(true);
      } else {
        setErrorMessage(res.error || "Failed to reject doctor.");
        setActionType(null);
      }
    });
  };

  // Row disappears from the list after revalidatePath, but show inline feedback
  // in the brief window before the server re-renders the page.
  if (done) {
    return (
      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 px-3 py-1.5">
        {actionType === "approve" ? "✓ Approved" : "✗ Rejected"}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center justify-end gap-2.5">
        <button
          onClick={handleReject}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Reject registration"
        >
          {isPending && actionType === "reject" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <X className="w-3.5 h-3.5" />
          )}
          <span>Reject</span>
        </button>

        <button
          onClick={handleApprove}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Approve doctor and grant access"
        >
          {isPending && actionType === "approve" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          <span>Approve</span>
        </button>
      </div>

      {errorMessage && (
        <span className="text-xs text-red-600 dark:text-red-400 font-medium">
          {errorMessage}
        </span>
      )}
    </div>
  );
}
