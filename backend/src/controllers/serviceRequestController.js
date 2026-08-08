import ServiceRequest from '../models/ServiceRequest.js';
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

function buildServiceRequestFilter(user) {
  if (user.role === ROLES.ADMIN) return {};
  if (user.role === ROLES.CITIZEN) return { citizenId: user._id };
  if (user.role === ROLES.OFFICER) return buildOfficerEntityFilter(user);
  return { _id: null };
}

export async function listServiceRequests(req, res, next) {
  try {
    const filter = buildServiceRequestFilter(req.user);
    const serviceRequests = await ServiceRequest.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, serviceRequests: toClientList(serviceRequests) });
  } catch (err) {
    next(err);
  }
}

export async function createServiceRequest(req, res, next) {
  try {
    const { serviceType, description, location } = req.body;
    const referenceId = await generateReferenceId(ServiceRequest, 'SRV');

    const serviceRequest = await ServiceRequest.create({
      referenceId,
      serviceType,
      description,
      location: location || '',
      status: STATUSES.PENDING,
      citizenId: req.userId,
    });

    await recordStatusHistory({
      entityType: 'serviceRequest',
      entityId: serviceRequest._id,
      fromStatus: null,
      toStatus: STATUSES.PENDING,
      note: 'Service request submitted',
      changedBy: req.userId,
    });

    res.status(201).json({
      success: true,
      referenceId: serviceRequest.referenceId,
      serviceRequest: toClient(serviceRequest),
    });
  } catch (err) {
    next(err);
  }
}

export async function assignServiceRequest(req, res, next) {
  try {
    const { departmentId, officerId } = req.body;
    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (!serviceRequest) {
      return res.status(404).json({ success: false, message: 'Service request not found.' });
    }

    if (![STATUSES.PENDING, STATUSES.IN_PROGRESS].includes(serviceRequest.status)) {
      return res.status(400).json({
        success: false,
        message: 'Only pending or in-progress service requests can be assigned.',
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

    const previousStatus = serviceRequest.status;
    const nextStatus = assignedOfficerId ? STATUSES.IN_PROGRESS : STATUSES.PENDING;
    serviceRequest.departmentId = departmentId;
    serviceRequest.assignedOfficerId = assignedOfficerId;
    serviceRequest.status = nextStatus;
    await serviceRequest.save();

    await recordStatusHistory({
      entityType: 'serviceRequest',
      entityId: serviceRequest._id,
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
      entityType: 'serviceRequest',
      entityId: serviceRequest._id,
      details: assignedOfficerId
        ? `Assigned to officer ${assignedOfficerId} in department ${departmentId}`
        : `Routed to department ${departmentId}`,
    });

    await createNotification({
      userId: serviceRequest.citizenId,
      title: 'Status Updated',
      message: assignedOfficerId
        ? `Your request ${serviceRequest.referenceId} is now In Progress.`
        : `Your request ${serviceRequest.referenceId} has been routed to a department.`,
      relatedEntityType: 'serviceRequest',
      relatedEntityId: serviceRequest._id,
    });

    await notifyOfficersOnAssign({
      departmentId,
      officerId: assignedOfficerId,
      referenceId: serviceRequest.referenceId,
      entityType: 'serviceRequest',
      entityId: serviceRequest._id,
    });

    res.json({ success: true, serviceRequest: toClient(serviceRequest) });
  } catch (err) {
    next(err);
  }
}

export async function updateServiceRequestStatus(req, res, next) {
  try {
    const { status, note } = req.body;
    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (!serviceRequest) {
      return res.status(404).json({ success: false, message: 'Service request not found.' });
    }

    if (req.user.role === ROLES.OFFICER && !officerCanAccessEntity(serviceRequest, req.user)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (!canTransitionStatus(req.user.role, serviceRequest.status, status)) {
      return res.status(400).json({
        success: false,
        message: invalidTransitionMessage(serviceRequest.status, status),
      });
    }

    const previousStatus = serviceRequest.status;

    if (
      req.user.role === ROLES.OFFICER &&
      previousStatus === STATUSES.PENDING &&
      status === STATUSES.IN_PROGRESS &&
      !serviceRequest.assignedOfficerId
    ) {
      const claimed = await ServiceRequest.findOneAndUpdate(
        {
          _id: serviceRequest._id,
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
        entityType: 'serviceRequest',
        entityId: claimed._id,
        fromStatus: previousStatus,
        toStatus: status,
        note: note || 'Officer started work',
        changedBy: req.userId,
      });

      await recordActivity({
        userId: req.userId,
        action: 'status_update',
        entityType: 'serviceRequest',
        entityId: claimed._id,
        details: `Status changed to ${status}`,
      });

      await createNotification({
        userId: claimed.citizenId,
        title: 'Status Updated',
        message: `Your ${claimed.referenceId} status is now ${status.replace('_', ' ')}.`,
        relatedEntityType: 'serviceRequest',
        relatedEntityId: claimed._id,
      });

      return res.json({ success: true, serviceRequest: toClient(claimed) });
    }

    serviceRequest.status = status;
    if (note) serviceRequest.resolutionNote = note;
    if ([STATUSES.RESOLVED, STATUSES.CLOSED].includes(status)) {
      serviceRequest.resolvedAt = new Date();
    }
    await serviceRequest.save();

    await recordStatusHistory({
      entityType: 'serviceRequest',
      entityId: serviceRequest._id,
      fromStatus: previousStatus,
      toStatus: status,
      note: note || '',
      changedBy: req.userId,
    });

    await recordActivity({
      userId: req.userId,
      action: 'status_update',
      entityType: 'serviceRequest',
      entityId: serviceRequest._id,
      details: `Status changed to ${status}`,
    });

    await createNotification({
      userId: serviceRequest.citizenId,
      title: 'Status Updated',
      message: `Your ${serviceRequest.referenceId} status is now ${status.replace('_', ' ')}.`,
      relatedEntityType: 'serviceRequest',
      relatedEntityId: serviceRequest._id,
    });

    res.json({ success: true, serviceRequest: toClient(serviceRequest) });
  } catch (err) {
    next(err);
  }
}
