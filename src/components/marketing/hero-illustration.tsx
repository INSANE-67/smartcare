"use client";

import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Check,
  FileText,
  Sparkles,
  Activity,
  Bell,
  Heart,
  Shield,
  Clock,
  TrendingUp,
} from "lucide-react";

export function HeroIllustration() {
  return (
    <div className="relative w-full max-w-xl mx-auto h-[480px] sm:h-[540px] flex items-center justify-center select-none">
      {/* ── Soft Ambient Cream Blobs ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-80 h-80 rounded-full bg-[#F5EFE6]/80 blur-3xl" />
        <div className="w-64 h-64 rounded-full bg-[#E8DED2]/40 blur-2xl -translate-y-12" />
      </div>

      {/* ── Main Base Container: Central Clinical Dashboard Card ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white border border-[#E8DED2] rounded-[24px] shadow-xl p-6 relative z-10 space-y-4"
      >
        {/* Card Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DED2]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#111111]" />
            <span className="text-xs font-semibold text-[#111111]">Clinical Overview</span>
          </div>
          <span className="text-[10px] font-mono text-[#555555] bg-[#FAF7F2] px-2.5 py-0.5 rounded-full border border-[#E8DED2]">
            Synchronized
          </span>
        </div>

        {/* Vitals Summary Graphic */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-[16px] bg-[#FAF7F2] border border-[#E8DED2] space-y-1">
            <div className="flex items-center justify-between text-[#777777]">
              <span className="text-[11px] font-medium">Heart Rate</span>
              <Heart className="w-3.5 h-3.5 text-[#111111]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-[#111111] font-mono">72</span>
              <span className="text-[10px] text-[#777777]">bpm</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[#555555] font-medium">
              <TrendingUp className="w-3 h-3 text-[#111111]" />
              <span>Normal sinus</span>
            </div>
          </div>

          <div className="p-3.5 rounded-[16px] bg-[#FAF7F2] border border-[#E8DED2] space-y-1">
            <div className="flex items-center justify-between text-[#777777]">
              <span className="text-[11px] font-medium">SpO2 Level</span>
              <Activity className="w-3.5 h-3.5 text-[#111111]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-[#111111] font-mono">99</span>
              <span className="text-[10px] text-[#777777]">%</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[#555555] font-medium">
              <Check className="w-3 h-3 text-[#111111]" />
              <span>Optimal baseline</span>
            </div>
          </div>
        </div>

        {/* Active Consultation Item */}
        <div className="p-3.5 rounded-[16px] bg-white border border-[#E8DED2] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#E8DED2] text-[#111111] flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#111111]">Cardiology Follow-up</p>
              <p className="text-[11px] text-[#555555]">Today at 10:30 AM &bull; Confirmed</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-[#111111] bg-[#FAF7F2] border border-[#E8DED2] px-2.5 py-0.5 rounded-full">
            In 15m
          </span>
        </div>
      </motion.div>

      {/* ── Floating Card 1: Calendar Widget (Top Left) ── */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-4 -left-4 sm:-left-8 z-20 w-52 bg-white border border-[#E8DED2] rounded-[20px] shadow-lg p-4 space-y-2.5 backdrop-blur-md"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#111111] flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-[#111111]" />
            October 2026
          </span>
          <span className="w-2 h-2 rounded-full bg-[#111111]" />
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-[#777777] font-medium">
          <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
          <span className="text-[#555555]">12</span>
          <span className="text-[#555555]">13</span>
          <span className="w-5 h-5 mx-auto rounded-full bg-[#111111] text-white flex items-center justify-center font-bold">14</span>
          <span className="text-[#555555]">15</span>
          <span className="text-[#555555]">16</span>
          <span className="text-[#777777]">17</span>
          <span className="text-[#777777]">18</span>
        </div>
      </motion.div>

      {/* ── Floating Card 2: AI Health Assistant (Top Right) ── */}
      <motion.div
        animate={{ y: [4, -4, 4] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        className="absolute -top-6 -right-2 sm:-right-6 z-20 w-60 bg-white border border-[#E8DED2] rounded-[20px] shadow-lg p-4 space-y-2"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#FAF7F2] border border-[#E8DED2] text-[#111111] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-[#111111]">AI Clinical Assistant</span>
        </div>
        <p className="text-[11px] text-[#555555] leading-relaxed bg-[#FAF7F2] p-2.5 rounded-[12px] border border-[#E8DED2]">
          &ldquo;Recent lab metrics match target recovery baseline.&rdquo;
        </p>
      </motion.div>

      {/* ── Floating Card 3: Medical Record Card (Bottom Left) ── */}
      <motion.div
        animate={{ y: [3, -5, 3] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        className="absolute -bottom-6 -left-2 sm:-left-6 z-20 w-56 bg-white border border-[#E8DED2] rounded-[20px] shadow-lg p-3.5 flex items-center gap-3"
      >
        <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#E8DED2] text-[#111111] flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-[#111111] truncate">Blood Panel Lab.pdf</p>
          <p className="text-[10px] text-[#555555] flex items-center gap-1">
            <Shield className="w-2.5 h-2.5 text-[#111111]" />
            Encrypted &bull; 2.4 MB
          </p>
        </div>
      </motion.div>

      {/* ── Floating Card 4: Notification Card (Bottom Right) ── */}
      <motion.div
        animate={{ y: [-5, 3, -5] }}
        transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
        className="absolute -bottom-4 -right-4 sm:-right-8 z-20 w-64 bg-white border border-[#E8DED2] rounded-[20px] shadow-lg p-3.5 flex items-center gap-3"
      >
        <div className="w-8 h-8 rounded-xl bg-[#111111] text-white flex items-center justify-center flex-shrink-0">
          <Bell className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-[#111111] truncate">Appointment Confirmed</p>
          <p className="text-[10px] text-[#555555] truncate">Dr. Jenkins accepted your request</p>
        </div>
      </motion.div>
    </div>
  );
}
