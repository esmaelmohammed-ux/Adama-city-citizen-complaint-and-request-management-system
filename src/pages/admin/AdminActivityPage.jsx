import { PageHeader } from '../../components/UI';
import { formatDate } from '../../utils/storage';
import { useApp } from '../../context/AppContext';

export default function AdminActivityPage() {
  const { activityLogs, users } = useApp();
  const getUser = (id) => users.find((u) => u.id === id)?.fullName || 'Unknown';

  return (
    <div>
      <PageHeader title="Activity Log" subtitle="Audit trail of administrative actions" />

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {activityLogs.map((log) => (
              <tr key={log.id}>
                <td>{formatDate(log.createdAt)}</td>
                <td>{getUser(log.userId)}</td>
                <td>{log.action.replace('_', ' ')}</td>
                <td>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
