import { requireAuth } from "@/lib/dal/auth";
import { logoutAction } from "@/lib/actions/auth";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/doctor", label: "Dashboard", icon: "grid" },
  { href: "/doctor/patients", label: "My Patients", icon: "users" },
  { href: "/doctor/appointments", label: "Appointments", icon: "calendar" },
  { href: "/doctor/notifications", label: "Notifications", icon: "bell" },
  { href: "/doctor/settings", label: "Settings", icon: "settings" },
];

function NavIcon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    grid: "M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z",
    calendar: "M8 2v4M16 2v4M3 8h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
    users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
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

export default async function DoctorLayout({ children }: { children: ReactNode }) {
  const user = await requireAuth();

  return (
    <div className="dash-shell">
      {/* Sidebar */}
      <aside className="dash-sidebar" aria-label="Main navigation">
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

        <div className="dash-role-badge" aria-label="Logged in as Doctor">
          <span className="dash-role-dot dash-role-doctor" aria-hidden="true" />
          Doctor Portal
        </div>

        <nav className="dash-nav" aria-label="Dashboard navigation">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} className="dash-nav-item">
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="dash-sidebar-footer">
          <div className="dash-user">
            <div className="dash-avatar" aria-hidden="true">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="dash-user-info">
              <p className="dash-user-name">{user.full_name}</p>
              <p className="dash-user-role">Doctor</p>
            </div>
          </div>

          <form action={logoutAction}>
            <button
              id="logout-btn"
              type="submit"
              className="dash-logout-btn"
              aria-label="Sign out"
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

      <main className="dash-main" id="main-content">
        {children}
      </main>
    </div>
  );
}
