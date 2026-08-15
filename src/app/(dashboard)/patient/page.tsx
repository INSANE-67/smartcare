import type { Metadata } from "next";
import { requireRole } from "@/lib/dal/auth";
import { getPatientRelationships } from "@/lib/dal/relationships";
import { getPatientMedicalRecords } from "@/lib/dal/medical-records";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Patient Dashboard — SmartCare",
  description: "Your personal health dashboard — appointments, records, and AI health assistance.",
};

export default async function PatientDashboardPage() {
  // Authoritative role check — redirects non-patients to their correct dashboard
  const user = await requireRole("patient");

  // Fetch dashboard data in parallel
  const [relationships, medicalRecords] = await Promise.all([
    getPatientRelationships(),
    getPatientMedicalRecords(),
  ]);

  const activeDoctorsCount = relationships.filter((r) => r.status === "active").length;
  const pendingRequestsCount = relationships.filter((r) => r.status === "pending").length;
  const recordsCount = medicalRecords.length;

  return (
    <div className="dash-content">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">
            Good day, {user.full_name.split(" ")[0]} 👋
          </h1>
          <p className="dash-page-subtitle">
            Here&apos;s an overview of your health activity
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <div className="dash-stat-icon dash-stat-icon-blue" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <p className="dash-stat-label">Upcoming Appointments</p>
          <p className="dash-stat-value">—</p>
          <p className="dash-stat-hint">Book your first appointment</p>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-icon dash-stat-icon-purple" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" />
            </svg>
          </div>
          <p className="dash-stat-label">My Doctors</p>
          <p className="dash-stat-value">{activeDoctorsCount}</p>
          <p className="dash-stat-hint">
            {pendingRequestsCount > 0 ? `${pendingRequestsCount} pending requests` : (activeDoctorsCount === 0 ? "No active relationships yet" : "Active relationships")}
          </p>
          <Link href="/patient/relationships" className="text-xs text-blue-600 dark:text-blue-400 mt-2 inline-block font-medium hover:underline">
            Manage relationships &rarr;
          </Link>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-icon dash-stat-icon-emerald" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
            </svg>
          </div>
          <p className="dash-stat-label">Health Records</p>
          <p className="dash-stat-value">{recordsCount}</p>
          <p className="dash-stat-hint">
            {recordsCount === 0 ? "No records uploaded yet" : "Total medical records"}
          </p>
          <Link href="/patient/records" className="text-xs text-blue-600 dark:text-blue-400 mt-2 inline-block font-medium hover:underline">
            View records &rarr;
          </Link>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-icon dash-stat-icon-amber" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </div>
          <p className="dash-stat-label">Unread Messages</p>
          <p className="dash-stat-value">—</p>
          <p className="dash-stat-hint">No messages yet</p>
        </div>
      </div>

      {/* Coming soon banner */}
      <div className="dash-coming-soon">
        <div className="dash-coming-soon-icon" aria-hidden="true">✦</div>
        <p className="dash-coming-soon-title">More features coming in Phase 2</p>
        <p className="dash-coming-soon-body">
          Appointment booking, AI health assistant, and secure messaging
          will be available in upcoming releases.
        </p>
      </div>
    </div>
  );
}
