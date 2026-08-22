import { PageHeader } from '../../components/UI';
import { formatDate } from '../../utils/storage';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminActivityPage() {
  const { activityLogs, users } = useApp();
  const { t } = useLanguage();
  const getUser = (id) => users.find((u) => u.id === id)?.fullName || t('commonApp.unknown');

  return (
    <div>
      <PageHeader title={t('admin.activityTitle')} subtitle={t('admin.activitySubtitle')} />

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('table.date')}</th>
              <th>{t('table.user')}</th>
              <th>{t('table.action')}</th>
              <th>{t('table.details')}</th>
            </tr>
          </thead>
          <tbody>
            {activityLogs.map((log) => (
              <tr key={log.id}>
                <td>{formatDate(log.createdAt)}</td>
                <td>{getUser(log.userId)}</td>
                <td>{log.action.replaceAll('_', ' ')}</td>
                <td>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
