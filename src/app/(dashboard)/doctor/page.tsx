import type { Metadata } from "next";
import { requireRole } from "@/lib/dal/auth";
import { getDoctorRelationships } from "@/lib/dal/relationships";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Doctor Dashboard — SmartCare",
  description: "Manage your patients, appointments, and clinical workflow on SmartCare.",
};

export default async function DoctorDashboardPage() {
  const user = await requireRole("doctor");

  const relationships = await getDoctorRelationships();

  const activePatientsCount = relationships.filter((r) => r.status === "active").length;
  const pendingRequestsCount = relationships.filter((r) => r.status === "pending").length;

  return (
    <div className="dash-content">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">
            Welcome, Dr. {user.full_name.split(" ").slice(-1)[0]} 👨‍⚕️
          </h1>
          <p className="dash-page-subtitle">
            Your clinical overview for today
          </p>
        </div>
      </div>

      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <div className="dash-stat-icon dash-stat-icon-blue" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <p className="dash-stat-label">Active Patients</p>
          <p className="dash-stat-value">{activePatientsCount}</p>
          <p className="dash-stat-hint">
            {activePatientsCount === 0 ? "No active relationships" : "Total active patients"}
          </p>
          <Link href="/doctor/patients" className="text-xs text-blue-600 dark:text-blue-400 mt-2 inline-block font-medium hover:underline">
            View patients &rarr;
          </Link>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-icon dash-stat-icon-amber" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
          </div>
          <p className="dash-stat-label">Pending Requests</p>
          <p className="dash-stat-value">{pendingRequestsCount}</p>
          <p className="dash-stat-hint">
            {pendingRequestsCount === 0 ? "No pending approvals" : "Action required"}
          </p>
          <Link href="/doctor/patients" className="text-xs text-blue-600 dark:text-blue-400 mt-2 inline-block font-medium hover:underline">
            Review requests &rarr;
          </Link>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-icon dash-stat-icon-purple" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <p className="dash-stat-label">Today&apos;s Appointments</p>
          <p className="dash-stat-value">—</p>
          <p className="dash-stat-hint">No appointments scheduled</p>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-icon dash-stat-icon-emerald" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </div>
          <p className="dash-stat-label">Unread Messages</p>
          <p className="dash-stat-value">—</p>
          <p className="dash-stat-hint">No messages</p>
        </div>
      </div>

      <div className="dash-coming-soon">
        <div className="dash-coming-soon-icon" aria-hidden="true">✦</div>
        <p className="dash-coming-soon-title">Clinical features arriving in Phase 2</p>
        <p className="dash-coming-soon-body">
          Appointment scheduling, secure messaging, and AI clinical
          assistance will be available in upcoming releases.
        </p>
      </div>
    </div>
  );
}
