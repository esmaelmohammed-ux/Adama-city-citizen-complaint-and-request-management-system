import { PageHeader, StatCard } from '../../components/UI';
import { COMPLAINT_CATEGORIES } from '../../constants';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminReportsPage() {
  const { complaints, serviceRequests, departments } = useApp();
  const { t } = useLanguage();
  const all = [...complaints, ...serviceRequests];

  const byStatus = (status) => all.filter((x) => x.status === status).length;

  return (
    <div>
      <PageHeader title="Reports" subtitle="Summary statistics for decision-making" />

      <div className="stats-grid">
        <StatCard label="Total records" value={all.length} icon="📊" />
        <StatCard label="Pending" value={byStatus('pending')} icon="⏳" tone="warning" />
        <StatCard label="In progress" value={byStatus('in_progress')} icon="🔄" tone="info" />
        <StatCard label="Resolved" value={byStatus('resolved')} icon="✅" tone="success" />
        <StatCard label="Rejected" value={byStatus('rejected')} icon="❌" />
        <StatCard label="Closed" value={byStatus('closed')} icon="📁" />
      </div>

      <h2 className="section-title">Complaints by category</h2>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Count</th>
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

      <h2 className="section-title">Records by department</h2>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Department</th>
              <th>Complaints</th>
              <th>Requests</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>{complaints.filter((c) => c.departmentId === d.id).length}</td>
                <td>{serviceRequests.filter((r) => r.departmentId === d.id).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
