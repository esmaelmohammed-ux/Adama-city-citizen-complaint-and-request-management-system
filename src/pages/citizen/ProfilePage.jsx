import { useState } from 'react';
import { PageHeader } from '../../components/UI';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

export default function ProfilePage() {
  const { currentUser, updateProfile } = useApp();
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
      showToast('Profile updated successfully.');
    } else {
      setError(result.message || 'Failed to update profile.');
    }
  };

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Update your account information" />

      {error && <div className="alert alert-error">{error}</div>}

      <form className="form-card" onSubmit={handleSubmit}>
        <label>
          Full name
          <input
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />
        </label>
        <label>
          Email
          <input value={currentUser.email} disabled />
        </label>
        <label>
          Phone number
          <input
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            required
          />
        </label>
        <label>
          Role
          <input value={currentUser.role} disabled className="capitalize" />
        </label>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
