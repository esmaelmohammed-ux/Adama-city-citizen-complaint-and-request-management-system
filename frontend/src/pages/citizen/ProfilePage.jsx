import { useState } from 'react';
import { PageHeader } from '../../components/UI';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

export default function ProfilePage() {
  const { currentUser, updateProfile } = useApp();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    fullName: currentUser.fullName,
    phoneNumber: currentUser.phoneNumber,
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const result = await updateProfile(form);
    setBusy(false);
    if (result.success) {
      showToast(t('citizen.profileUpdated'));
    } else {
      setError(result.message || t('citizen.profileFailed'));
    }
  };

  return (
    <div>
      <PageHeader title={t('citizen.profileTitle')} subtitle={t('citizen.profileSubtitle')} />

      {error && <div className="alert alert-error">{error}</div>}

      <form className="form-card" onSubmit={handleSubmit}>
        <label>
          {t('form.fullName')}
          <input
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />
        </label>
        <label>
          {t('form.email')}
          <input value={currentUser.email} disabled />
        </label>
        <label>
          {t('form.phoneNumber')}
          <input
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            required
          />
        </label>
        <label>
          {t('form.role')}
          <input value={t(`roles.${currentUser.role}`)} disabled className="capitalize" />
        </label>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? t('form.saving') : t('form.saveChanges')}
        </button>
      </form>
    </div>
  );
}
