"use client";

import { useState } from "react";
import { updateRelationshipStatusAction } from "@/lib/actions/relationships";

export function DoctorActionButtons({ relationshipId }: { relationshipId: string }) {
  const [isPending, setIsPending] = useState(false);

  async function handleAction(status: "active" | "rejected") {
    setIsPending(true);
    const formData = new FormData();
    formData.append("relationshipId", relationshipId);
    formData.append("status", status);
    
    await updateRelationshipStatusAction(null, formData);
    setIsPending(false);
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleAction("active")}
        disabled={isPending}
        className="px-3 py-1.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-200 disabled:opacity-50 transition-colors"
      >
        Accept
      </button>
      <button
        onClick={() => handleAction("rejected")}
        disabled={isPending}
        className="px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-200 disabled:opacity-50 transition-colors"
      >
        Reject
      </button>
    </div>
  );
}
