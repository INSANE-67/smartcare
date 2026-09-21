"use client";

import { useState } from "react";
import { Zap, X } from "lucide-react";
import { useRuralCare } from "./rural-care-context";

export function LiteModeBanner() {
  const { lowBandwidthMode } = useRuralCare();
  const [dismissed, setDismissed] = useState(false);

  if (!lowBandwidthMode || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-2 flex items-center gap-4">
        {/* Message */}
        <div className="flex flex-1 items-center justify-center gap-2">
          <Zap
            aria-hidden="true"
            className="w-3.5 h-3.5 shrink-0 fill-yellow-300 text-yellow-300"
          />
          <p className="text-xs font-semibold text-center">
            ⚡ Lite Tele-Clinic Mode Active{" "}
            <span className="font-normal opacity-90">
              — Optimised for Low Connectivity (2G/3G)
            </span>
          </p>
        </div>

        {/* Dismiss */}
        <button
          id="lite-mode-banner-dismiss-btn"
          type="button"
          aria-label="Dismiss lite mode banner"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-full p-1 hover:bg-white/20 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white cursor-pointer"
        >
          <X aria-hidden="true" className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
