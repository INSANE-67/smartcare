/**
 * SmartCare — Profile Server Actions
 *
 * updateProfileAction       — update profiles row (name, phone, dob, gender)
 * updateDoctorProfileAction — update doctors row (specialty, dept, bio, years)
 * uploadAvatarAction        — upload avatar to Supabase Storage, update avatar_url
 *
 * Security:
 *   - All actions run on the server using the caller's Supabase session.
 *   - RLS on profiles and doctors enforces ownership:
 *       profiles_update_own  → cannot change role or is_active
 *       doctors_update_own   → cannot change is_verified, verified_by, verified_at
 *   - Zod validates all inputs before any database call.
 *   - Avatar upload path is always scoped to `<user_id>/avatar.<ext>` — the
 *     Storage RLS policy prevents writing to another user's path.
 */
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// ─── Validation schemas ───────────────────────────────────────────────────────

const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters." })
    .max(100, { message: "Full name must be at most 100 characters." })
    .trim(),
  phone: z
    .string()
    .max(30, { message: "Phone number is too long." })
    .trim()
    .optional()
    .or(z.literal("")),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be in YYYY-MM-DD format." })
    .optional()
    .or(z.literal("")),
  gender: z
    .enum(["male", "female", "other", "prefer_not_to_say"])
    .optional()
    .or(z.literal("")),
});

const doctorProfileSchema = z.object({
  specialty: z
    .string()
    .min(2, { message: "Specialty must be at least 2 characters." })
    .max(100)
    .trim(),
  department: z
    .string()
    .max(100)
    .trim()
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .max(1000, { message: "Bio must be at most 1000 characters." })
    .trim()
    .optional()
    .or(z.literal("")),
  years_of_experience: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" || v === undefined ? null : Number(v)))
    .pipe(
      z.number().int().min(0).max(60).nullable()
    ),
});

// ─── Action result type ───────────────────────────────────────────────────────

export interface ProfileActionState {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

// ─── updateProfileAction ──────────────────────────────────────────────────────

export async function updateProfileAction(
  _prev: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const raw = {
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    date_of_birth: formData.get("date_of_birth"),
    gender: formData.get("gender"),
  };

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { full_name, phone, date_of_birth, gender } = parsed.data;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated. Please sign in again." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name,
      phone: phone || null,
      date_of_birth: date_of_birth || null,
      gender: (gender as "male" | "female" | "other" | "prefer_not_to_say") || null,
    } as never)
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/patient/profile");
  revalidatePath("/doctor/profile");
  revalidatePath("/", "layout"); // refresh sidebar user name

  return { success: true };
}

// ─── updateDoctorProfileAction ────────────────────────────────────────────────

export async function updateDoctorProfileAction(
  _prev: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const raw = {
    specialty: formData.get("specialty"),
    department: formData.get("department"),
    bio: formData.get("bio"),
    years_of_experience: formData.get("years_of_experience"),
  };

  const parsed = doctorProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { specialty, department, bio, years_of_experience } = parsed.data;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated. Please sign in again." };
  }

  const { error } = await supabase
    .from("doctors")
    .update({
      specialty,
      department: department || null,
      bio: bio || null,
      years_of_experience,
    } as never)
    .eq("profile_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/doctor/profile");
  revalidatePath("/", "layout");

  return { success: true };
}

// ─── uploadAvatarAction ───────────────────────────────────────────────────────

export async function uploadAvatarAction(
  formData: FormData
): Promise<ProfileActionState> {
  const file = formData.get("avatar") as File | null;

  if (!file || file.size === 0) {
    return { error: "No file selected." };
  }

  // Validate file type and size
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Only JPEG, PNG, WebP, or GIF images are allowed." };
  }

  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  if (file.size > MAX_SIZE) {
    return { error: "Image must be smaller than 5 MB." };
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated." };
  }

  // Derive extension from MIME type
  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  // Storage path: <user_id>/avatar.<ext>
  // Storage RLS ensures each user can only write to their own folder.
  const storagePath = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(storagePath, file, {
      upsert: true,        // overwrite existing avatar
      contentType: file.type,
    });

  if (uploadError) {
    if (uploadError.message.includes("Bucket not found")) {
      return {
        error:
          "Avatar storage is not yet configured. Please ask an admin to create the avatars bucket.",
      };
    }
    return { error: uploadError.message };
  }

  // Store the object path (not the signed URL) in the profiles table.
  // The DAL calls getAvatarSignedUrl() at render time to generate a fresh URL.
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: storagePath } as never)
    .eq("id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/patient/profile");
  revalidatePath("/doctor/profile");
  revalidatePath("/", "layout");

  return { success: true };
}
