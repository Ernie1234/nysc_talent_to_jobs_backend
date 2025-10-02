// src/controllers/onboarding-controller.ts
import { Request, Response } from 'express';
import { asyncHandler } from '@/middleware/asyncHandler.middlerware';
import { HTTPSTATUS } from '@/config/http-config';
import {
  updateOnboardingStepService,
  completeOnboardingService,
  getOnboardingProgressService,
} from '@/services/onboarding-service';
import {
  onboardingStepSchema,
  completeOnboardingSchema,
} from '@/validations/onboarding-validation';

export const updateOnboardingStepController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(HTTPSTATUS.UNAUTHORIZED).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  const body = onboardingStepSchema.parse(req.body);
  const user = await updateOnboardingStepService(userId, body);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Onboarding step updated successfully',
    data: {
      user: user.omitPassword(),
      onboardingStep: user.onboardingStep,
      onboardingCompleted: user.onboardingCompleted,
    },
  });
});

export const completeOnboardingController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(HTTPSTATUS.UNAUTHORIZED).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  const body = completeOnboardingSchema.parse(req.body);
  const user = await completeOnboardingService(userId, body);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Onboarding completed successfully',
    data: {
      user: user.omitPassword(),
    },
  });
});

export const getOnboardingProgressController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(HTTPSTATUS.UNAUTHORIZED).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  const progress = await getOnboardingProgressService(userId);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Onboarding progress retrieved successfully',
    data: progress,
  });
});
