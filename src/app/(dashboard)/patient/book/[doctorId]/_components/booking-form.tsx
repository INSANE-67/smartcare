"use client";

import { useState, useTransition } from "react";
import { bookAppointment } from "@/actions/appointments";
import {
  Calendar,
  Clock,
  FileText,
  Loader2,
  AlertCircle,
  CalendarCheck,
  ShieldCheck,
} from "lucide-react";

interface BookingFormProps {
  doctorId: string;
  doctorName: string;
  doctorSpecialty?: string;
}

const TIME_SLOTS = [
  { value: "09:00 AM", label: "09:00 AM — Morning" },
  { value: "09:30 AM", label: "09:30 AM — Morning" },
  { value: "10:00 AM", label: "10:00 AM — Morning" },
  { value: "10:30 AM", label: "10:30 AM — Morning" },
  { value: "11:00 AM", label: "11:00 AM — Morning" },
  { value: "11:30 AM", label: "11:30 AM — Morning" },
  { value: "01:00 PM", label: "01:00 PM — Afternoon" },
  { value: "01:30 PM", label: "01:30 PM — Afternoon" },
  { value: "02:00 PM", label: "02:00 PM — Afternoon" },
  { value: "02:30 PM", label: "02:30 PM — Afternoon" },
  { value: "03:00 PM", label: "03:00 PM — Afternoon" },
  { value: "03:30 PM", label: "03:30 PM — Afternoon" },
  { value: "04:00 PM", label: "04:00 PM — Late Afternoon" },
  { value: "04:30 PM", label: "04:30 PM — Late Afternoon" },
  { value: "05:00 PM", label: "05:00 PM — Evening" },
];

export function BookingForm({
  doctorId,
  doctorName,
}: BookingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form field states
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedDate) {
      setErrorMessage("Please choose an appointment date.");
      return;
    }

    if (!selectedTime) {
      setErrorMessage("Please select an appointment time slot.");
      return;
    }

    if (!reason.trim()) {
      setErrorMessage("Please provide a reason for your visit.");
      return;
    }

    const formData = new FormData();
    formData.append("appointment_date", selectedDate);
    formData.append("appointment_time", selectedTime);
    formData.append("reason", reason);

    startTransition(async () => {
      try {
        const result = await bookAppointment(formData, doctorId);
        if (result && !result.success && result.error) {
          setErrorMessage(result.error);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.message?.includes("NEXT_REDIRECT")) {
          return;
        }
        setErrorMessage(err instanceof Error ? err.message : "Failed to book appointment. Please try again.");
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-[24px] border border-[#E8DED2] p-6 sm:p-8 shadow-xs space-y-6"
    >
      {/* Error alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-3 text-[#991B1B] text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Scheduling Conflict / Error</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Date & Time Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date Picker */}
        <div className="space-y-1.5">
          <label
            htmlFor="appointment_date"
            className="flex items-center gap-2 text-xs font-semibold text-[#111111]"
          >
            <Calendar className="w-4 h-4" />
            <span>Select Consultation Date</span>
          </label>
          <input
            id="appointment_date"
            name="appointment_date"
            type="date"
            min={today}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#E8DED2] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all"
          />
          <p className="text-[11px] text-[#777777]">
            Consultations available Monday through Saturday.
          </p>
        </div>

        {/* Time Slot Dropdown */}
        <div className="space-y-1.5">
          <label
            htmlFor="appointment_time"
            className="flex items-center gap-2 text-xs font-semibold text-[#111111]"
          >
            <Clock className="w-4 h-4" />
            <span>Select Available Time Slot</span>
          </label>
          <select
            id="appointment_time"
            name="appointment_time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#E8DED2] rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all"
          >
            <option value="">-- Choose an available time --</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot.value} value={slot.value}>
                {slot.label}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-[#777777]">
            Standard clinical duration: 30 minutes.
          </p>
        </div>
      </div>

      {/* Reason for Visit */}
      <div className="space-y-1.5">
        <label
          htmlFor="reason"
          className="flex items-center gap-2 text-xs font-semibold text-[#111111]"
        >
          <FileText className="w-4 h-4" />
          <span>Reason for Visit &amp; Symptoms Description</span>
        </label>
        <textarea
          id="reason"
          name="reason"
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Briefly describe your symptoms, current health concerns, or any questions you would like to discuss with the doctor..."
          required
          className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E8DED2] rounded-xl text-xs text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all leading-relaxed"
        />
        <p className="text-[11px] text-[#777777]">
          This clinical intake will be securely attached to your consultation file for Dr. {doctorName}.
        </p>
      </div>

      {/* Trust & Guarantee Note */}
      <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] flex items-center gap-3 text-xs text-[#555555]">
        <ShieldCheck className="w-5 h-5 shrink-0 text-[#111111]" />
        <span>
          Your appointment request will be securely scheduled and synchronized with Dr. {doctorName}&apos;s schedule queue.
        </span>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary w-full py-3.5 px-6 rounded-full text-sm font-medium justify-center gap-2 shadow-md transition-all disabled:opacity-60 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Scheduling Consultation…</span>
            </>
          ) : (
            <>
              <CalendarCheck className="w-4 h-4" />
              <span>Confirm &amp; Book Appointment</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
