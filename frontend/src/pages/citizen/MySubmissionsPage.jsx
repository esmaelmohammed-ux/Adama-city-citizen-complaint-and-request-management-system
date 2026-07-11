import { useMemo, useState } from 'react';
import { PageHeader } from '../../components/UI';
import SubmissionDetail from '../../components/SubmissionDetail';
import SubmissionTable from '../../components/SubmissionTable';
import { useApp } from '../../context/AppContext';

export default function MySubmissionsPage() {
  const { currentUser, complaints, serviceRequests, departments, statusHistories } = useApp();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [selectedType, setSelectedType] = useState('complaint');

  const myComplaints = complaints.filter((c) => c.citizenId === currentUser.id);
  const myRequests = serviceRequests.filter((r) => r.citizenId === currentUser.id);

  const filteredComplaints = useMemo(() => {
    return myComplaints.filter((c) => {
      if (filter !== 'all' && c.status !== filter) return false;
      if (search && !c.referenceId.toLowerCase().includes(search.toLowerCase()) && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [myComplaints, filter, search]);

  const filteredRequests = useMemo(() => {
    return myRequests.filter((r) => {
      if (filter !== 'all' && r.status !== filter) return false;
      if (search && !r.referenceId.toLowerCase().includes(search.toLowerCase()) && !r.serviceType.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [myRequests, filter, search]);

  const openDetail = (item, type) => {
    setSelected(item);
    setSelectedType(type);
  };

  const history = selected
    ? statusHistories.filter(
        (h) => h.entityId === selected.id && h.entityType === (selectedType === 'complaint' ? 'complaint' : 'serviceRequest')
      )
    : [];

  const deptName = selected?.departmentId
    ? departments.find((d) => d.id === selected.departmentId)?.name
    : null;

  return (
    <div>
      <PageHeader title="My Submissions" subtitle="Track all your complaints and service requests" />

      <div className="filters-bar">
        <input
          className="search-input"
          placeholder="Search by reference or title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <h2 className="section-title">Complaints ({filteredComplaints.length})</h2>
      <SubmissionTable
        items={filteredComplaints}
        type="complaint"
        onView={(item) => openDetail(item, 'complaint')}
      />

      <h2 className="section-title">Service Requests ({filteredRequests.length})</h2>
      <SubmissionTable
        items={filteredRequests}
        type="serviceRequest"
        onView={(item) => openDetail(item, 'serviceRequest')}
      />

      {selected && (
        <SubmissionDetail
          item={selected}
          type={selectedType}
          history={history}
          departmentName={deptName}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
