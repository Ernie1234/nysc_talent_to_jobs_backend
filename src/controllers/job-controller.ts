import { Request, Response } from 'express';
import { asyncHandler } from '@/middleware/asyncHandler.middlerware';
import { createJobSchema, updateJobSchema, jobQuerySchema } from '@/validations/job-validation';
import {
  createJobService,
  updateJobService,
  getJobService,
  getEmployerJobsService,
  deleteJobService,
  changeJobStatusService,
} from '@/services/job-service';
import { HTTPSTATUS } from '@/config/http-config';
import { NotFoundException } from '@/utils/app-error';

export const createJobController = asyncHandler(async (req: Request, res: Response) => {
  const jobData = createJobSchema.parse(req.body);
  const user = req.user;

  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (user.role !== 'employer') {
    return res.status(HTTPSTATUS.FORBIDDEN).json({
      success: false,
      message: 'Only employers can create jobs',
    });
  }

  const job = await createJobService(user.id, jobData);

  return res.status(HTTPSTATUS.CREATED).json({
    success: true,
    message: 'Job created successfully',
    data: job,
  });
});

export const updateJobController = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const updateData = updateJobSchema.parse(req.body);
  const user = req.user;

  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (user.role !== 'employer') {
    return res.status(HTTPSTATUS.FORBIDDEN).json({
      success: false,
      message: 'Only employers can create jobs',
    });
  }

  const job = await updateJobService(jobId!, user.id, updateData);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Job updated successfully',
    data: job,
  });
});

export const getJobController = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const user = req.user;

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const job = await getJobService(jobId!, user.id);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Job fetched successfully',
    data: job,
  });
});
export const getEmployerJobsController = asyncHandler(async (req: Request, res: Response) => {
  const query = jobQuerySchema.parse(req.query);
  const user = req.user;

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const result = await getEmployerJobsService(user.id, query);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Jobs fetched successfully',
    data: result,
  });
});

export const deleteJobController = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const user = req.user;

  if (!user) {
    throw new NotFoundException('User not found');
  }

  await deleteJobService(jobId!, user.id);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Job deleted successfully',
  });
});

export const publishJobController = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const user = req.user;

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const job = await changeJobStatusService(jobId!, user.id, 'published');

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Job published successfully',
    data: job,
  });
});

export const closeJobController = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const user = req.user;

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const job = await changeJobStatusService(jobId!, user.id, 'closed');

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Job closed successfully',
    data: job,
  });
});
