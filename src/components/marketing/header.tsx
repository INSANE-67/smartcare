import Link from "next/link";
import { Activity, ArrowUpRight } from "lucide-react";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E8DED2] bg-[#FAF7F2]/90 backdrop-blur-md transition-all">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between max-w-7xl">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-[#111111]">
            SmartCare
          </span>
        </Link>
        
        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/about"
            className="text-sm font-medium text-[#111111] hover:underline underline-offset-4 transition-all"
          >
            About
          </Link>
          <Link
            href="/features"
            className="text-sm font-medium text-[#111111] hover:underline underline-offset-4 transition-all"
          >
            Features
          </Link>
          <Link
            href="/doctors"
            className="text-sm font-medium text-[#111111] hover:underline underline-offset-4 transition-all"
          >
            Verified Specialists
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-[#111111] hover:underline underline-offset-4 px-3 py-2 transition-all hidden sm:block"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="btn-primary text-xs tracking-wide"
          >
            <span>Get Started</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
