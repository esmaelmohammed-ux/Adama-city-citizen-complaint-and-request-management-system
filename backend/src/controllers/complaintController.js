import Complaint from '../models/Complaint.js';
import Department from '../models/Department.js';
import User from '../models/User.js';
import { ROLES, STATUSES } from '../constants/index.js';
import { generateReferenceId } from '../utils/referenceId.js';
import { buildOfficerEntityFilter, officerCanAccessEntity } from '../utils/officerScope.js';
import { toClient, toClientList } from '../utils/toClient.js';
import {
  canTransitionStatus,
  invalidTransitionMessage,
} from '../utils/statusTransitions.js';
import {
  createNotification,
  notifyOfficersOnAssign,
  recordActivity,
  recordStatusHistory,
} from '../utils/workflow.js';

function buildComplaintFilter(user) {
  if (user.role === ROLES.ADMIN) return {};
  if (user.role === ROLES.CITIZEN) return { citizenId: user._id };
  if (user.role === ROLES.OFFICER) return buildOfficerEntityFilter(user);
  return { _id: null };
}

export async function listComplaints(req, res, next) {
  try {
    const filter = buildComplaintFilter(req.user);
    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, complaints: toClientList(complaints) });
  } catch (err) {
    next(err);
  }
}

export async function createComplaint(req, res, next) {
  try {
    const { title, description, category, location, photoUrl } = req.body;
    const referenceId = await generateReferenceId(Complaint, 'CMP');

    const complaint = await Complaint.create({
      referenceId,
      title,
      description,
      category,
      location,
      photoUrl: photoUrl || '',
      attachmentUrl: req.file ? `/uploads/${req.file.filename}` : '',
      status: STATUSES.PENDING,
      citizenId: req.userId,
    });

    await recordStatusHistory({
      entityType: 'complaint',
      entityId: complaint._id,
      fromStatus: null,
      toStatus: STATUSES.PENDING,
      note: 'Complaint submitted',
      changedBy: req.userId,
    });

    res.status(201).json({
      success: true,
      referenceId: complaint.referenceId,
      complaint: toClient(complaint),
    });
  } catch (err) {
    next(err);
  }
}

export async function assignComplaint(req, res, next) {
  try {
    const { departmentId, officerId } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (![STATUSES.PENDING, STATUSES.IN_PROGRESS].includes(complaint.status)) {
      return res.status(400).json({
        success: false,
        message: 'Only pending or in-progress complaints can be assigned.',
      });
    }

    if (!departmentId) {
      return res.status(400).json({ success: false, message: 'Department is required.' });
    }

    const department = await Department.findById(departmentId);
    if (!department || !department.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Department not found or inactive.',
      });
    }

    let assignedOfficerId = null;
    if (officerId) {
      const officer = await User.findById(officerId);
      if (
        !officer ||
        officer.role !== ROLES.OFFICER ||
        !officer.isActive ||
        officer.departmentId?.toString() !== departmentId.toString()
      ) {
        return res.status(400).json({
          success: false,
          message: 'Officer must be an active member of the selected department.',
        });
      }
      assignedOfficerId = officer._id;
    }

    const previousStatus = complaint.status;
    const nextStatus = assignedOfficerId ? STATUSES.IN_PROGRESS : STATUSES.PENDING;
    complaint.departmentId = departmentId;
    complaint.assignedOfficerId = assignedOfficerId;
    complaint.status = nextStatus;
    await complaint.save();

    await recordStatusHistory({
      entityType: 'complaint',
      entityId: complaint._id,
      fromStatus: previousStatus,
      toStatus: nextStatus,
      note: assignedOfficerId
        ? 'Assigned to department officer'
        : 'Routed to department queue',
      changedBy: req.userId,
    });

    await recordActivity({
      userId: req.userId,
      action: 'assign',
      entityType: 'complaint',
      entityId: complaint._id,
      details: assignedOfficerId
        ? `Assigned to officer ${assignedOfficerId} in department ${departmentId}`
        : `Routed to department ${departmentId}`,
    });

    await createNotification({
      userId: complaint.citizenId,
      title: 'Status Updated',
      message: assignedOfficerId
        ? `Your complaint ${complaint.referenceId} is now In Progress.`
        : `Your complaint ${complaint.referenceId} has been routed to a department.`,
      relatedEntityType: 'complaint',
      relatedEntityId: complaint._id,
    });

    await notifyOfficersOnAssign({
      departmentId,
      officerId: assignedOfficerId,
      referenceId: complaint.referenceId,
      entityType: 'complaint',
      entityId: complaint._id,
    });

    res.json({ success: true, complaint: toClient(complaint) });
  } catch (err) {
    next(err);
  }
}

export async function updateComplaintStatus(req, res, next) {
  try {
    const { status, note } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (req.user.role === ROLES.OFFICER && !officerCanAccessEntity(complaint, req.user)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (!canTransitionStatus(req.user.role, complaint.status, status)) {
      return res.status(400).json({
        success: false,
        message: invalidTransitionMessage(complaint.status, status),
      });
    }

    const previousStatus = complaint.status;

    // Atomic claim when officer starts a department-queue item
    if (
      req.user.role === ROLES.OFFICER &&
      previousStatus === STATUSES.PENDING &&
      status === STATUSES.IN_PROGRESS &&
      !complaint.assignedOfficerId
    ) {
      const claimed = await Complaint.findOneAndUpdate(
        {
          _id: complaint._id,
          status: STATUSES.PENDING,
          departmentId: req.user.departmentId,
          $or: [{ assignedOfficerId: null }, { assignedOfficerId: { $exists: false } }],
        },
        {
          $set: {
            status: STATUSES.IN_PROGRESS,
            assignedOfficerId: req.userId,
            ...(note ? { resolutionNote: note } : {}),
          },
        },
        { new: true }
      );

      if (!claimed) {
        return res.status(409).json({
          success: false,
          message: 'This task was already claimed by another officer.',
        });
      }

      await recordStatusHistory({
        entityType: 'complaint',
        entityId: claimed._id,
        fromStatus: previousStatus,
        toStatus: status,
        note: note || 'Officer started work',
        changedBy: req.userId,
      });

      await recordActivity({
        userId: req.userId,
        action: 'status_update',
        entityType: 'complaint',
        entityId: claimed._id,
        details: `Status changed to ${status}`,
      });

      await createNotification({
        userId: claimed.citizenId,
        title: 'Status Updated',
        message: `Your ${claimed.referenceId} status is now ${status.replace('_', ' ')}.`,
        relatedEntityType: 'complaint',
        relatedEntityId: claimed._id,
      });

      return res.json({ success: true, complaint: toClient(claimed) });
    }

    complaint.status = status;
    if (note) complaint.resolutionNote = note;
    if ([STATUSES.RESOLVED, STATUSES.CLOSED].includes(status)) {
      complaint.resolvedAt = new Date();
    }
    await complaint.save();

    await recordStatusHistory({
      entityType: 'complaint',
      entityId: complaint._id,
      fromStatus: previousStatus,
      toStatus: status,
      note: note || '',
      changedBy: req.userId,
    });

    await recordActivity({
      userId: req.userId,
      action: 'status_update',
      entityType: 'complaint',
      entityId: complaint._id,
      details: `Status changed to ${status}`,
    });

    await createNotification({
      userId: complaint.citizenId,
      title: 'Status Updated',
      message: `Your ${complaint.referenceId} status is now ${status.replace('_', ' ')}.`,
      relatedEntityType: 'complaint',
      relatedEntityId: complaint._id,
    });

    res.json({ success: true, complaint: toClient(complaint) });
  } catch (err) {
    next(err);
  }
}
