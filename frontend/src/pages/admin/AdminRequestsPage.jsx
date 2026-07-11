import { useMemo, useState } from 'react';
import { PageHeader } from '../../components/UI';
import SubmissionDetail from '../../components/SubmissionDetail';
import SubmissionTable from '../../components/SubmissionTable';
import { STATUSES } from '../../constants';
import { useApp } from '../../context/AppContext';

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
  const [selected, setSelected] = useState(null);
  const [assignDept, setAssignDept] = useState('');
  const [note, setNote] = useState('');

  const filtered = useMemo(() => {
    return serviceRequests.filter((r) =>
      !search || `${r.referenceId} ${r.serviceType}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [serviceRequests, search]);

  const history = selected
    ? statusHistories.filter((h) => h.entityId === selected.id && h.entityType === 'serviceRequest')
    : [];

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
      </div>

      <SubmissionTable
        items={filtered}
        type="serviceRequest"
        showCitizen
        users={users}
        departments={departments}
        onView={setSelected}
      />

      {selected && (
        <SubmissionDetail
          item={selected}
          type="serviceRequest"
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
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      assignSubmission('serviceRequest', selected.id, assignDept);
                      setSelected(null);
                      setAssignDept('');
                    }}
                    disabled={!assignDept}
                  >
                    Assign
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
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      updateSubmissionStatus('serviceRequest', selected.id, STATUSES.RESOLVED, note);
                      setSelected(null);
                      setNote('');
                    }}
                  >
                    Mark resolved
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
