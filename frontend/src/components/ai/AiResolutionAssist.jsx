import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { aiResolution } from '../../services/aiApi';
import { formatComplaintLocation } from '../../utils/location';
import './Ai.css';

/** Draft resolution note from case + optional action text. */
export default function AiResolutionAssist({ item, actionTaken = '', onApply }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!item) return null;

  const run = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await aiResolution({
        title: item.title || '',
        description: item.description || '',
        location: formatComplaintLocation(item, t),
        category: item.category || '',
        actionTaken: actionTaken || 'Field work completed per department procedure',
        outcome: 'resolved',
      });
      onApply?.(data.resolutionNote || '');
    } catch (err) {
      setError(err.message || t('ai.draftFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-inline">
      <button type="button" className="btn btn-outline btn-sm" onClick={run} disabled={loading}>
        {loading ? t('ai.drafting') : t('ai.draftNote')}
      </button>
      {error && <span className="ai-inline-error">{error}</span>}
    </div>
  );
}
