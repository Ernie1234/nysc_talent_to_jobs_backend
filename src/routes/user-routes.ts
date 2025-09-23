import { Router } from 'express';
import { getCurrentUserController, updateUserController } from '@/controllers/user-controller';
import { passportAuthenticateJwt } from '@/config/passport-config';
import { upload } from '@/config/cloudinary-config';
import { handleUploadError } from '@/middleware/multer-middleware';

const router = Router();

// Get Current User Route
router.get('/current-user', passportAuthenticateJwt, getCurrentUserController);
router.patch(
  '/update-user',
  passportAuthenticateJwt,
  upload.single('profilePicture'),
  handleUploadError,
  updateUserController
);

export default router;
