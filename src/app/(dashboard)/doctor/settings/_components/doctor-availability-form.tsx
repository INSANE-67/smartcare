"use client";

import { useState } from "react";
import { saveAvailabilityAction } from "@/lib/actions/availability";
import type { DoctorAvailabilityRow } from "@/types/database";

export default function DoctorAvailabilityForm({ initialAvailability, initialAccepting }: { initialAvailability: DoctorAvailabilityRow[], initialAccepting: boolean }) {
  const [isAccepting, setIsAccepting] = useState(initialAccepting);
  
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  const [days, setDays] = useState(daysOfWeek.map((_, i) => {
    const existing = initialAvailability.find(d => d.day_of_week === i);
    return {
      active: !!existing,
      day_of_week: i,
      start_time: existing?.start_time || "09:00",
      end_time: existing?.end_time || "17:00",
      break_start_time: existing?.break_start_time || "",
      break_end_time: existing?.break_end_time || "",
    };
  }));

  const handleToggleDay = (index: number) => {
    const newDays = [...days];
    newDays[index].active = !newDays[index].active;
    setDays(newDays);
  };

  const handleTimeChange = (index: number, field: string, value: string) => {
    const newDays = [...days];
    (newDays[index] as Record<string, unknown>)[field] = value;
    setDays(newDays);
  };

  return (
    <form action={saveAvailabilityAction as unknown as undefined} className="space-y-6">
      <input type="hidden" name="is_accepting_appointments" value={isAccepting.toString()} />
      <input type="hidden" name="days" value={JSON.stringify(days.filter(d => d.active).map(({ active, ...rest }) => rest))} />
      
      <div className="flex items-center mb-6">
        <input 
          type="checkbox" 
          id="isAccepting" 
          checked={isAccepting} 
          onChange={(e) => setIsAccepting(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
        />
        <label htmlFor="isAccepting" className="ml-2 block text-sm font-medium text-gray-900">
          Accepting New Appointments
        </label>
      </div>

      <div className="space-y-4">
        {days.map((day, i) => (
          <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-md">
            <div className="w-32 flex items-center">
              <input 
                type="checkbox" 
                checked={day.active} 
                onChange={() => handleToggleDay(i)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2" 
              />
              <span className="text-sm font-medium text-gray-700">{daysOfWeek[i]}</span>
            </div>
            
            {day.active && (
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>
                  <label className="block text-xs text-gray-500">Start Time</label>
                  <input type="time" value={day.start_time} onChange={(e) => handleTimeChange(i, "start_time", e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">End Time</label>
                  <input type="time" value={day.end_time} onChange={(e) => handleTimeChange(i, "end_time", e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Break Start</label>
                  <input type="time" value={day.break_start_time} onChange={(e) => handleTimeChange(i, "break_start_time", e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Break End</label>
                  <input type="time" value={day.break_end_time} onChange={(e) => handleTimeChange(i, "break_end_time", e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-4">
        <button type="submit" className="btn btn-primary">Save Availability</button>
      </div>
    </form>
  );
}
