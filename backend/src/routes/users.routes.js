import { Router } from 'express';
import { body } from 'express-validator';
import { listUsers, toggleUserActive, updateProfile } from '../controllers/userController.js';
import { authenticate, attachUser, authorize } from '../middleware/auth.js';
import { ROLES } from '../constants/index.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authenticate, attachUser);

router.get('/', authorize(ROLES.ADMIN), listUsers);

router.patch(
  '/me',
  [
    body('fullName').optional().trim().notEmpty(),
    body('phoneNumber').optional().trim(),
  ],
  validate,
  updateProfile
);

router.patch('/:id/active', authorize(ROLES.ADMIN), toggleUserActive);

export default router;
