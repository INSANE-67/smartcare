import type { Metadata } from "next";
import { SignupForm } from "./_components/signup-form";

export const metadata: Metadata = {
  title: "Create account — SmartCare",
  description:
    "Create a SmartCare account to manage your health records, connect with doctors, and access AI-powered health assistance.",
};

export default function SignupPage() {
  return (
    <>
      <div className="auth-card-header">
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Join SmartCare — AI-powered healthcare, personalised for you</p>
      </div>

      <SignupForm />
    </>
  );
}
