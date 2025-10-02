// routes/admin-routes.ts
import { Router } from 'express';
import { passportAuthenticateJwt } from '@/config/passport-config';
import {
  getAdminDashboardStatsController,
  getAllApplicationsController,
  getAllUsersController,
  updateApplicationStatusController,
  updateUserStatusController,
} from '@/controllers/admin-controller';

const router = Router();

// All routes require ADMIN authentication
router.use(passportAuthenticateJwt);

// Application management routes
router.get('/applications', getAllApplicationsController);
router.patch('/applications/:applicationId/status', updateApplicationStatusController);

// User management routes
router.get('/users', getAllUsersController);
router.patch('/users/:userId/status', updateUserStatusController);

// Dashboard stats
router.get('/dashboard/stats', getAdminDashboardStatsController);

export default router;
