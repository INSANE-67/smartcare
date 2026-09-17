"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Returns true if the currently logged-in doctor has been verified.
 * Checks both the `doctors` and `profiles` tables for verification.
 *
 * Called by the "Check Status" button on /doctor/pending.
 */
export async function checkDoctorVerificationAction(): Promise<boolean> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    // Check doctors table
    const { data: doc, error: docError } = await supabase
      .from("doctors")
      .select("is_verified, verification_status")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (docError) {
      console.log("Doctor check error in doctors table:", docError);
    }

    return Boolean(
      doc?.is_verified === true ||
      doc?.verification_status === "approved" ||
      user.user_metadata?.is_verified === true
    );
  } catch (err) {
    console.error("Error in checkDoctorVerificationAction:", err);
    return false;
  }
}

export interface SearchDoctorResult {
  id: string;
  profile_id?: string;
  specialty: string;
  license_number?: string | null;
  department?: string | null;
  bio?: string | null;
  years_of_experience?: number | null;
  clinic_name?: string | null;
  clinic_address?: string | null;
  is_verified: boolean;
  profile?: {
    id: string;
    full_name: string;
    email?: string;
    avatar_url?: string | null;
  } | null;
}

/**
 * Searches for verified doctors across doctor specialty and profile full_name.
 * Disambiguates foreign keys with explicit `profiles!doctors_profile_id_fkey`.
 */
export async function searchDoctors(searchTerm: string = ""): Promise<SearchDoctorResult[]> {
  try {
    const supabase = await createSupabaseServerClient();

    // Fetch verified doctors with profile information
    const { data, error } = await supabase
      .from("doctors")
      .select(`
        id,
        profile_id,
        specialty,
        license_number,
        department,
        bio,
        years_of_experience,
        clinic_name,
        clinic_address,
        is_verified,
        profile:profiles!doctors_profile_id_fkey(
          id,
          full_name,
          avatar_url
        )
      `)
      .eq("is_verified", true);

    if (error) {
      console.error("Error searching doctors with join:", error);

      // Fallback: sequential fetching if join experiences RLS or PostgREST constraints
      const { data: rawDocs, error: rawDocErr } = await supabase
        .from("doctors")
        .select("id, profile_id, specialty, license_number, department, bio, years_of_experience, clinic_name, clinic_address, is_verified")
        .eq("is_verified", true);

      if (rawDocErr || !rawDocs) {
        console.error("Fallback doctor query failed:", rawDocErr);
        return [];
      }

      const pIds = rawDocs.map((d) => d.profile_id).filter(Boolean);
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", pIds);

      const pMap = new Map((profs || []).map((p) => [p.id, p]));

      const combined: SearchDoctorResult[] = rawDocs.map((d) => ({
        id: d.id,
        profile_id: d.profile_id,
        specialty: d.specialty || "General Practice",
        license_number: d.license_number,
        department: d.department,
        bio: d.bio,
        years_of_experience: d.years_of_experience,
        clinic_name: d.clinic_name,
        clinic_address: d.clinic_address,
        is_verified: d.is_verified,
        profile: pMap.get(d.profile_id) || null,
      }));

      if (!searchTerm.trim()) {
        return combined;
      }

      const term = searchTerm.toLowerCase();
      return combined.filter((doc) => {
        const nameMatch = doc.profile?.full_name?.toLowerCase().includes(term);
        const specialtyMatch = doc.specialty?.toLowerCase().includes(term);
        return Boolean(nameMatch || specialtyMatch);
      });
    }

    // Normalize profile object if array
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatted: SearchDoctorResult[] = (data ?? []).map((doc: any) => ({
      id: doc.id,
      profile_id: doc.profile_id,
      specialty: doc.specialty || "General Practice",
      license_number: doc.license_number,
      department: doc.department,
      bio: doc.bio,
      years_of_experience: doc.years_of_experience,
      clinic_name: doc.clinic_name,
      clinic_address: doc.clinic_address,
      is_verified: doc.is_verified,
      profile: Array.isArray(doc.profile) ? doc.profile[0] : doc.profile,
    }));

    if (!searchTerm.trim()) {
      return formatted;
    }

    const term = searchTerm.toLowerCase();

    // Filter by doctor name or specialty client/server-side cleanly
    return formatted.filter((doc) => {
      const nameMatch = doc.profile?.full_name?.toLowerCase().includes(term);
      const specialtyMatch = doc.specialty?.toLowerCase().includes(term);
      return Boolean(nameMatch || specialtyMatch);
    });
  } catch (err) {
    console.error("searchDoctors error:", err);
    return [];
  }
}
