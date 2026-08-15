/**
 * SmartCare — Auth Server Actions
 *
 * Server Actions for authentication: login, signup, logout.
 * All actions run exclusively on the server — no secrets or logic leak to the client.
 *
 * Validation: Zod is used server-side. The client receives typed error messages
 * without any schema exposure.
 *
 * Post-login redirect: After successful login, the user's role is fetched from
 * the database and they are redirected to their role-specific dashboard.
 *
 * Profile creation: Handled automatically by the handle_new_auth_user trigger
 * in the database (migration 002). The signupAction passes full_name via
 * raw_user_meta_data so the trigger can populate the profile row.
 */
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDashboardPath } from "@/lib/dal/auth";

// ─── Validation Schemas ───────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }).trim(),
  password: z.string().min(1, { message: "Password is required." }),
});

const signupSchema = z.object({
  full_name: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters." })
    .max(100, { message: "Full name must be at most 100 characters." })
    .trim(),
  email: z.string().email({ message: "Please enter a valid email address." }).trim(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .regex(/[a-zA-Z]/, { message: "Password must contain at least one letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." }),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match.",
  path: ["confirm_password"],
});

// ─── Action Result Types ───────────────────────────────────────────────────────

export interface AuthActionState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

// ─── loginAction ─────────────────────────────────────────────────────────────

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  // Server-side validation
  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { email, password } = parsed.data;
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Map Supabase error codes to user-friendly messages
    if (
      error.code === "invalid_credentials" ||
      error.message.includes("Invalid login credentials")
    ) {
      return { error: "Incorrect email or password. Please try again." };
    }
    if (error.message.includes("Email not confirmed")) {
      return { error: "Please confirm your email address before logging in." };
    }
    return { error: error.message };
  }

  // Fetch profile to determine redirect destination
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication failed. Please try again." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single() as { data: { role: import("@/types").UserRole; is_active: boolean } | null; error: unknown };

  if (profileError || !profile) {
    return { error: "Profile not found. Please contact support." };
  }

  if (!profile.is_active) {
    await supabase.auth.signOut();
    return { error: "Your account has been deactivated. Please contact support." };
  }

  // Invalidate the entire layout cache so server components re-fetch the session
  revalidatePath("/", "layout");

  // Redirect to role-specific dashboard
  redirect(getDashboardPath(profile.role));
}

// ─── signupAction ─────────────────────────────────────────────────────────────

export async function signupAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const rawData = {
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  };

  const parsed = signupSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { full_name, email, password } = parsed.data;
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Passed to handle_new_auth_user trigger via raw_user_meta_data
      data: { full_name },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "An account with this email already exists." };
    }
    return { error: error.message };
  }

  // Redirect to login with a prompt to confirm email
  // (Email confirmation behaviour depends on Supabase project settings)
  redirect("/login?message=Account+created.+Check+your+email+to+confirm+before+logging+in.");
}

// ─── logoutAction ─────────────────────────────────────────────────────────────

export async function logoutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
