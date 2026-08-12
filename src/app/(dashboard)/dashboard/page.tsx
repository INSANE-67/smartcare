import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getDashboardPath } from "@/lib/dal/auth";

export const metadata: Metadata = {
  title: "Dashboard — SmartCare",
  description: "SmartCare dashboard",
};

/**
 * /dashboard — role dispatcher.
 *
 * After login or auth callback, the user lands here.
 * Reads their role and immediately redirects to the correct portal.
 * No content is rendered — this is purely a server-side redirect.
 */
export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  redirect(getDashboardPath(user.role));
}
