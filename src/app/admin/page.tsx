import { getSystemStats } from "@/lib/dal/admin";
import { Users, Stethoscope, UserPlus } from "lucide-react";

export default async function AdminDashboardPage() {
  const stats = await getSystemStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Platform overview and key metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
          <div className="bg-blue-100 p-4 rounded-lg text-blue-600 mr-4">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Patients</p>
            <h3 className="text-3xl font-bold text-slate-900">{stats.totalPatients}</h3>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
          <div className="bg-teal-100 p-4 rounded-lg text-teal-600 mr-4">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Doctors</p>
            <h3 className="text-3xl font-bold text-slate-900">{stats.totalDoctors}</h3>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
          <div className="bg-purple-100 p-4 rounded-lg text-purple-600 mr-4">
            <UserPlus className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Recent Signups (7d)</p>
            <h3 className="text-3xl font-bold text-slate-900">{stats.recentSignups}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
