import { getPendingDoctors } from "@/lib/dal/admin";
import { DoctorVerificationCard } from "./_components/doctor-verification-card";

export default async function AdminPendingDoctorsPage() {
  const pendingDoctors = await getPendingDoctors();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pending Doctor Applications</h1>
        <p className="text-slate-500 mt-1">Review and approve new doctors to join the platform.</p>
      </div>

      {pendingDoctors.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎉</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">All caught up!</h3>
          <p className="text-slate-500 max-w-sm mx-auto">There are no pending doctor applications waiting for your review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingDoctors.map((doctor) => (
            <DoctorVerificationCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}
    </div>
  );
}
