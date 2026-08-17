import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartCare",
  description:
    "AI-Powered Healthcare Management & Patient Assistance Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="antialiased min-h-screen flex flex-col relative bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50">
        <Toaster position="bottom-right" richColors theme="system" />
        {children}
      </body>
    </html>
  );
}
