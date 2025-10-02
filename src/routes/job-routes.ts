import { Router } from 'express';
import { passportAuthenticateJwt } from '@/config/passport-config';
import {
  createJobController,
  updateJobController,
  getJobController,
  getStaffJobsController,
  deleteJobController,
  publishJobController,
  closeJobController,
  getStaffAnalysisController,
  getPublicJobsController,
  getPublicJobDetailsController,
  updateJobViewCountController,
} from '@/controllers/job-controller';
import {
  applyToJobController,
  getStaffJobApplicationsController,
} from '@/controllers/applicant-controller';

const router = Router();

// All routes require JWT authentication
router.use(passportAuthenticateJwt);

// Job CRUD routes
router.post('/', createJobController);
router.get('/', getStaffJobsController);
// Corps Member routes
router.get('/users', getPublicJobsController);
router.get('/:jobId/users', getPublicJobDetailsController);
router.patch('/:jobId/users/view-count', updateJobViewCountController);

router.get('/analysis', getStaffAnalysisController);
router.get('/:jobId', getJobController);
router.put('/:jobId', updateJobController);
router.delete('/:jobId', deleteJobController);

// Job status management
router.patch('/:jobId/publish', publishJobController);
router.patch('/:jobId/close', closeJobController);

// Job Applications
router.post('/:jobId/apply', applyToJobController);
router.get('/:jobId/applications', getStaffJobApplicationsController);

export default router;
