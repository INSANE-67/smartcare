import { Metadata } from "next";
import { getPublicDoctors } from "@/lib/dal/public";
import { MapPin, BriefcaseMedical } from "lucide-react";

export const metadata: Metadata = {
  title: "Find a Doctor",
  description: "Browse our directory of verified medical professionals.",
};

export const revalidate = 3600; // Cache for 1 hour

export default async function DoctorsDirectoryPage() {
  const doctors = await getPublicDoctors();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Medical Professionals</h1>
        <p className="text-xl text-gray-600">
          Find the right specialist for your needs. All our doctors are thoroughly verified.
        </p>
      </div>

      {doctors.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl">
          <p className="text-gray-500">No doctors are currently available in the directory.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="border border-gray-200 rounded-xl p-6 bg-white hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                  {doctor.profile.avatar_url ? (
                    // Using standard img for now since we don't have configured next/image domains
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={doctor.profile.avatar_url} alt={doctor.profile.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-blue-600 font-bold text-xl">{doctor.profile.full_name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{doctor.profile.full_name}</h2>
                  <p className="text-blue-600 text-sm font-medium">{doctor.specialty}</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                {doctor.clinic_name && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <BriefcaseMedical className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{doctor.clinic_name}</span>
                  </div>
                )}
                {doctor.clinic_address && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{doctor.clinic_address}</span>
                  </div>
                )}
              </div>

              {doctor.bio && (
                <p className="text-sm text-gray-500 line-clamp-3 mb-4">{doctor.bio}</p>
              )}

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${doctor.is_accepting_appointments ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {doctor.is_accepting_appointments ? "Accepting Patients" : "Not Accepting Patients"}
                </span>
                {doctor.years_of_experience && (
                  <span className="text-sm text-gray-500">{doctor.years_of_experience} yrs exp</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
