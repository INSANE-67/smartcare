/**
 * Auth group layout — wraps /login, /signup, /forgot-password.
 *
 * Server Component: checks if the user is already authenticated and
 * redirects to /dashboard immediately. This is the authoritative check
 * (uses getUser(), not getSession()).
 *
 * If not authenticated, renders the centered auth UI shell.
 */
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/dal/auth";
import type { ReactNode } from "react";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  // Already logged in — send to the role dispatcher
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="auth-shell">
      <div className="auth-bg-gradient" aria-hidden="true" />
      <div className="auth-bg-orb auth-bg-orb-1" aria-hidden="true" />
      <div className="auth-bg-orb auth-bg-orb-2" aria-hidden="true" />

      <div className="auth-container">
        {/* Logo / brand mark */}
        <Link href="/" className="auth-brand" aria-label="SmartCare home">
          <div className="auth-brand-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <rect width="28" height="28" rx="8" fill="url(#brandGrad)" />
              <path
                d="M14 7v14M7 14h14"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="brandGrad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="auth-brand-name">SmartCare</span>
        </Link>

        {/* Auth card */}
        <main className="auth-card" id="main-content">
          {children}
        </main>

        <p className="auth-footer">
          &copy; {new Date().getFullYear()} SmartCare. AI-Powered Healthcare Platform.
        </p>
      </div>
    </div>
  );
}
