/**
 * Dashboard group layout — wraps /patient, /doctor, /admin.
 *
 * AUTHORITATIVE protection: calls requireAuth() which uses getUser() —
 * a real JWT verification with Supabase Auth. The proxy check is optimistic
 * only and should not be relied on for security.
 *
 * Also provides the shared dashboard shell: sidebar navigation, top bar,
 * and main content area. Content for each role varies but the structure
 * is the same.
 */
import { requireAuth } from "@/lib/dal/auth";
import { logoutAction } from "@/lib/actions/auth";
import type { ReactNode } from "react";

// ─── Navigation config per role ────────────────────────────────────────────

const NAV_ITEMS = {
  patient: [
    { href: "/patient", label: "Dashboard", icon: "grid" },
    { href: "/patient/relationships", label: "My Doctors", icon: "users" },
    { href: "/patient/appointments", label: "Appointments", icon: "calendar" },
    { href: "/patient/doctors", label: "Find Doctors", icon: "search" },
    { href: "/patient/records", label: "Health Records", icon: "folder" },
    { href: "/patient/notifications", label: "Notifications", icon: "bell" },
    { href: "/patient/settings", label: "Settings", icon: "settings" },
  ],
  doctor: [
    { href: "/doctor", label: "Dashboard", icon: "grid" },
    { href: "/doctor/patients", label: "My Patients", icon: "users" },
    { href: "/doctor/appointments", label: "Appointments", icon: "calendar" },
    { href: "/doctor/notifications", label: "Notifications", icon: "bell" },
    { href: "/doctor/settings", label: "Settings", icon: "settings" },
  ],
  admin: [
    { href: "/admin", label: "Dashboard", icon: "grid" },
    { href: "/admin/users", label: "Users", icon: "users" },
    { href: "/admin/doctors", label: "Doctor Verification", icon: "check" },
    { href: "/admin/relationships", label: "Relationships", icon: "link" },
  ],
} as const;

const ROLE_LABELS: Record<string, string> = {
  patient: "Patient",
  doctor: "Doctor",
  admin: "Admin",
};

// ─── Icons ─────────────────────────────────────────────────────────────────

function NavIcon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    grid: "M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z",
    calendar: "M8 2v4M16 2v4M3 8h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
    search: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35",
    folder: "M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z",
    message: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
    users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
    check: "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
    link: "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
    bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
    settings: "M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2zM12 15a3 3 0 100-6 3 3 0 000 6z"
  };
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name] ?? paths.grid} />
    </svg>
  );
}

// ─── Layout ────────────────────────────────────────────────────────────────

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // Authoritative check — redirects to /login if not authenticated
  const user = await requireAuth();

  const navItems = NAV_ITEMS[user.role] ?? NAV_ITEMS.patient;
  const roleLabel = ROLE_LABELS[user.role] ?? "User";

  return (
    <div className="dash-shell">
      {/* Sidebar */}
      <aside className="dash-sidebar" aria-label="Main navigation">
        {/* Brand */}
        <div className="dash-sidebar-brand">
          <div className="dash-brand-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="url(#dashBrandGrad)" />
              <path d="M14 7v14M7 14h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="dashBrandGrad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="dash-brand-name">SmartCare</span>
        </div>

        {/* Role badge */}
        <div className="dash-role-badge" aria-label={`Logged in as ${roleLabel}`}>
          <span className={`dash-role-dot dash-role-${user.role}`} aria-hidden="true" />
          {roleLabel} Portal
        </div>

        {/* Nav */}
        <nav className="dash-nav" aria-label="Dashboard navigation">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="dash-nav-item">
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        {/* User + logout */}
        <div className="dash-sidebar-footer">
          <div className="dash-user">
            <div className="dash-avatar" aria-hidden="true">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="dash-user-info">
              <p className="dash-user-name">{user.full_name}</p>
              <p className="dash-user-role">{roleLabel}</p>
            </div>
          </div>

          <form action={logoutAction}>
            <button
              id="logout-btn"
              type="submit"
              className="dash-logout-btn"
              aria-label="Sign out of SmartCare"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="dash-main" id="main-content">
        {children}
      </main>
    </div>
  );
}
