import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface PublicDoctor {
  id: string;
  specialty: string;
  department: string | null;
  bio: string | null;
  years_of_experience: number | null;
  clinic_name: string | null;
  clinic_address: string | null;
  is_accepting_appointments: boolean;
  profile: {
    full_name: string;
    avatar_url: string | null;
  };
}

export async function getPublicDoctors(): Promise<PublicDoctor[]> {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from("doctors")
    .select(`
      id,
      specialty,
      department,
      bio,
      years_of_experience,
      clinic_name,
      clinic_address,
      is_accepting_appointments,
      profiles!inner (
        full_name,
        avatar_url,
        is_active
      )
    `)
    .eq("is_verified", true)
    .eq("profiles.is_active", true);

  if (error) {
    console.error("Failed to fetch public doctors:", error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map(d => ({
    id: d.id,
    specialty: d.specialty,
    department: d.department,
    bio: d.bio,
    years_of_experience: d.years_of_experience,
    clinic_name: d.clinic_name,
    clinic_address: d.clinic_address,
    is_accepting_appointments: d.is_accepting_appointments,
    profile: {
      full_name: Array.isArray(d.profiles) ? d.profiles[0].full_name : d.profiles.full_name,
      avatar_url: Array.isArray(d.profiles) ? d.profiles[0].avatar_url : d.profiles.avatar_url,
    }
  }));
}
