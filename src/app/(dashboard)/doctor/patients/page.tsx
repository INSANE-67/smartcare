import type { Metadata } from "next";
import { requireRole } from "@/lib/dal/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PatientDirectoryTable, type PatientRecord } from "./_components/patient-directory-table";
import { Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Patient Directory — SmartCare",
  description: "Search and manage your patients' electronic health records on SmartCare.",
};

export default async function DoctorPatientsPage() {
  await requireRole("doctor");
  const supabase = await createSupabaseServerClient();

  // 1. Fetch all profiles where role = 'patient'
  const { data: rawPatients, error } = await supabase
    .from("profiles")
    .select("id, full_name, created_at, role, avatar_url, phone")
    .eq("role", "patient")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching patient directory:", error);
  }

  // 2. Fetch email addresses via admin client if service role key is available
  const emailMap: Record<string, string> = {};
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminSupabase = createSupabaseAdminClient();
      const { data: authUsers } = await adminSupabase.auth.admin.listUsers();
      if (authUsers?.users) {
        authUsers.users.forEach((u) => {
          if (u.email) emailMap[u.id] = u.email;
        });
      }
    } catch (authErr) {
      console.warn("Could not fetch user emails from admin auth:", authErr);
    }
  }

  // 3. Format patient records
  const patients: PatientRecord[] = (rawPatients || []).map((p) => ({
    id: p.id,
    full_name: p.full_name,
    email: emailMap[p.id] || "No email on record",
    created_at: p.created_at,
    avatar_url: p.avatar_url,
    phone: p.phone,
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-teal-700 dark:text-teal-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Clinical Records</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Patient Directory
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Search and manage your patients&apos; electronic health records.
          </p>
        </div>
      </div>

      {/* ── Patient Directory Table ── */}
      <PatientDirectoryTable patients={patients} />
    </div>
  );
}
