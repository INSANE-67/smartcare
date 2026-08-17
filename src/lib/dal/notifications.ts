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
 * Creates a notification securely using the Admin client to bypass RLS.
 * Since users often trigger notifications for *other* users, standard RLS
 * will block the insert. This must only be called from secure Server Actions.
 */
export async function createNotification(data: NotificationInsert): Promise<void> {
  const adminClient = createSupabaseAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await adminClient
    .from("notifications")
    .insert(data as any);

  if (error) {
    console.error("Failed to create notification:", error);
    // We log but don't strictly throw to avoid breaking the main user flow
    // (e.g. failing an appointment booking just because the notification failed).
  }
}
