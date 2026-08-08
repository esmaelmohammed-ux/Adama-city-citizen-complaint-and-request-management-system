import { Link, useNavigate } from 'react-router-dom';
import { PageHeader, StatCard } from '../../components/UI';
import SubmissionTable from '../../components/SubmissionTable';
import { useApp } from '../../context/AppContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { complaints, serviceRequests, users, departments } = useApp();
  const pending = [...complaints, ...serviceRequests].filter((x) => x.status === 'pending').length;
  const inProgress = [...complaints, ...serviceRequests].filter((x) => x.status === 'in_progress').length;
  const citizens = users.filter((u) => u.role === 'citizen').length;

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Overview of citizen complaints and service requests"
      />

      <div className="stats-grid">
        <StatCard label="Total complaints" value={complaints.length} icon="📢" />
        <StatCard label="Service requests" value={serviceRequests.length} icon="📋" />
        <StatCard label="Pending review" value={pending} icon="⏳" tone="warning" />
        <StatCard label="In progress" value={inProgress} icon="🔄" tone="info" />
        <StatCard label="Registered citizens" value={citizens} icon="👥" />
        <StatCard label="Departments" value={departments.length} icon="🏛️" tone="success" />
      </div>

      <h2 className="section-title">Recent pending complaints</h2>
      <SubmissionTable
        items={complaints.filter((c) => c.status === 'pending').slice(0, 5)}
        type="complaint"
        showCitizen
        users={users}
        departments={departments}
        onView={() => navigate('/admin/complaints')}
      />
      <p className="mt-1">
        <Link to="/admin/complaints">View all complaints →</Link>
      </p>
    </div>
  );
}
