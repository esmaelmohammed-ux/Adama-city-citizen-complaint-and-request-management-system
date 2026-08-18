import ActivityLog from '../models/ActivityLog.js';
import Notification from '../models/Notification.js';
import StatusHistory from '../models/StatusHistory.js';
import User from '../models/User.js';
import { ROLES } from '../constants/index.js';
import { deliverUserChannels } from '../services/notifyChannels.js';

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
  const notification = await Notification.create({
    userId,
    title,
    message,
    relatedEntityType,
    relatedEntityId,
    isRead: false,
    createdAt: new Date(),
  });

  // Fire-and-forget email + SMS; never block or fail the request
  void (async () => {
    try {
      const user = await User.findById(userId).select('email fullName phoneNumber isActive');
      await deliverUserChannels(user, { title, message });
    } catch (err) {
      console.warn('[notify-channel]', err.message);
    }
  })();

  return notification;
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

/** Notify the assigned officer, or all active officers in the department. */
export async function notifyOfficersOnAssign({
  departmentId,
  officerId,
  referenceId,
  entityType,
  entityId,
}) {
  const label = entityType === 'complaint' ? 'complaint' : 'service request';
  const title = 'New assignment';
  const message = `${referenceId} has been assigned to you.`;

  if (officerId) {
    await createNotification({
      userId: officerId,
      title,
      message,
      relatedEntityType: entityType,
      relatedEntityId: entityId,
    });
    return;
  }

  if (!departmentId) return;

  const officers = await User.find({
    role: ROLES.OFFICER,
    departmentId,
    isActive: true,
  }).select('_id');

  await Promise.all(
    officers.map((officer) =>
      createNotification({
        userId: officer._id,
        title,
        message: `${referenceId} has been assigned to your department (${label}).`,
        relatedEntityType: entityType,
        relatedEntityId: entityId,
      })
    )
  );
}
