import { PageHeader } from '../../components/UI';
import { useApp } from '../../context/AppContext';

export default function AdminUsersPage() {
  const { users, departments, toggleUserActive } = useApp();

  const getDept = (id) => departments.find((d) => d.id === id)?.name || '—';

  return (
    <div>
      <PageHeader title="User Management" subtitle="View and manage system users" />

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.fullName}</td>
                <td>{u.email}</td>
                <td className="capitalize">{u.role}</td>
                <td>{u.role === 'officer' ? getDept(u.departmentId) : '—'}</td>
                <td>{u.isActive ? 'Active' : 'Inactive'}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => toggleUserActive(u.id)}
                  >
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
