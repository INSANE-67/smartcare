import type { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "blue" | "green" | "amber" | "red" | "slate";
  className?: string;
  badge?: ReactNode;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  className,
  badge,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-[20px] border border-[#E8DED2] p-5 flex items-center gap-4 shadow-2xs hover:shadow-xs transition-shadow",
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] flex items-center justify-center text-[#111111] flex-shrink-0">
        <Icon className="w-5 h-5" strokeWidth={1.75} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <p className="text-xs font-semibold text-[#555555] uppercase tracking-wider font-mono">
            {title}
          </p>
          {badge}
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <h3 className="font-serif text-2xl font-bold tracking-tight text-[#111111]">
            {value}
          </h3>
          {subtitle && (
            <span className="text-xs text-[#777777] truncate font-sans">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
