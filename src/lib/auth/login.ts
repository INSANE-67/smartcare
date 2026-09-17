import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkUserRole, verifyRoleAccess } from "./checkRole";

export interface LoginOptions {
  email: string;
  password: string;
  portal?: "patient" | "doctor" | "admin";
}

export interface LoginResult {
  success: boolean;
  error?: string;
  redirectUrl?: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Authenticates user credentials with Supabase Auth and validates multi-portal access.
 */
export async function authenticateWithPortal({
  email,
  password,
  portal = "patient",
}: LoginOptions): Promise<LoginResult> {
  const supabase = await createSupabaseServerClient();

  // 1. Authenticate with Supabase
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    if (
      authError?.code === "invalid_credentials" ||
      authError?.message?.includes("Invalid login credentials")
    ) {
      return { success: false, error: "Incorrect email or password. Please try again." };
    }
    if (authError?.message?.includes("Email not confirmed")) {
      return { success: false, error: "Please verify your email before logging in." };
    }
    return { success: false, error: authError?.message || "Authentication failed." };
  }

  const userId = authData.user.id;

  // 2. Validate Role & Portal
  const roleData = await checkUserRole(userId);
  if (!roleData) {
    return {
      success: true,
      redirectUrl: "/patient",
      user: { id: userId, email, role: "patient" },
    };
  }

  if (!roleData.isActive) {
    await supabase.auth.signOut();
    return {
      success: false,
      error: "Your account has been deactivated. Please contact support.",
    };
  }

  // 3. Check Portal Match
  if (portal === "doctor") {
    if (roleData.role !== "doctor" && roleData.role !== "admin") {
      await supabase.auth.signOut();
      return {
        success: false,
        error: "This portal is reserved for registered Physicians. Please sign in via the Patient portal.",
      };
    }

    if (roleData.role === "doctor" && !roleData.isVerified) {
      return {
        success: true,
        redirectUrl: "/doctor/pending",
        user: { id: userId, email, role: roleData.role },
      };
    }

    return {
      success: true,
      redirectUrl: "/doctor",
      user: { id: userId, email, role: roleData.role },
    };
  }

  if (portal === "admin") {
    if (roleData.role !== "admin") {
      await supabase.auth.signOut();
      return {
        success: false,
        error: "Access restricted. Administrator credentials are required for this portal.",
      };
    }

    return {
      success: true,
      redirectUrl: "/admin",
      user: { id: userId, email, role: roleData.role },
    };
  }

  // Patient portal default
  if (roleData.role === "doctor") {
    return {
      success: true,
      redirectUrl: roleData.isVerified ? "/doctor" : "/doctor/pending",
      user: { id: userId, email, role: roleData.role },
    };
  }

  if (roleData.role === "admin") {
    return {
      success: true,
      redirectUrl: "/admin",
      user: { id: userId, email, role: roleData.role },
    };
  }

  return {
    success: true,
    redirectUrl: "/patient",
    user: { id: userId, email, role: "patient" },
  };
}
