import { useMemo, useState } from 'react';
import { PageHeader, StatCard } from '../../components/UI';
import SubmissionDetail from '../../components/SubmissionDetail';
import SubmissionTable from '../../components/SubmissionTable';
import { STATUSES } from '../../constants';
import { useApp } from '../../context/AppContext';

export default function OfficerDashboard() {
  const { currentUser, complaints, serviceRequests, departments } = useApp();
  const deptId = currentUser.departmentId;

  const assignedComplaints = complaints.filter((c) => c.departmentId === deptId);
  const assignedRequests = serviceRequests.filter((r) => r.departmentId === deptId);
  const all = [...assignedComplaints, ...assignedRequests];
  const pending = all.filter((x) => x.status === 'in_progress').length;

  const deptName = departments.find((d) => d.id === deptId)?.name;

  return (
    <div>
      <PageHeader
        title="Officer Dashboard"
        subtitle={`${deptName || 'Department'} — assigned work overview`}
      />

      <div className="stats-grid">
        <StatCard label="Assigned complaints" value={assignedComplaints.length} icon="📢" />
        <StatCard label="Assigned requests" value={assignedRequests.length} icon="📋" />
        <StatCard label="In progress" value={pending} icon="🔄" tone="info" />
        <StatCard label="Resolved" value={all.filter((x) => x.status === 'resolved').length} icon="✅" tone="success" />
      </div>
    </div>
  );
}

export function OfficerTasksPage() {
  const {
    currentUser,
    complaints,
    serviceRequests,
    departments,
    statusHistories,
    updateSubmissionStatus,
  } = useApp();
  const deptId = currentUser.departmentId;
  const [selected, setSelected] = useState(null);
  const [selectedType, setSelectedType] = useState('complaint');
  const [note, setNote] = useState('');

  const tasks = useMemo(() => {
    const c = complaints
      .filter((x) => x.departmentId === deptId && x.status === STATUSES.IN_PROGRESS)
      .map((x) => ({ ...x, itemType: 'complaint' }));
    const r = serviceRequests
      .filter((x) => x.departmentId === deptId && x.status === STATUSES.IN_PROGRESS)
      .map((x) => ({ ...x, itemType: 'serviceRequest' }));
    return [...c, ...r];
  }, [complaints, serviceRequests, deptId]);

  const history = selected
    ? statusHistories.filter(
        (h) =>
          h.entityId === selected.id &&
          h.entityType === (selectedType === 'complaint' ? 'complaint' : 'serviceRequest')
      )
    : [];

  const openTask = (item) => {
    setSelected(item);
    setSelectedType(item.itemType);
  };

  return (
    <div>
      <PageHeader title="Assigned Tasks" subtitle="Process complaints and requests for your department" />

      <SubmissionTable
        items={tasks}
        type="complaint"
        departments={departments}
        onView={openTask}
      />

      {selected && (
        <SubmissionDetail
          item={selected}
          type={selectedType}
          history={history}
          departmentName={departments.find((d) => d.id === deptId)?.name}
          onClose={() => setSelected(null)}
          actions={
            <>
              <input
                placeholder="Resolution or progress note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="inline-input"
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  updateSubmissionStatus(selectedType, selected.id, STATUSES.RESOLVED, note);
                  setSelected(null);
                  setNote('');
                }}
              >
                Mark resolved
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  updateSubmissionStatus(selectedType, selected.id, STATUSES.CLOSED, note);
                  setSelected(null);
                  setNote('');
                }}
              >
                Close
              </button>
            </>
          }
        />
      )}
    </div>
  );
}
