// middleware/nitda-auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { UnauthorizedException } from '@/utils/app-error';
import { hasAdminCapabilities, hasPermission } from '@/utils/role-utils';
import { asyncHandler } from './asyncHandler.middlerware';

export const requireNITDARole = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !hasAdminCapabilities(user.role)) {
      throw new UnauthorizedException('This action requires NITDA administrator privileges');
    }

    next();
  }
);

export const requireEmployerOrNITDA = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !(user.role === 'employer' || user.role === 'nitda')) {
      throw new UnauthorizedException('This action requires employer or NITDA privileges');
    }

    next();
  }
);

export const requirePermission = (permission: string) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !hasPermission(user.role, permission as any)) {
      throw new UnauthorizedException(`Insufficient permissions. Required: ${permission}`);
    }

    next();
  });
};
