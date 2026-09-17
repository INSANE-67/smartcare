"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/dal/auth";
import { updateProfile, updateDoctorProfile } from "@/lib/dal/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const patientSettingsSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters."),
  phone: z.string().optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional().nullable(),
  email_notifications: z.boolean(),
  in_app_notifications: z.boolean(),
});

const doctorSettingsSchema = patientSettingsSchema.extend({
  specialty: z.string().min(2, "Specialty is required"),
  clinic_name: z.string().optional().nullable(),
  clinic_address: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  appointment_duration: z.number().min(10).max(120),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords do not match.",
  path: ["confirm_password"],
});

export async function updatePatientSettingsAction(formData: FormData) {
  try {
    const user = await requireAuth();
    
    const rawData = {
      full_name: formData.get("full_name"),
      phone: formData.get("phone"),
      date_of_birth: formData.get("date_of_birth"),
      gender: formData.get("gender"),
      email_notifications: formData.get("email_notifications") === "true",
      in_app_notifications: formData.get("in_app_notifications") === "true",
    };

    const parsed = patientSettingsSchema.safeParse(rawData);
    if (!parsed.success) {
      return { fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const { email_notifications, in_app_notifications, ...profileData } = parsed.data;

    await updateProfile(user.id, {
      ...profileData,
      notification_preferences: {
        email: email_notifications,
        in_app: in_app_notifications,
      }
    });

    revalidatePath("/patient/settings");
    revalidatePath("/", "layout");
    
    return { success: true, message: "Settings updated successfully." };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "An error occurred" };
  }
}

export async function updateDoctorSettingsAction(formData: FormData) {
  try {
    const user = await requireAuth();
    if (user.role !== "doctor") return { error: "Unauthorized" };
    
    const rawData = {
      full_name: formData.get("full_name"),
      phone: formData.get("phone"),
      date_of_birth: formData.get("date_of_birth"),
      gender: formData.get("gender"),
      email_notifications: formData.get("email_notifications") === "true",
      in_app_notifications: formData.get("in_app_notifications") === "true",
      specialty: formData.get("specialty"),
      clinic_name: formData.get("clinic_name"),
      clinic_address: formData.get("clinic_address"),
      bio: formData.get("bio"),
      appointment_duration: Number(formData.get("appointment_duration")),
    };

    const parsed = doctorSettingsSchema.safeParse(rawData);
    if (!parsed.success) {
      return { fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const { 
      email_notifications, in_app_notifications, 
      specialty, clinic_name, clinic_address, bio, appointment_duration,
      ...profileData 
    } = parsed.data;

    await updateProfile(user.id, {
      ...profileData,
      notification_preferences: {
        email: email_notifications,
        in_app: in_app_notifications,
      }
    });

    await updateDoctorProfile(user.id, {
      specialty,
      clinic_name,
      clinic_address,
      bio,
      appointment_duration,
    });

    revalidatePath("/doctor/settings");
    revalidatePath("/patient/doctors");
    revalidatePath("/", "layout");
    
    return { success: true, message: "Settings updated successfully." };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "An error occurred" };
  }
}

export async function changePasswordAction(formData: FormData) {
  try {
    await requireAuth();
    
    const rawData = {
      current_password: formData.get("current_password"),
      new_password: formData.get("new_password"),
      confirm_password: formData.get("confirm_password"),
    };

    const parsed = passwordSchema.safeParse(rawData);
    if (!parsed.success) {
      return { fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const supabase = await createSupabaseServerClient();
    
    // 1. Verify current password by signing in
    // Note: getUser doesn't return the email directly in the app session if we only rely on the profile.
    // Let's get the email from auth.getUser()
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser?.email) {
      return { error: "Authentication error. Email not found." };
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: authUser.email,
      password: parsed.data.current_password,
    });

    if (signInError) {
      return { error: "Incorrect current password." };
    }

    // 2. Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: parsed.data.new_password,
    });

    if (updateError) {
      return { error: `Failed to update password: ${updateError.message}` };
    }

    return { success: true, message: "Password updated successfully." };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "An error occurred" };
  }
}
