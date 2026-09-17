"use client";

import { useActionState, useEffect } from "react";
import { bookAppointmentAction } from "@/lib/actions/appointments";
import { useRouter } from "next/navigation";
import { AlertCircle, CalendarPlus } from "lucide-react";

type DoctorOption = {
  id: string;
  name: string;
};

type BookAppointmentFormProps = {
  doctors: DoctorOption[];
};

export function BookAppointmentForm({ doctors }: BookAppointmentFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(bookAppointmentAction, null);

  useEffect(() => {
    if (state?.success) {
      router.push("/patient/appointments?booked=true");
    }
  }, [state, router]);

  // Allow today and future dates
  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  return (
    <form action={formAction} className="dash-form">
      {state && !state.success && state.error && (
        <div className="p-3 text-xs text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900 rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
          <span>{state.error}</span>
        </div>
      )}

      {doctors.length === 0 ? (
        <div className="p-4 text-xs text-amber-800 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-300 border border-amber-200 dark:border-amber-900 rounded-md">
          No verified physicians available at this moment. Please check the physician directory.
        </div>
      ) : (
        <>
          <div className="dash-form-group">
            <label htmlFor="doctor_id" className="form-label text-xs">Attending Physician</label>
            <select
              id="doctor_id"
              name="doctor_id"
              className="form-select text-xs"
              required
            >
              <option value="">-- Choose a Verified Specialist --</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </option>
              ))}
            </select>
            {state?.fieldErrors?.doctor_id && (
              <p className="form-error">{state.fieldErrors.doctor_id[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="dash-form-group">
              <label htmlFor="appointment_date" className="form-label text-xs">Consultation Date</label>
              <input
                type="date"
                id="appointment_date"
                name="appointment_date"
                className="form-input text-xs"
                min={minDate}
                required
              />
              {state?.fieldErrors?.appointment_date && (
                <p className="form-error">{state.fieldErrors.appointment_date[0]}</p>
              )}
            </div>

            <div className="dash-form-group">
              <label htmlFor="appointment_time" className="form-label text-xs">Preferred Time Slot</label>
              <input
                type="time"
                id="appointment_time"
                name="appointment_time"
                className="form-input text-xs"
                min="08:00"
                max="18:00"
                defaultValue="09:00"
                required
              />
              <span className="text-[10px] text-slate-500 mt-0.5">Clinic hours: 08:00 AM – 06:00 PM</span>
              {state?.fieldErrors?.appointment_time && (
                <p className="form-error">{state.fieldErrors.appointment_time[0]}</p>
              )}
            </div>
          </div>

          <div className="dash-form-group">
            <label htmlFor="reason" className="form-label text-xs">Reason for Visit / Symptoms</label>
            <textarea
              id="reason"
              name="reason"
              className="form-textarea min-h-[90px] text-xs"
              placeholder="Describe current symptoms, reason for consultation, or existing treatment questions..."
              required
            />
            {state?.fieldErrors?.reason && (
              <p className="form-error">{state.fieldErrors.reason[0]}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800 mt-4">
            <button
              type="button"
              onClick={() => router.push("/patient/appointments")}
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
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>{isPending ? "Submitting Request..." : "Request Appointment"}</span>
            </button>
          </div>
        </>
      )}
    </form>
  );
}
