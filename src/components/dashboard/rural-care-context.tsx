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

interface RuralCareContextValue {
  lowBandwidthMode: boolean;
  setLowBandwidthMode: (value: boolean) => void;
}

const RuralCareContext = createContext<RuralCareContextValue>({
  lowBandwidthMode: false,
  setLowBandwidthMode: () => undefined,
});

export function RuralCareProvider({ children }: { children: ReactNode }) {
  const [lowBandwidthMode, setLowBandwidthModeState] = useState(false);

  // Hydrate from localStorage on mount (client-only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored === "true") setLowBandwidthModeState(true);
    } catch {
      // localStorage not available (SSR guard)
    }
  }, []);

  const setLowBandwidthMode = useCallback((value: boolean) => {
    setLowBandwidthModeState(value);
    try {
      localStorage.setItem(LS_KEY, String(value));
    } catch {
      // noop
    }
  }, []);

  return (
    <RuralCareContext.Provider value={{ lowBandwidthMode, setLowBandwidthMode }}>
      {children}
    </RuralCareContext.Provider>
  );
}

export function useRuralCare() {
  return useContext(RuralCareContext);
}
