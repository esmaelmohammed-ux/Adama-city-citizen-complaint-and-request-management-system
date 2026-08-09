import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { aiAssist } from '../../services/aiApi';
import './Ai.css';

/**
 * Citizen writing assist + category/service suggestion.
 * onApply({ title, description, category?, serviceType?, department?, priority? })
 */
export default function AiCitizenAssist({
  type = 'complaint',
  title = '',
  description = '',
  location = '',
  onApply,
}) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [appliedMsg, setAppliedMsg] = useState('');

  const run = async () => {
    if (!description.trim() && !title.trim()) {
      setError(t('ai.enterFirst'));
      return;
    }
    setLoading(true);
    setError('');
    setAppliedMsg('');
    try {
      const data = await aiAssist({ type, title, description, location });
      setResult(data);
    } catch (err) {
      setError(err.message || t('ai.assistFailed'));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const apply = () => {
    if (!result) return;

    const next = {
      title: result.improved?.title ?? title,
      description: result.improved?.description ?? description,
      category: result.classification?.category,
      serviceType: result.classification?.serviceType,
      department: result.classification?.department,
      priority: result.classification?.priority,
    };

    const changed = [];
    if (next.title !== title) changed.push('title');
    if (next.description !== description) changed.push('description');
    if (type === 'complaint' && next.category) changed.push('category');
    if (type === 'service' && next.serviceType) changed.push('service type');

    onApply?.(next);

    setAppliedMsg(
      changed.length
        ? t('ai.appliedFields', { fields: changed.join(', ') })
        : t('ai.appliedSame')
    );

    // Bring form fields into view — they sit above this panel
    document.getElementById('ai-form-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const c = result?.classification;

  return (
    <div className="ai-panel">
      <div className="ai-panel-head">
        <div>
          <strong>AI assist</strong>
          <p>Improve wording and suggest category / department. You stay in control before submit.</p>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={run} disabled={loading}>
          {loading ? t('ai.thinking') : t('ai.suggest')}
        </button>
      </div>

      {error && <div className="alert alert-error ai-alert">{error}</div>}
      {appliedMsg && <div className="alert ai-alert ai-alert-success">{appliedMsg}</div>}

      {result && (
        <div className="ai-panel-body">
          <div className="ai-chips">
            <span className="ai-chip">
              {c?.categoryLabel || c?.serviceType || '—'}
            </span>
            <span className="ai-chip">{c?.department}</span>
            <span className={`ai-chip priority-${c?.priority || 'low'}`}>
              Priority: {c?.priority}
            </span>
            <span className="ai-chip muted">
              {Math.round((c?.confidence || 0) * 100)}% · {c?.provider}
            </span>
          </div>
          <p className="ai-rationale">{c?.rationale}</p>
          <div className="ai-preview">
            <div>
              <span className="detail-label">{t('ai.suggestedTitle')}</span>
              <p>{result.improved?.title}</p>
            </div>
            <div>
              <span className="detail-label">{t('ai.suggestedDescription')}</span>
              <p>{result.improved?.description}</p>
            </div>
          </div>
          {result.similar?.enabled && result.similar.items?.length > 0 && (
            <p className="ai-similar-note">
              {result.similar.items.length} similar case(s) found in the database.
            </p>
          )}
          <button type="button" className="btn btn-primary btn-sm" onClick={apply}>
            {t('ai.applySuggestions')}
          </button>
        </div>
      )}
    </div>
  );
}
