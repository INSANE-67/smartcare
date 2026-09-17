import { requireAuth } from "@/lib/dal/auth";
import { getUserNotifications } from "@/lib/dal/notifications";
import { markNotificationReadAction, markAllNotificationsReadAction } from "@/lib/actions/notifications";
import { Bell, CheckCheck, CheckCircle2, Clock } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = {
  title: "Notifications — SmartCare",
  description: "Stay informed with updates regarding appointments, prescriptions, and health records.",
};

export default async function NotificationsPage() {
  const user = await requireAuth();
  const notifications = await getUserNotifications(user.id);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8DED2]">
        <div className="space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#777777] font-semibold">
            Alerts &amp; Activity
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
            Notifications
          </h1>
          <p className="text-xs text-[#666666]">
            Live feed of appointment confirmations, prescription alerts, and record updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <form action={markAllNotificationsReadAction as unknown as undefined}>
            <button
              type="submit"
              className="btn-secondary py-2 px-4 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-[#111111]" />
              <span>Mark All as Read ({unreadCount})</span>
            </button>
          </form>
        )}
      </div>

      {/* ── Notifications List ── */}
      <div className="bg-white rounded-[18px] border border-[#E8DED2] shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#E8DED2] flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-[#666666] font-semibold">
            Feed Items ({notifications.length})
          </span>
          {unreadCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#111111] text-white">
              {unreadCount} Unread
            </span>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Bell}
              title="No notifications"
              description="You're all caught up. When appointments are scheduled or records are updated, notifications will appear here."
            />
          </div>
        ) : (
          <ul className="divide-y divide-[#E8DED2]">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`p-5 sm:p-6 transition-colors ${
                  !notification.is_read ? "bg-[#FAF7F2]/60" : "hover:bg-[#FAF7F2]/30"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {!notification.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#111111] shrink-0" />
                      )}
                      <h3 className="font-serif font-bold text-sm text-[#111111]">
                        {notification.title}
                      </h3>
                    </div>
                    <p className="text-xs text-[#555555] leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="text-[11px] text-[#777777] font-mono flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(notification.created_at).toLocaleString()}</span>
                    </p>
                  </div>

                  {!notification.is_read && (
                    <form
                      action={markNotificationReadAction.bind(null, notification.id) as unknown as undefined}
                      className="shrink-0"
                    >
                      <button
                        type="submit"
                        className="btn-secondary py-1.5 px-3 rounded-full text-xs font-semibold inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark read</span>
                      </button>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
