"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

const LS_KEY = "smartcare_low_bandwidth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RuralCareContextValue {
  lowBandwidthMode: boolean;
  toggleLowBandwidthMode: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const RuralCareContext = createContext<RuralCareContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function RuralCareProvider({ children }: { children: ReactNode }) {
  const [lowBandwidthMode, setLowBandwidthMode] = useState(false);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      setLowBandwidthMode(localStorage.getItem(LS_KEY) === "true");
    } catch {
      // Silently ignore — localStorage unavailable in some environments
    }
  }, []);

  const toggleLowBandwidthMode = useCallback(() => {
    setLowBandwidthMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(LS_KEY, String(next));
      } catch {
        // noop
      }
      return next;
    });
  }, []);

  return (
    <RuralCareContext.Provider value={{ lowBandwidthMode, toggleLowBandwidthMode }}>
      {children}
    </RuralCareContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useRuralCare(): RuralCareContextValue {
  const ctx = useContext(RuralCareContext);
  if (ctx === null) {
    throw new Error("useRuralCare must be used within a <RuralCareProvider>");
  }
  return ctx;
}
