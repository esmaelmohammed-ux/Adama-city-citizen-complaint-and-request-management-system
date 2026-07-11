import { PageHeader } from '../../components/UI';
import { formatDate } from '../../utils/storage';
import { useApp } from '../../context/AppContext';

export default function NotificationsPage({ basePath = '/citizen/notifications' }) {
  const { currentUser, notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const mine = notifications.filter((n) => n.userId === currentUser.id);

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${mine.filter((n) => !n.isRead).length} unread`}
        action={
          mine.some((n) => !n.isRead) && (
            <button type="button" className="btn btn-outline btn-sm" onClick={markAllNotificationsRead}>
              Mark all read
            </button>
          )
        }
      />

      <div className="notification-list">
        {mine.length === 0 ? (
          <p className="muted">No notifications yet.</p>
        ) : (
          mine.map((n) => (
            <div key={n.id} className={`notification-item ${n.isRead ? '' : 'unread'}`}>
              <div>
                <strong>{n.title}</strong>
                <p>{n.message}</p>
                <small>{formatDate(n.createdAt)}</small>
              </div>
              {!n.isRead && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => markNotificationRead(n.id)}>
                  Mark read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
