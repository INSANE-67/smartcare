import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SmartCare — Modern Healthcare Platform",
  description:
    "A unified, modern healthcare platform connecting patients and physicians with real-time electronic health records, smart scheduling, and clinical coordination.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="antialiased min-h-screen flex flex-col relative bg-[#FAF7F2] text-[#111111] font-sans">
        <Toaster position="bottom-right" richColors theme="light" />
        {children}
      </body>
    </html>
  );
}
