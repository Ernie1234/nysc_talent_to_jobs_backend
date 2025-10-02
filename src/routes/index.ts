import { Router } from 'express';
import authRoute from './auth-routes';
import usersRoute from './user-routes';
import profileRoute from './profile-routes';
import documentRoute from './document-routes';
import resumeUploadRoute from './resume-upload-routes';
import jobRoutes from './job-routes';
import applicantRoutes from './applicant-routes';
import onBoardingRoutes from './onboarding-routes';
import coursesRoute from './course-routes';
import adminRoutes from './admin-routes';

const apiRouter: Router = Router();

apiRouter.use('/auth', authRoute);
apiRouter.use('/users', usersRoute);
apiRouter.use('/profiles', profileRoute);
apiRouter.use('/documents', documentRoute);
apiRouter.use('/resume-uploads', resumeUploadRoute);
apiRouter.use('/jobs', jobRoutes);
apiRouter.use('/applications', applicantRoutes);
apiRouter.use('/onboarding', onBoardingRoutes);
apiRouter.use('/courses', coursesRoute);
apiRouter.use('/admin', adminRoutes);

export default apiRouter;
