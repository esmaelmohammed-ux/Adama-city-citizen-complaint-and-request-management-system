import { Router } from 'express';
import { body } from 'express-validator';
import {
  assignComplaint,
  createComplaint,
  listComplaints,
  updateComplaint,
  updateComplaintStatus,
} from '../controllers/complaintController.js';
import { upload } from '../controllers/uploadController.js';
import { authenticate, attachUser, authorize } from '../middleware/auth.js';
import { ADAMA_LOCATIONS, COMPLAINT_CATEGORIES, ROLES, STATUS_LIST } from '../constants/index.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authenticate, attachUser);

router.get('/', listComplaints);

router.post(
  '/',
  authorize(ROLES.CITIZEN),
  upload.single('photo'),
  [
    body('title').trim().notEmpty().withMessage('Title is required.'),
    body('description').trim().notEmpty().withMessage('Description is required.'),
    body('category').isIn(COMPLAINT_CATEGORIES).withMessage('Invalid category.'),
    body('location').isIn(ADAMA_LOCATIONS).withMessage('Select a valid Adama location.'),
    body('landmark').optional().trim().isLength({ max: 120 }).withMessage('Landmark is too long.'),
    body('photoUrl').optional(),
  ],
  validate,
  createComplaint
);

router.patch(
  '/:id/assign',
  authorize(ROLES.ADMIN),
  [
    body('departmentId').notEmpty().withMessage('Department is required.'),
    body('officerId').optional(),
  ],
  validate,
  assignComplaint
);

router.patch(
  '/:id/status',
  authorize(ROLES.ADMIN, ROLES.OFFICER),
  [
    body('status').isIn(STATUS_LIST).withMessage('Invalid status.'),
    body('note').optional().trim(),
  ],
  validate,
  updateComplaintStatus
);

router.patch(
  '/:id',
  authorize(ROLES.CITIZEN),
  [
    body('title').trim().notEmpty().withMessage('Title is required.'),
    body('description').trim().notEmpty().withMessage('Description is required.'),
    body('category').isIn(COMPLAINT_CATEGORIES).withMessage('Invalid category.'),
    body('location').trim().notEmpty().withMessage('Location is required.'),
    body('landmark').optional().trim().isLength({ max: 120 }).withMessage('Landmark is too long.'),
    body('photoUrl').optional(),
  ],
  validate,
  updateComplaint
);

export default router;
