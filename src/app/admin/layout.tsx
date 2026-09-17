import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/dal/auth";
import { requireAdmin, getPendingDoctors } from "@/lib/dal/admin";
import { Activity, LayoutDashboard, UserCheck, Users, ShieldCheck, ArrowLeft } from "lucide-react";
import { UserDropdown } from "@/components/ui/user-dropdown";
import type { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const adminUser = await getCurrentUser();

  if (!adminUser) {
    redirect("/login");
  }

  if (adminUser.role !== "admin") {
    redirect("/patient");
  }

  try {
    await requireAdmin();
  } catch {
    redirect("/patient");
  }

  let pendingCount = 0;
  try {
    const pendingDocs = await getPendingDoctors();
    pendingCount = pendingDocs.length;
  } catch {
    pendingCount = 0;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF7F2] selection:bg-[#E7DDD1] selection:text-[#111111]">
      {/* ── Admin Sidebar ── */}
      <aside className="w-full md:w-64 lg:w-72 bg-white border-b md:border-b-0 md:border-r border-[#E8DED2] flex flex-col justify-between p-6 sm:p-8 shrink-0">
        <div className="space-y-7">
          {/* Brand Header */}
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#111111]">
                SmartCare
              </span>
            </div>
          </Link>

          {/* Admin Role Pill */}
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-[#111111]" />
            <div className="min-w-0">
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#777777] font-semibold">
                Control Console
              </p>
              <p className="text-xs font-bold text-[#111111]">
                Platform Administrator
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#666666] hover:text-[#111111] hover:bg-[#FAF7F2] transition-all"
            >
              <LayoutDashboard className="w-4 h-4 text-[#111111]" />
              <span>Overview</span>
            </Link>

            <Link
              href="/admin/pending-doctors"
              className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold text-[#666666] hover:text-[#111111] hover:bg-[#FAF7F2] transition-all"
            >
              <div className="flex items-center gap-3">
                <UserCheck className="w-4 h-4 text-[#111111]" />
                <span>Doctor Approvals</span>
              </div>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#111111] text-white text-[10px] font-mono font-bold">
                  {pendingCount}
                </span>
              )}
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#666666] hover:text-[#111111] hover:bg-[#FAF7F2] transition-all"
            >
              <Users className="w-4 h-4 text-[#111111]" />
              <span>User Directory</span>
            </Link>
          </nav>
        </div>

        {/* Footer Navigation & UserDropdown */}
        <div className="pt-6 border-t border-[#E8DED2] space-y-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-semibold text-[#777777] hover:text-[#111111] transition-colors px-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to User Portal</span>
          </Link>

          <UserDropdown
            userFullName={adminUser?.full_name ?? "Administrator"}
            userEmail={adminUser?.email ?? ""}
            userRole="Administrator"
            profileHref="/admin/users"
            settingsHref="/admin"
            notificationsHref="/admin"
            helpHref="/about"
            variant="sidebar"
          />
        </div>
      </aside>

      {/* ── Main Admin Content Canvas (1600px Max Width) ── */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-6 sm:p-8 lg:p-10 overflow-y-auto" id="main-content">
        {children}
      </main>
    </div>
  );
}
