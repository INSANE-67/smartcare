import type { Metadata } from "next";
import { requireRole } from "@/lib/dal/auth";

export const metadata: Metadata = {
  title: "Admin Dashboard — SmartCare",
  description: "SmartCare administration — user management, doctor verification, and platform oversight.",
};

export default async function AdminDashboardPage() {
  const user = await requireRole("admin");

  return (
    <div className="dash-content">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">
            Admin Dashboard 🛡️
          </h1>
          <p className="dash-page-subtitle">
            Platform overview — {user.full_name}
          </p>
        </div>
        <div className="dash-admin-badge" aria-label="Administrator">
          Administrator
        </div>
      </div>

      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <div className="dash-stat-icon dash-stat-icon-blue" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <p className="dash-stat-label">Total Users</p>
          <p className="dash-stat-value">—</p>
          <p className="dash-stat-hint">Platform-wide</p>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-icon dash-stat-icon-amber" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
          </div>
          <p className="dash-stat-label">Pending Verifications</p>
          <p className="dash-stat-value">—</p>
          <p className="dash-stat-hint">Doctor applications awaiting review</p>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-icon dash-stat-icon-emerald" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <p className="dash-stat-label">Verified Doctors</p>
          <p className="dash-stat-value">—</p>
          <p className="dash-stat-hint">Active on the platform</p>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-icon dash-stat-icon-purple" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <p className="dash-stat-label">Active Relationships</p>
          <p className="dash-stat-value">—</p>
          <p className="dash-stat-hint">Doctor-patient connections</p>
        </div>
      </div>

      <div className="dash-coming-soon">
        <div className="dash-coming-soon-icon" aria-hidden="true">✦</div>
        <p className="dash-coming-soon-title">Admin tools arriving in Phase 2</p>
        <p className="dash-coming-soon-body">
          Doctor verification workflow, user management, relationship oversight, and
          platform analytics will be available in upcoming releases.
        </p>
      </div>
    </div>
  );
}
