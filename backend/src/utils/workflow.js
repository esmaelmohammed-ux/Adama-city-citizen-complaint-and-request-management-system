import ActivityLog from '../models/ActivityLog.js';
import Notification from '../models/Notification.js';
import StatusHistory from '../models/StatusHistory.js';

export async function recordStatusHistory({
  entityType,
  entityId,
  fromStatus,
  toStatus,
  note,
  changedBy,
}) {
  return StatusHistory.create({
    entityType,
    entityId,
    fromStatus,
    toStatus,
    note: note || '',
    changedBy,
    changedAt: new Date(),
  });
}

export async function createNotification({
  userId,
  title,
  message,
  relatedEntityType,
  relatedEntityId,
}) {
  return Notification.create({
    userId,
    title,
    message,
    relatedEntityType,
    relatedEntityId,
    isRead: false,
    createdAt: new Date(),
  });
}

export async function recordActivity({
  userId,
  action,
  entityType,
  entityId,
  details,
}) {
  return ActivityLog.create({
    userId,
    action,
    entityType,
    entityId,
    details,
    createdAt: new Date(),
  });
}
