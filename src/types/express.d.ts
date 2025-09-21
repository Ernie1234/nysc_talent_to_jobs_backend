// Import your full IUser interface from the model
import { IUser } from '@/models/User';
import { Request } from 'express';

declare global {
  namespace Express {
    export interface User extends IUser {}

    export interface Request {
      user?: User;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: IUser;
}
