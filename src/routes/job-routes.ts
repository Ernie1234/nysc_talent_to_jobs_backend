import { Router } from 'express';
import { passportAuthenticateJwt } from '@/config/passport-config';
import {
  createJobController,
  updateJobController,
  getJobController,
  getEmployerJobsController,
  deleteJobController,
  publishJobController,
  closeJobController,
  getEmployerAnalysisController,
} from '@/controllers/job-controller';
import {
  applyToJobController,
  getJobApplicationsController,
} from '@/controllers/applicant-controller';

const router = Router();

// All routes require JWT authentication
router.use(passportAuthenticateJwt);

// Job CRUD routes
router.post('/', createJobController);
router.get('/', getEmployerJobsController);
router.get('/analysis', getEmployerAnalysisController);
router.get('/:jobId', getJobController);
router.put('/:jobId', updateJobController);
router.delete('/:jobId', deleteJobController);

// Job status management
router.patch('/:jobId/publish', publishJobController);
router.patch('/:jobId/close', closeJobController);

// Job Applications
router.post('/:jobId/apply', applyToJobController);
router.get('/:jobId/applications', getJobApplicationsController);

export default router;
