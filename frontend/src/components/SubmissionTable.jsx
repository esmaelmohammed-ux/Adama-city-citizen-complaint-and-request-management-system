import StatusBadge from './UI';
import { formatDate } from '../utils/storage';
import './SubmissionTable.css';
// comment
export default function SubmissionTable({ items, type, showCitizen = false, users = [], departments = [], onView }) {
  if (!items.length) {
    return (
      <div className="table-empty">No records found.</div>
    );
  }

  const getUserName = (id) => users.find((u) => u.id === id)?.fullName || '—';
  const getDeptName = (id) => departments.find((d) => d.id === id)?.name || '—';

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Reference</th>
            {type === 'complaint' ? <th>Title</th> : <th>Service Type</th>}
            <th>Status</th>
            {showCitizen && <th>Citizen</th>}
            <th>Department</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td><code>{item.referenceId}</code></td>
              <td>{type === 'complaint' ? item.title : item.serviceType}</td>
              <td><StatusBadge status={item.status} /></td>
              {showCitizen && <td>{getUserName(item.citizenId)}</td>}
              <td>{getDeptName(item.departmentId)}</td>
              <td>{formatDate(item.createdAt)}</td>
              <td>
                {onView ? (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => onView(item)}>
                    View
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
