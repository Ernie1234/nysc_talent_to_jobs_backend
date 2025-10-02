// src/routes/onboarding-routes.ts
import { Router } from 'express';
import {
  updateOnboardingStepController,
  completeOnboardingController,
  getOnboardingProgressController,
} from '@/controllers/onboarding-controller';
import { passportAuthenticateJwt } from '@/config/passport-config';

const router = Router();

// All routes require authentication
router.use(passportAuthenticateJwt);

router.get('/progress', getOnboardingProgressController);
router.patch('/step', updateOnboardingStepController);
router.post('/complete', completeOnboardingController);

export default router;
