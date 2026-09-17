"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  User,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  ChevronDown,
  Shield,
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";

interface UserDropdownProps {
  userFullName: string;
  userEmail?: string | null;
  userRole?: string;
  avatarUrl?: string | null;
  profileHref?: string;
  settingsHref?: string;
  notificationsHref?: string;
  helpHref?: string;
  variant?: "pill" | "sidebar";
}

export function UserDropdown({
  userFullName,
  userEmail = "user@smartcare.io",
  userRole = "Patient",
  avatarUrl,
  profileHref = "/patient/profile",
  settingsHref = "/patient/settings",
  notificationsHref = "/patient/notifications",
  helpHref = "/about",
  variant = "pill",
}: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initials = userFullName
    ? userFullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "SC";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (variant === "sidebar") {
    return (
      <div className="relative w-full" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          className="w-full flex items-center justify-between p-2 rounded-2xl border border-[#E8DED2] bg-white hover:border-[#111111] hover:shadow-xs transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#111111] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#111111] truncate">{userFullName}</p>
              <p className="text-[10px] text-[#666666] truncate">{userEmail || "user@smartcare.io"}</p>
            </div>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-[#666666] transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div
            role="menu"
            aria-orientation="vertical"
            className="absolute bottom-full left-0 mb-2 w-full bg-white rounded-2xl border border-[#E8DED2] shadow-xl p-2 z-50 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            {/* Header */}
            <div className="px-3.5 py-2.5 border-b border-[#E8DED2] space-y-0.5">
              <p className="text-xs font-bold text-[#111111] truncate">{userFullName}</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E8DED2] text-[#111111]">
                <Shield className="w-3 h-3" />
                <span>{userRole}</span>
              </span>
            </div>

            <div className="py-1 space-y-0.5">
              <Link
                href={profileHref}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#444444] hover:text-[#111111] hover:bg-[#FAF7F2] transition-colors"
              >
                <User className="w-4 h-4 text-[#111111]" />
                <span>Profile</span>
              </Link>
              <Link
                href={settingsHref}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#444444] hover:text-[#111111] hover:bg-[#FAF7F2] transition-colors"
              >
                <Settings className="w-4 h-4 text-[#111111]" />
                <span>Settings</span>
              </Link>
              <Link
                href={notificationsHref}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#444444] hover:text-[#111111] hover:bg-[#FAF7F2] transition-colors"
              >
                <Bell className="w-4 h-4 text-[#111111]" />
                <span>Notifications</span>
              </Link>
              <Link
                href={helpHref}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#444444] hover:text-[#111111] hover:bg-[#FAF7F2] transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-[#111111]" />
                <span>Help &amp; Support</span>
              </Link>
            </div>

            <div className="pt-1 border-t border-[#E8DED2]">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#991B1B] hover:bg-[#FEF2F2] transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4 text-[#991B1B]" />
                  <span>Sign out</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
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
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-[#E8DED2] shadow-xl p-2 z-50 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* User Profile Header */}
          <div className="px-3.5 py-3 border-b border-[#E8DED2] space-y-0.5">
            <p className="text-xs font-bold text-[#111111] truncate">{userFullName}</p>
            <p className="text-[11px] text-[#666666] truncate">{userEmail || "user@smartcare.io"}</p>
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
              href={profileHref}
              onClick={() => setIsOpen(false)}
              role="menuitem"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#444444] hover:text-[#111111] hover:bg-[#FAF7F2] transition-colors"
            >
              <User className="w-4 h-4 text-[#111111]" />
              <span>Profile</span>
            </Link>

            <Link
              href={profileHref}
              onClick={() => setIsOpen(false)}
              role="menuitem"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#444444] hover:text-[#111111] hover:bg-[#FAF7F2] transition-colors"
            >
              <Settings className="w-4 h-4 text-[#111111]" />
              <span>My Account</span>
            </Link>

            <Link
              href={settingsHref}
              onClick={() => setIsOpen(false)}
              role="menuitem"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#444444] hover:text-[#111111] hover:bg-[#FAF7F2] transition-colors"
            >
              <Settings className="w-4 h-4 text-[#111111]" />
              <span>Settings</span>
            </Link>

            <Link
              href={notificationsHref}
              onClick={() => setIsOpen(false)}
              role="menuitem"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#444444] hover:text-[#111111] hover:bg-[#FAF7F2] transition-colors"
            >
              <Bell className="w-4 h-4 text-[#111111]" />
              <span>Notifications</span>
            </Link>

            <Link
              href={helpHref}
              onClick={() => setIsOpen(false)}
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
  );
}
