import { ROLES, STATUSES } from '../constants/index.js';

/** Allowed next statuses by role and current status. */
const TRANSITIONS = {
  [ROLES.OFFICER]: {
    [STATUSES.PENDING]: [STATUSES.IN_PROGRESS],
    [STATUSES.IN_PROGRESS]: [STATUSES.RESOLVED, STATUSES.CLOSED],
  },
  [ROLES.ADMIN]: {
    [STATUSES.PENDING]: [STATUSES.REJECTED],
    [STATUSES.IN_PROGRESS]: [STATUSES.RESOLVED, STATUSES.CLOSED, STATUSES.REJECTED],
    [STATUSES.RESOLVED]: [STATUSES.CLOSED],
  },
};

export function canTransitionStatus(role, fromStatus, toStatus) {
  if (fromStatus === toStatus) return false;
  const allowed = TRANSITIONS[role]?.[fromStatus];
  return Array.isArray(allowed) && allowed.includes(toStatus);
}

export function invalidTransitionMessage(fromStatus, toStatus) {
  return `Cannot change status from ${fromStatus} to ${toStatus}.`;
}
