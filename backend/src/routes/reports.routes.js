import { Router } from 'express';
import { getByCategory, getByDepartment, getSummary } from '../controllers/reportController.js';
import { authenticate, attachUser, authorize } from '../middleware/auth.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.use(authenticate, attachUser, authorize(ROLES.ADMIN));

router.get('/summary', getSummary);
router.get('/by-category', getByCategory);
router.get('/by-department', getByDepartment);

export default router;
