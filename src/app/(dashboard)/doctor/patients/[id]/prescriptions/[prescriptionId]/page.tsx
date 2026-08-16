import { getPrescriptionById } from "@/lib/dal/prescriptions";
import { requireRole } from "@/lib/dal/auth";
import { getDoctorRelationships } from "@/lib/dal/relationships";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PrescriptionForm } from "@/components/ui/prescription-form";

export const metadata = {
  title: "Edit Prescription | SmartCare",
};

export default async function EditPrescriptionPage({
  params,
}: {
  params: Promise<{ id: string; prescriptionId: string }>;
}) {
  const user = await requireRole("doctor");
  const { id, prescriptionId } = await params;

  // Ensure relationship exists
  const relationships = await getDoctorRelationships();
  const relationship = relationships.find((r) => r.other_party.id === id && r.status === "active");

  if (!relationship) {
    notFound();
  }

  const prescription = await getPrescriptionById(prescriptionId);

  // Doctors can only edit prescriptions they issued, and for the specific patient
  if (!prescription || prescription.patient_id !== id || prescription.doctor_id !== user.id) {
    notFound();
  }

  const patientName = relationship.other_party.full_name;

  return (
    <div className="dash-content max-w-4xl">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Edit Prescription</h1>
          <p className="dash-page-subtitle">Update prescription details for {patientName}.</p>
        </div>
        <Link href={`/doctor/patients/${id}/prescriptions`} className="btn-secondary">
          <span>&larr;</span> Back
        </Link>
      </div>

      <div className="dash-card">
        <PrescriptionForm patientId={id} initialData={prescription} />
      </div>
    </div>
  );
}
