"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/dal/auth";
import { saveDoctorAvailability, updateDoctorAcceptingAppointments } from "@/lib/dal/availability";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;

const availabilityDaySchema = z.object({
  day_of_week: z.number().min(0).max(6),
  start_time: z.string().regex(timeRegex, "Invalid time format"),
  end_time: z.string().regex(timeRegex, "Invalid time format"),
  break_start_time: z.string().regex(timeRegex, "Invalid time format").nullable(),
  break_end_time: z.string().regex(timeRegex, "Invalid time format").nullable(),
}).refine((data) => data.end_time > data.start_time, {
  message: "End time must be after start time",
  path: ["end_time"],
}).refine((data) => {
  if (!data.break_start_time && !data.break_end_time) return true;
  if (!data.break_start_time || !data.break_end_time) return false;
  return data.break_end_time > data.break_start_time && 
         data.break_start_time >= data.start_time && 
         data.break_end_time <= data.end_time;
}, {
  message: "Invalid break times",
  path: ["break_end_time"],
});

const availabilitySchema = z.object({
  is_accepting_appointments: z.boolean(),
  days: z.array(availabilityDaySchema),
});

export async function saveAvailabilityAction(
  formData: FormData
) {
  try {
    const user = await requireAuth();
    if (user.role !== "doctor") {
      return { error: "Unauthorized" };
    }

    const rawData = {
      is_accepting_appointments: formData.get("is_accepting_appointments") === "true",
      days: JSON.parse(formData.get("days") as string || "[]"),
    };

    const parsed = availabilitySchema.safeParse(rawData);
    if (!parsed.success) {
      return { fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const doctorId = user.id;

    await updateDoctorAcceptingAppointments(doctorId, parsed.data.is_accepting_appointments);

    const dbDays = parsed.data.days.map(d => ({
      doctor_id: doctorId,
      ...d
    }));

    await saveDoctorAvailability(doctorId, dbDays);

    revalidatePath("/doctor/settings");
    revalidatePath("/patient/doctors");

    return { success: true };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "An error occurred" };
  }
}
