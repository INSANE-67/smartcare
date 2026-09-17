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
      profile_id,
      specialty,
      department,
      bio,
      years_of_experience,
      clinic_name,
      clinic_address,
      is_accepting_appointments,
      profiles:profiles!doctors_profile_id_fkey (
        full_name,
        avatar_url,
        is_active
      )
    `);

  if (error) {
    console.error("Failed to fetch public doctors via join:", error);

    // Fallback: query sequentially
    const { data: rawDocs, error: rawDocErr } = (await supabase
      .from("doctors")
      .select("id, profile_id, specialty, department, bio, years_of_experience, clinic_name, clinic_address, is_accepting_appointments")) as {
      data: any[] | null;
      error: any;
    };

    if (rawDocErr || !rawDocs) return [];

    const pIds = rawDocs.map((d) => d.profile_id).filter(Boolean);
    const { data: profs } = (await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, is_active")
      .in("id", pIds)) as {
      data: any[] | null;
      error: any;
    };

    const pMap = new Map((profs || []).map((p: any) => [p.id, p]));

    return rawDocs.map((d) => {
      const p = pMap.get(d.profile_id);
      return {
        id: d.id,
        specialty: d.specialty || "General Practice",
        department: d.department,
        bio: d.bio,
        years_of_experience: d.years_of_experience,
        clinic_name: d.clinic_name,
        clinic_address: d.clinic_address,
        is_accepting_appointments: d.is_accepting_appointments ?? true,
        profile: {
          full_name: p?.full_name || "Doctor",
          avatar_url: p?.avatar_url || null,
        },
      };
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((d) => {
    const prof = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles;
    return {
      id: d.id,
      specialty: d.specialty || "General Practice",
      department: d.department,
      bio: d.bio,
      years_of_experience: d.years_of_experience,
      clinic_name: d.clinic_name,
      clinic_address: d.clinic_address,
      is_accepting_appointments: d.is_accepting_appointments ?? true,
      profile: {
        full_name: prof?.full_name || "Doctor",
        avatar_url: prof?.avatar_url || null,
      },
    };
  });
}
