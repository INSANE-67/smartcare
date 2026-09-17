"use client";

import { useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { signOut } from "@/lib/actions/auth";

interface LogoutButtonProps {
  className?: string;
  iconOnly?: boolean;
  showText?: boolean;
  children?: React.ReactNode;
}

export function LogoutButton({
  className,
  iconOnly = false,
  showText = true,
  children,
}: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await signOut();
    });
  };

  const defaultClasses = iconOnly
    ? "p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 rounded-full transition-colors inline-flex items-center justify-center disabled:opacity-50"
    : "inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors w-full disabled:opacity-50";

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      title="Log out"
      aria-label="Log out"
      className={className || defaultClasses}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
      ) : (
        <LogOut className="w-4 h-4 flex-shrink-0" />
      )}
      {!iconOnly && showText && (
        <span>{children || (isPending ? "Signing out…" : "Log Out")}</span>
      )}
    </button>
  );
}
