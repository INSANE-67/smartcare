import { requireAuth } from "@/lib/dal/auth";
import { PatientNavbar } from "@/components/patient-navbar";
import type { ReactNode } from "react";

export default async function PatientLayout({ children }: { children: ReactNode }) {
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#111111] flex flex-col relative selection:bg-[#E7DDD1] selection:text-[#111111]">
      <PatientNavbar
        userFullName={user.full_name}
        userEmail={user.email}
        userRole="Patient"
        avatarUrl={user.avatar_url}
      />
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-8" id="main-content">
        {children}
      </main>
    </div>
  );
}
