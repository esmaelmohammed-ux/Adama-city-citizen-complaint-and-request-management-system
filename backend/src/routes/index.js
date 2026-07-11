import { Router } from 'express';
import authRoutes from './auth.routes.js';
import usersRoutes from './users.routes.js';
import departmentsRoutes from './departments.routes.js';
import complaintsRoutes from './complaints.routes.js';
import serviceRequestsRoutes from './serviceRequests.routes.js';
import activityRoutes from './activity.routes.js';
import reportsRoutes from './reports.routes.js';
import uploadsRoutes from './uploads.routes.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Adama Citizen API',
    version: '1.0.0',
    docs: {
      health: 'GET /api/health',
      login: 'POST /api/auth/login',
      register: 'POST /api/auth/register',
    },
  });
});

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Adama Citizen API is running.' });
});

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/departments', departmentsRoutes);
router.use('/complaints', complaintsRoutes);
router.use('/service-requests', serviceRequestsRoutes);
router.use('/uploads', uploadsRoutes);
router.use('/reports', reportsRoutes);
router.use('/', activityRoutes);

export default router;
