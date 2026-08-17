import { requireAuth } from "@/lib/dal/auth";
import { PatientNavbar } from "@/components/patient-navbar";
import type { ReactNode } from "react";

export default async function PatientLayout({ children }: { children: ReactNode }) {
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      <PatientNavbar userFullName={user.full_name} />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
