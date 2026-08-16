import { cn } from "@/lib/utils";
import type { PrescriptionStatus } from "@/types/index";

interface PrescriptionStatusBadgeProps {
  status: PrescriptionStatus;
  className?: string;
}

export function PrescriptionStatusBadge({ status, className }: PrescriptionStatusBadgeProps) {
  const getStatusColor = (s: PrescriptionStatus) => {
    switch (s) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "discontinued":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={cn(
        "px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",
        getStatusColor(status),
        className
      )}
    >
      {formattedStatus}
    </span>
  );
}
