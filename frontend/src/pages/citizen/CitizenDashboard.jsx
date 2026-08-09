import { Link } from 'react-router-dom';
import { PageHeader, StatCard } from '../../components/UI';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

export default function CitizenDashboard() {
  const { currentUser, complaints, serviceRequests } = useApp();
  const { t } = useLanguage();
  const mine = (list) => list.filter((x) => x.citizenId === currentUser.id);
  const myComplaints = mine(complaints);
  const myRequests = mine(serviceRequests);
  const all = [...myComplaints, ...myRequests];
  const pending = all.filter((x) => x.status === 'pending').length;
  const inProgress = all.filter((x) => x.status === 'in_progress').length;
  const resolved = all.filter((x) => ['resolved', 'closed'].includes(x.status)).length;

  return (
    <div>
      <PageHeader
        title={t('citizen.hello', { name: currentUser.fullName.split(' ')[0] })}
        subtitle={t('citizen.dashboardSubtitle')}
        action={
          <div className="btn-group">
            <Link to="/citizen/complaints/new" className="btn btn-primary">
              {t('citizen.newComplaint')}
            </Link>
            <Link to="/citizen/requests/new" className="btn btn-outline">
              {t('citizen.newRequest')}
            </Link>
          </div>
        }
      />

      <div className="stats-grid">
        <StatCard label={t('citizen.totalSubmissions')} value={all.length} icon="📋" />
        <StatCard label={t('citizen.pending')} value={pending} icon="⏳" tone="warning" />
        <StatCard label={t('citizen.inProgress')} value={inProgress} icon="🔄" tone="info" />
        <StatCard label={t('citizen.resolved')} value={resolved} icon="✅" tone="success" />
      </div>

      <div className="quick-links">
        <Link to="/citizen/submissions" className="quick-link-card">
          <strong>{t('citizen.mySubmissionsCard')}</strong>
          <span>{t('citizen.mySubmissionsCardDesc')}</span>
        </Link>
        <Link to="/citizen/notifications" className="quick-link-card">
          <strong>{t('citizen.notificationsCard')}</strong>
          <span>{t('citizen.notificationsCardDesc')}</span>
        </Link>
      </div>
    </div>
  );
}
