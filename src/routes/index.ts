import { Router } from 'express';
import authRoute from './auth-routes';
import usersRoute from './user-routes';
import profileRoute from './profile-routes';
import documentRoute from './document-routes';
import resumeUploadRoute from './resume-upload-routes';
import jobRoutes from './job-routes';
import applicantRoutes from './applicant-routes';

const apiRouter: Router = Router();

apiRouter.use('/auth', authRoute);
apiRouter.use('/users', usersRoute);
apiRouter.use('/profiles', profileRoute);
apiRouter.use('/documents', documentRoute);
apiRouter.use('/resume-uploads', resumeUploadRoute);
apiRouter.use('/jobs', jobRoutes);
apiRouter.use('/applications', applicantRoutes);

export default apiRouter;
