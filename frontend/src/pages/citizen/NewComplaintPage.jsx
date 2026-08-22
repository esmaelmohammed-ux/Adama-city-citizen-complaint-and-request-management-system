import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COMPLAINT_CATEGORIES } from '../../constants';
import ImageUpload from '../../components/ImageUpload';
import LocationSelect from '../../components/LocationSelect';
import SuccessPopup from '../../components/SuccessPopup';
import AiCitizenAssist from '../../components/ai/AiCitizenAssist';
import VoiceButton from '../../components/ai/VoiceButton';
import { PageHeader } from '../../components/UI';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { formatComplaintLocation } from '../../utils/location';
import '../../components/ImageUpload.css';

export default function NewComplaintPage() {
  const { submitComplaint } = useApp();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: COMPLAINT_CATEGORIES[0],
    location: '',
    landmark: '',
    photoUrl: null,
  });
  const [referenceId, setReferenceId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [highlight, setHighlight] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const ref = await submitComplaint(form);
      setError('');
      setReferenceId(ref);
    } catch (err) {
      setError(err.message || t('citizen.submitFailed'));
      setSubmitting(false);
    }
  };

  const appendVoice = (field) => (transcript) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field] ? `${prev[field].trim()} ${transcript}` : transcript,
    }));
  };

  const applyAi = (s) => {
    const nextHighlight = {};
    setForm((prev) => {
      const next = { ...prev };
      if (s.title != null && s.title !== prev.title) {
        next.title = s.title;
        nextHighlight.title = true;
      }
      if (s.description != null && s.description !== prev.description) {
        next.description = s.description;
        nextHighlight.description = true;
      }
      if (s.category && COMPLAINT_CATEGORIES.includes(s.category)) {
        next.category = s.category;
        nextHighlight.category = true;
      }
      return next;
    });
    setHighlight(nextHighlight);
    showToast(t('commonApp.aiApplied'), 'success');
    window.setTimeout(() => setHighlight({}), 2200);
  };

  return (
    <div>
      <PageHeader
        title={t('citizen.submitComplaintTitle')}
        subtitle={t('citizen.submitComplaintSubtitle')}
      />

      {error && <div className="alert alert-error">{error}</div>}

      <form className="form-card" onSubmit={handleSubmit} id="ai-form-anchor">
        <label className={highlight.title ? 'ai-field-flash' : undefined}>
          {t('form.title')}
          <div className="ai-field-row">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder={t('form.titlePlaceholder')}
            />
            <VoiceButton onTranscript={appendVoice('title')} />
          </div>
        </label>
        <LocationSelect
          location={form.location}
          landmark={form.landmark}
          onChange={(partial) => setForm({ ...form, ...partial })}
        />
        <label className={highlight.description ? 'ai-field-flash' : undefined}>
          {t('form.description')}
          <div className="ai-field-row">
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              placeholder={t('form.descriptionPlaceholder')}
            />
            <VoiceButton onTranscript={appendVoice('description')} />
          </div>
        </label>

        <AiCitizenAssist
          type="complaint"
          title={form.title}
          description={form.description}
          location={formatComplaintLocation(form, t)}
          onApply={applyAi}
        />

        <label className={highlight.category ? 'ai-field-flash' : undefined}>
          {t('form.category')}
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {COMPLAINT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{t(`categories.${c}`)}</option>
            ))}
          </select>
        </label>

        <ImageUpload
          value={form.photoUrl}
          onChange={(photoUrl) => setForm({ ...form, photoUrl })}
          label={t('form.photo')}
        />

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
            {t('form.cancel')}
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? t('form.submitting') : t('citizen.submitComplaint')}
          </button>
        </div>
      </form>

      <SuccessPopup
        open={Boolean(referenceId)}
        title={t('citizen.complaintSubmitted')}
        message={t('citizen.complaintSubmittedMsg')}
        referenceId={referenceId}
        confirmLabel={t('citizen.viewSubmissions')}
        onConfirm={() => navigate('/citizen/submissions')}
      />
    </div>
  );
}
