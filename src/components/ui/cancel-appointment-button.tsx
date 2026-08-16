"use client";

import { useTransition } from "react";
import { cancelAppointmentAction } from "@/lib/actions/appointments";

export function CancelAppointmentButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    
    startTransition(async () => {
      const result = await cancelAppointmentAction(id);
      if (!result.success) {
        alert(result.error || "Failed to cancel appointment.");
      }
    });
  };

  return (
    <button
      onClick={handleCancel}
      disabled={isPending}
      className="dash-btn bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900/50"
    >
      {isPending ? "Cancelling..." : "Cancel Appointment"}
    </button>
  );
}
