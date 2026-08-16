import type { Metadata } from "next";
import { requireRole } from "@/lib/dal/auth";
import { getPatientRelationships } from "@/lib/dal/relationships";
import { BookAppointmentForm } from "@/components/ui/book-appointment-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Book Appointment — SmartCare",
  description: "Request a new appointment with your doctor.",
};

export default async function BookAppointmentPage() {
  await requireRole("patient");
  
  // Fetch active relationships to populate the doctor dropdown
  const relationships = await getPatientRelationships();
  const activeDoctors = relationships
    .filter(r => r.status === "active" && r.other_party)
    .map(r => ({
      id: r.other_party.id,
      name: r.other_party.full_name,
    }));

  return (
    <div className="dash-content max-w-3xl">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Book Appointment</h1>
          <p className="dash-page-subtitle">
            Request an appointment with one of your active doctors.
          </p>
        </div>
        <div className="dash-page-actions">
          <Link href="/patient/appointments" className="dash-btn dash-btn-secondary">
            &larr; Back to Appointments
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
        <BookAppointmentForm doctors={activeDoctors} />
      </div>
    </div>
  );
}
