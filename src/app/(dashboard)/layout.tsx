import { requireAuth } from "@/lib/dal/auth";
import type { ReactNode } from "react";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Authoritative check — redirects to /login if not authenticated
  await requireAuth();

  return (
    <div className="min-h-screen bg-black text-white">
      {children}
    </div>
  );
}
