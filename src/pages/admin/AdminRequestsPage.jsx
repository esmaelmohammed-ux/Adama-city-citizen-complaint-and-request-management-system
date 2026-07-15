import { useMemo, useState } from 'react';
import { PageHeader } from '../../components/UI';
import SubmissionDetail from '../../components/SubmissionDetail';
import SubmissionTable from '../../components/SubmissionTable';
import { ROLES, STATUSES } from '../../constants';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

export default function AdminRequestsPage() {
  const {
    serviceRequests,
    users,
    departments,
    statusHistories,
    assignSubmission,
    updateSubmissionStatus,
  } = useApp();
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
    return serviceRequests.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (
        search &&
        !`${r.referenceId} ${r.serviceType}`.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [serviceRequests, search, statusFilter]);

  const history = selected
    ? statusHistories.filter((h) => h.entityId === selected.id && h.entityType === 'serviceRequest')
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
      'serviceRequest',
      selected.id,
      assignDept,
      assignOfficer || null
    );
    setBusy(false);
    if (!result.success) {
      setActionError(result.message || 'Assign failed.');
      return;
    }
    showToast(
      assignOfficer
        ? 'Request assigned to officer successfully.'
        : 'Request routed to department successfully.'
    );
    setSelected(null);
    setAssignDept('');
    setAssignOfficer('');
  };

  const handleStatus = async (status) => {
    if (!selected) return;
    setBusy(true);
    setActionError('');
    const result = await updateSubmissionStatus('serviceRequest', selected.id, status, note);
    setBusy(false);
    if (!result.success) {
      setActionError(result.message || 'Update failed.');
      return;
    }
    const labels = {
      [STATUSES.REJECTED]: 'Request rejected.',
      [STATUSES.RESOLVED]: 'Request marked as resolved.',
      [STATUSES.CLOSED]: 'Request closed successfully.',
    };
    showToast(labels[status] || 'Request status updated.');
    setSelected(null);
    setNote('');
  };

  return (
    <div>
      <PageHeader title="Service Requests" subtitle="Manage citizen service requests" />

      <div className="filters-bar">
        <input
          className="search-input"
          placeholder="Search requests..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {Object.values(STATUSES).map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <SubmissionTable
        items={filtered}
        type="serviceRequest"
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
          type="serviceRequest"
          history={history}
          departmentName={departments.find((d) => d.id === selected.departmentId)?.name}
          officerName={users.find((u) => u.id === selected.assignedOfficerId)?.fullName}
          onClose={() => setSelected(null)}
          actions={
            <>
              {actionError && <div className="alert alert-error">{actionError}</div>}
              {showAssign && (
                <>
                  <select value={assignDept} onChange={(e) => handleDeptChange(e.target.value)}>
                    <option value="">Assign to department...</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <select
                    value={assignOfficer}
                    onChange={(e) => setAssignOfficer(e.target.value)}
                    disabled={!assignDept}
                  >
                    <option value="">Any officer (department queue)</option>
                    {officersInDept.map((o) => (
                      <option key={o.id} value={o.id}>{o.fullName}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleAssign}
                    disabled={!assignDept || busy}
                  >
                    {assignOfficer ? 'Assign to officer' : 'Route to department'}
                  </button>
                  {selected.status === STATUSES.PENDING && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={busy}
                      onClick={() => handleStatus(STATUSES.REJECTED)}
                    >
                      Reject
                    </button>
                  )}
                </>
              )}
              {selected.status === STATUSES.IN_PROGRESS && (
                <>
                  <input
                    placeholder="Resolution note..."
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
                    Mark resolved
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={busy}
                    onClick={() => handleStatus(STATUSES.CLOSED)}
                  >
                    Close
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
