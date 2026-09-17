import { AuthLayout } from "@/components/auth/AuthLayout";
import type { ReactNode } from "react";

export default function AuthRootLayout({ children }: { children: ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}
