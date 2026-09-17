import { Metadata } from "next";
import { getPublicDoctors } from "@/lib/dal/public";
import Link from "next/link";
import {
  Stethoscope,
  Building2,
  Calendar,
  Check,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Verified Specialists Directory — SmartCare",
  description: "Browse verified healthcare professionals and request clinical appointments.",
};

export const revalidate = 60; // Revalidate every 60 seconds

export default async function DoctorsDirectoryPage() {
  const doctors = await getPublicDoctors();

  return (
    <div className="py-20 lg:py-28 px-6 bg-[#FAF7F2]">
      <div className="container mx-auto max-w-6xl space-y-12">
        {/* ── Page Header ── */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E8DED2] shadow-xs text-xs font-semibold text-[#111111]">
            <span>Accredited Care Providers</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-[#111111]">
            Verified Physician Directory
          </h1>
          <p className="font-sans text-base sm:text-lg text-[#555555] leading-relaxed">
            Connect directly with verified specialists across clinical departments. Book consultations online with instant scheduling.
          </p>
        </div>

        {/* ── Doctors Cards Grid ── */}
        {doctors.length === 0 ? (
          <div className="card-saas p-12 text-center rounded-[22px] max-w-md mx-auto space-y-3 bg-white border border-[#E8DED2]">
            <Stethoscope className="w-8 h-8 text-[#111111] mx-auto" />
            <h3 className="font-serif text-lg font-bold text-[#111111]">No physicians currently listed</h3>
            <p className="text-xs text-[#555555]">
              Verified healthcare providers will appear here as accreditation completes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => {
              const initials =
                doctor.profile.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "DR";

              const rawName = doctor.profile.full_name;
              const formattedName = rawName.startsWith("Dr.") ? rawName : `Dr. ${rawName}`;

              return (
                <div
                  key={doctor.id}
                  className="card-saas p-6 sm:p-7 rounded-[22px] bg-white border border-[#E8DED2] flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    {/* Header with Avatar & Verified Tag */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-14 h-14 rounded-[16px] bg-[#111111] text-white font-serif text-lg font-bold flex items-center justify-center shadow-xs flex-shrink-0">
                        {initials}
                      </div>
                      <span className="badge-neutral">
                        <Check className="w-3.5 h-3.5" />
                        Verified Specialist
                      </span>
                    </div>

                    {/* Doctor Info */}
                    <div className="space-y-1">
                      <h3 className="font-serif text-xl font-bold text-[#111111]">
                        {formattedName}
                      </h3>
                      <p className="text-xs font-semibold text-[#555555] flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-[#111111]" />
                        <span>{doctor.specialty}</span>
                        {doctor.department && (
                          <>
                            <span className="text-slate-300">&bull;</span>
                            <span className="text-slate-500 font-normal">{doctor.department}</span>
                          </>
                        )}
                      </p>
                    </div>

                    {/* Bio or Clinic */}
                    {doctor.bio && (
                      <p className="text-xs text-[#555555] line-clamp-3 leading-relaxed">
                        {doctor.bio}
                      </p>
                    )}

                    {doctor.clinic_name && (
                      <div className="flex items-center gap-1.5 text-xs text-[#777777]">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{doctor.clinic_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="pt-4 border-t border-[#E8DED2] flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-[#777777]">
                      {doctor.is_accepting_appointments ? "Accepting Consultations" : "Schedule upon request"}
                    </span>

                    <Link
                      href={`/patient/book/${doctor.id}`}
                      className="btn-primary text-xs px-4 py-2"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Consultation</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
