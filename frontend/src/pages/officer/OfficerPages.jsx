import { useMemo, useState } from 'react';
import AiResolutionAssist from '../../components/ai/AiResolutionAssist';
import { PageHeader, StatCard } from '../../components/UI';
import SubmissionDetail from '../../components/SubmissionDetail';
import SubmissionTable from '../../components/SubmissionTable';
import { STATUSES } from '../../constants';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

const OPEN_STATUSES = [STATUSES.PENDING, STATUSES.IN_PROGRESS];

/** Match backend: personally assigned, or unassigned items in my department. */
function isOfficerScoped(item, user) {
  if (item.assignedOfficerId === user.id) return true;
  if (
    user.departmentId &&
    item.departmentId === user.departmentId &&
    !item.assignedOfficerId
  ) {
    return true;
  }
  return false;
}

export default function OfficerDashboard() {
  const { currentUser, complaints, departments } = useApp();
  const { t } = useLanguage();

  const assigned = complaints.filter((c) => isOfficerScoped(c, currentUser));
  const openCount = assigned.filter((x) => OPEN_STATUSES.includes(x.status)).length;
  const inProgress = assigned.filter((x) => x.status === STATUSES.IN_PROGRESS).length;
  const pendingQueue = assigned.filter((x) => x.status === STATUSES.PENDING).length;

  const deptName = departments.find((d) => d.id === currentUser.departmentId)?.name;

  return (
    <div>
      <PageHeader
        title={t('officer.dashboardTitle')}
        subtitle={t('officer.dashboardSubtitle', {
          department: deptName || t('officer.departmentFallback'),
        })}
      />

      <div className="stats-grid">
        <StatCard label={t('officer.openTasks')} value={openCount} icon="📋" />
        <StatCard label={t('officer.pendingQueue')} value={pendingQueue} icon="⏳" tone="info" />
        <StatCard label={t('officer.inProgress')} value={inProgress} icon="🔄" tone="info" />
        <StatCard
          label={t('officer.resolved')}
          value={assigned.filter((x) => x.status === STATUSES.RESOLVED).length}
          icon="✅"
          tone="success"
        />
      </div>
    </div>
  );
}

export function OfficerTasksPage() {
  const {
    currentUser,
    complaints,
    departments,
    statusHistories,
    updateSubmissionStatus,
  } = useApp();
  const { t } = useLanguage();
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const { showToast } = useToast();

  const tasks = useMemo(() => {
    return complaints
      .filter((x) => isOfficerScoped(x, currentUser) && OPEN_STATUSES.includes(x.status))
      .sort((a, b) => {
        if (a.status === b.status) return 0;
        return a.status === STATUSES.PENDING ? -1 : 1;
      });
  }, [complaints, currentUser]);

  const history = selected
    ? statusHistories.filter((h) => h.entityId === selected.id && h.entityType === 'complaint')
    : [];

  const openTask = (item) => {
    setSelected(item);
    setActionError('');
    setNote('');
  };

  const runStatus = async (status) => {
    setBusy(true);
    setActionError('');
    const result = await updateSubmissionStatus(selected.id, status, note);
    setBusy(false);
    if (!result.success) {
      setActionError(result.message || t('officer.updateFailed'));
      return;
    }
    const labels = {
      [STATUSES.IN_PROGRESS]: t('officer.workStarted'),
      [STATUSES.RESOLVED]: t('officer.markedResolved'),
      [STATUSES.CLOSED]: t('officer.taskClosed'),
    };
    showToast(labels[status] || t('officer.statusUpdated'));
    setSelected(null);
    setNote('');
  };

  return (
    <div>
      <PageHeader title={t('officer.tasksTitle')} subtitle={t('officer.tasksSubtitle')} />

      <SubmissionTable
        items={tasks}
        departments={departments}
        onView={openTask}
      />

      {selected && (
        <SubmissionDetail
          item={selected}
          history={history}
          departmentName={
            departments.find((d) => d.id === selected.departmentId)?.name
          }
          onClose={() => setSelected(null)}
          actions={
            <>
              {actionError && <div className="alert alert-error">{actionError}</div>}
              {selected.status === STATUSES.PENDING && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={busy}
                  onClick={() => runStatus(STATUSES.IN_PROGRESS)}
                >
                  {t('form.startWork')}
                </button>
              )}
              {selected.status === STATUSES.IN_PROGRESS && (
                <>
                  <AiResolutionAssist
                    item={selected}
                    actionTaken={note}
                    onApply={setNote}
                  />
                  <input
                    placeholder={t('form.resolutionProgressNote')}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="inline-input"
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={busy}
                    onClick={() => runStatus(STATUSES.RESOLVED)}
                  >
                    {t('form.markResolved')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={busy}
                    onClick={() => runStatus(STATUSES.CLOSED)}
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
