import { useState } from 'react';
import { PageHeader } from '../../components/UI';
import { useApp } from '../../context/AppContext';

export default function ProfilePage() {
  const { currentUser, updateProfile } = useApp();
  const [form, setForm] = useState({
    fullName: currentUser.fullName,
    phoneNumber: currentUser.phoneNumber,
  });
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateProfile(form);
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Update your account information" />

      {saved && <div className="alert alert-success">Profile updated successfully.</div>}

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
        <button type="submit" className="btn btn-primary">Save changes</button>
      </form>
    </div>
  );
}
