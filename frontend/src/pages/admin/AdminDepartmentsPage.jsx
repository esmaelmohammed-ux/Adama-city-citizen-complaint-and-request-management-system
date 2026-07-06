import { useState } from 'react';
import { PageHeader } from '../../components/UI';
import { useApp } from '../../context/AppContext';

export default function AdminDepartmentsPage() {
  const { departments, addDepartment } = useApp();
  const [form, setForm] = useState({ name: '', description: '' });
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    addDepartment(form);
    setForm({ name: '', description: '' });
    setShowForm(false);
  };

  return (
    <div>
      <PageHeader
        title="Departments"
        subtitle="Municipal departments for routing submissions"
        action={
          <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add department'}
          </button>
        }
      />

      {showForm && (
        <form className="form-card mb-2" onSubmit={handleSubmit}>
          <label>
            Department name
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
          <label>
            Description
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <button type="submit" className="btn btn-primary">Save department</button>
        </form>
      )}

      <div className="dept-grid">
        {departments.map((d) => (
          <div key={d.id} className="dept-card">
            <h3>{d.name}</h3>
            <p>{d.description}</p>
            <span className={`badge ${d.isActive ? 'badge-success' : 'badge-muted'}`}>
              {d.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
