import { Request, Response } from 'express';
import { asyncHandler } from '@/middleware/asyncHandler.middlerware';
import { HTTPSTATUS } from '@/config/http-config';
import { BadRequestException, NotFoundException } from '@/utils/app-error';
import Logger from '@/utils/logger';
import { userUpdateSchema } from '@/validations/auth-validation';
import { updateUserService } from '@/services/user-service';

export const getCurrentUserController = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  Logger.info('Fetching current user', { userId: user?._id });

  if (!user) {
    throw new NotFoundException('User not found or does not exist! 🚫');
  }

  Logger.info('Current user fetched successfully', { userId: user._id });

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Current user fetched successfully ✅',
    data: { user: user.omitPassword() },
  });
});

export const updateUserController = asyncHandler(async (req: Request, res: Response) => {
  // Use .safeParse to catch validation errors gracefully
  const parsedBody = userUpdateSchema.safeParse(req.body);
  if (!parsedBody.success) {
    const errorMessages = parsedBody.error.errors
      .map(error => `${error.path.join('.')}: ${error.message}`)
      .join(', ');

    throw new BadRequestException(`Invalid request data: ${errorMessages}`);
  }

  // Destructure the validated data
  const { profile, employerProfile, ...restOfBody } = parsedBody.data;

  const userId = req.user?._id;
  if (!userId) {
    throw new NotFoundException('User ID not found in request');
  }

  const profilePic = req.file;

  const user = await updateUserService(
    userId,
    { profile, employerProfile, ...restOfBody },
    profilePic
  );

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'User profile updated successfully ✅',
    data: user,
  });
});
