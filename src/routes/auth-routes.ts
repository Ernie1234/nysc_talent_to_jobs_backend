import { Router } from 'express';
import { loginController, RegisterController } from '@/controllers/auth-controllers';

const router = Router();

// Register Credentials Route
router.post('/register', RegisterController);
router.post('/login', loginController);

export default router;
