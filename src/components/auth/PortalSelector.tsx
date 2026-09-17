"use client";

import { motion } from "framer-motion";
import { User, Stethoscope, ShieldCheck } from "lucide-react";

export type PortalType = "patient" | "doctor" | "admin";

interface PortalSelectorProps {
  selectedPortal: PortalType;
  onSelect: (portal: PortalType) => void;
}

const portals: { id: PortalType; label: string; icon: typeof User }[] = [
  { id: "patient", label: "PATIENT", icon: User },
  { id: "doctor", label: "DOCTOR", icon: Stethoscope },
  { id: "admin", label: "ADMIN", icon: ShieldCheck },
];

export function PortalSelector({ selectedPortal, onSelect }: PortalSelectorProps) {
  return (
    <div className="w-full p-1.5 rounded-2xl bg-[#F8F2EA] border border-[#E7DDD1] flex items-center justify-between gap-1 select-none">
      {portals.map((portal) => {
        const isSelected = selectedPortal === portal.id;
        const Icon = portal.icon;

        return (
          <button
            key={portal.id}
            type="button"
            onClick={() => onSelect(portal.id)}
            className={`relative flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold tracking-wider transition-colors z-10 cursor-pointer ${
              isSelected ? "text-[#111111]" : "text-[#777777] hover:text-[#111111]"
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId="activePortalIndicator"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                className="absolute inset-0 bg-white rounded-xl shadow-xs border border-[#E7DDD1]"
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5" />
              <span>{portal.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
