import type { Metadata } from "next";
import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = {
  title: "Sign in — SmartCare",
  description:
    "Sign in to SmartCare to manage your health, connect with doctors, and access your AI-powered healthcare dashboard.",
};

interface LoginPageProps {
  searchParams: Promise<{
    message?: string;
    error?: string;
    redirect?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <>
      <div className="auth-card-header">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your SmartCare account</p>
      </div>

      <LoginForm
        message={params.message}
        urlError={params.error}
        redirectTo={params.redirect}
      />
    </>
  );
}
