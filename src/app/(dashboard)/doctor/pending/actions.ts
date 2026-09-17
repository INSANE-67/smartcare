"use server";

/**
 * This file previously contained checkDoctorStatusAction which called
 * revalidatePath("/", "layout") + redirect("/doctor") unconditionally.
 *
 * That caused an infinite RSC fetch loop: when the doctor was still unverified,
 * /doctor layout would redirect back to /doctor/pending, which triggered another
 * RSC fetch, which re-ran the action, ad infinitum (60+ requests).
 *
 * The action has been replaced by checkDoctorVerificationAction in
 * @/lib/actions/doctor — it returns a boolean and does NO redirect/revalidate.
 * Navigation is handled purely client-side in CheckStatusButton.
 *
 * Re-exported here for any legacy imports.
 */
export { checkDoctorVerificationAction as checkDoctorStatusAction } from "@/lib/actions/doctor";
