"use client";

import { Zap, X } from "lucide-react";
import { useState } from "react";
import { useRuralCare } from "./rural-care-context";

export function LiteModeBanner() {
  const { lowBandwidthMode } = useRuralCare();
  const [dismissed, setDismissed] = useState(false);

  if (!lowBandwidthMode || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 justify-center">
          <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 shrink-0" />
          <p className="text-xs font-semibold text-white text-center">
            ⚡ Lite Tele-Clinic Mode Active{" "}
            <span className="font-normal opacity-90">(Optimised for Low Connectivity)</span>
          </p>
        </div>
        <button
          id="lite-mode-banner-dismiss"
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss banner"
          className="shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
