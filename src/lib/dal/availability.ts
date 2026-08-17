import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DoctorAvailabilityRow, DoctorAvailabilityInsert } from "@/types/index";

export async function getDoctorAvailability(doctorId: string): Promise<DoctorAvailabilityRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("doctor_availability")
    .select("*")
    .eq("doctor_id", doctorId)
    .order("day_of_week", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch availability: ${error.message}`);
  }

  return data ?? [];
}

export async function saveDoctorAvailability(doctorId: string, availabilityData: DoctorAvailabilityInsert[]): Promise<void> {
  const supabase = await createSupabaseServerClient();
  
  // To keep it simple, delete existing and insert new ones
  const { error: deleteError } = await supabase
    .from("doctor_availability")
    .delete()
    .eq("doctor_id", doctorId);

  if (deleteError) {
    throw new Error(`Failed to clear old availability: ${deleteError.message}`);
  }

  if (availabilityData.length > 0) {
    const { error: insertError } = await supabase
      .from("doctor_availability")
      .insert(availabilityData as never);

    if (insertError) {
      throw new Error(`Failed to save availability: ${insertError.message}`);
    }
  }
}

export async function updateDoctorAcceptingAppointments(doctorId: string, isAccepting: boolean): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("doctors")
    .update({ is_accepting_appointments: isAccepting } as never)
    .eq("profile_id", doctorId);

  if (error) {
    throw new Error(`Failed to update accepting appointments status: ${error.message}`);
  }
}
