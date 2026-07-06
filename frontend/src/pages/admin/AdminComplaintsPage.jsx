import { useMemo, useState } from 'react';
import { PageHeader } from '../../components/UI';
import SubmissionDetail from '../../components/SubmissionDetail';
import SubmissionTable from '../../components/SubmissionTable';
import { STATUSES } from '../../constants';
import { useApp } from '../../context/AppContext';

export default function AdminComplaintsPage() {
  const {
    complaints,
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
  const [note, setNote] = useState('');

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

  const handleAssign = () => {
    if (!selected || !assignDept) return;
    assignSubmission('complaint', selected.id, assignDept);
    setSelected(null);
    setAssignDept('');
  };

  const handleStatus = (status) => {
    if (!selected) return;
    updateSubmissionStatus('complaint', selected.id, status, note);
    setSelected(null);
    setNote('');
  };

  return (
    <div>
      <PageHeader title="Manage Complaints" subtitle="Review, assign, and update complaint status" />

      <div className="filters-bar">
        <input
          className="search-input"
          placeholder="Search complaints..."
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
        type="complaint"
        showCitizen
        users={users}
        departments={departments}
        onView={setSelected}
      />

      {selected && (
        <SubmissionDetail
          item={selected}
          type="complaint"
          history={history}
          departmentName={departments.find((d) => d.id === selected.departmentId)?.name}
          onClose={() => setSelected(null)}
          actions={
            <>
              {selected.status === STATUSES.PENDING && (
                <>
                  <select value={assignDept} onChange={(e) => setAssignDept(e.target.value)}>
                    <option value="">Assign to department...</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <button type="button" className="btn btn-primary btn-sm" onClick={handleAssign} disabled={!assignDept}>
                    Assign
                  </button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => handleStatus(STATUSES.REJECTED)}>
                    Reject
                  </button>
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
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => handleStatus(STATUSES.RESOLVED)}>
                    Mark resolved
                  </button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => handleStatus(STATUSES.CLOSED)}>
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
