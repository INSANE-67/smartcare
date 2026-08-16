import { getPrescriptionsForPatient } from "@/lib/dal/prescriptions";
import { getDoctorRelationships } from "@/lib/dal/relationships";
import { requireRole } from "@/lib/dal/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PrescriptionStatusBadge } from "@/components/ui/prescription-status-badge";

export const metadata = {
  title: "Patient Prescriptions | SmartCare",
};

export default async function DoctorPatientPrescriptionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("doctor");
  const { id } = await params;

  // Ensure relationship exists
  const relationships = await getDoctorRelationships();
  const relationship = relationships.find((r) => r.other_party.id === id && r.status === "active");

  if (!relationship) {
    notFound();
  }

  const patientName = relationship.other_party.full_name;
  const prescriptions = await getPrescriptionsForPatient(id);

  return (
    <div className="dash-content">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Prescriptions for {patientName}</h1>
          <p className="dash-page-subtitle">Manage medication for this patient.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/doctor/patients/${id}`} className="btn-secondary">
            <span>&larr;</span> Back to Patient
          </Link>
          <Link href={`/doctor/patients/${id}/prescriptions/new`} className="btn-primary">
            <span>+</span> New Prescription
          </Link>
        </div>
      </div>

      <div className="dash-card">
        {prescriptions.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <span className="text-4xl block mb-3">💊</span>
            <p>No prescriptions found for this patient.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Dosage & Frequency</th>
                  <th>Start Date</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {prescriptions.map((prescription) => (
                  <tr key={prescription.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="font-medium text-gray-900 dark:text-white">
                      {prescription.medication_name}
                    </td>
                    <td>
                      <div>{prescription.dosage}</div>
                      <div className="text-xs text-gray-500">{prescription.frequency}</div>
                    </td>
                    <td>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <span className="mr-1.5">🕒</span>
                        {new Date(prescription.start_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <PrescriptionStatusBadge status={prescription.status} />
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/doctor/patients/${id}/prescriptions/${prescription.id}`}
                        className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
                      >
                        Edit / View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
