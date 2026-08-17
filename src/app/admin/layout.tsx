import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/dal/admin";
import { LayoutDashboard, UserCheck, Users, ShieldAlert } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Strict security check at the layout level
  try {
    await requireAdmin();
  } catch (error) {
    // If the user is not an admin, kick them out
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <ShieldAlert className="w-6 h-6 text-teal-400 mr-2" />
          <span className="font-bold text-lg text-white tracking-tight">SmartCare Admin</span>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2">
          <Link href="/admin" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/doctors/pending" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <UserCheck className="w-5 h-5" />
            <span>Pending Doctors</span>
          </Link>
          <Link href="/admin/users" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <Users className="w-5 h-5" />
            <span>All Users</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">
            &larr; Back to App
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 md:hidden">
           <ShieldAlert className="w-6 h-6 text-teal-500 mr-2" />
           <span className="font-bold text-lg text-slate-800">Admin Portal</span>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
