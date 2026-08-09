import { useState } from 'react';
import { PageHeader } from '../../components/UI';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

export default function AdminUsersPage() {
  const { users, departments, currentUser, toggleUserActive } = useApp();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [error, setError] = useState('');

  const getDept = (id) => departments.find((d) => d.id === id)?.name || '—';

  const handleToggle = async (userId) => {
    setError('');
    const user = users.find((u) => u.id === userId);
    const result = await toggleUserActive(userId);
    if (!result.success) {
      setError(result.message || t('admin.userUpdateFailed'));
      return;
    }
    showToast(
      user?.isActive
        ? t('admin.userDeactivated', { name: user.fullName })
        : t('admin.userActivated', { name: user?.fullName || t('table.user') })
    );
  };

  return (
    <div>
      <PageHeader title={t('admin.usersTitle')} subtitle={t('admin.usersSubtitle')} />

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('table.name')}</th>
              <th>{t('table.email')}</th>
              <th>{t('table.role')}</th>
              <th>{t('table.department')}</th>
              <th>{t('table.status')}</th>
              <th>{t('table.action')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u.id === currentUser.id;
              return (
                <tr key={u.id}>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td className="capitalize">{t(`roles.${u.role}`)}</td>
                  <td>{u.role === 'officer' ? getDept(u.departmentId) : '—'}</td>
                  <td>{u.isActive ? t('commonApp.active') : t('commonApp.inactive')}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      disabled={isSelf}
                      title={isSelf ? t('admin.cannotDeactivateSelf') : undefined}
                      onClick={() => handleToggle(u.id)}
                    >
                      {u.isActive ? t('admin.deactivate') : t('admin.activate')}
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
