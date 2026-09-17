import { requireRole } from "@/lib/dal/auth";
import type { ReactNode } from "react";
import { DoctorNavbar } from "@/components/doctor-navbar";

export default async function DoctorLayout({ children }: { children: ReactNode }) {
  const user = await requireRole("doctor");

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] selection:bg-[#E7DDD1] selection:text-[#111111]">
      {/* ── Sticky Top Navigation Bar ── */}
      <DoctorNavbar
        userFullName={user.full_name}
        userEmail={user.email}
        isVerified={user.is_verified}
      />

      {/* ── Main Content Area ── */}
      <main
        className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-8"
        id="main-content"
      >
        {children}
      </main>
    </div>
  );
}
