import { Router } from 'express';
import { RegisterController } from '@/controllers/auth-controllers';

const router = Router();

// Register Credentials Route
router.post('/register', RegisterController);

export default router;
