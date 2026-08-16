import { getPatientPrescriptions } from "@/lib/dal/prescriptions";
import { getPatientRelationships } from "@/lib/dal/relationships";
import { PrescriptionStatusBadge } from "@/components/ui/prescription-status-badge";
import Link from "next/link";

export const metadata = {
  title: "My Prescriptions | SmartCare",
};

export default async function PatientPrescriptionsPage() {
  const prescriptions = await getPatientPrescriptions();
  const relationships = await getPatientRelationships();

  // Create a map to quickly look up doctor names
  const doctorMap = new Map(
    relationships.map((r) => [r.other_party.id, r.other_party.full_name])
  );

  return (
    <div className="dash-content">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">My Prescriptions</h1>
          <p className="dash-page-subtitle">View and track your prescribed medications.</p>
        </div>
      </div>

      <div className="dash-card">
        {prescriptions.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <span className="text-4xl block mb-3">💊</span>
            <p>You don&apos;t have any prescriptions yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Dosage & Frequency</th>
                  <th>Prescribing Doctor</th>
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
                    <td>{doctorMap.get(prescription.doctor_id) || "Unknown Doctor"}</td>
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
                        href={`/patient/prescriptions/${prescription.id}`}
                        className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
                      >
                        View Details
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
