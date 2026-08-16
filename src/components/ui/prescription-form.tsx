"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPrescriptionAction, updatePrescriptionAction } from "@/lib/actions/prescriptions";
import type { PrescriptionRow } from "@/types/index";

interface PrescriptionFormProps {
  patientId: string;
  initialData?: PrescriptionRow;
}

export function PrescriptionForm({ patientId, initialData }: PrescriptionFormProps) {
  const router = useRouter();
  
  // Decide which action to use
  const action = initialData ? updatePrescriptionAction : createPrescriptionAction;
  
  const [state, formAction, isPending] = useActionState(action, null);

  useEffect(() => {
    if (state && state.success) {
      // Redirect back to the prescriptions list or patient detail
      router.push(`/doctor/patients/${patientId}/prescriptions`);
    }
  }, [state, router, patientId]);

  return (
    <form action={formAction} className="dash-form">
      {state && !state.success && state.error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-md mb-4">
          {state.error}
        </div>
      )}

      {initialData && (
        <input type="hidden" name="id" value={initialData.id} />
      )}
      <input type="hidden" name="patient_id" value={patientId} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="medication_name" className="dash-label">
            Medication Name *
          </label>
          <input
            id="medication_name"
            name="medication_name"
            type="text"
            required
            defaultValue={initialData?.medication_name}
            className="dash-input"
            placeholder="e.g., Amoxicillin"
          />
          {state && !state.success && state.fieldErrors?.medication_name && (
            <p className="text-xs text-red-500 mt-1">{state.fieldErrors.medication_name[0]}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="status" className="dash-label">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={initialData?.status || "active"}
            className="dash-input"
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="discontinued">Discontinued</option>
          </select>
          {state && !state.success && state.fieldErrors?.status && (
            <p className="text-xs text-red-500 mt-1">{state.fieldErrors.status[0]}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="dosage" className="dash-label">
            Dosage *
          </label>
          <input
            id="dosage"
            name="dosage"
            type="text"
            required
            defaultValue={initialData?.dosage}
            className="dash-input"
            placeholder="e.g., 500mg"
          />
          {state && !state.success && state.fieldErrors?.dosage && (
            <p className="text-xs text-red-500 mt-1">{state.fieldErrors.dosage[0]}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="frequency" className="dash-label">
            Frequency *
          </label>
          <input
            id="frequency"
            name="frequency"
            type="text"
            required
            defaultValue={initialData?.frequency}
            className="dash-input"
            placeholder="e.g., Twice daily"
          />
          {state && !state.success && state.fieldErrors?.frequency && (
            <p className="text-xs text-red-500 mt-1">{state.fieldErrors.frequency[0]}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="start_date" className="dash-label">
            Start Date *
          </label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            required
            defaultValue={initialData?.start_date || new Date().toISOString().split("T")[0]}
            className="dash-input"
          />
          {state && !state.success && state.fieldErrors?.start_date && (
            <p className="text-xs text-red-500 mt-1">{state.fieldErrors.start_date[0]}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="end_date" className="dash-label">
            End Date (Optional)
          </label>
          <input
            id="end_date"
            name="end_date"
            type="date"
            defaultValue={initialData?.end_date || ""}
            className="dash-input"
          />
          {state && !state.success && state.fieldErrors?.end_date && (
            <p className="text-xs text-red-500 mt-1">{state.fieldErrors.end_date[0]}</p>
          )}
        </div>
      </div>

      <div className="space-y-1 mt-4">
        <label htmlFor="notes" className="dash-label">
          Additional Instructions / Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={initialData?.notes || ""}
          className="dash-input"
          placeholder="Take with food..."
        />
        {state && !state.success && state.fieldErrors?.notes && (
          <p className="text-xs text-red-500 mt-1">{state.fieldErrors.notes[0]}</p>
        )}
      </div>

      <div className="pt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
          disabled={isPending}
        >
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? "Saving..." : initialData ? "Update Prescription" : "Create Prescription"}
        </button>
      </div>
    </form>
  );
}
