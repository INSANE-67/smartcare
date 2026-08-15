import { requireRole } from "@/lib/dal/auth";
import { getPatientRelationships } from "@/lib/dal/relationships";
import { Avatar } from "@/components/ui/avatar";
import Link from "next/link";

export const metadata = {
  title: "My Doctors — SmartCare",
};

export default async function PatientRelationshipsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole("patient");
  const resolvedParams = await searchParams;
  const statusFilter = resolvedParams.status;

  const relationships = await getPatientRelationships(statusFilter);

  return (
    <div className="dash-content">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">My Doctors</h1>
          <p className="dash-page-subtitle">Manage your connections with healthcare providers</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/patient/doctors"
            className="px-4 py-2 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 transition-colors"
          >
            Find a Doctor
          </Link>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        <Link
          href="/patient/relationships"
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            !statusFilter ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All
        </Link>
        <Link
          href="/patient/relationships?status=active"
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            statusFilter === "active" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Active
        </Link>
        <Link
          href="/patient/relationships?status=pending"
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            statusFilter === "pending" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Pending
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {relationships.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No relationships found.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {relationships.map((rel) => (
              <li key={rel.id} className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <Avatar
                  src={rel.other_party.avatar_url}
                  name={rel.other_party.full_name}
                  size={64}
                />
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {rel.other_party.full_name}
                  </h3>
                  <div className="text-sm text-slate-500 mt-1">
                    Requested on {new Date(rel.created_at).toLocaleDateString()}
                  </div>
                  {rel.notes && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg text-sm text-slate-700 italic border border-slate-100">
                      &quot;{rel.notes}&quot;
                    </div>
                  )}
                </div>
                <div className="mt-4 sm:mt-0">
                  {rel.status === "active" && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wide">
                      Active
                    </span>
                  )}
                  {rel.status === "pending" && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold uppercase tracking-wide">
                      Pending
                    </span>
                  )}
                  {rel.status === "rejected" && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold uppercase tracking-wide">
                      Rejected
                    </span>
                  )}
                  {rel.status === "revoked" && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold uppercase tracking-wide">
                      Revoked
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
