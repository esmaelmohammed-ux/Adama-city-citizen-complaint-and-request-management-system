import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SERVICE_TYPES, SERVICE_TYPE_I18N_KEYS } from '../../constants';
import SuccessPopup from '../../components/SuccessPopup';
import AiCitizenAssist from '../../components/ai/AiCitizenAssist';
import VoiceButton from '../../components/ai/VoiceButton';
import { PageHeader } from '../../components/UI';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

export default function NewServiceRequestPage() {
  const { submitServiceRequest } = useApp();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    serviceType: SERVICE_TYPES[0],
    description: '',
    location: '',
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
      const ref = await submitServiceRequest(form);
      setError('');
      setReferenceId(ref);
    } catch (err) {
      setError(err.message || t('citizen.submitRequestFailed'));
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
      if (s.description != null && s.description !== prev.description) {
        next.description = s.description;
        nextHighlight.description = true;
      }
      if (s.serviceType && SERVICE_TYPES.includes(s.serviceType)) {
        next.serviceType = s.serviceType;
        nextHighlight.serviceType = true;
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
        title={t('citizen.submitRequestTitle')}
        subtitle={t('citizen.submitRequestSubtitle')}
      />

      {error && <div className="alert alert-error">{error}</div>}

      <form className="form-card" onSubmit={handleSubmit} id="ai-form-anchor">
        <label className={highlight.location ? 'ai-field-flash' : undefined}>
          {t('form.locationOptional')}
          <div className="ai-field-row">
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder={t('form.serviceLocationPlaceholder')}
            />
            <VoiceButton onTranscript={appendVoice('location')} />
          </div>
        </label>
        <label className={highlight.description ? 'ai-field-flash' : undefined}>
          {t('form.description')}
          <div className="ai-field-row">
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              placeholder={t('form.serviceDescriptionPlaceholder')}
            />
            <VoiceButton onTranscript={appendVoice('description')} />
          </div>
        </label>

        <AiCitizenAssist
          type="service"
          title={form.serviceType}
          description={form.description}
          location={form.location}
          onApply={applyAi}
        />

        <label className={highlight.serviceType ? 'ai-field-flash' : undefined}>
          {t('form.serviceType')}
          <select
            value={form.serviceType}
            onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
          >
            {SERVICE_TYPES.map((value) => (
              <option key={value} value={value}>
                {t(`serviceTypes.${SERVICE_TYPE_I18N_KEYS[value]}`)}
              </option>
            ))}
          </select>
        </label>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
            {t('form.cancel')}
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? t('form.submitting') : t('citizen.submitRequest')}
          </button>
        </div>
      </form>

      <SuccessPopup
        open={Boolean(referenceId)}
        title={t('citizen.requestSubmitted')}
        message={t('citizen.requestSubmittedMsg')}
        referenceId={referenceId}
        confirmLabel={t('citizen.viewSubmissions')}
        onConfirm={() => navigate('/citizen/submissions')}
      />
    </div>
  );
}
