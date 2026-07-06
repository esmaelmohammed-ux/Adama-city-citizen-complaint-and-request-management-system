import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';
import StatusHistory from '../models/StatusHistory.js';
import { toClient, toClientList } from '../utils/toClient.js';

export async function listNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    res.json({ success: true, notifications: toClientList(notifications) });
  } catch (err) {
    next(err);
  }
}

export async function markNotificationRead(req, res, next) {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ success: true, notification: toClient(notification) });
  } catch (err) {
    next(err);
  }
}

export async function markAllNotificationsRead(req, res, next) {
  try {
    await Notification.updateMany({ userId: req.userId, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function listActivityLogs(req, res, next) {
  try {
    const activityLogs = await ActivityLog.find().sort({ createdAt: -1 }).limit(200);
    res.json({ success: true, activityLogs: toClientList(activityLogs) });
  } catch (err) {
    next(err);
  }
}

export async function listStatusHistories(req, res, next) {
  try {
    const { entityType, entityId } = req.query;
    const filter = {};
    if (entityType) filter.entityType = entityType;
    if (entityId) filter.entityId = entityId;

    const statusHistories = await StatusHistory.find(filter).sort({ changedAt: -1 });
    res.json({ success: true, statusHistories: toClientList(statusHistories) });
  } catch (err) {
    next(err);
  }
}
