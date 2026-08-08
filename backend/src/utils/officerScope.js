import { ROLES } from '../constants/index.js';

/** Mongo filter: personally assigned, or unassigned items in the officer's department. */
export function buildOfficerEntityFilter(user) {
  if (!user.departmentId) {
    return { assignedOfficerId: user._id };
  }
  return {
    $or: [
      { assignedOfficerId: user._id },
      {
        departmentId: user.departmentId,
        $or: [{ assignedOfficerId: null }, { assignedOfficerId: { $exists: false } }],
      },
    ],
  };
}

export function officerCanAccessEntity(entity, user) {
  if (user.role !== ROLES.OFFICER) return false;
  const assigned =
    entity.assignedOfficerId?.toString() === user._id.toString();
  if (assigned) return true;
  if (!user.departmentId) return false;
  return (
    entity.departmentId?.toString() === user.departmentId.toString() &&
    !entity.assignedOfficerId
  );
}
