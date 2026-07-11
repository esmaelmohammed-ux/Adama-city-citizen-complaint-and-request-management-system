import { Link } from 'react-router-dom';
import { PageHeader, StatCard } from '../../components/UI';
import { useApp } from '../../context/AppContext';

export default function CitizenDashboard() {
  const { currentUser, complaints, serviceRequests } = useApp();
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
        title={`Hello, ${currentUser.fullName.split(' ')[0]}`}
        subtitle="Manage your complaints and service requests"
        action={
          <div className="btn-group">
            <Link to="/citizen/complaints/new" className="btn btn-primary">New Complaint</Link>
            <Link to="/citizen/requests/new" className="btn btn-outline">New Request</Link>
          </div>
        }
      />

      <div className="stats-grid">
        <StatCard label="Total submissions" value={all.length} icon="📋" />
        <StatCard label="Pending" value={pending} icon="⏳" tone="warning" />
        <StatCard label="In progress" value={inProgress} icon="🔄" tone="info" />
        <StatCard label="Resolved" value={resolved} icon="✅" tone="success" />
      </div>

      <div className="quick-links">
        <Link to="/citizen/submissions" className="quick-link-card">
          <strong>My Submissions</strong>
          <span>View and track all complaints & requests</span>
        </Link>
        <Link to="/citizen/notifications" className="quick-link-card">
          <strong>Notifications</strong>
          <span>Status updates from the administration</span>
        </Link>
      </div>
    </div>
  );
}
