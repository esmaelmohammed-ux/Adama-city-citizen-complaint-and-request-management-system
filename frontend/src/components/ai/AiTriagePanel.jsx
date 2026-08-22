import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { aiTriage } from '../../services/aiApi';
import { formatComplaintLocation } from '../../utils/location';
import './Ai.css';

/**
 * Admin triage: suggest department (by name→id), priority, duplicates.
 * onApplyDepartment(departmentId)
 */
export default function AiTriagePanel({
  item,
  departments = [],
  onApplyDepartment,
}) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pack, setPack] = useState(null);

  if (!item) return null;

  const run = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await aiTriage({
        type: 'complaint',
        title: item.title || '',
        description: item.description || '',
        location: formatComplaintLocation(item, t),
      });
      setPack(data);
    } catch (err) {
      setError(err.message || t('ai.triageFailed'));
      setPack(null);
    } finally {
      setLoading(false);
    }
  };

  const applyDept = () => {
    const name = pack?.advice?.recommendedDepartment;
    if (!name) return;
    const dept = departments.find((d) => d.name === name);
    if (!dept) {
      setError(`Department "${name}" not found in your list. Pick manually.`);
      return;
    }
    onApplyDepartment?.(dept.id);
  };

  const advice = pack?.advice;
  const similar = pack?.similar;

  return (
    <div className="ai-panel ai-panel--compact">
      <div className="ai-panel-head">
        <div>
          <strong>AI triage</strong>
          <p>Suggest routing, priority, and possible duplicates. Assignment still requires your click.</p>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={run} disabled={loading}>
          {loading ? t('ai.analyzing') : t('ai.runTriage')}
        </button>
      </div>

      {error && <div className="alert alert-error ai-alert">{error}</div>}

      {advice && (
        <div className="ai-panel-body">
          <div className="ai-chips">
            <span className="ai-chip">{advice.recommendedDepartment}</span>
            <span className={`ai-chip priority-${advice.recommendedPriority}`}>
              Priority: {advice.recommendedPriority}
            </span>
            <span className="ai-chip">{t('ai.duplicateRisk', { risk: advice.duplicateRisk })}</span>
          </div>
          <p className="ai-rationale">{advice.assignHint}</p>
          <ul className="ai-list">
            {(advice.actions || []).map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          {similar?.enabled && similar.items?.length > 0 && (
            <ul className="ai-list">
              {similar.items.slice(0, 3).map((s) => (
                <li key={s.referenceId}>
                  <strong>{s.referenceId}</strong> — {s.title} ({Math.round((s.score || 0) * 100)}%)
                </li>
              ))}
            </ul>
          )}
          {!similar?.enabled && (
            <p className="ai-similar-note">{similar?.message || 'Similar-case DB not connected on AI service.'}</p>
          )}
          <button type="button" className="btn btn-primary btn-sm" onClick={applyDept}>
            {t('ai.applyDepartment')}
          </button>
        </div>
      )}
    </div>
  );
}
