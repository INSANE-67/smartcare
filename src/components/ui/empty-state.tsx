import type { ReactNode } from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  actionOnClick?: () => void;
  className?: string;
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionHref,
  actionLabel,
  actionOnClick,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-[20px] border border-dashed border-[#E8DED2] bg-white/60",
        className
      )}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#E8DED2] text-[#111111] flex items-center justify-center mb-3.5 shadow-2xs">
          <Icon className="w-5 h-5 stroke-[1.75]" />
        </div>
      )}

      <h3 className="font-serif text-base font-bold text-[#111111]">
        {title}
      </h3>

      <p className="text-xs text-[#555555] mt-1.5 max-w-md leading-relaxed font-sans">
        {description}
      </p>

      {actionHref && actionLabel && (
        <div className="mt-5">
          <Link
            href={actionHref}
            className="btn-primary py-2 px-5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 shadow-xs"
          >
            {actionLabel}
          </Link>
        </div>
      )}

      {actionOnClick && actionLabel && !actionHref && (
        <div className="mt-5">
          <button
            type="button"
            onClick={actionOnClick}
            className="btn-primary py-2 px-5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            {actionLabel}
          </button>
        </div>
      )}

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
