// controllers/applicant-controller.ts
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { asyncHandler } from '@/middleware/asyncHandler.middlerware';
import { HTTPSTATUS } from '@/config/http-config';
import { BadRequestException, NotFoundException } from '@/utils/app-error';
import {
  applyToJobSchema,
  updateApplicationSchema,
  applicationQuerySchema,
} from '@/validations/applicant-validation';
import {
  applyToJobService,
  getJobApplicationsService,
  updateApplicationService,
  getUserApplicationsService,
  withdrawApplicationService,
  getApplicationDetailsService,
  getEmployerApplicationsService,
} from '@/services/applicant-service';

export const applyToJobController = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const applicationData = applyToJobSchema.parse(req.body);
  const user = req.user;

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const result = await applyToJobService(jobId!, user.id, applicationData);

  return res.status(HTTPSTATUS.CREATED).json({
    success: true,
    message: 'Application submitted successfully',
    data: result,
  });
});

export const getJobApplicationsController = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const query = applicationQuerySchema.parse(req.query);
  const user = req.user;

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const result = await getJobApplicationsService(jobId!, user.id, query);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Applications fetched successfully',
    data: result,
  });
});

export const updateApplicationController = asyncHandler(async (req: Request, res: Response) => {
  const { applicationId } = req.params;
  const updateData = updateApplicationSchema.parse(req.body);
  const user = req.user;

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const application = await updateApplicationService(applicationId!, user.id, updateData);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Application updated successfully',
    data: application,
  });
});

export const getUserApplicationsController = asyncHandler(async (req: Request, res: Response) => {
  const query = applicationQuerySchema.parse(req.query);
  const user = req.user;

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const result = await getUserApplicationsService(user.id, query);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Your applications fetched successfully',
    data: result,
  });
});

export const withdrawApplicationController = asyncHandler(async (req: Request, res: Response) => {
  const { applicationId } = req.params;
  const user = req.user;

  if (!user) {
    throw new NotFoundException('User not found');
  }

  await withdrawApplicationService(applicationId!, user.id);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Application withdrawn successfully',
  });
});

export const getApplicationDetailsController = asyncHandler(async (req: Request, res: Response) => {
  const { applicationId } = req.params;
  const user = req.user;

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const application = await getApplicationDetailsService(applicationId!, user.id, user.role);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Application details fetched successfully',
    data: application,
  });
});

export const getEmployerApplicationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const query = applicationQuerySchema.parse(req.query);
    const user = req.user;

    console.log('User object:', user); // Debug log
    console.log('User ID:', user?.id); // Debug log
    console.log('User ID type:', typeof user?.id); // Debug log

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate that user.id is a valid ObjectId
    if (!Types.ObjectId.isValid(user.id)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const result = await getEmployerApplicationsService(user.id, query);

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: 'Your job applications fetched successfully',
      data: result,
    });
  }
);
