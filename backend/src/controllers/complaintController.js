import Complaint from '../models/Complaint.js';
import { ROLES, STATUSES } from '../constants/index.js';
import { generateReferenceId } from '../utils/referenceId.js';
import { toClient, toClientList } from '../utils/toClient.js';
import {
  createNotification,
  recordActivity,
  recordStatusHistory,
} from '../utils/workflow.js';

function buildComplaintFilter(user) {
  if (user.role === ROLES.ADMIN) return {};
  if (user.role === ROLES.CITIZEN) return { citizenId: user._id };
  if (user.role === ROLES.OFFICER) {
    return {
      $or: [
        { departmentId: user.departmentId },
        { assignedOfficerId: user._id },
      ],
    };
  }
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

    const previousStatus = complaint.status;
    complaint.departmentId = departmentId;
    complaint.assignedOfficerId = officerId || null;
    complaint.status = STATUSES.IN_PROGRESS;
    await complaint.save();

    await recordStatusHistory({
      entityType: 'complaint',
      entityId: complaint._id,
      fromStatus: previousStatus,
      toStatus: STATUSES.IN_PROGRESS,
      note: 'Assigned to department',
      changedBy: req.userId,
    });

    await recordActivity({
      userId: req.userId,
      action: 'assign',
      entityType: 'complaint',
      entityId: complaint._id,
      details: `Assigned to department ${departmentId}`,
    });

    await createNotification({
      userId: complaint.citizenId,
      title: 'Status Updated',
      message: `Your complaint ${complaint.referenceId} is now In Progress.`,
      relatedEntityType: 'complaint',
      relatedEntityId: complaint._id,
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

    if (req.user.role === ROLES.OFFICER) {
      const sameDept =
        complaint.departmentId?.toString() === req.user.departmentId?.toString();
      const assigned =
        complaint.assignedOfficerId?.toString() === req.userId.toString();
      if (!sameDept && !assigned) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }

    const previousStatus = complaint.status;
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
