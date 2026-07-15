import { useState } from 'react';
import { PageHeader } from '../../components/UI';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

export default function AdminUsersPage() {
  const { users, departments, currentUser, toggleUserActive } = useApp();
  const { showToast } = useToast();
  const [error, setError] = useState('');

  const getDept = (id) => departments.find((d) => d.id === id)?.name || '—';

  const handleToggle = async (userId) => {
    setError('');
    const user = users.find((u) => u.id === userId);
    const result = await toggleUserActive(userId);
    if (!result.success) {
      setError(result.message || 'Failed to update user.');
      return;
    }
    showToast(
      user?.isActive
        ? `${user.fullName} deactivated successfully.`
        : `${user?.fullName || 'User'} activated successfully.`
    );
  };

  return (
    <div>
      <PageHeader title="User Management" subtitle="View and manage system users" />

      {error && <div className="alert alert-error">{error}</div>}

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
            {users.map((u) => {
              const isSelf = u.id === currentUser.id;
              return (
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
                      disabled={isSelf}
                      title={isSelf ? 'You cannot deactivate your own account' : undefined}
                      onClick={() => handleToggle(u.id)}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
