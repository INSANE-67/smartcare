import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/dal/auth";
import { getVerifiedDoctors } from "@/lib/dal/relationships";
import { Avatar } from "@/components/ui/avatar";

export const metadata: Metadata = {
  title: "Doctor Directory — SmartCare",
};

export default async function DoctorDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; specialty?: string }>;
}) {
  await requireRole("patient");

  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page) || 1;
  const search = resolvedParams.search || "";
  const specialty = resolvedParams.specialty || "";
  const limit = 10;

  const { data: doctors, count } = await getVerifiedDoctors(
    page,
    limit,
    search,
    specialty
  );

  const totalPages = Math.ceil(count / limit);

  return (
    <div className="dash-content">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Doctor Directory</h1>
          <p className="dash-page-subtitle">Find and connect with verified doctors</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
        <form className="flex flex-col sm:flex-row gap-4" method="GET">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by name..."
            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            type="text"
            name="specialty"
            defaultValue={specialty}
            placeholder="Specialty (e.g. Cardiology)"
            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
            No verified doctors found.
          </div>
        ) : (
          doctors.map((doctor) => (
            <Link
              href={`/patient/doctors/${doctor.profile_id}`}
              key={doctor.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col items-center text-center"
            >
              <Avatar
                src={doctor.avatar_url}
                name={doctor.full_name}
                size={64}
                className="mb-4"
              />
              <h3 className="font-semibold text-slate-900 text-lg mb-1">
                {doctor.full_name}
              </h3>
              <p className="text-brand-600 font-medium text-sm mb-2">
                {doctor.specialty}
              </p>
              {doctor.department && (
                <p className="text-slate-500 text-sm mb-4">{doctor.department}</p>
              )}
              <div className="mt-auto pt-4 border-t border-slate-100 w-full">
                <span className="text-brand-500 text-sm font-medium hover:underline">
                  View Profile &rarr;
                </span>
              </div>
            </Link>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          {page > 1 && (
            <Link
              href={`/patient/doctors?page=${page - 1}&search=${search}&specialty=${specialty}`}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-slate-600 font-medium">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/patient/doctors?page=${page + 1}&search=${search}&specialty=${specialty}`}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
