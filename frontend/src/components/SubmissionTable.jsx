import StatusBadge from './UI';
import { SERVICE_TYPE_I18N_KEYS } from '../constants';
import { useLanguage } from '../context/LanguageContext';
import { formatDate } from '../utils/storage';
import './SubmissionTable.css';
// comment
function serviceTypeLabel(value, t) {
  const key = SERVICE_TYPE_I18N_KEYS[value];
  return key ? t(`serviceTypes.${key}`) : value;
}

export default function SubmissionTable({
  items,
  type,
  showCitizen = false,
  users = [],
  departments = [],
  onView,
}) {
  const { t } = useLanguage();

  if (!items.length) {
    return <div className="table-empty">{t('table.noRecords')}</div>;
  }

  const getUserName = (id) => users.find((u) => u.id === id)?.fullName || '—';
  const getDeptName = (id) => departments.find((d) => d.id === id)?.name || '—';
  const rowType = (item) => item.itemType || type;
  const mixed = items.some((item) => item.itemType && item.itemType !== type);

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>{t('table.reference')}</th>
            <th>
              {mixed
                ? t('table.titleOrService')
                : type === 'complaint'
                  ? t('table.title')
                  : t('table.serviceType')}
            </th>
            <th>{t('table.status')}</th>
            {showCitizen && <th>{t('table.citizen')}</th>}
            <th>{t('table.department')}</th>
            <th>{t('table.date')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const itemType = rowType(item);
            return (
              <tr key={`${itemType}-${item.id}`}>
                <td><code>{item.referenceId}</code></td>
                <td>
                  {itemType === 'complaint'
                    ? item.title
                    : serviceTypeLabel(item.serviceType, t)}
                </td>
                <td><StatusBadge status={item.status} /></td>
                {showCitizen && <td>{getUserName(item.citizenId)}</td>}
                <td>{getDeptName(item.departmentId)}</td>
                <td>{formatDate(item.createdAt)}</td>
                <td>
                  {onView ? (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => onView(item)}>
                      {t('table.view')}
                    </button>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
