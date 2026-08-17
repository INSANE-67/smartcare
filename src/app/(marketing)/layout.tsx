import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: {
    template: "%s | SmartCare",
    default: "SmartCare - AI-Powered Healthcare",
  },
  description: "SmartCare provides modern, AI-powered healthcare management for patients and doctors.",
  openGraph: {
    title: "SmartCare - AI-Powered Healthcare",
    description: "SmartCare provides modern, AI-powered healthcare management for patients and doctors.",
    url: "https://smartcare.example.com",
    siteName: "SmartCare",
    type: "website",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
