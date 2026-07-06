import { Router } from 'express';
import { body } from 'express-validator';
import { createDepartment, listDepartments } from '../controllers/departmentController.js';
import { authenticate, attachUser, authorize } from '../middleware/auth.js';
import { ROLES } from '../constants/index.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authenticate, attachUser);

router.get('/', listDepartments);

router.post(
  '/',
  authorize(ROLES.ADMIN),
  [
    body('name').trim().notEmpty().withMessage('Department name is required.'),
    body('description').optional().trim(),
  ],
  validate,
  createDepartment
);

export default router;
