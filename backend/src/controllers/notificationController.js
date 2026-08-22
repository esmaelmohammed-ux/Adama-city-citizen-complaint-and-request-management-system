import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';
import StatusHistory from '../models/StatusHistory.js';
import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import { ROLES } from '../constants/index.js';
import { deliverUserChannels } from '../services/notifyChannels.js';
import { buildOfficerEntityFilter } from '../utils/officerScope.js';
import { createNotification } from '../utils/workflow.js';
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

/**
 * Admin smoke test: send email/SMS (and optional in-app notification).
 * Body: { userId?, email?, phone?, title?, message?, createInApp? }
 */
export async function testNotifyChannels(req, res, next) {
  try {
    const {
      userId,
      email,
      phone,
      title = 'Channel test',
      message = 'Adama Citizen Portal email/SMS test.',
      createInApp = false,
    } = req.body || {};

    let user = null;
    if (userId) {
      user = await User.findById(userId).select('email fullName phoneNumber isActive');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
    }

    const target = {
      email: email || user?.email || '',
      phoneNumber: phone || user?.phoneNumber || '',
      fullName: user?.fullName || 'Tester',
      isActive: true,
    };

    if (!target.email && !target.phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Provide userId, or email and/or phone.',
      });
    }

    const config = {
      smsEnabled: process.env.SMS_ENABLED === 'true',
      atUsername: process.env.AT_USERNAME || null,
      hasResend: Boolean(process.env.RESEND_API_KEY),
      emailFrom: process.env.EMAIL_FROM || null,
    };

    if (createInApp && user) {
      const notification = await createNotification({
        userId: user._id,
        title,
        message,
        relatedEntityType: null,
        relatedEntityId: null,
      });
      return res.json({
        success: true,
        mode: 'in-app+channels',
        config,
        notification: toClient(notification),
        note: 'In-app notification created; email/SMS sent asynchronously.',
      });
    }

    const results = await deliverUserChannels(target, { title, message });

    res.json({
      success: true,
      mode: 'direct',
      config,
      target: { email: target.email || null, phone: target.phoneNumber || null },
      results,
    });
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

async function accessibleComplaintIds(user) {
  if (user.role === ROLES.ADMIN) return null;

  let complaintFilter;
  if (user.role === ROLES.CITIZEN) {
    complaintFilter = { citizenId: user._id };
  } else if (user.role === ROLES.OFFICER) {
    complaintFilter = buildOfficerEntityFilter(user);
  } else {
    return [];
  }

  const complaints = await Complaint.find(complaintFilter).select('_id');
  return complaints.map((c) => c._id);
}

export async function listStatusHistories(req, res, next) {
  try {
    const { entityType, entityId } = req.query;
    const filter = {};

    if (req.user.role === ROLES.ADMIN) {
      if (entityType) filter.entityType = entityType;
      if (entityId) filter.entityId = entityId;
    } else {
      const complaintIds = await accessibleComplaintIds(req.user);

      if (entityType && entityId) {
        const allowed =
          entityType === 'complaint' &&
          complaintIds.some((id) => id.toString() === entityId.toString());
        if (!allowed) {
          return res.json({ success: true, statusHistories: [] });
        }
        filter.entityType = entityType;
        filter.entityId = entityId;
      } else {
        filter.entityType = 'complaint';
        filter.entityId = { $in: complaintIds };
      }
    }

    const statusHistories = await StatusHistory.find(filter).sort({ changedAt: -1 });
    res.json({ success: true, statusHistories: toClientList(statusHistories) });
  } catch (err) {
    next(err);
  }
}
