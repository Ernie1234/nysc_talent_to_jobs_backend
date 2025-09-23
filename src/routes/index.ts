import { Router } from 'express';
import authRoute from './auth-routes';
import usersRoute from './user-routes';
import profileRoute from './profile-routes';

const apiRouter: Router = Router();

apiRouter.use('/auth', authRoute);
apiRouter.use('/users', usersRoute);
apiRouter.use('/profiles', profileRoute);

export default apiRouter;
