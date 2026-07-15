import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SERVICE_TYPES } from '../../constants';
import SuccessPopup from '../../components/SuccessPopup';
import { PageHeader } from '../../components/UI';
import { useApp } from '../../context/AppContext';

export default function NewServiceRequestPage() {
  const { submitServiceRequest } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    serviceType: SERVICE_TYPES[0],
    description: '',
    location: '',
  });
  const [referenceId, setReferenceId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const ref = await submitServiceRequest(form);
      setError('');
      setReferenceId(ref);
    } catch (err) {
      setError(err.message || 'Failed to submit request.');
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Submit Service Request" subtitle="Request a municipal service from the city administration" />

      {error && <div className="alert alert-error">{error}</div>}

      <form className="form-card" onSubmit={handleSubmit}>
        <label>
          Service type
          <select
            value={form.serviceType}
            onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
          >
            {SERVICE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          Location (optional)
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Where should the service be provided?"
          />
        </label>
        <label>
          Description
          <textarea
            rows={5}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            placeholder="Describe what you need..."
          />
        </label>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit request'}
          </button>
        </div>
      </form>

      <SuccessPopup
        open={Boolean(referenceId)}
        title="Service request submitted"
        message="Save your reference ID to track this request."
        referenceId={referenceId}
        confirmLabel="View my submissions"
        onConfirm={() => navigate('/citizen/submissions')}
      />
    </div>
  );
}
