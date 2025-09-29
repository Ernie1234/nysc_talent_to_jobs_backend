import { Router } from 'express';
import {
  loginController,
  LogoutController,
  RegisterController,
} from '@/controllers/auth-controllers';

const router = Router();

// Register Credentials Route
router.post('/register', RegisterController);
router.post('/login', loginController);
router.post('/logout', LogoutController);

export default router;
