"use client";

import { useActionState } from "react";
import { createRecordAction, updateRecordAction } from "@/lib/actions/medical-records";
import { MedicalRecordRow } from "@/types/database";
import { useRouter } from "next/navigation";

type MedicalRecordFormProps = {
  patientId: string;
  initialData?: MedicalRecordRow;
  returnTo: string;
};

export function MedicalRecordForm({ patientId, initialData, returnTo }: MedicalRecordFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const actionToUse = isEditing
    ? updateRecordAction.bind(null, initialData.id)
    : createRecordAction;

  const [state, formAction, isPending] = useActionState(actionToUse, null);

  if (state?.success) {
    router.push(returnTo);
  }

  return (
    <form action={formAction} className="dash-form">
      {state?.error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-md">
          {state.error}
        </div>
      )}

      <input type="hidden" name="patient_id" value={patientId} />

      <div className="dash-form-group">
        <label htmlFor="title" className="dash-form-label">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          className="dash-input"
          defaultValue={initialData?.title}
          required
        />
        {state?.fieldErrors?.title && (
          <p className="dash-form-error">{state.fieldErrors.title[0]}</p>
        )}
      </div>

      <div className="dash-form-group">
        <label htmlFor="type" className="dash-form-label">Type</label>
        <select
          id="type"
          name="type"
          className="dash-input"
          defaultValue={initialData?.type || "clinical_note"}
          required
        >
          <option value="clinical_note">Clinical Note</option>
          <option value="lab_result">Lab Result</option>
          <option value="prescription">Prescription</option>
          <option value="imaging">Imaging</option>
          <option value="other">Other</option>
        </select>
        {state?.fieldErrors?.type && (
          <p className="dash-form-error">{state.fieldErrors.type[0]}</p>
        )}
      </div>

      <div className="dash-form-group">
        <label htmlFor="record_date" className="dash-form-label">Date</label>
        <input
          type="date"
          id="record_date"
          name="record_date"
          className="dash-input"
          defaultValue={
            initialData?.record_date
              ? new Date(initialData.record_date).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0]
          }
          required
        />
        {state?.fieldErrors?.record_date && (
          <p className="dash-form-error">{state.fieldErrors.record_date[0]}</p>
        )}
      </div>

      <div className="dash-form-group">
        <label htmlFor="description" className="dash-form-label">Description (Optional)</label>
        <textarea
          id="description"
          name="description"
          className="dash-input min-h-[100px]"
          defaultValue={initialData?.description || ""}
        />
        {state?.fieldErrors?.description && (
          <p className="dash-form-error">{state.fieldErrors.description[0]}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => router.push(returnTo)}
          className="dash-btn dash-btn-secondary"
          disabled={isPending}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="dash-btn dash-btn-primary"
          disabled={isPending}
        >
          {isPending ? "Saving..." : isEditing ? "Update Record" : "Create Record"}
        </button>
      </div>
    </form>
  );
}
