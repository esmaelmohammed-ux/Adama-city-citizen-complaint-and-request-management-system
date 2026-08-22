import { Link, useNavigate } from 'react-router-dom';
import { PageHeader, StatCard } from '../../components/UI';
import SubmissionTable from '../../components/SubmissionTable';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { complaints, users, departments } = useApp();
  const { t } = useLanguage();
  const pending = complaints.filter((x) => x.status === 'pending').length;
  const inProgress = complaints.filter((x) => x.status === 'in_progress').length;
  const citizens = users.filter((u) => u.role === 'citizen').length;

  return (
    <div>
      <PageHeader
        title={t('admin.dashboardTitle')}
        subtitle={t('admin.dashboardSubtitle')}
      />

      <div className="stats-grid">
        <StatCard label={t('admin.totalComplaints')} value={complaints.length} icon="📢" />
        <StatCard label={t('admin.pendingReview')} value={pending} icon="⏳" tone="warning" />
        <StatCard label={t('admin.inProgress')} value={inProgress} icon="🔄" tone="info" />
        <StatCard label={t('admin.registeredCitizens')} value={citizens} icon="👥" />
        <StatCard label={t('admin.departments')} value={departments.length} icon="🏛️" tone="success" />
      </div>

      <h2 className="section-title">{t('admin.recentPending')}</h2>
      <SubmissionTable
        items={complaints.filter((c) => c.status === 'pending').slice(0, 5)}
        showCitizen
        users={users}
        departments={departments}
        onView={() => navigate('/admin/complaints')}
      />
      <p className="mt-1">
        <Link to="/admin/complaints">{t('admin.viewAllComplaints')}</Link>
      </p>
    </div>
  );
}
