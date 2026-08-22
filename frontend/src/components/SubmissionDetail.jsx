import StatusBadge from './UI';
import { useLanguage } from '../context/LanguageContext';
import { formatDate } from '../utils/storage';
import { formatComplaintLocation } from '../utils/location';
import './SubmissionTable.css';
import './ImageUpload.css';
//  comment added by 
export default function SubmissionDetail({
  item,
  history = [],
  departmentName,
  officerName,
  onClose,
  actions,
}) {
  const { t } = useLanguage();
  if (!item) return null;

  const statusLabel = (status) => (status ? t(`status.${status}`) : status);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <code>{item.referenceId}</code>
            <h2>{item.title}</h2>
          </div>
          <StatusBadge status={item.status} />
        </div>

        <div className="detail-grid">
          <div>
            <span className="detail-label">{t('detail.description')}</span>
            <p>{item.description}</p>
          </div>
          {item.location && (
            <div>
              <span className="detail-label">{t('detail.location')}</span>
              <p>{formatComplaintLocation(item, t)}</p>
            </div>
          )}
          {item.category && (
            <div>
              <span className="detail-label">{t('detail.category')}</span>
              <p>{t(`categories.${item.category}`) || item.category}</p>
            </div>
          )}
          {item.photoUrl && (
            <div>
              <span className="detail-label">{t('detail.photo')}</span>
              <img src={item.photoUrl} alt={t('detail.photoAlt')} className="submission-photo" />
            </div>
          )}
          <div>
            <span className="detail-label">{t('detail.department')}</span>
            <p>{departmentName || t('detail.notAssigned')}</p>
          </div>
          <div>
            <span className="detail-label">{t('detail.assignedOfficer')}</span>
            <p>
              {officerName ||
                (item.assignedOfficerId ? t('detail.assigned') : t('detail.departmentQueue'))}
            </p>
          </div>
          {item.resolutionNote && (
            <div>
              <span className="detail-label">{t('detail.resolutionNote')}</span>
              <p>{item.resolutionNote}</p>
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div className="timeline">
            <h3>{t('detail.statusHistory')}</h3>
            {history.map((h) => (
              <div key={h.id} className="timeline-item">
                <div className="timeline-dot" />
                <div>
                  <strong>
                    {h.fromStatus
                      ? `${statusLabel(h.fromStatus)} → ${statusLabel(h.toStatus)}`
                      : statusLabel(h.toStatus)}
                  </strong>
                  {h.note && <p>{h.note}</p>}
                  <small>{formatDate(h.changedAt)}</small>
                </div>
              </div>
            ))}
          </div>
        )}

        {actions && <div className="modal-actions">{actions}</div>}

        <button type="button" className="btn btn-ghost" onClick={onClose}>
          {t('form.close')}
        </button>
      </div>
    </div>
  );
}
