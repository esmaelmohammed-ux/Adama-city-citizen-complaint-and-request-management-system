import { useMemo, useState } from 'react';
import ImageUpload from '../../components/ImageUpload';
import LocationSelect from '../../components/LocationSelect';
import { PageHeader } from '../../components/UI';
import SubmissionDetail from '../../components/SubmissionDetail';
import SubmissionTable from '../../components/SubmissionTable';
import { COMPLAINT_CATEGORIES, STATUSES } from '../../constants';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import '../../components/ImageUpload.css';

function canEditComplaint(item) {
  return item?.status === STATUSES.PENDING;
}

export default function MySubmissionsPage() {
  const { currentUser, complaints, departments, statusHistories, updateComplaint } = useApp();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: COMPLAINT_CATEGORIES[0],
    location: '',
    landmark: '',
    photoUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const myComplaints = complaints.filter((c) => c.citizenId === currentUser.id);

  const filteredComplaints = useMemo(() => {
    return myComplaints.filter((c) => {
      if (filter !== 'all' && c.status !== filter) return false;
      if (
        search &&
        !c.referenceId.toLowerCase().includes(search.toLowerCase()) &&
        !c.title.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [myComplaints, filter, search]);

  const history = selected
    ? statusHistories.filter((h) => h.entityId === selected.id && h.entityType === 'complaint')
    : [];

  const deptName = selected?.departmentId
    ? departments.find((d) => d.id === selected.departmentId)?.name
    : null;

  const openEdit = (item) => {
    setSelected(null);
    setEditing(item);
    setEditError('');
    setForm({
      title: item.title || '',
      description: item.description || '',
      category: COMPLAINT_CATEGORIES.includes(item.category)
        ? item.category
        : COMPLAINT_CATEGORIES[0],
      location: item.location || '',
      landmark: item.landmark || '',
      photoUrl: item.photoUrl || '',
    });
  };

  const closeEdit = () => {
    if (saving) return;
    setEditing(null);
    setEditError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editing || saving) return;
    setSaving(true);
    setEditError('');
    const result = await updateComplaint(editing.id, {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      location: form.location,
      landmark: (form.landmark || '').trim(),
      photoUrl: form.photoUrl || '',
    });
    setSaving(false);
    if (!result.success) {
      setEditError(result.message || t('citizen.updateFailed'));
      return;
    }
    showToast(t('citizen.complaintUpdated'), 'success');
    setEditing(null);
  };

  return (
    <div>
      <PageHeader
        title={t('citizen.submissionsTitle')}
        subtitle={t('citizen.submissionsSubtitle')}
      />

      <div className="filters-bar">
        <input
          className="search-input"
          placeholder={t('form.searchReference')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">{t('status.all')}</option>
          {Object.values(STATUSES).map((s) => (
            <option key={s} value={s}>{t(`status.${s}`)}</option>
          ))}
        </select>
      </div>

      <SubmissionTable
        items={filteredComplaints}
        onView={setSelected}
        onEdit={openEdit}
      />

      {selected && (
        <SubmissionDetail
          item={selected}
          history={history}
          departmentName={deptName}
          onClose={() => setSelected(null)}
          actions={
            canEditComplaint(selected) ? (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => openEdit(selected)}
              >
                {t('table.edit')}
              </button>
            ) : null
          }
        />
      )}

      {editing && (
        <div className="modal-overlay" onClick={closeEdit}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <code>{editing.referenceId}</code>
                <h2>{t('citizen.editComplaint')}</h2>
                <p className="field-hint">{t('citizen.editComplaintSubtitle')}</p>
              </div>
            </div>

            {editError && <div className="alert alert-error">{editError}</div>}

            <form className="form-card" onSubmit={handleSave}>
              <label>
                {t('form.title')}
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder={t('form.titlePlaceholder')}
                />
              </label>
              <LocationSelect
                location={form.location}
                landmark={form.landmark}
                onChange={(partial) => setForm({ ...form, ...partial })}
              />
              <label>
                {t('form.description')}
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  placeholder={t('form.descriptionPlaceholder')}
                />
              </label>
              <label>
                {t('form.category')}
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {COMPLAINT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{t(`categories.${c}`)}</option>
                  ))}
                </select>
              </label>
              <ImageUpload
                value={form.photoUrl || null}
                onChange={(photoUrl) => setForm({ ...form, photoUrl: photoUrl || '' })}
                label={t('form.photo')}
              />
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={closeEdit} disabled={saving}>
                  {t('form.cancel')}
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? t('form.saving') : t('form.saveChanges')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
