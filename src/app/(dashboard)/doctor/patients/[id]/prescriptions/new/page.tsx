import { requireRole } from "@/lib/dal/auth";
import { getDoctorRelationships } from "@/lib/dal/relationships";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PrescriptionForm } from "@/components/ui/prescription-form";

export const metadata = {
  title: "New Prescription | SmartCare",
};

export default async function NewPrescriptionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("doctor");
  const { id } = await params;

  const relationships = await getDoctorRelationships();
  const relationship = relationships.find((r) => r.other_party.id === id && r.status === "active");

  if (!relationship) {
    notFound();
  }

  const patientName = relationship.other_party.full_name;

  return (
    <div className="dash-content max-w-4xl">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">New Prescription</h1>
          <p className="dash-page-subtitle">Prescribe medication for {patientName}.</p>
        </div>
        <Link href={`/doctor/patients/${id}/prescriptions`} className="btn-secondary">
          <span>&larr;</span> Back
        </Link>
      </div>

      <div className="dash-card">
        <PrescriptionForm patientId={id} />
      </div>
    </div>
  );
}
