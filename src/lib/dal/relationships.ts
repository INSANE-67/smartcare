import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAvatarSignedUrl } from "@/lib/dal/profile";
import type { RelationshipStatus } from "@/types/database";

export type PublicDoctorDTO = {
  id: string;
  profile_id: string;
  specialty: string;
  department: string | null;
  years_of_experience: number | null;
  bio: string | null;
  full_name: string;
  avatar_url: string | null;
};

export type DoctorDirectoryResponse = {
  data: PublicDoctorDTO[];
  count: number;
};

/**
 * Retrieves a paginated list of verified doctors for the patient directory.
 * Includes basic profile info (name, avatar).
 */
export async function getVerifiedDoctors(
  page: number = 1,
  limit: number = 10,
  search?: string,
  specialty?: string
): Promise<DoctorDirectoryResponse> {
  const supabase = await createSupabaseServerClient();
  const offset = (page - 1) * limit;

  // We query `doctors` and join `profiles` using explicit foreign key
  let query = supabase
    .from("doctors")
    .select(
      `
      id,
      profile_id,
      specialty,
      department,
      years_of_experience,
      bio,
      profiles:profiles!doctors_profile_id_fkey (
        full_name,
        avatar_url
      )
    `,
      { count: "exact" }
    );

  if (specialty) {
    query = query.ilike("specialty", `%${specialty}%`);
  }

  // To search by name we must filter on the joined table
  if (search) {
    query = query.ilike("profiles.full_name", `%${search}%`);
  }

  const { data, count, error } = await query
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getVerifiedDoctors join query error:", error);
    // Fallback: sequential fetching if join experiences PostgREST constraints
    const { data: rawDocs, count: rawCount } = (await supabase
      .from("doctors")
      .select("id, profile_id, specialty, department, years_of_experience, bio", { count: "exact" })
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false })) as {
      data: any[] | null;
      count: number | null;
    };

    if (!rawDocs || rawDocs.length === 0) return { data: [], count: 0 };

    const pIds = rawDocs.map((d) => d.profile_id).filter(Boolean);
    const { data: profs } = (await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", pIds)) as {
      data: any[] | null;
    };

    const pMap = new Map((profs || []).map((p: any) => [p.id, p]));

    const formattedData: PublicDoctorDTO[] = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rawDocs.map(async (r: any) => {
        const prof = pMap.get(r.profile_id);
        const avatarUrl = await getAvatarSignedUrl(prof?.avatar_url);
        return {
          id: r.id,
          profile_id: r.profile_id,
          specialty: r.specialty,
          department: r.department,
          years_of_experience: r.years_of_experience,
          bio: r.bio,
          full_name: prof?.full_name || "Doctor",
          avatar_url: avatarUrl,
        };
      })
    );

    let filtered = formattedData;
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter((d) => d.full_name.toLowerCase().includes(term));
    }
    if (specialty) {
      const term = specialty.toLowerCase();
      filtered = filtered.filter((d) => d.specialty?.toLowerCase().includes(term));
    }

    return { data: filtered, count: rawCount ?? filtered.length };
  }

  if (!data) {
    return { data: [], count: 0 };
  }

  // Format the response and resolve signed URLs for avatars
  const formattedData: PublicDoctorDTO[] = await Promise.all(
    data.map(async (row: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = row as any;
      const prof = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
      const avatarUrl = await getAvatarSignedUrl(prof?.avatar_url);
      return {
        id: r.id,
        profile_id: r.profile_id,
        specialty: r.specialty,
        department: r.department,
        years_of_experience: r.years_of_experience,
        bio: r.bio,
        full_name: prof?.full_name || "Doctor",
        avatar_url: avatarUrl,
      };
    })
  );

  return { data: formattedData, count: count ?? 0 };
}

/**
 * Retrieves the public profile of a single verified doctor.
 */
export async function getDoctorProfilePublic(
  profileId: string
): Promise<PublicDoctorDTO | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("doctors")
    .select(
      `
      id,
      profile_id,
      specialty,
      department,
      years_of_experience,
      bio,
      profiles:profiles!doctors_profile_id_fkey (
        full_name,
        avatar_url
      )
    `
    )
    .eq("is_verified", true)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error || !data) {
    // Fallback: query sequentially
    const { data: docRow } = (await supabase
      .from("doctors")
      .select("id, profile_id, specialty, department, years_of_experience, bio")
      .eq("profile_id", profileId)
      .maybeSingle()) as { data: any | null };

    const { data: profRow } = (await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role")
      .eq("id", profileId)
      .maybeSingle()) as { data: any | null };

    if (!docRow && (!profRow || profRow.role !== "doctor")) {
      return null;
    }

    const avatarUrl = await getAvatarSignedUrl(profRow?.avatar_url);

    return {
      id: docRow?.id || profRow?.id || profileId,
      profile_id: profileId,
      specialty: docRow?.specialty || "General Practice",
      department: docRow?.department || null,
      years_of_experience: docRow?.years_of_experience || null,
      bio: docRow?.bio || null,
      full_name: profRow?.full_name || "Doctor",
      avatar_url: avatarUrl,
    };
  }

  // Supabase returns the joined table as an object (single) or array of objects.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any;
  const prof = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  const avatarUrl = await getAvatarSignedUrl(prof?.avatar_url);

  return {
    id: row.id,
    profile_id: row.profile_id,
    specialty: row.specialty,
    department: row.department,
    years_of_experience: row.years_of_experience,
    bio: row.bio,
    full_name: prof?.full_name || "Doctor",
    avatar_url: avatarUrl,
  };
}

export type RelationshipWithProfileDTO = {
  id: string;
  status: string;
  initiated_by: string | null;
  initiator_role: string;
  established_at: string | null;
  created_at: string;
  notes: string | null;
  other_party: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
};

/**
 * Gets all relationships for a doctor (fetches the patient's profiles)
 */
export async function getDoctorRelationships(
  statusFilter?: string
): Promise<RelationshipWithProfileDTO[]> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("doctor_patient_relationships")
    .select(
      `
      id,
      status,
      initiated_by,
      initiator_role,
      established_at,
      created_at,
      notes,
      patient_id,
      profiles!doctor_patient_relationships_patient_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `
    )
    .eq("doctor_id", user.id);

  if (statusFilter) {
    query = query.eq("status", statusFilter as NonNullable<RelationshipStatus>);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error || !data) return [];

  return Promise.all(
    data.map(async (row: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = row as any;
      return {
        id: r.id,
        status: r.status,
        initiated_by: r.initiated_by,
        initiator_role: r.initiator_role,
        established_at: r.established_at,
        created_at: r.created_at,
        notes: r.notes,
        other_party: {
          id: r.profiles.id,
          full_name: r.profiles.full_name,
          avatar_url: await getAvatarSignedUrl(r.profiles.avatar_url),
        },
      };
    })
  );
}

/**
 * Gets all relationships for a patient (fetches the doctor's profiles)
 */
export async function getPatientRelationships(
  statusFilter?: string
): Promise<RelationshipWithProfileDTO[]> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("doctor_patient_relationships")
    .select(
      `
      id,
      status,
      initiated_by,
      initiator_role,
      established_at,
      created_at,
      notes,
      doctor_id,
      profiles!doctor_patient_relationships_doctor_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `
    )
    .eq("patient_id", user.id);

  if (statusFilter) {
    query = query.eq("status", statusFilter as NonNullable<RelationshipStatus>);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error || !data) return [];

  return Promise.all(
    data.map(async (row: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = row as any;
      return {
        id: r.id,
        status: r.status,
        initiated_by: r.initiated_by,
        initiator_role: r.initiator_role,
        established_at: r.established_at,
        created_at: r.created_at,
        notes: r.notes,
        other_party: {
          id: r.profiles.id,
          full_name: r.profiles.full_name,
          avatar_url: await getAvatarSignedUrl(r.profiles.avatar_url),
        },
      };
    })
  );
}

/**
 * Checks if there is an active relationship between the authenticated user
 * (acting as doctor) and the specified patient.
 */
export async function checkActiveRelationship(patientId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("doctor_patient_relationships")
    .select("id")
    .eq("doctor_id", user.id)
    .eq("patient_id", patientId)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) return false;
  return true;
}
