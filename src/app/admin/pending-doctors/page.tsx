import { requireAdmin } from "@/lib/dal/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ShieldCheck, Stethoscope, Mail, Calendar, Hash } from "lucide-react";
import { DoctorVerificationActions } from "./_components/doctor-verification-actions";

export const metadata = {
  title: "Doctor Approvals — SmartCare Admin",
  description: "Review and approve medical professionals requesting platform access.",
};

interface PendingDoctorRecord {
  doctorRowId: string;
  profileId: string;
  full_name: string;
  email?: string;
  medical_license?: string | null;
  specialty?: string | null;
  created_at: string;
}

export default async function PendingDoctorsPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: docRows, error: docError } = await supabase
    .from("doctors")
    .select("id, profile_id, license_number, specialty, is_verified, created_at")
    .eq("is_verified", false)
    .order("created_at", { ascending: false });

  if (docError) {
    console.error("Error fetching pending doctors:", docError);
  }

  const unverifiedDoctors = docRows ?? [];

  const profileIds = unverifiedDoctors.map((d) => d.profile_id).filter(Boolean);
  const profileMap: Record<string, string> = {};

  if (profileIds.length > 0) {
    const { data: profileRows } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", profileIds);

    (profileRows ?? []).forEach((p) => {
      if (p.id && p.full_name) profileMap[p.id] = p.full_name;
    });
  }

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
    } catch (e) {
      console.warn("Could not fetch user emails from auth admin:", e);
    }
  }

  const pendingDoctors: PendingDoctorRecord[] = unverifiedDoctors.map((doc) => ({
    doctorRowId: doc.id,
    profileId: doc.profile_id,
    full_name: profileMap[doc.profile_id] ?? "Doctor",
    email: emailMap[doc.profile_id] ?? "No email available",
    medical_license: doc.license_number ?? null,
    specialty: doc.specialty ?? null,
    created_at: doc.created_at,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Header */}
      <div className="space-y-1 pb-6 border-b border-[#E8DED2]">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#777777] font-semibold">
          Accreditation Pipeline
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#111111] tracking-tight">
          Pending Physician Verifications
        </h1>
        <p className="text-xs text-[#555555]">
          Inspect credentials, verify medical licensing, and grant clinical permissions.
        </p>
      </div>

      {pendingDoctors.length === 0 ? (
        <div className="bg-white rounded-[22px] border border-[#E8DED2] p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] text-[#111111] flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#111111]">
            All Doctor Applications Triaged
          </h3>
          <p className="mt-1.5 text-xs text-[#555555] max-w-md mx-auto">
            No pending verifications at this time. All provider onboarding requests have been reviewed.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[22px] border border-[#E8DED2] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#FAF7F2] border-b border-[#E8DED2] font-mono text-[11px] font-semibold text-[#555555] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Physician Information</th>
                  <th className="px-6 py-4">Specialty &amp; License</th>
                  <th className="px-6 py-4">Submitted Date</th>
                  <th className="px-6 py-4 text-right">Accreditation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DED2]">
                {pendingDoctors.map((doctor) => (
                  <tr
                    key={doctor.doctorRowId}
                    className="hover:bg-[#FAF7F2]/40 transition-colors"
                  >
                    {/* Doctor Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#111111] text-white flex items-center justify-center font-semibold text-xs shrink-0">
                          {doctor.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-serif font-bold text-sm text-[#111111]">
                            {doctor.full_name}
                          </p>
                          <p className="text-[11px] text-[#777777] flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" />
                            {doctor.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* License / NPI */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-[#111111]">{doctor.specialty || "General Medicine"}</p>
                        <p className="text-[11px] font-mono text-[#777777] mt-0.5">
                          License: {doctor.medical_license || "Pending Document"}
                        </p>
                      </div>
                    </td>

                    {/* Submitted Date */}
                    <td className="px-6 py-4 text-[#777777] text-xs font-mono">
                      {new Date(doctor.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <DoctorVerificationActions
                        doctorRowId={doctor.doctorRowId}
                        profileId={doctor.profileId}
                        doctorName={doctor.full_name}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
