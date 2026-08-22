import { PageHeader, StatCard } from '../../components/UI';
import { COMPLAINT_CATEGORIES } from '../../constants';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminReportsPage() {
  const { complaints, departments } = useApp();
  const { t } = useLanguage();

  const byStatus = (status) => complaints.filter((x) => x.status === status).length;

  return (
    <div>
      <PageHeader title={t('admin.reportsTitle')} subtitle={t('admin.reportsSubtitle')} />

      <div className="stats-grid">
        <StatCard label={t('admin.totalRecords')} value={complaints.length} icon="📊" />
        <StatCard label={t('status.pending')} value={byStatus('pending')} icon="⏳" tone="warning" />
        <StatCard label={t('status.in_progress')} value={byStatus('in_progress')} icon="🔄" tone="info" />
        <StatCard label={t('status.resolved')} value={byStatus('resolved')} icon="✅" tone="success" />
        <StatCard label={t('status.rejected')} value={byStatus('rejected')} icon="❌" />
        <StatCard label={t('status.closed')} value={byStatus('closed')} icon="📁" />
      </div>

      <h2 className="section-title">{t('admin.byCategory')}</h2>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('table.category')}</th>
              <th>{t('table.count')}</th>
            </tr>
          </thead>
          <tbody>
            {COMPLAINT_CATEGORIES.map((cat) => (
              <tr key={cat}>
                <td>{t(`categories.${cat}`)}</td>
                <td>{complaints.filter((c) => c.category === cat).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="section-title">{t('admin.byDepartment')}</h2>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('table.department')}</th>
              <th>{t('table.complaints')}</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>{complaints.filter((c) => c.departmentId === d.id).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
