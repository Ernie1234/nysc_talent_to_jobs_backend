import { Router } from 'express';
import { passportAuthenticateJwt } from '@/config/passport-config';
import { getUserProfileController } from '@/controllers/profile-controller';

const router = Router();

// routes/user-routes.ts
router.get('/profile', passportAuthenticateJwt, getUserProfileController);

export default router;
