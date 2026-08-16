"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  createConsultationNoteAction, 
  updateConsultationNoteAction,
  type ConsultationNoteActionState
} from "@/lib/actions/consultation_notes";
import type { ConsultationNoteRow } from "@/types/database";

interface ConsultationNoteFormProps {
  appointmentId: string;
  patientId: string;
  initialData?: ConsultationNoteRow | null;
}

const initialState: ConsultationNoteActionState = {};

export function ConsultationNoteForm({ appointmentId, patientId, initialData }: ConsultationNoteFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If we have initialData, we are editing
  const actionToUse = initialData
    ? updateConsultationNoteAction.bind(null, initialData.id)
    : createConsultationNoteAction;

  const [state, formAction] = useActionState(actionToUse, initialState);

  useEffect(() => {
    if (state?.success) {
      router.push(`/doctor/appointments/${appointmentId}/consultation`);
      router.refresh();
    }
    
    // We only want to stop submitting if there was an error (if success, we are navigating away)
    if (state && !state.success) {
      setIsSubmitting(false);
    }
  }, [state, router, appointmentId]);

  return (
    <form 
      action={formAction} 
      className="space-y-6 max-w-2xl"
      onSubmit={() => setIsSubmitting(true)}
    >
      {/* Hidden fields needed for creation */}
      <input type="hidden" name="appointment_id" value={appointmentId} />
      <input type="hidden" name="patient_id" value={patientId} />

      {state?.error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/10 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-lg">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="diagnosis" className="dash-label">Diagnosis</label>
        <input
          id="diagnosis"
          name="diagnosis"
          type="text"
          defaultValue={initialData?.diagnosis || ""}
          className="dash-input"
          placeholder="e.g. Acute Bronchitis"
          required
        />
        {state?.fieldErrors?.diagnosis && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.diagnosis[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="symptoms" className="dash-label">Symptoms</label>
        <textarea
          id="symptoms"
          name="symptoms"
          defaultValue={initialData?.symptoms || ""}
          rows={3}
          className="dash-input"
          placeholder="Patient reported symptoms..."
          required
        />
        {state?.fieldErrors?.symptoms && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.symptoms[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="observations" className="dash-label">Clinical Observations</label>
        <textarea
          id="observations"
          name="observations"
          defaultValue={initialData?.observations || ""}
          rows={4}
          className="dash-input"
          placeholder="Physical examination notes, vital signs context..."
          required
        />
        {state?.fieldErrors?.observations && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.observations[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="treatment_plan" className="dash-label">Treatment Plan</label>
        <textarea
          id="treatment_plan"
          name="treatment_plan"
          defaultValue={initialData?.treatment_plan || ""}
          rows={4}
          className="dash-input"
          placeholder="Medications prescribed, lifestyle advice, next steps..."
          required
        />
        {state?.fieldErrors?.treatment_plan && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.treatment_plan[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="follow_up_date" className="dash-label">Follow Up Date <span className="text-slate-400">(Optional)</span></label>
        <input
          id="follow_up_date"
          name="follow_up_date"
          type="date"
          defaultValue={initialData?.follow_up_date || ""}
          className="dash-input"
        />
        {state?.fieldErrors?.follow_up_date && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.follow_up_date[0]}</p>
        )}
      </div>

      <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button 
          type="button" 
          onClick={() => router.back()}
          className="dash-btn dash-btn-secondary"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="dash-btn dash-btn-primary flex-1 justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Create Consultation Note"}
        </button>
      </div>
    </form>
  );
}
