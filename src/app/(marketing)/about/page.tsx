import { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  HeartHandshake,
  ShieldCheck,
  Zap,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Clinical Philosophy & Mission — SmartCare",
  description: "Learn about the mission, architecture, and clinical standards behind SmartCare.",
};

export default function AboutPage() {
  return (
    <div className="py-20 lg:py-28 px-6 bg-[#FAF7F2]">
      <div className="container mx-auto max-w-5xl space-y-20">
        {/* ── Header ── */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E8DED2] shadow-xs text-xs font-semibold text-[#111111]">
            <span>Our Mission &amp; Purpose</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#111111]">
            Redefining clinical coordination
          </h1>
          <p className="font-sans text-base sm:text-lg text-[#555555] max-w-2xl mx-auto leading-relaxed">
            SmartCare is engineered to eliminate healthcare administrative fragmentation by providing a high-integrity, unified digital foundation for patients and physicians.
          </p>
        </div>

        {/* ── Core Mission Editorial Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-bold text-[#111111]">
              Healthcare without administrative barriers
            </h2>
            <p className="text-sm sm:text-base text-[#555555] leading-relaxed">
              We envision a medical ecosystem where scheduling a consultation or accessing diagnostic laboratory history is as instantaneous and clear as managing modern financial software.
            </p>
            <p className="text-sm sm:text-base text-[#555555] leading-relaxed">
              By removing manual phone trees, disconnected paper records, and cumbersome portals, SmartCare restores the physician-patient relationship as the primary focus of healthcare delivery.
            </p>
          </div>

          {/* Abstract Vector Illustration */}
          <div className="card-saas p-8 rounded-[22px] bg-white border border-[#E8DED2] space-y-4">
            <div className="w-12 h-12 rounded-[16px] bg-[#FAF7F2] border border-[#E8DED2] text-[#111111] flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#111111]">
              Unified Health Architecture
            </h3>
            <div className="space-y-2.5 text-xs text-[#555555]">
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DED2] flex items-center justify-between">
                <span className="font-medium text-[#111111]">Direct Patient Scheduling</span>
                <span className="text-[#555555] font-semibold">Instant Intake</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DED2] flex items-center justify-between">
                <span className="font-medium text-[#111111]">Encrypted Electronic Health Records</span>
                <span className="text-[#555555] font-semibold">Signed Access</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DED2] flex items-center justify-between">
                <span className="font-medium text-[#111111]">Physician Clinical Workstation</span>
                <span className="text-[#555555] font-semibold">Real-Time</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Principles ── */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="font-serif text-3xl font-bold text-[#111111]">Our Core Principles</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="card-saas p-6 rounded-[22px] bg-white border border-[#E8DED2] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8DED2] text-[#111111] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#111111]">Privacy First</h4>
              <p className="text-xs text-[#555555] leading-relaxed">
                Patient records are cryptographically secured and accessible strictly by authenticated parties.
              </p>
            </div>

            <div className="card-saas p-6 rounded-[22px] bg-white border border-[#E8DED2] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8DED2] text-[#111111] flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#111111]">Instant Velocity</h4>
              <p className="text-xs text-[#555555] leading-relaxed">
                Zero friction booking, immediate cache synchronization, and real-time encounter updates.
              </p>
            </div>

            <div className="card-saas p-6 rounded-[22px] bg-white border border-[#E8DED2] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8DED2] text-[#111111] flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#111111]">Clinical Clarity</h4>
              <p className="text-xs text-[#555555] leading-relaxed">
                Designed for high cognitive clarity, readable typography, and effortless navigation for both patients and clinicians.
              </p>
            </div>
          </div>
        </div>

        {/* ── Call To Action ── */}
        <div className="text-center pt-4">
          <Link
            href="/signup"
            className="btn-primary text-sm px-8 py-3.5 inline-flex"
          >
            <span>Join SmartCare Today</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
