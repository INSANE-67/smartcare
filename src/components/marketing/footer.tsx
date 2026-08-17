import Link from "next/link";
import { Activity } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="bg-slate-50 border-t border-gray-200 py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-1">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <Activity className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl tracking-tight text-gray-900">SmartCare</span>
          </Link>
          <p className="text-sm text-gray-500">
            AI-powered healthcare management, making visits easier and smarter for both patients and doctors.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Platform</h3>
          <ul className="space-y-2">
            <li><Link href="/features" className="text-sm text-gray-600 hover:text-blue-600">Features</Link></li>
            <li><Link href="/doctors" className="text-sm text-gray-600 hover:text-blue-600">Our Doctors</Link></li>
            <li><Link href="/about" className="text-sm text-gray-600 hover:text-blue-600">About Us</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
          <ul className="space-y-2">
            <li><Link href="/faq" className="text-sm text-gray-600 hover:text-blue-600">FAQ</Link></li>
            <li><Link href="/contact" className="text-sm text-gray-600 hover:text-blue-600">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
          <ul className="space-y-2">
            <li><Link href="/privacy" className="text-sm text-gray-600 hover:text-blue-600">Privacy Policy</Link></li>
            <li><Link href="/terms" className="text-sm text-gray-600 hover:text-blue-600">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-gray-200">
        <p className="text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} SmartCare. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
