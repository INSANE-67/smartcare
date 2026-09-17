"use client";

import { useActionState, useEffect, useState } from "react";
import { createRecordAction, updateRecordAction } from "@/lib/actions/medical-records";
import { MedicalRecordRow } from "@/types/database";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText, AlertCircle, X } from "lucide-react";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (state?.success) {
      router.push(returnTo);
    }
  }, [state, router, returnTo]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <form action={formAction} className="dash-form">
      {state && !state.success && state.error && (
        <div className="p-3 text-xs text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900 rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
          <span>{state.error}</span>
        </div>
      )}

      <input type="hidden" name="patient_id" value={patientId} />

      <div className="dash-form-group">
        <label htmlFor="title" className="form-label text-xs">Record Title</label>
        <input
          type="text"
          id="title"
          name="title"
          className="form-input text-xs"
          placeholder="e.g. Comprehensive Metabolic Panel, Chest X-Ray..."
          defaultValue={initialData?.title}
          required
        />
        {state?.fieldErrors?.title && (
          <p className="form-error">{state.fieldErrors.title[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="dash-form-group">
          <label htmlFor="type" className="form-label text-xs">Record Category</label>
          <select
            id="type"
            name="type"
            className="form-select text-xs"
            defaultValue={initialData?.type || "lab_result"}
            required
          >
            <option value="lab_result">Lab Result</option>
            <option value="prescription">Prescription</option>
            <option value="imaging">Radiology / Imaging</option>
            <option value="clinical_note">Consultation / Clinical Note</option>
            <option value="other">Discharge Summary / Certificate / Other</option>
          </select>
          {state?.fieldErrors?.type && (
            <p className="form-error">{state.fieldErrors.type[0]}</p>
          )}
        </div>

        <div className="dash-form-group">
          <label htmlFor="record_date" className="form-label text-xs">Encounter / Specimen Date</label>
          <input
            type="date"
            id="record_date"
            name="record_date"
            className="form-input text-xs"
            defaultValue={
              initialData?.record_date
                ? new Date(initialData.record_date).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0]
            }
            required
          />
          {state?.fieldErrors?.record_date && (
            <p className="form-error">{state.fieldErrors.record_date[0]}</p>
          )}
        </div>
      </div>

      {/* File Upload Section */}
      {!isEditing && (
        <div className="dash-form-group">
          <label className="form-label text-xs">Document Attachment (PDF, Image, DOCX &bull; Max 10MB)</label>
          <div className="border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 text-center">
            {selectedFile ? (
              <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{selectedFile.name}</span>
                  <span className="text-slate-400">({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-1 text-slate-400 hover:text-red-600 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div>
                <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <label
                  htmlFor="file"
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Choose a file from device
                </label>
                <input
                  type="file"
                  id="file"
                  name="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Supports PDF reports, JPEG/PNG scans, and Word summaries
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="dash-form-group">
        <label htmlFor="description" className="form-label text-xs">Clinical Summary &amp; Findings (Optional)</label>
        <textarea
          id="description"
          name="description"
          className="form-textarea min-h-[90px] text-xs"
          placeholder="Document diagnostic impressions, physician interpretations, or lab notes..."
          defaultValue={initialData?.description || ""}
        />
        {state?.fieldErrors?.description && (
          <p className="form-error">{state.fieldErrors.description[0]}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => router.push(returnTo)}
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
          {isPending ? "Submitting..." : isEditing ? "Update Record" : "Save to Patient EHR"}
        </button>
      </div>
    </form>
  );
}
