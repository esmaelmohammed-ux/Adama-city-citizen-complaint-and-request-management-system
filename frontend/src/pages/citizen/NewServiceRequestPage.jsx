import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SERVICE_TYPES } from '../../constants';
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
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const ref = await submitServiceRequest(form);
      setError('');
      setSuccess(`Service request submitted! Reference: ${ref}`);
      setTimeout(() => navigate('/citizen/submissions'), 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit request.');
    }
  };

  return (
    <div>
      <PageHeader title="Submit Service Request" subtitle="Request a municipal service from the city administration" />

      {success && <div className="alert alert-success">{success}</div>}
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
          <button type="submit" className="btn btn-primary">Submit request</button>
        </div>
      </form>
    </div>
  );
}
