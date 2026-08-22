import { useEffect } from 'react';
import { PageHeader } from '../../components/UI';
import { formatDate } from '../../utils/storage';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

export default function NotificationsPage() {
  const { currentUser, notifications, initializing, markAllNotificationsRead } = useApp();
  const { t } = useLanguage();
  const mine = notifications.filter((n) => n.userId === currentUser.id);
  const unread = mine.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (initializing || unread === 0) return;
    markAllNotificationsRead();
  }, [initializing, unread, markAllNotificationsRead]);

  return (
    <div>
      <PageHeader
        title={t('citizen.notificationsTitle')}
        subtitle={t('citizen.unreadCount', { count: unread })}
      />

      <div className="notification-list">
        {mine.length === 0 ? (
          <p className="muted">{t('citizen.noNotifications')}</p>
        ) : (
          mine.map((n) => (
            <div key={n.id} className={`notification-item ${n.isRead ? '' : 'unread'}`}>
              <div>
                <strong>{n.title}</strong>
                <p>{n.message}</p>
                <small>{formatDate(n.createdAt)}</small>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
