import { AppointmentStatus } from "@/types/database";
import { cn } from "@/lib/utils";

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

export function AppointmentStatusBadge({ status, className }: AppointmentStatusBadgeProps) {
  const formatStatus = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const colors = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    confirmed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    cancelled: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        colors[status],
        className
      )}
    >
      {formatStatus(status)}
    </span>
  );
}
