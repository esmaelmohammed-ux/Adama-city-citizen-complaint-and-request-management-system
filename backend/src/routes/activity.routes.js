import { Router } from 'express';
import {
  listActivityLogs,
  listNotifications,
  listStatusHistories,
  markAllNotificationsRead,
  markNotificationRead,
} from '../controllers/notificationController.js';
import { authenticate, attachUser, authorize } from '../middleware/auth.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.use(authenticate, attachUser);

router.get('/notifications', listNotifications);
router.patch('/notifications/read-all', markAllNotificationsRead);
router.patch('/notifications/:id/read', markNotificationRead);

router.get('/status-histories', listStatusHistories);

router.get('/activity-logs', authorize(ROLES.ADMIN), listActivityLogs);

export default router;
