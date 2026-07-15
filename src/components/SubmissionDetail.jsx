import StatusBadge from './UI';
import { formatDate } from '../utils/storage';
import './SubmissionTable.css';
import './ImageUpload.css';
// commen
export default function SubmissionDetail({
  item,
  type,
  history = [],
  departmentName,
  officerName,
  onClose,
  actions,
}) {
  if (!item) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <code>{item.referenceId}</code>
            <h2>{type === 'complaint' ? item.title : item.serviceType}</h2>
          </div>
          <StatusBadge status={item.status} />
        </div>

        <div className="detail-grid">
          <div>
            <span className="detail-label">Description</span>
            <p>{item.description}</p>
          </div>
          {item.location && (
            <div>
              <span className="detail-label">Location</span>
              <p>{item.location}</p>
            </div>
          )}
          {type === 'complaint' && (
            <div>
              <span className="detail-label">Category</span>
              <p>{item.category}</p>
            </div>
          )}
          {item.photoUrl && (
            <div>
              <span className="detail-label">Photo</span>
              <img src={item.photoUrl} alt="Submission attachment" className="submission-photo" />
            </div>
          )}
          <div>
            <span className="detail-label">Department</span>
            <p>{departmentName || 'Not assigned'}</p>
          </div>
          <div>
            <span className="detail-label">Assigned officer</span>
            <p>{officerName || (item.assignedOfficerId ? 'Assigned' : 'Department queue')}</p>
          </div>
          {item.resolutionNote && (
            <div>
              <span className="detail-label">Resolution note</span>
              <p>{item.resolutionNote}</p>
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div className="timeline">
            <h3>Status history</h3>
            {history.map((h) => (
              <div key={h.id} className="timeline-item">
                <div className="timeline-dot" />
                <div>
                  <strong>{h.fromStatus ? `${h.fromStatus} → ${h.toStatus}` : h.toStatus}</strong>
                  {h.note && <p>{h.note}</p>}
                  <small>{formatDate(h.changedAt)}</small>
                </div>
              </div>
            ))}
          </div>
        )}

        {actions && <div className="modal-actions">{actions}</div>}

        <button type="button" className="btn btn-ghost" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
