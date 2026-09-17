import Link from "next/link";
import { Activity, ShieldCheck, FileText, Sparkles, Calendar } from "lucide-react";
import { RoleCard } from "./RoleCard";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row selection:bg-[#E7DDD1] selection:text-[#111111]">
      {/* ══════════════════════════════════════════════════════════════════════
          LEFT PANEL (~58% Width): Dark Professional Medical Panel (#111827)
          ══════════════════════════════════════════════════════════════════════ */}
      <aside className="w-full lg:w-[58%] bg-[#111827] text-white p-8 sm:p-12 lg:p-16 xl:p-20 flex flex-col justify-between relative overflow-hidden shrink-0 border-b lg:border-b-0 lg:border-r border-[#1F2937]">
        {/* Subtle Medical Grid Pattern */}
        <svg
          className="absolute inset-0 w-full h-full stroke-slate-800/60 [mask-image:radial-gradient(100%_100%_at_top_left,white,transparent)] pointer-events-none"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <pattern id="medical-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M0 32V.5H32" strokeWidth="0.75" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" strokeWidth="0" fill="url(#medical-grid)" />
        </svg>

        {/* Soft Radial Ambient Lighting */}
        <div className="absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full bg-slate-800/40 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-slate-800/25 blur-3xl pointer-events-none" />

        {/* Top: SmartCare Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-white text-[#111827] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-[#FFFFFF]">
              SmartCare
            </span>
          </Link>
        </div>

        {/* Middle: Headline & Wider Feature List */}
        <div className="space-y-8 my-10 lg:my-auto py-6 relative z-10">
          <div className="space-y-4">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1]">
              <span className="font-extrabold text-[#FFFFFF] block">Healthcare.</span>
              <span className="font-extrabold text-[#FFFFFF] block">Built for</span>
              <span className="italic font-normal text-[#F5F5F5] block">Everyone.</span>
            </h1>
            <p className="text-sm sm:text-base text-[rgba(255,255,255,0.82)] max-w-lg leading-relaxed font-sans font-normal">
              SmartCare securely connects patients, doctors and administrators through one unified healthcare platform.
            </p>
          </div>

          {/* Wider Feature Cards with Glassmorphism */}
          <div className="space-y-3.5 w-full max-w-lg">
            <RoleCard
              title="Secure Authentication"
              icon={<ShieldCheck className="w-3.5 h-3.5" />}
              description="Role-based encryption and active session protection"
            />
            <RoleCard
              title="Medical Records"
              icon={<FileText className="w-3.5 h-3.5" />}
              description="Encrypted diagnostic archival with on-demand signed tokens"
            />
            <RoleCard
              title="AI Assistant"
              icon={<Sparkles className="w-3.5 h-3.5" />}
              description="Smart clinical summaries and pre-consultation intake"
            />
            <RoleCard
              title="Appointments"
              icon={<Calendar className="w-3.5 h-3.5" />}
              description="Real-time scheduling with double-booking prevention"
            />
          </div>
        </div>

        {/* Bottom Left Copyright */}
        <div className="text-xs text-[rgba(255,255,255,0.82)] pt-6 relative z-10 space-y-0.5">
          <p className="font-semibold text-[#FFFFFF]">&copy; SmartCare</p>
          <p className="text-[11px] text-[rgba(255,255,255,0.65)]">Clinical Healthcare Platform</p>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════════════════
          RIGHT PANEL (~42% Width): Warm Cream Background (#FAF5EF)
          ══════════════════════════════════════════════════════════════════════ */}
      <main className="w-full lg:w-[42%] bg-[#FAF5EF] flex flex-col justify-between items-center p-6 sm:p-10 lg:p-12 xl:p-14 min-h-screen lg:min-h-full overflow-y-auto">
        <div className="w-full flex justify-end" />

        {/* Centered Authentication Card (Max Width 480px, 24px Radius) */}
        <div className="w-full max-w-[480px] my-auto bg-white border border-[#E7DDD1] rounded-[24px] shadow-xl p-8 sm:p-10 transition-all">
          {children}
        </div>

        {/* Bottom Legal Navigation Links */}
        <div className="flex items-center gap-6 text-xs text-[#777777] pt-8">
          <Link href="/privacy" className="hover:text-[#111111] hover:underline underline-offset-4 transition-colors">
            Privacy Policy
          </Link>
          <span className="text-[#E7DDD1]">&bull;</span>
          <Link href="/terms" className="hover:text-[#111111] hover:underline underline-offset-4 transition-colors">
            Terms
          </Link>
          <span className="text-[#E7DDD1]">&bull;</span>
          <Link href="/contact" className="hover:text-[#111111] hover:underline underline-offset-4 transition-colors">
            Contact Support
          </Link>
        </div>
      </main>
    </div>
  );
}
