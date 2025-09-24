/* eslint-disable @typescript-eslint/no-empty-object-type */
import { IUser } from '@/models/user-model';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
    interface User extends IUser {}
  }
}
