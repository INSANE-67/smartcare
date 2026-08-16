"use client";

import { useTransition } from "react";
import { deleteRecordAction } from "@/lib/actions/medical-records";
import { useRouter } from "next/navigation";

export function DeleteRecordButton({ id, patientId, returnTo }: { id: string; patientId: string; returnTo: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this record? This action cannot be undone.")) return;
    
    startTransition(async () => {
      const result = await deleteRecordAction(id, patientId);
      if (result.success) {
        router.push(returnTo);
      } else {
        alert(result.error || "Failed to delete record.");
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="dash-btn bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900/50"
    >
      {isPending ? "Deleting..." : "Delete Record"}
    </button>
  );
}
