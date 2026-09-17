import Link from "next/link";
import { Activity } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="bg-[#FAF7F2] border-t border-[#E8DED2] pt-16 pb-12 mt-auto">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-[#E8DED2]">
          {/* Logo & Platform Summary */}
          <div className="space-y-3 max-w-sm">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center shadow-xs">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-[#111111]">
                SmartCare
              </span>
            </Link>
            <p className="text-xs text-[#555555] leading-relaxed">
              A secure healthcare platform connecting patients and accredited physicians with clear electronic health records and clinical coordination.
            </p>
          </div>

          {/* Clean Navigation Links */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-xs font-medium text-[#111111]">
            <Link href="/signup" className="hover:underline underline-offset-4 transition-all">
              Patients
            </Link>
            <Link href="/doctors" className="hover:underline underline-offset-4 transition-all">
              Doctors
            </Link>
            <Link href="/features" className="hover:underline underline-offset-4 transition-all">
              Features
            </Link>
            <Link href="/about" className="hover:underline underline-offset-4 transition-all">
              About
            </Link>
            <Link href="/privacy" className="hover:underline underline-offset-4 transition-all">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:underline underline-offset-4 transition-all">
              Terms
            </Link>
            <Link href="/contact" className="hover:underline underline-offset-4 transition-all">
              Contact
            </Link>
          </div>
        </div>

        {/* Minimal Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#777777]">
          <p>&copy; SmartCare</p>
          <div className="flex items-center gap-2 text-[#555555] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
            <span>End-to-End Encrypted Health Records</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
