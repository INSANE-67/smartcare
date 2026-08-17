import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ProfileRow, DoctorRow, UserRole } from "@/types/index";

/**
 * Helper to securely verify the current user is an admin.
 * Throws an Error if unauthorized.
 */
export async function requireAdmin(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Call the secure RPC function to get the role directly
  const { data: role, error } = await supabase.rpc("get_user_role");
  
  if (error || role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }
}

export interface AdminSystemStats {
  totalPatients: number;
  totalDoctors: number;
  recentSignups: number;
}

export async function getSystemStats(): Promise<AdminSystemStats> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { count: totalPatients } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "patient");

  const { count: totalDoctors } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "doctor");

  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const { count: recentSignups } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", lastWeek.toISOString());

  return {
    totalPatients: totalPatients ?? 0,
    totalDoctors: totalDoctors ?? 0,
    recentSignups: recentSignups ?? 0,
  };
}

export interface AdminPendingDoctor extends DoctorRow {
  profiles: ProfileRow;
}

export async function getPendingDoctors(): Promise<AdminPendingDoctor[]> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  // Admins have RLS policies to select all doctors and all profiles
  const { data, error } = await supabase
    .from("doctors")
    .select("*, profiles(*)")
    .eq("verification_status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch pending doctors: ${error.message}`);
  }

  // Typecast to include profiles relation
  return data as unknown as AdminPendingDoctor[];
}

export async function getAllUsers(searchQuery: string = ""): Promise<ProfileRow[]> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (searchQuery) {
    query = query.ilike("full_name", `%${searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  return data as ProfileRow[];
}
