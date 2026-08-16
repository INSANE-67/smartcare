"use client";

import { useTransition, useState } from "react";
import { confirmAppointmentAction, rejectAppointmentAction, completeAppointmentAction } from "@/lib/actions/appointments";
import { AppointmentStatus, AppointmentRow } from "@/types/database";
import { ActionResponse } from "@/types";

interface UpdateAppointmentStatusFormProps {
  id: string;
  status: AppointmentStatus;
}

export function UpdateAppointmentStatusForm({ id, status }: UpdateAppointmentStatusFormProps) {
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState("");
  const [showNotesForm, setShowNotesForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = (actionFn: (id: string) => Promise<ActionResponse<AppointmentRow>>) => {
    setError(null);
    startTransition(async () => {
      const result = await actionFn(id);
      if (!result.success) {
        setError(result.error || "Action failed.");
      }
    });
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!notes.trim()) {
      setError("Consultation notes are required to complete an appointment.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("notes", notes);
      
      const result = await completeAppointmentAction(id, null, formData);
      if (!result.success) {
        setError(result.error || "Failed to complete appointment.");
      } else {
        setShowNotesForm(false);
      }
    });
  };

  if (status === "pending") {
    return (
      <div className="flex gap-3 items-center">
        {error && <p className="text-red-500 text-sm mr-2">{error}</p>}
        <button
          onClick={() => handleAction(rejectAppointmentAction)}
          disabled={isPending}
          className="dash-btn bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900/50"
        >
          {isPending ? "Processing..." : "Reject"}
        </button>
        <button
          onClick={() => handleAction(confirmAppointmentAction)}
          disabled={isPending}
          className="dash-btn bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-900/50"
        >
          {isPending ? "Processing..." : "Confirm Appointment"}
        </button>
      </div>
    );
  }

  if (status === "confirmed") {
    if (showNotesForm) {
      return (
        <form onSubmit={handleComplete} className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 w-full">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Complete Appointment</h4>
          {error && <div className="text-red-500 text-sm mb-3">{error}</div>}
          <div className="dash-form-group">
            <label htmlFor="notes" className="dash-form-label">Consultation Notes (Required)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="dash-input min-h-[100px]"
              placeholder="Enter notes from the consultation..."
              required
            />
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={() => setShowNotesForm(false)}
              className="dash-btn dash-btn-secondary py-1.5 px-3 text-sm"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="dash-btn dash-btn-primary py-1.5 px-3 text-sm"
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save & Complete"}
            </button>
          </div>
        </form>
      );
    }

    return (
      <button
        onClick={() => setShowNotesForm(true)}
        className="dash-btn bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-900/50"
      >
        Mark Completed
      </button>
    );
  }

  return null;
}
