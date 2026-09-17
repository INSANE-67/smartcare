"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  Activity,
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  Bell,
  User,
  CheckCircle2,
  Menu,
  X,
} from "lucide-react";
import { UserDropdown } from "@/components/ui/user-dropdown";

const NAV_ITEMS = [
  { href: "/doctor", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/doctor/appointments", label: "Consultations", icon: Calendar, exact: false },
  { href: "/doctor/patients", label: "Patient EHR", icon: Users, exact: false },
  { href: "/doctor/notifications", label: "Notifications", icon: Bell, exact: false },
  { href: "/doctor/profile", label: "Profile", icon: User, exact: false },
  { href: "/doctor/settings", label: "Settings", icon: Clock, exact: false },
];

interface DoctorNavbarProps {
  userFullName: string;
  userEmail?: string | null;
  isVerified?: boolean;
}

export function DoctorNavbar({ userFullName, userEmail, isVerified }: DoctorNavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  function isActive(item: (typeof NAV_ITEMS)[number]) {
    return item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  const initials = userFullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const doctorShortName = userFullName
    ? userFullName.replace(/^(dr\.?|doctor)\s+/i, "").trim().split(" ").slice(-1)[0] ||
      userFullName
    : "Specialist";

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#E8DED2]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">

          {/* ── Left: Brand ── */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/doctor" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-[#111111]">
                SmartCare
              </span>
            </Link>

            {/* Physician context badge (desktop only) */}
            <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#E8DED2] text-[10px] font-mono font-semibold text-[#555555] uppercase tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
              Physician
              {isVerified && <CheckCircle2 className="w-3 h-3 text-[#111111]" />}
            </span>
          </div>

          {/* ── Center: Desktop horizontal nav ── */}
          <nav
            className="hidden md:flex items-stretch h-16 overflow-x-auto scrollbar-none"
            aria-label="Physician navigation"
          >
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "inline-flex items-center gap-1.5 px-3.5 lg:px-4 text-xs font-semibold",
                    "whitespace-nowrap transition-colors border-b-2 -mb-px",
                    active
                      ? "border-[#111111] text-[#111111]"
                      : "border-transparent text-[#777777] hover:text-[#111111] hover:border-[#CCBBAA]",
                  ].join(" ")}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* ── Right: User controls ── */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Notifications quick-access (desktop) */}
            <Link
              href="/doctor/notifications"
              title="Notifications"
              className="hidden md:flex items-center justify-center w-9 h-9 rounded-full text-[#666666] hover:text-[#111111] hover:bg-[#FAF7F2] transition-colors"
            >
              <Bell className="w-4 h-4" />
            </Link>

            {/* Profile dropdown (desktop) */}
            <div className="hidden md:block">
              <UserDropdown
                userFullName={userFullName}
                userEmail={userEmail}
                userRole="Physician"
                profileHref="/doctor/profile"
                settingsHref="/doctor/settings"
                notificationsHref="/doctor/notifications"
                helpHref="/about"
                variant="pill"
              />
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl text-[#444444] hover:text-[#111111] hover:bg-[#FAF7F2] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="doctor-mobile-menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile slide-down menu ── */}
      {mobileOpen && (
        <div
          id="doctor-mobile-menu"
          ref={mobileMenuRef}
          className="md:hidden border-t border-[#E8DED2] bg-white px-4 py-5 space-y-4"
        >
          {/* Doctor identity header */}
          <div className="flex items-center gap-3 pb-4 border-b border-[#E8DED2]">
            <div className="w-10 h-10 rounded-full bg-[#111111] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#111111] truncate">Dr. {doctorShortName}</p>
              <p className="text-[10px] text-[#666666] truncate">{userEmail}</p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="space-y-1" aria-label="Physician navigation (mobile)">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={[
                    "flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-colors",
                    active
                      ? "bg-[#111111] text-white"
                      : "text-[#444444] hover:bg-[#FAF7F2] hover:text-[#111111]",
                  ].join(" ")}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sign-out via sidebar variant dropdown */}
          <div className="pt-2 border-t border-[#E8DED2]">
            <UserDropdown
              userFullName={userFullName}
              userEmail={userEmail}
              userRole="Physician"
              profileHref="/doctor/profile"
              settingsHref="/doctor/settings"
              notificationsHref="/doctor/notifications"
              helpHref="/about"
              variant="sidebar"
            />
          </div>
        </div>
      )}
    </header>
  );
}
