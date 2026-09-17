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
import { createSupabaseAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";

// ─── Validation Schemas ───────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }).trim(),
  password: z.string().min(1, { message: "Password is required." }),
});

const signupSchema = z
  .object({
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
    role: z.enum(["patient", "doctor"]).default("patient"),
    license_number: z.string().trim().optional(),
    medical_license: z.string().trim().optional(),
    specialty: z.string().trim().optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  })
  .refine(
    (data) => {
      const license = data.license_number || data.medical_license;
      if (data.role === "doctor" && (!license || license.trim().length === 0)) {
        return false;
      }
      return true;
    },
    {
      message: "Medical license / NPI number is required for doctor registration.",
      path: ["medical_license"],
    }
  );

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

  const portalParam = (formData.get("portal") as "patient" | "doctor" | "admin") || "patient";

  // Server-side validation
  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { email, password } = parsed.data;
  const { authenticateWithPortal } = await import("@/lib/auth/login");

  const result = await authenticateWithPortal({
    email,
    password,
    portal: portalParam,
  });

  if (!result.success || !result.redirectUrl) {
    return { error: result.error || "Authentication failed. Please check your credentials." };
  }

  revalidatePath("/", "layout");
  redirect(result.redirectUrl);
}

export const signInAction = loginAction;

// ─── signupAction ─────────────────────────────────────────────────────────────

export async function signupAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const formRole = (formData.get("role") as string) === "doctor" ? "doctor" : "patient";
  const licenseNumber = (
    formData.get("license_number") ||
    formData.get("medical_license") ||
    formData.get("medicalLicense") ||
    ""
  ).toString().trim();
  const specialtyName = (formData.get("specialty") as string)?.trim() || "";

  const rawData = {
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
    role: formRole,
    license_number: licenseNumber || undefined,
    medical_license: licenseNumber || undefined,
    specialty: specialtyName,
  };

  const parsed = signupSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { full_name, email, password, role } = parsed.data;
  const supabase = await createSupabaseServerClient();
  const is_verified = role === "patient";

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Passed to handle_new_auth_user trigger via raw_user_meta_data
      data: {
        full_name,
        role,
        license_number: role === "doctor" ? licenseNumber : null,
        medical_license: role === "doctor" ? licenseNumber : null,
        specialty: role === "doctor" ? specialtyName : null,
        is_verified,
      },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "An account with this email already exists." };
    }
    return { error: error.message };
  }

  // Explicitly upsert/insert the profile record and doctor record
  if (authData?.user) {
    let client = supabase;
    if (hasServiceRoleKey()) {
      try {
        client = createSupabaseAdminClient() as unknown as typeof supabase;
      } catch (err) {
        console.warn("Using authenticated client for profile setup:", err);
      }
    }

    try {
      // 1. Insert/Upsert into profiles (only valid profile columns)
      await client.from("profiles").upsert([
        {
          id: authData.user.id,
          full_name,
          role,
          is_active: true,
        },
      ] as never);

      // 2. Insert into doctors table if role === 'doctor'
      if (role === "doctor") {
        const finalLicense = licenseNumber || `MD-${authData.user.id.slice(0, 8).toUpperCase()}`;
        const finalSpecialty = specialtyName || "General Practice";

        await client.from("doctors").upsert([
          {
            profile_id: authData.user.id,
            license_number: finalLicense,
            specialty: finalSpecialty,
            is_verified: false,
          },
        ] as never);
      }
    } catch (profileErr) {
      console.error("Profile/Doctor setup during signup:", profileErr);
    }
  }

  // Invalidate layout cache
  revalidatePath("/", "layout");

  // Redirect new doctor directly to /doctor/pending
  if (role === "doctor") {
    redirect("/doctor/pending");
  }

  redirect(`/login?message=${encodeURIComponent("Account created. Please sign in to continue.")}`);
}

// ─── signOut / logoutAction ───────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export const logoutAction = signOut;
