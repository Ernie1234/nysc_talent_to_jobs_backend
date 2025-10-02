// controllers/admin-controller.ts
import { Request, Response } from 'express';
import { asyncHandler } from '@/middleware/asyncHandler.middlerware';
import { HTTPSTATUS } from '@/config/http-config';
import { UnauthorizedException, BadRequestException } from '@/utils/app-error';
import {
  getAllApplicationsService,
  updateApplicationStatusService,
  getAllUsersService,
  updateUserStatusService,
  getAdminDashboardStatsService,
} from '@/services/admin-service';
import {
  applicationQuerySchema,
  userQuerySchema,
  updateApplicationStatusSchema,
  updateUserStatusSchema,
} from '@/validations/admin-validation';

export const getAllApplicationsController = asyncHandler(async (req: Request, res: Response) => {
  const query = applicationQuerySchema.parse(req.query);
  const user = req.user;

  if (!user || user.role !== 'ADMIN') {
    throw new UnauthorizedException('Only administrators can access this resource');
  }

  const result = await getAllApplicationsService(query);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'All applications fetched successfully',
    data: result,
  });
});

export const updateApplicationStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const { applicationId } = req.params;
    const { status } = updateApplicationStatusSchema.parse(req.body);
    const user = req.user;

    if (!user || user.role !== 'ADMIN') {
      throw new UnauthorizedException('Only administrators can update application status');
    }

    const application = await updateApplicationStatusService(applicationId!, status);

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: 'Application status updated successfully',
      data: application,
    });
  }
);

export const getAllUsersController = asyncHandler(async (req: Request, res: Response) => {
  const query = userQuerySchema.parse(req.query);
  const user = req.user;

  if (!user || user.role !== 'ADMIN') {
    throw new UnauthorizedException('Only administrators can access this resource');
  }

  const result = await getAllUsersService(query);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'All users fetched successfully',
    data: result,
  });
});

export const updateUserStatusController = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { status } = updateUserStatusSchema.parse(req.body);
  const user = req.user;

  if (!user || user.role !== 'ADMIN') {
    throw new UnauthorizedException('Only administrators can update user status');
  }

  // Prevent admin from modifying their own status
  if (userId === user.id) {
    throw new BadRequestException('Cannot modify your own status');
  }

  const updatedUser = await updateUserStatusService(userId!, status);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'User status updated successfully',
    data: updatedUser,
  });
});

export const getAdminDashboardStatsController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;

    if (!user || user.role !== 'ADMIN') {
      throw new UnauthorizedException('Only administrators can access dashboard stats');
    }

    const stats = await getAdminDashboardStatsService();

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: 'Admin dashboard stats fetched successfully',
      data: stats,
    });
  }
);
