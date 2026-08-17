import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about the mission and vision behind SmartCare.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About SmartCare</h1>
        <p className="text-xl text-gray-600">
          Our mission is to democratize healthcare by bridging the gap between patients and doctors through smart, accessible technology.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
          <p className="text-gray-600 mb-4">
            We envision a world where managing your health is as simple as managing your calendar. By reducing administrative friction, we allow doctors to focus on what they do best: providing care.
          </p>
          <p className="text-gray-600">
            For patients, SmartCare means no more waiting on hold, no more lost medical records, and no more confusion about your next steps in care.
          </p>
        </div>
        <div className="bg-slate-100 rounded-2xl h-80 flex items-center justify-center">
          {/* Placeholder for an illustration or team photo */}
          <span className="text-slate-400">Team Photo Placeholder</span>
        </div>
      </div>
    </div>
  );
}
