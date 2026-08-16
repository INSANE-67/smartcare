import { getPrescriptionById } from "@/lib/dal/prescriptions";
import { requireRole } from "@/lib/dal/auth";
import { getPatientRelationships } from "@/lib/dal/relationships";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PrescriptionStatusBadge } from "@/components/ui/prescription-status-badge";

export const metadata = {
  title: "Prescription Details | SmartCare",
};

export default async function PatientPrescriptionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("patient");
  const { id } = await params;

  const prescription = await getPrescriptionById(id);

  if (!prescription || prescription.patient_id !== user.id) {
    notFound();
  }

  // Fetch doctor name
  const relationships = await getPatientRelationships();
  const doctorRel = relationships.find(r => r.other_party.id === prescription.doctor_id);
  const doctorName = doctorRel?.other_party.full_name || "Unknown Doctor";

  return (
    <div className="dash-content max-w-4xl">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Prescription Details</h1>
          <div className="dash-page-subtitle flex items-center gap-3 mt-2">
            <span>Prescribed on {new Date(prescription.start_date).toLocaleDateString()}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <PrescriptionStatusBadge status={prescription.status} />
          </div>
        </div>
        <Link href="/patient/prescriptions" className="btn-secondary">
          <span>&larr;</span> Back to Prescriptions
        </Link>
      </div>

      <div className="dash-card">
        <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-xl">
            <span className="text-2xl">💊</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {prescription.medication_name}
            </h2>
            <div className="text-gray-600 dark:text-gray-400 mt-1">
              {prescription.dosage} • {prescription.frequency}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Prescription Info
            </h3>
            
            <div className="flex items-start gap-3">
              <span className="text-gray-400 mt-0.5">👤</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Prescribing Doctor</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Dr. {doctorName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-gray-400 mt-0.5">📅</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Start Date</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(prescription.start_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {prescription.end_date && (
              <div className="flex items-start gap-3">
                <span className="text-gray-400 mt-0.5">📅</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">End Date</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(prescription.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Instructions
            </h3>
            <div className="flex items-start gap-3">
              <span className="text-gray-400 mt-0.5">ℹ️</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Additional Notes</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-wrap">
                  {prescription.notes || "No additional instructions provided."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
