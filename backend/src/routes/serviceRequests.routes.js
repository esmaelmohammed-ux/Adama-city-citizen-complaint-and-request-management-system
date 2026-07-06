import { Router } from 'express';
import { body } from 'express-validator';
import {
  assignServiceRequest,
  createServiceRequest,
  listServiceRequests,
  updateServiceRequestStatus,
} from '../controllers/serviceRequestController.js';
import { authenticate, attachUser, authorize } from '../middleware/auth.js';
import { ROLES, SERVICE_TYPES, STATUS_LIST } from '../constants/index.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authenticate, attachUser);

router.get('/', listServiceRequests);

router.post(
  '/',
  authorize(ROLES.CITIZEN),
  [
    body('serviceType').isIn(SERVICE_TYPES).withMessage('Invalid service type.'),
    body('description').trim().notEmpty().withMessage('Description is required.'),
    body('location').optional().trim(),
  ],
  validate,
  createServiceRequest
);

router.patch(
  '/:id/assign',
  authorize(ROLES.ADMIN),
  [
    body('departmentId').notEmpty().withMessage('Department is required.'),
    body('officerId').optional(),
  ],
  validate,
  assignServiceRequest
);

router.patch(
  '/:id/status',
  authorize(ROLES.ADMIN, ROLES.OFFICER),
  [
    body('status').isIn(STATUS_LIST).withMessage('Invalid status.'),
    body('note').optional().trim(),
  ],
  validate,
  updateServiceRequestStatus
);

export default router;
