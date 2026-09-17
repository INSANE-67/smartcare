import { ReactNode } from "react";
import { Check } from "lucide-react";

interface RoleCardProps {
  title: string;
  icon?: ReactNode;
  description?: string;
}

export function RoleCard({ title, icon, description }: RoleCardProps) {
  return (
    <div className="w-full p-4 rounded-[16px] bg-white/[0.07] backdrop-blur-md border border-white/15 shadow-md shadow-black/20 flex items-center gap-3.5 transition-all duration-200 hover:bg-white/[0.12] hover:border-white/25 hover:translate-x-1 select-none">
      <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center flex-shrink-0">
        {icon || <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-semibold text-[#FFFFFF] tracking-tight">{title}</p>
        {description && (
          <p className="text-[11px] text-[rgba(255,255,255,0.72)] leading-normal mt-0.5">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
