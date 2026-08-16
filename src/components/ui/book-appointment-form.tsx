"use client";

import { useActionState } from "react";
import { bookAppointmentAction } from "@/lib/actions/appointments";
import { useRouter } from "next/navigation";

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

  if (state?.success) {
    router.push("/patient/appointments");
  }

  // Get tomorrow's date for the minimum selectable date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <form action={formAction} className="dash-form">
      {state && !state.success && state.error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-md mb-4">
          {state.error}
        </div>
      )}

      {doctors.length === 0 ? (
        <div className="p-4 text-sm text-amber-800 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-300 rounded-md">
          You need an active relationship with a doctor before you can book an appointment.
        </div>
      ) : (
        <>
          <div className="dash-form-group">
            <label htmlFor="doctor_id" className="dash-form-label">Select Doctor</label>
            <select
              id="doctor_id"
              name="doctor_id"
              className="dash-input"
              required
            >
              <option value="">-- Choose a Doctor --</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </option>
              ))}
            </select>
            {state?.fieldErrors?.doctor_id && (
              <p className="dash-form-error">{state.fieldErrors.doctor_id[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="dash-form-group">
              <label htmlFor="appointment_date" className="dash-form-label">Date</label>
              <input
                type="date"
                id="appointment_date"
                name="appointment_date"
                className="dash-input"
                min={minDate}
                required
              />
              {state?.fieldErrors?.appointment_date && (
                <p className="dash-form-error">{state.fieldErrors.appointment_date[0]}</p>
              )}
            </div>

            <div className="dash-form-group">
              <label htmlFor="appointment_time" className="dash-form-label">Time</label>
              <input
                type="time"
                id="appointment_time"
                name="appointment_time"
                className="dash-input"
                min="09:00"
                max="17:00"
                required
              />
              <p className="text-xs text-slate-500 mt-1">Available 09:00 AM to 05:00 PM</p>
              {state?.fieldErrors?.appointment_time && (
                <p className="dash-form-error">{state.fieldErrors.appointment_time[0]}</p>
              )}
            </div>
          </div>

          <div className="dash-form-group">
            <label htmlFor="reason" className="dash-form-label">Reason for Visit</label>
            <textarea
              id="reason"
              name="reason"
              className="dash-input min-h-[100px]"
              placeholder="Please briefly describe your symptoms or reason for this appointment..."
              required
            />
            {state?.fieldErrors?.reason && (
              <p className="dash-form-error">{state.fieldErrors.reason[0]}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
            <button
              type="button"
              onClick={() => router.push("/patient/appointments")}
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
              {isPending ? "Booking..." : "Request Appointment"}
            </button>
          </div>
        </>
      )}
    </form>
  );
}
