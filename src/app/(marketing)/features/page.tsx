import { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Features",
  description: "Discover all the powerful features SmartCare offers for both patients and doctors.",
};

export default function FeaturesPage() {
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-16 text-center max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Platform Features</h1>
        <p className="text-xl text-gray-600">
          SmartCare provides a comprehensive suite of tools designed to make healthcare management seamless for everyone involved.
        </p>
      </div>

      <div className="bg-slate-50 py-16">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12">
          {/* For Patients */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">For Patients</h2>
            <ul className="space-y-4">
              {[
                "Find and connect with verified specialists.",
                "Book and manage appointments 24/7.",
                "Access your medical records and lab results securely.",
                "Receive digital prescriptions directly from your doctor.",
                "Get real-time notifications about your care plan.",
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-teal-500 shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* For Doctors */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">For Doctors</h2>
            <ul className="space-y-4">
              {[
                "Manage your availability and schedule effortlessly.",
                "Keep detailed consultation notes for every visit.",
                "Maintain a secure, unified database of patient records.",
                "Issue digital prescriptions seamlessly.",
                "Build a verified public profile to attract new patients.",
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
