"use client";

import { useState } from "react";
import {
  SignalLow,
  WifiOff,
  Users,
  Leaf,
  ChevronRight,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useRuralCare } from "./rural-care-context";

// ─── Proxy config ─────────────────────────────────────────────────────────────

type ProxyId = "self" | "proxy";

interface ProxyOption {
  id: ProxyId;
  label: string;
  description: string;
  initial: string; // avatar initial
}

const PROXY_OPTIONS: Record<ProxyId, ProxyOption> = {
  self: {
    id: "self",
    label: "Self (Primary)",
    description: "You are managing your own account",
    initial: "S",
  },
  proxy: {
    id: "proxy",
    label: "Ramu — Village Health Volunteer",
    description: "Community Caregiver · Primary Health Centre #4",
    initial: "R",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function RuralCareCard() {
  const { lowBandwidthMode, toggleLowBandwidthMode } = useRuralCare();
  const [activeProxyId, setActiveProxyId] = useState<ProxyId>("self");
  const [switching, setSwitching] = useState(false);

  const active = PROXY_OPTIONS[activeProxyId];
  const other = PROXY_OPTIONS[activeProxyId === "self" ? "proxy" : "self"];

  function handleProxySwitch() {
    if (switching) return;
    setSwitching(true);
    setTimeout(() => {
      setActiveProxyId((prev) => (prev === "self" ? "proxy" : "self"));
      setSwitching(false);
    }, 550);
  }

  return (
    <section
      aria-label="Rural Tele-Clinic & Digital Equity Mode"
      className="bg-white border border-emerald-200 rounded-2xl p-6 shadow-sm space-y-6"
    >
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            {lowBandwidthMode ? (
              <WifiOff
                aria-hidden="true"
                className="w-5 h-5 text-emerald-600 stroke-[1.75]"
              />
            ) : (
              <SignalLow
                aria-hidden="true"
                className="w-5 h-5 text-emerald-600 stroke-[1.75]"
              />
            )}
          </div>

          {/* Title */}
          <div>
            <h2 className="font-serif text-lg font-bold text-[#111111] leading-snug">
              Rural Tele-Clinic &amp; Digital Equity Mode
            </h2>
            <p className="text-xs text-[#666666] mt-0.5">
              Optimised for low-connectivity regions and proxy-assisted care.
            </p>
          </div>
        </div>

        {/* UN SDG badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-50 border border-emerald-300 text-emerald-700 shrink-0">
          <span
            aria-hidden="true"
            className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
          />
          UN SDG 3 &amp; 10
        </span>
      </div>

      <div className="border-t border-emerald-100" />

      {/* ── Section 1: Low-Bandwidth Toggle ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Description */}
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <SignalLow
              aria-hidden="true"
              className="w-4 h-4 text-emerald-600 stroke-[1.75] shrink-0"
            />
            <p className="text-sm font-semibold text-[#111111]">
              Low-Bandwidth Lite Mode{" "}
              <span className="text-[11px] font-mono text-[#888888]">
                (2G/3G Optimised)
              </span>
            </p>
          </div>
          <p className="text-xs text-[#666666] leading-relaxed max-w-prose">
            Disables non-essential media, heavy image hydration, and transitions
            telemedicine checkups to a low-packet audio/text protocol.
          </p>

          {/* Active pill */}
          {lowBandwidthMode && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 text-[11px] font-mono font-semibold">
              <span
                aria-hidden="true"
                className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
              />
              Active — Lite Protocol Engaged
            </span>
          )}
        </div>

        {/* Toggle switch */}
        <button
          id="rural-care-lite-mode-toggle"
          type="button"
          role="switch"
          aria-checked={lowBandwidthMode}
          aria-label="Toggle Low-Bandwidth Lite Mode"
          onClick={toggleLowBandwidthMode}
          className={[
            "relative inline-flex h-7 w-[52px] shrink-0 cursor-pointer items-center rounded-full",
            "border-2 transition-colors duration-300",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500",
            lowBandwidthMode
              ? "border-emerald-500 bg-emerald-500"
              : "border-[#E8DED2] bg-[#F5EFE6]",
          ].join(" ")}
        >
          <span
            aria-hidden="true"
            className={[
              "inline-block h-5 w-5 transform rounded-full bg-white shadow-md",
              "ring-0 transition-transform duration-300",
              lowBandwidthMode ? "translate-x-[26px]" : "translate-x-0.5",
            ].join(" ")}
          />
        </button>
      </div>

      {/* ── Section 2: Caregiver / ASHA Worker Proxy Access ── */}
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 space-y-3">
        {/* Sub-heading */}
        <div className="flex items-center gap-2">
          <Users
            aria-hidden="true"
            className="w-4 h-4 text-emerald-700 stroke-[1.75] shrink-0"
          />
          <p className="text-sm font-semibold text-[#111111]">
            Caregiver / ASHA Worker Proxy Access
          </p>
        </div>

        <p className="text-xs text-[#666666] leading-relaxed">
          Enables a rural family member or village health worker (ASHA) to
          manage appointments and retrieve offline-ready prescriptions on behalf
          of elderly or digitally-limited patients.
        </p>

        {/* Registered badge */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-emerald-200 text-[11px] font-mono font-semibold text-emerald-700">
            <ShieldCheck
              aria-hidden="true"
              className="w-3 h-3 shrink-0"
            />
            Registered Proxy Caregiver
          </span>
        </div>

        {/* Quick-switcher panel */}
        <div className="rounded-xl border border-emerald-200 bg-white overflow-hidden divide-y divide-emerald-100">
          {/* Active session row */}
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-[11px] font-bold text-emerald-700 shrink-0">
                {active.initial}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#111111] truncate">
                  Active: {active.label}
                </p>
                <p className="text-[11px] text-[#666666] truncate">
                  {active.description}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-[10px] font-mono font-bold text-emerald-700 shrink-0">
              <span
                aria-hidden="true"
                className="w-1.5 h-1.5 rounded-full bg-emerald-500"
              />
              Active
            </span>
          </div>

          {/* Switch-to row */}
          <button
            id="rural-care-proxy-switch-btn"
            type="button"
            disabled={switching}
            onClick={handleProxySwitch}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-emerald-50 transition-colors disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {switching ? (
                <Loader2
                  aria-hidden="true"
                  className="w-4 h-4 text-emerald-500 animate-spin shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#E8DED2] flex items-center justify-center text-[11px] font-bold text-[#888888] shrink-0">
                  {other.initial}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#444444] truncate">
                  Switch to: {other.label}
                </p>
                <p className="text-[11px] text-[#888888] truncate">
                  {other.description}
                </p>
              </div>
            </div>
            <ChevronRight
              aria-hidden="true"
              className="w-3.5 h-3.5 text-[#AAAAAA] shrink-0"
            />
          </button>
        </div>
      </div>

      {/* ── Section 3: Green Telehealth Impact ── */}
      <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 flex items-start gap-3">
        <Leaf
          aria-hidden="true"
          className="w-5 h-5 text-emerald-600 stroke-[1.75] shrink-0 mt-0.5"
        />
        <div className="space-y-1">
          <p className="text-xs font-bold text-emerald-800">
            Green Telehealth Impact
          </p>
          <p className="text-xs text-emerald-700 leading-relaxed">
            🌿{" "}
            <strong>Estimated Transit Emissions Prevented:</strong> ~14.2 kg
            CO₂ avoided per remote follow-up{" "}
            <span className="text-emerald-600">
              (equivalent to 48 km bus transit).
            </span>
          </p>
          <p className="text-[11px] text-emerald-600 mt-1">
            Every remote consultation reduces last-mile travel for rural
            patients — contributing to{" "}
            <strong>SDG 13 Climate Action</strong> alongside SDG&nbsp;3
            &amp;&nbsp;10.
          </p>
        </div>
      </div>
    </section>
  );
}
