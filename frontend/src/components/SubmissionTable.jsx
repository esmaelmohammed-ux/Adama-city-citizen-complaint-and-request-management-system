import StatusBadge from './UI';
import { STATUSES } from '../constants';
import { useLanguage } from '../context/LanguageContext';
import { formatDate } from '../utils/storage';
import './SubmissionTable.css';

export default function SubmissionTable({
  items,
  showCitizen = false,
  users = [],
  departments = [],
  onView,
  onEdit,
}) {
  const { t } = useLanguage();

  if (!items.length) {
    return <div className="table-empty">{t('table.noRecords')}</div>;
  }

  const getUserName = (id) => users.find((u) => u.id === id)?.fullName || '—';
  const getDeptName = (id) => departments.find((d) => d.id === id)?.name || '—';

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>{t('table.reference')}</th>
            <th>{t('table.title')}</th>
            <th>{t('table.status')}</th>
            {showCitizen && <th>{t('table.citizen')}</th>}
            <th>{t('table.department')}</th>
            <th>{t('table.date')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td><code>{item.referenceId}</code></td>
              <td>{item.title}</td>
              <td><StatusBadge status={item.status} /></td>
              {showCitizen && <td>{getUserName(item.citizenId)}</td>}
              <td>{getDeptName(item.departmentId)}</td>
              <td>{formatDate(item.createdAt)}</td>
              <td>
                <div className="table-actions">
                  {onView ? (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => onView(item)}>
                      {t('table.view')}
                    </button>
                  ) : null}
                  {onEdit && item.status === STATUSES.PENDING ? (
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => onEdit(item)}>
                      {t('table.edit')}
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
