import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getDashboardPath } from "@/lib/dal/auth";
import { LoginForm } from "@/components/auth/LoginForm";
import type { PortalType } from "@/components/auth/PortalSelector";

export const metadata: Metadata = {
  title: "Sign in — SmartCare",
  description:
    "Sign in to SmartCare to access your healthcare portal, medical records, or physician workstation.",
};

interface LoginPageProps {
  searchParams: Promise<{
    message?: string;
    error?: string;
    redirect?: string;
    portal?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  // If the user arrived due to an error, unauthorized bounce, or explicit redirect query,
  // do NOT auto-redirect them away; let them see the error message or log in.
  const isUnauthorizedBounce = Boolean(params.error || params.message);

  if (!isUnauthorizedBounce) {
    const user = await getCurrentUser();
    if (user) {
      redirect(getDashboardPath(user.role, user.is_verified));
    }
  }

  const validPortal: PortalType =
    params.portal === "doctor"
      ? "doctor"
      : params.portal === "admin"
      ? "admin"
      : "patient";

  return (
    <LoginForm
      message={params.message}
      urlError={params.error}
      redirectTo={params.redirect}
      initialPortal={validPortal}
    />
  );
}
