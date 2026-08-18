import { useMemo, useState } from 'react';
import AiResolutionAssist from '../../components/ai/AiResolutionAssist';
import AiTriagePanel from '../../components/ai/AiTriagePanel';
import { PageHeader } from '../../components/UI';
import SubmissionDetail from '../../components/SubmissionDetail';
import SubmissionTable from '../../components/SubmissionTable';
import { ROLES, STATUSES } from '../../constants';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

export default function AdminComplaintsPage() {
  const {
    complaints,
    users,
    departments,
    statusHistories,
    assignSubmission,
    updateSubmissionStatus,
  } = useApp();
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [assignDept, setAssignDept] = useState('');
  const [assignOfficer, setAssignOfficer] = useState('');
  const [note, setNote] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const { showToast } = useToast();

  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (search && !`${c.referenceId} ${c.title}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [complaints, search, statusFilter]);

  const history = selected
    ? statusHistories.filter((h) => h.entityId === selected.id && h.entityType === 'complaint')
    : [];

  const officersInDept = useMemo(() => {
    if (!assignDept) return [];
    return users.filter(
      (u) => u.role === ROLES.OFFICER && u.isActive !== false && u.departmentId === assignDept
    );
  }, [users, assignDept]);

  const showAssign =
    selected &&
    (selected.status === STATUSES.PENDING || selected.status === STATUSES.IN_PROGRESS);

  const handleDeptChange = (deptId) => {
    setAssignDept(deptId);
    setAssignOfficer('');
  };

  const handleAssign = async () => {
    if (!selected || !assignDept) return;
    setBusy(true);
    setActionError('');
    const result = await assignSubmission(
      'complaint',
      selected.id,
      assignDept,
      assignOfficer || null
    );
    setBusy(false);
    if (!result.success) {
      setActionError(result.message || t('admin.assignFailed'));
      return;
    }
    showToast(
      assignOfficer
        ? t('admin.complaintAssignedOfficer')
        : t('admin.complaintRouted')
    );
    setSelected(null);
    setAssignDept('');
    setAssignOfficer('');
  };

  const handleStatus = async (status) => {
    if (!selected) return;
    setBusy(true);
    setActionError('');
    const result = await updateSubmissionStatus('complaint', selected.id, status, note);
    setBusy(false);
    if (!result.success) {
      setActionError(result.message || t('admin.updateFailed'));
      return;
    }
    const labels = {
      [STATUSES.REJECTED]: t('admin.complaintRejected'),
      [STATUSES.RESOLVED]: t('admin.complaintResolved'),
      [STATUSES.CLOSED]: t('admin.complaintClosed'),
    };
    showToast(labels[status] || t('admin.complaintUpdated'));
    setSelected(null);
    setNote('');
  };

  return (
    <div>
      <PageHeader
        title={t('admin.manageComplaintsTitle')}
        subtitle={t('admin.manageComplaintsSubtitle')}
      />

      <div className="filters-bar">
        <input
          className="search-input"
          placeholder={t('form.searchComplaints')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">{t('status.all')}</option>
          {Object.values(STATUSES).map((s) => (
            <option key={s} value={s}>{t(`status.${s}`)}</option>
          ))}
        </select>
      </div>

      <SubmissionTable
        items={filtered}
        type="complaint"
        showCitizen
        users={users}
        departments={departments}
        onView={(item) => {
          setSelected(item);
          setAssignDept(item.departmentId || '');
          setAssignOfficer(item.assignedOfficerId || '');
          setActionError('');
          setNote('');
        }}
      />

      {selected && (
        <SubmissionDetail
          item={selected}
          type="complaint"
          history={history}
          departmentName={departments.find((d) => d.id === selected.departmentId)?.name}
          officerName={users.find((u) => u.id === selected.assignedOfficerId)?.fullName}
          onClose={() => setSelected(null)}
          actions={
            <>
              {actionError && <div className="alert alert-error">{actionError}</div>}
              {showAssign && (
                <>
                  <AiTriagePanel
                    type="complaint"
                    item={selected}
                    departments={departments}
                    onApplyDepartment={(deptId) => handleDeptChange(deptId)}
                  />
                  <select value={assignDept} onChange={(e) => handleDeptChange(e.target.value)}>
                    <option value="">{t('form.assignDepartment')}</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <select
                    value={assignOfficer}
                    onChange={(e) => setAssignOfficer(e.target.value)}
                    disabled={!assignDept}
                  >
                    <option value="">{t('form.anyOfficer')}</option>
                    {officersInDept.map((o) => (
                      <option key={o.id} value={o.id}>{o.fullName}</option>
                    ))}
                  </select>
                  {assignDept && officersInDept.length === 0 && (
                    <div className="alert alert-warning">{t('form.noOfficersInDept')}</div>
                  )}
                  {assignDept && officersInDept.length > 0 && !assignOfficer && (
                    <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0 }}>
                      {t('form.deptQueueHint')}
                    </p>
                  )}
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleAssign}
                    disabled={!assignDept || busy}
                  >
                    {assignOfficer ? t('form.assignOfficer') : t('form.routeDepartment')}
                  </button>
                  {selected.status === STATUSES.PENDING && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={busy}
                      onClick={() => handleStatus(STATUSES.REJECTED)}
                    >
                      {t('form.reject')}
                    </button>
                  )}
                </>
              )}
              {selected.status === STATUSES.IN_PROGRESS && (
                <>
                  <AiResolutionAssist
                    item={selected}
                    type="complaint"
                    actionTaken={note}
                    onApply={setNote}
                  />
                  <input
                    placeholder={t('form.resolutionNote')}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="inline-input"
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={busy}
                    onClick={() => handleStatus(STATUSES.RESOLVED)}
                  >
                    {t('form.markResolved')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={busy}
                    onClick={() => handleStatus(STATUSES.CLOSED)}
                  >
                    {t('form.close')}
                  </button>
                </>
              )}
            </>
          }
        />
      )}
    </div>
  );
}
