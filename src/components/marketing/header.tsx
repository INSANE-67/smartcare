import Link from "next/link";
import { Activity } from "lucide-react";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-xl tracking-tight text-gray-900">SmartCare</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">About</Link>
          <Link href="/features" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Features</Link>
          <Link href="/doctors" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Find a Doctor</Link>
          <Link href="/faq" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">FAQ</Link>
          <Link href="/contact" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Contact</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600 hidden md:block">
            Sign In
          </Link>
          <Link href="/signup" className="text-sm font-medium bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition-colors">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
