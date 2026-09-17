import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getDashboardPath } from "@/lib/dal/auth";
import { SignupForm } from "./_components/signup-form";

export const metadata: Metadata = {
  title: "Create account — SmartCare",
  description:
    "Create a SmartCare account to manage your health records, connect with doctors, and access AI-powered health assistance.",
};

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(getDashboardPath(user.role, user.is_verified));
  }
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <span className="text-[11px] font-mono tracking-widest text-[#777777] uppercase font-semibold">
          Get Started
        </span>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-[#111111]">
          Create your account
        </h2>
        <p className="text-xs text-[#555555] font-sans">
          Join SmartCare &mdash; Secure clinical healthcare platform.
        </p>
      </div>

      <SignupForm />
    </div>
  );
}
