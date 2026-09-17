import { AppointmentStatus } from "@/types/database";
import { cn } from "@/lib/utils";

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

export function AppointmentStatusBadge({ status, className }: AppointmentStatusBadgeProps) {
  const formatStatus = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const statusStyles: Record<AppointmentStatus, string> = {
    pending: "bg-[#FDF6B2]/40 text-[#723B10] border-[#FCE96A]",
    confirmed: "bg-[#E1EFFE]/50 text-[#1E429F] border-[#BCF0DA]",
    completed: "bg-[#EDF2F7] text-[#111111] border-[#E8DED2]",
    cancelled: "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]",
    rejected: "bg-[#FDE8E8]/60 text-[#9B1C1C] border-[#FBD5D5]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border font-mono uppercase tracking-wider",
        statusStyles[status] || "bg-[#FAF7F2] text-[#111111] border-[#E8DED2]",
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      <span>{formatStatus(status)}</span>
    </span>
  );
}
