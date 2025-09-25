import { Router } from 'express';
import { passportAuthenticateJwt } from '@/config/passport-config';
import {
  allDocumentController,
  createDocumentController,
  deleteDocumentController,
  getSingleDocumentController,
  restoreDocumentController,
  updateDocumentController,
} from '@/controllers/document-controller';

const router = Router();

// routes/user-routes.ts
router.post('/create', passportAuthenticateJwt, createDocumentController);
router.patch('/update/:documentId', passportAuthenticateJwt, updateDocumentController);
router.patch('/restore/archive', passportAuthenticateJwt, restoreDocumentController);
router.get('/', passportAuthenticateJwt, allDocumentController);
router.get('/:documentId', passportAuthenticateJwt, getSingleDocumentController);
router.delete('/trash/all', passportAuthenticateJwt, deleteDocumentController);

export default router;
