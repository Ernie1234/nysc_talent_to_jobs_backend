import { Router } from 'express';
import authRoute from './auth-routes';

const apiRouter: Router = Router();

apiRouter.use('/auth', authRoute);

export default apiRouter;
