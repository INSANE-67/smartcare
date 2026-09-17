import { cn } from "@/lib/utils";
import type { PrescriptionStatus } from "@/types/index";

interface PrescriptionStatusBadgeProps {
  status: PrescriptionStatus;
  className?: string;
}

export function PrescriptionStatusBadge({ status, className }: PrescriptionStatusBadgeProps) {
  const getStatusBadge = (s: PrescriptionStatus) => {
    switch (s) {
      case "active":
        return "badge-green";
      case "completed":
        return "badge-blue";
      case "discontinued":
        return "badge-red";
      default:
        return "badge-slate";
    }
  };

  const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={cn(
        "badge whitespace-nowrap",
        getStatusBadge(status),
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      <span>{formattedStatus}</span>
    </span>
  );
}
