import { requireAuth } from "@/lib/dal/auth";
import { getUserNotifications } from "@/lib/dal/notifications";
import { markNotificationReadAction, markAllNotificationsReadAction } from "@/lib/actions/notifications";

export default async function NotificationsPage() {
  const user = await requireAuth();
  const notifications = await getUserNotifications(user.id);
  
  return (
    <div className="dash-container">
      <header className="dash-header">
        <div>
          <h1 className="dash-title">Notifications</h1>
          <p className="dash-subtitle">View and manage your recent activity.</p>
        </div>
        {notifications.some(n => !n.is_read) && (
          <form action={markAllNotificationsReadAction as unknown as undefined}>
            <button type="submit" className="btn btn-secondary">Mark All as Read</button>
          </form>
        )}
      </header>

      <div className="card">
        {notifications.length === 0 ? (
          <p className="text-gray-500 p-6 text-center">You have no notifications.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <li key={notification.id} className={`p-4 ${!notification.is_read ? "bg-indigo-50" : ""}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`text-sm font-medium ${!notification.is_read ? "text-indigo-900" : "text-gray-900"}`}>
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(notification.created_at).toLocaleString()}</p>
                  </div>
                  {!notification.is_read && (
                    <form action={markNotificationReadAction.bind(null, notification.id) as unknown as undefined}>
                      <button type="submit" className="text-sm text-indigo-600 hover:text-indigo-800">
                        Mark as read
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
