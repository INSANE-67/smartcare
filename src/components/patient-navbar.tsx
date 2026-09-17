"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  Activity,
  Bell,
  Menu,
  X,
  Calendar,
  FileText,
  Users,
  Settings,
  LogOut,
  Search,
  User,
  HelpCircle,
  Shield,
  ChevronDown,
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";

interface PatientNavbarProps {
  userFullName: string;
  userEmail?: string | null;
  userRole?: string;
  avatarUrl?: string | null;
}

const NAV_ITEMS = [
  { href: "/patient", label: "Dashboard", icon: Activity },
  { href: "/patient/doctors", label: "My Doctors", icon: Users },
  { href: "/patient/appointments", label: "Appointments", icon: Calendar },
  { href: "/patient/book", label: "Find Doctors", icon: Search },
  { href: "/patient/records", label: "Health Records", icon: FileText },
];

export function PatientNavbar({
  userFullName,
  userEmail = "patient@smartcare.io",
  userRole = "Patient",
  avatarUrl,
}: PatientNavbarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initials = userFullName
    ? userFullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "PT";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#E8DED2] shadow-2xs">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-18">
          {/* ── Left: Brand ── */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/patient" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-full bg-[#111111] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Activity className="w-4.5 h-4.5" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#111111]">
                SmartCare
              </span>
            </Link>
            <span className="hidden sm:inline-block text-[11px] font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#111111] border border-[#E8DED2] font-semibold">
              Patient Portal
            </span>
          </div>

          {/* ── Center: High-Contrast Navigation Links ── */}
          <nav className="hidden xl:flex items-center gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/patient"
                  ? pathname === "/patient"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#111111] text-white shadow-xs"
                      : "text-[#444444] hover:text-[#111111] hover:bg-[#FAF7F2]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* ── Right: Quick Actions & Profile Dropdown ── */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Notifications */}
            <Link
              href="/patient/notifications"
              className="relative p-2.5 rounded-full text-[#444444] hover:text-[#111111] hover:bg-[#FAF7F2] transition-colors"
              title="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#111111] ring-2 ring-white" />
            </Link>

            {/* Profile Dropdown Trigger */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                id="profile-dropdown-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
                className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full bg-white border border-[#E8DED2] hover:border-[#111111] hover:shadow-xs transition-all cursor-pointer"
              >
                <span className="text-xs font-bold text-[#111111] max-w-[130px] truncate">
                  {userFullName}
                </span>
                <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {initials}
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#666666] transition-transform duration-200 ${
                    isUserMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* ── Professional Dropdown Menu ── */}
              {isUserMenuOpen && (
                <div
                  role="menu"
                  aria-orientation="vertical"
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-[#E8DED2] shadow-xl p-2 z-50 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  {/* User Profile Header */}
                  <div className="px-3.5 py-3 border-b border-[#E8DED2] space-y-0.5">
                    <p className="text-xs font-bold text-[#111111] truncate">{userFullName}</p>
                    <p className="text-[11px] text-[#666666] truncate">{userEmail || "patient@smartcare.io"}</p>
                    <div className="pt-1.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E8DED2] text-[#111111] uppercase">
                        <Shield className="w-3 h-3 text-[#111111]" />
                        <span>{userRole} Account</span>
                      </span>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="py-1 space-y-0.5">
                    <Link
                      href="/patient/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      role="menuitem"
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#444444] hover:text-[#111111] hover:bg-[#FAF7F2] transition-colors"
                    >
                      <User className="w-4 h-4 text-[#111111]" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      href="/patient/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      role="menuitem"
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#444444] hover:text-[#111111] hover:bg-[#FAF7F2] transition-colors"
                    >
                      <Settings className="w-4 h-4 text-[#111111]" />
                      <span>My Account</span>
                    </Link>

                    <Link
                      href="/patient/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      role="menuitem"
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#444444] hover:text-[#111111] hover:bg-[#FAF7F2] transition-colors"
                    >
                      <Settings className="w-4 h-4 text-[#111111]" />
                      <span>Settings</span>
                    </Link>

                    <Link
                      href="/patient/notifications"
                      onClick={() => setIsUserMenuOpen(false)}
                      role="menuitem"
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#444444] hover:text-[#111111] hover:bg-[#FAF7F2] transition-colors"
                    >
                      <Bell className="w-4 h-4 text-[#111111]" />
                      <span>Notifications</span>
                    </Link>

                    <Link
                      href="/about"
                      onClick={() => setIsUserMenuOpen(false)}
                      role="menuitem"
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#444444] hover:text-[#111111] hover:bg-[#FAF7F2] transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-[#111111]" />
                      <span>Help &amp; Support</span>
                    </Link>
                  </div>

                  {/* Divider & Danger Logout */}
                  <div className="pt-1 border-t border-[#E8DED2]">
                    <form action={logoutAction}>
                      <button
                        type="submit"
                        role="menuitem"
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#991B1B] hover:bg-[#FEF2F2] transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4 text-[#991B1B]" />
                        <span>Sign out</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Mobile Hamburger & Actions ── */}
          <div className="flex xl:hidden items-center gap-2">
            <Link
              href="/patient/notifications"
              className="p-2 text-[#444444] hover:text-[#111111]"
            >
              <Bell className="w-5 h-5" />
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#111111] focus:outline-none cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {isMobileMenuOpen && (
        <div className="xl:hidden border-t border-[#E8DED2] bg-white px-4 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/patient"
                  ? pathname === "/patient"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-[#111111] text-white"
                      : "text-[#444444] hover:bg-[#FAF7F2] hover:text-[#111111]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-[#E8DED2] space-y-2">
            <div className="px-3 py-2">
              <p className="text-xs font-bold text-[#111111]">{userFullName}</p>
              <p className="text-[11px] text-[#666666]">{userEmail}</p>
            </div>
            <Link
              href="/patient/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#444444]"
            >
              <User className="w-4 h-4 text-[#111111]" />
              <span>My Profile</span>
            </Link>
            <Link
              href="/patient/settings"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#444444]"
            >
              <Settings className="w-4 h-4 text-[#111111]" />
              <span>Settings</span>
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-[#991B1B] hover:bg-[#FEF2F2]"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
