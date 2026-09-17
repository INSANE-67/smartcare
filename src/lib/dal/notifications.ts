import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { NotificationRow, NotificationInsert } from "@/types/index";

export async function getUserNotifications(userId: string): Promise<NotificationRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  }

  return data ?? [];
}

export async function markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true } as never)
    .eq("id", notificationId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to mark notification as read: ${error.message}`);
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true } as never)
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    throw new Error(`Failed to mark all notifications as read: ${error.message}`);
  }
}

/**
 * Creates a notification using the Admin client when available (bypasses RLS
 * for cross-user inserts), falling back to the server client if the service-role
 * key is not configured in the environment.
 *
 * This function is intentionally non-fatal: a failed notification must never
 * break the primary user flow (booking, confirming, etc.).
 */
export async function createNotification(data: NotificationInsert): Promise<void> {
  try {
    // Prefer the admin client so we can write to another user's notifications row.
    const adminClient = createSupabaseAdminClient();
    const { error } = await adminClient
      .from("notifications")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(data as any);

    if (error) {
      console.error("Failed to create notification (admin client):", error);
    }
  } catch (adminErr) {
    // Admin client unavailable (service-role key not set) — fall back to the
    // authenticated server client. This will succeed only if the calling user's
    // RLS allows inserting a notification for the target user_id (e.g. self-notify).
    console.warn(
      "Admin client unavailable for createNotification, falling back to server client:",
      adminErr instanceof Error ? adminErr.message : adminErr
    );
    try {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase
        .from("notifications")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert(data as any);

      if (error) {
        console.error("Failed to create notification (server client fallback):", error);
      }
    } catch (fallbackErr) {
      console.error("Notification fallback also failed:", fallbackErr);
    }
  }
}

