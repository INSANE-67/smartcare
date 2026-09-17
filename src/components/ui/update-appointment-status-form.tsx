"use client";

import { useTransition, useState } from "react";
import { confirmAppointmentAction, rejectAppointmentAction, completeAppointmentAction } from "@/lib/actions/appointments";
import { AppointmentStatus, AppointmentRow } from "@/types/database";
import { ActionResponse } from "@/types";
import { Check, X, FileCheck2, AlertCircle } from "lucide-react";

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
      setError("Clinical encounter notes are required to complete an appointment.");
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
      <div className="flex items-center gap-2">
        {error && (
          <div className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mr-2">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </div>
        )}
        <button
          type="button"
          onClick={() => handleAction(rejectAppointmentAction)}
          disabled={isPending}
          className="btn btn-secondary text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          <X className="w-3.5 h-3.5" />
          <span>{isPending ? "Declining..." : "Decline"}</span>
        </button>
        <button
          type="button"
          onClick={() => handleAction(confirmAppointmentAction)}
          disabled={isPending}
          className="btn btn-primary text-xs"
        >
          <Check className="w-3.5 h-3.5" />
          <span>{isPending ? "Confirming..." : "Confirm Appointment"}</span>
        </button>
      </div>
    );
  }

  if (status === "confirmed") {
    if (showNotesForm) {
      return (
        <form onSubmit={handleComplete} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 w-full mt-3">
          <h4 className="font-semibold text-slate-900 dark:text-white text-xs mb-2">Complete Consultation Encounter</h4>
          {error && (
            <div className="text-xs text-red-600 dark:text-red-400 mb-2 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
          )}
          <div className="dash-form-group">
            <label htmlFor="notes" className="form-label text-xs">Clinical Summary &amp; Treatment Plan (Required)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-textarea min-h-[90px] text-xs"
              placeholder="Enter diagnosis, summary of visit, and treatment instructions..."
              required
            />
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={() => setShowNotesForm(false)}
              className="btn btn-secondary text-xs"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary text-xs"
              disabled={isPending}
            >
              {isPending ? "Submitting..." : "Save & Complete Encounter"}
            </button>
          </div>
        </form>
      );
    }

    return (
      <button
        type="button"
        onClick={() => setShowNotesForm(true)}
        className="btn btn-primary text-xs"
      >
        <FileCheck2 className="w-3.5 h-3.5" />
        <span>Mark Encounter Completed</span>
      </button>
    );
  }

  return null;
}
