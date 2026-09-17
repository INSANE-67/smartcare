"use client";

import { useTransition, useState } from "react";
import { cancelAppointmentAction } from "@/lib/actions/appointments";
import { X, AlertCircle } from "lucide-react";

export function CancelAppointmentButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleCancel = () => {
    if (!confirm("Are you sure you want to cancel this scheduled consultation?")) return;
    setError(null);

    startTransition(async () => {
      const result = await cancelAppointmentAction(id);
      if (!result.success) {
        setError(result.error || "Failed to cancel appointment.");
      }
    });
  };

  return (
    <div className="inline-flex items-center gap-2">
      {error && (
        <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </span>
      )}
      <button
        type="button"
        onClick={handleCancel}
        disabled={isPending}
        className="btn btn-secondary text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
      >
        <X className="w-3.5 h-3.5" />
        <span>{isPending ? "Cancelling..." : "Cancel Appointment"}</span>
      </button>
    </div>
  );
}
