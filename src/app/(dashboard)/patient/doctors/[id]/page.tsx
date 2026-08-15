import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/dal/auth";
import { getDoctorProfilePublic } from "@/lib/dal/relationships";
import { Avatar } from "@/components/ui/avatar";
import { RequestConnectionForm } from "./_components/request-connection-form";

export const metadata = {
  title: "Doctor Profile — SmartCare",
};

export default async function DoctorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("patient");
  const { id } = await params;

  const doctor = await getDoctorProfilePublic(id);

  if (!doctor) {
    notFound();
  }

  return (
    <div className="dash-content max-w-3xl">
      <div className="mb-6">
        <Link
          href="/patient/doctors"
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          &larr; Back to Directory
        </Link>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left mb-8 pb-8 border-b border-slate-100">
          <Avatar
            src={doctor.avatar_url}
            name={doctor.full_name}
            size={96}
          />
          <div>
            <div className="flex items-center gap-3 justify-center sm:justify-start mb-2">
              <h1 className="text-2xl font-bold text-slate-900">
                {doctor.full_name}
              </h1>
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold uppercase tracking-wide">
                Verified
              </span>
            </div>
            <p className="text-lg text-brand-600 font-medium mb-1">
              {doctor.specialty}
            </p>
            {doctor.department && (
              <p className="text-slate-500">{doctor.department}</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {doctor.years_of_experience != null && (
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                Experience
              </h2>
              <p className="text-slate-700">{doctor.years_of_experience} Years</p>
            </div>
          )}

          {doctor.bio && (
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                About
              </h2>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {doctor.bio}
              </p>
            </div>
          )}
        </div>

        <RequestConnectionForm doctorId={doctor.profile_id} />
      </div>
    </div>
  );
}
