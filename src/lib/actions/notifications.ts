"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/dal/auth";
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/dal/notifications";

export async function markNotificationReadAction(notificationId: string, formData?: FormData) {
  try {
    const user = await requireAuth();
    await markNotificationAsRead(notificationId, user.id);
    
    // Invalidate everything to update the bell icon count
    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "An error occurred" };
  }
}

export async function markAllNotificationsReadAction(formData?: FormData) {
  try {
    const user = await requireAuth();
    await markAllNotificationsAsRead(user.id);
    
    // Invalidate everything to update the bell icon count
    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "An error occurred" };
  }
}
