import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COMPLAINT_CATEGORIES } from '../../constants';
import ImageUpload from '../../components/ImageUpload';
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
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const ref = await submitComplaint(form);
      setError('');
      setSuccess(`Complaint submitted successfully! Reference: ${ref}`);
      setTimeout(() => navigate('/citizen/submissions'), 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit complaint.');
    }
  };

  return (
    <div>
      <PageHeader title="Submit Complaint" subtitle="Report a problem with municipal services" />

      {success && <div className="alert alert-success">{success}</div>}
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
          <button type="submit" className="btn btn-primary">Submit complaint</button>
        </div>
      </form>
    </div>
  );
}
