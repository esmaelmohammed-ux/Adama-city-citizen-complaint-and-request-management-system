import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COMPLAINT_CATEGORIES } from '../../constants';
import ImageUpload from '../../components/ImageUpload';
import SuccessPopup from '../../components/SuccessPopup';
import { PageHeader } from '../../components/UI';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import '../../components/ImageUpload.css';

export default function NewComplaintPage() {
  const { submitComplaint } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: COMPLAINT_CATEGORIES[0],
    location: '',
    photoUrl: null,
  });
  const [referenceId, setReferenceId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const ref = await submitComplaint(form);
      setError('');
      setReferenceId(ref);
    } catch (err) {
      setError(err.message || 'Failed to submit complaint.');
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Submit Complaint" subtitle="Report a problem with municipal services" />

      {error && <div className="alert alert-error">{error}</div>}

      <form className="form-card" onSubmit={handleSubmit}>
        <label>
          Title
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            placeholder="Brief summary of the issue"
          />
        </label>
        <label>
          Category
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {COMPLAINT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{t(`categories.${c}`)}</option>
            ))}
          </select>
        </label>
        <label>
          Location
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            required
            placeholder="Street, kebele, or landmark"
          />
        </label>
        <label>
          Description
          <textarea
            rows={5}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            placeholder="Describe the problem in detail..."
          />
        </label>

        <ImageUpload
          value={form.photoUrl}
          onChange={(photoUrl) => setForm({ ...form, photoUrl })}
          label="Photo"
        />

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit complaint'}
          </button>
        </div>
      </form>

      <SuccessPopup
        open={Boolean(referenceId)}
        title="Complaint submitted"
        message="Save your reference ID to track this complaint."
        referenceId={referenceId}
        confirmLabel="View my submissions"
        onConfirm={() => navigate('/citizen/submissions')}
      />
    </div>
  );
}
