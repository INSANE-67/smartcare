"use client";

import { useState } from "react";
import {
  SignalLow,
  WifiOff,
  Users,
  Leaf,
  ChevronRight,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useRuralCare } from "./rural-care-context";

const PROXY_OPTIONS = [
  { id: "self", label: "Self (Primary)", description: "You are managing your own account" },
  {
    id: "proxy",
    label: "Ramu — Village Health Volunteer",
    description: "Community Caregiver: Primary Health Centre #4",
  },
];

export function RuralCareCard() {
  const { lowBandwidthMode, setLowBandwidthMode } = useRuralCare();
  const [activeProxyId, setActiveProxyId] = useState<"self" | "proxy">("self");
  const [switching, setSwitching] = useState(false);

  const activeProxy = PROXY_OPTIONS.find((o) => o.id === activeProxyId)!;
  const otherProxy = PROXY_OPTIONS.find((o) => o.id !== activeProxyId)!;

  function handleProxySwitch() {
    setSwitching(true);
    setTimeout(() => {
      setActiveProxyId((prev) => (prev === "self" ? "proxy" : "self"));
      setSwitching(false);
    }, 600);
  }

  return (
    <section
      aria-label="Rural Tele-Clinic & Digital Equity Mode"
      className="bg-white border border-emerald-200 rounded-2xl p-6 shadow-sm space-y-6 transition-all"
    >
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            {lowBandwidthMode ? (
              <WifiOff className="w-5 h-5 text-emerald-600 stroke-[1.75]" />
            ) : (
              <SignalLow className="w-5 h-5 text-emerald-600 stroke-[1.75]" />
            )}
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-[#111111] leading-tight">
              Rural Tele-Clinic &amp; Digital Equity Mode
            </h2>
            <p className="text-xs text-[#666666] mt-0.5">
              Optimised for low-connectivity regions and proxy-assisted care.
            </p>
          </div>
        </div>
        {/* UN SDG Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-50 border border-emerald-300 text-emerald-700 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          UN SDG 3 &amp; 10
        </span>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-emerald-100" />

      {/* ── Toggle 1: Low-Bandwidth Lite Mode ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <SignalLow className="w-4 h-4 text-emerald-600 stroke-[1.75]" />
            <p className="text-sm font-semibold text-[#111111]">
              Low-Bandwidth Lite Mode{" "}
              <span className="text-[11px] font-mono text-[#777777]">(2G/3G Optimised)</span>
            </p>
          </div>
          <p className="text-xs text-[#666666] leading-relaxed max-w-prose">
            Disables non-essential media, heavy image hydration, and transitions
            telemedicine checkups to low-packet audio/text protocol.
          </p>
          {lowBandwidthMode && (
            <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 text-[11px] font-mono font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active — Lite Protocol Engaged
            </div>
          )}
        </div>

        {/* Toggle Switch */}
        <button
          id="rural-care-lite-mode-toggle"
          type="button"
          role="switch"
          aria-checked={lowBandwidthMode}
          onClick={() => setLowBandwidthMode(!lowBandwidthMode)}
          className={`relative inline-flex h-7 w-[52px] flex-shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
            lowBandwidthMode
              ? "border-emerald-500 bg-emerald-500"
              : "border-[#E8DED2] bg-[#F5EFE6]"
          }`}
        >
          <span className="sr-only">Enable Low-Bandwidth Lite Mode</span>
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ${
              lowBandwidthMode ? "translate-x-[26px]" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {/* ── Section 2: Caregiver / ASHA Worker Proxy Access ── */}
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-700 stroke-[1.75]" />
          <p className="text-sm font-semibold text-[#111111]">
            Caregiver / ASHA Worker Proxy Access
          </p>
        </div>

        <p className="text-xs text-[#666666] leading-relaxed">
          Enables a rural family member or village health worker (ASHA) to manage appointments
          and retrieve offline-ready prescriptions on behalf of elderly or digitally-limited patients.
        </p>

        {/* Registered Proxy Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-emerald-200 text-[11px] font-mono font-semibold text-emerald-700">
            <ShieldCheck className="w-3 h-3" />
            Registered Proxy Caregiver
          </span>
        </div>

        {/* Active / Switch Panel */}
        <div className="mt-1 rounded-xl border border-emerald-200 bg-white divide-y divide-emerald-100 overflow-hidden">
          {/* Active session */}
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-[11px] font-bold text-emerald-700 shrink-0">
                {activeProxy.label.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#111111] truncate">
                  Active: {activeProxy.label}
                </p>
                <p className="text-[11px] text-[#666666] truncate">
                  {activeProxy.description}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-[10px] font-mono font-bold text-emerald-700 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          </div>

          {/* Switch-to row */}
          <button
            id="rural-care-proxy-switch-btn"
            type="button"
            onClick={handleProxySwitch}
            disabled={switching}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-emerald-50 transition-colors disabled:opacity-60"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {switching ? (
                <RefreshCw className="w-4 h-4 text-emerald-500 animate-spin shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#E8DED2] flex items-center justify-center text-[11px] font-bold text-[#777777] shrink-0">
                  {otherProxy.label.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#444444] truncate">
                  Switch to: {otherProxy.label}
                </p>
                <p className="text-[11px] text-[#777777] truncate">
                  {otherProxy.description}
                </p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#999999] shrink-0" />
          </button>
        </div>
      </div>

      {/* ── Green Impact Summary ── */}
      <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 flex items-start gap-3">
        <Leaf className="w-5 h-5 text-emerald-600 stroke-[1.75] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-emerald-800">Green Telehealth Impact</p>
          <p className="text-xs text-emerald-700 leading-relaxed">
            🌿 <strong>Estimated Transit Emissions Prevented:</strong> ~14.2 kg CO₂ avoided per
            remote follow-up{" "}
            <span className="text-emerald-600">
              (equivalent to 48 km bus transit).
            </span>
          </p>
          <p className="text-[11px] text-emerald-600 mt-1">
            Every remote consultation reduces last-mile travel for rural patients, contributing
            to SDG&nbsp;13 Climate Action alongside SDG&nbsp;3 &amp; 10.
          </p>
        </div>
      </div>
    </section>
  );
}
