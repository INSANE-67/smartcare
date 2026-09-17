import { requireAuth } from "@/lib/dal/auth";
import type { ReactNode } from "react";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Authoritative session verification — redirects to /login if not authenticated
  await requireAuth();

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#111111] selection:bg-[#E7DDD1] selection:text-[#111111] antialiased">
      {children}
    </div>
  );
}
