// routes/applicant-routes.ts
import { Router } from 'express';
import { passportAuthenticateJwt } from '@/config/passport-config';
import {
  getApplicationDetailsController,
  getStaffApplicationAnalysisController,
  getStaffApplicationsController,
  getUserApplicationsController,
  updateApplicationController,
  withdrawApplicationController,
} from '@/controllers/applicant-controller';

const router = Router();

// All routes require authentication
router.use(passportAuthenticateJwt);

// Corps member routes
router.get('/my-applications', getUserApplicationsController);
router.get('/staff', getStaffApplicationsController);
router.get('/analysis', getStaffApplicationAnalysisController);
router.patch('/:applicationId/withdraw', withdrawApplicationController);
router.get('/:applicationId', getApplicationDetailsController);
router.patch('/:applicationId', updateApplicationController);

export default router;
