import ServiceRequest from '../models/ServiceRequest.js';
import { ROLES, STATUSES } from '../constants/index.js';
import { generateReferenceId } from '../utils/referenceId.js';
import { toClient, toClientList } from '../utils/toClient.js';
import {
  createNotification,
  recordActivity,
  recordStatusHistory,
} from '../utils/workflow.js';

function buildServiceRequestFilter(user) {
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

    const previousStatus = serviceRequest.status;
    serviceRequest.departmentId = departmentId;
    serviceRequest.assignedOfficerId = officerId || null;
    serviceRequest.status = STATUSES.IN_PROGRESS;
    await serviceRequest.save();

    await recordStatusHistory({
      entityType: 'serviceRequest',
      entityId: serviceRequest._id,
      fromStatus: previousStatus,
      toStatus: STATUSES.IN_PROGRESS,
      note: 'Assigned to department',
      changedBy: req.userId,
    });

    await recordActivity({
      userId: req.userId,
      action: 'assign',
      entityType: 'serviceRequest',
      entityId: serviceRequest._id,
      details: `Assigned to department ${departmentId}`,
    });

    await createNotification({
      userId: serviceRequest.citizenId,
      title: 'Status Updated',
      message: `Your request ${serviceRequest.referenceId} is now In Progress.`,
      relatedEntityType: 'serviceRequest',
      relatedEntityId: serviceRequest._id,
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

    if (req.user.role === ROLES.OFFICER) {
      const sameDept =
        serviceRequest.departmentId?.toString() === req.user.departmentId?.toString();
      const assigned =
        serviceRequest.assignedOfficerId?.toString() === req.userId.toString();
      if (!sameDept && !assigned) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }

    const previousStatus = serviceRequest.status;
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
