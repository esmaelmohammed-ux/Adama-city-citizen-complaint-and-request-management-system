import { useState } from 'react';
import { PageHeader } from '../../components/UI';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

export default function AdminDepartmentsPage() {
  const { departments, addDepartment } = useApp();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', description: '' });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const result = await addDepartment(form);
    setBusy(false);
    if (!result.success) {
      setError(result.message || t('admin.departmentFailed'));
      return;
    }
    showToast(t('admin.departmentAdded'));
    setForm({ name: '', description: '' });
    setShowForm(false);
  };

  return (
    <div>
      <PageHeader
        title={t('admin.departmentsTitle')}
        subtitle={t('admin.departmentsSubtitle')}
        action={
          <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? t('form.cancel') : t('admin.addDepartment')}
          </button>
        }
      />

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <form className="form-card mb-2" onSubmit={handleSubmit}>
          <label>
            {t('admin.departmentName')}
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
          <label>
            {t('form.description')}
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? t('form.saving') : t('admin.saveDepartment')}
          </button>
        </form>
      )}

      <div className="dept-grid">
        {departments.map((d) => (
          <div key={d.id} className="dept-card">
            <h3>{d.name}</h3>
            <p>{d.description}</p>
            <span className={`badge ${d.isActive ? 'badge-success' : 'badge-muted'}`}>
              {d.isActive ? t('commonApp.active') : t('commonApp.inactive')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
