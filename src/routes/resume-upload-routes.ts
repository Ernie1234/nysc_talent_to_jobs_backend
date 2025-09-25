// routes/resume-upload-routes.ts
import { Router } from 'express';
import {
  uploadResumeController,
  getUserResumesController,
  getResumeByIdController,
  deleteResumeController,
  downloadResumeController,
} from '@/controllers/resume-upload-controller';
import { passportAuthenticateJwt } from '@/config/passport-config';
import { resumeUpload } from '@/config/resume-upload-config';
import { handleResumeUploadError } from '@/middleware/resume-upload-middleware';

const router = Router();

// All routes require authentication
router.use(passportAuthenticateJwt);

// Upload resume - using the separate resumeUpload multer configuration
router.post(
  '/upload',
  resumeUpload.single('resume'), // 'resume' is the field name in the form
  handleResumeUploadError,
  uploadResumeController
);

// Get user's resumes
router.get('/', getUserResumesController);

// Get specific resume
router.get('/:resumeId', getResumeByIdController);

// Download resume
router.get('/:resumeId/download', downloadResumeController);

// Delete resume
router.delete('/:resumeId', deleteResumeController);

export default router;
