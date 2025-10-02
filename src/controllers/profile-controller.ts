/* eslint-disable indent */
import { Request, Response } from 'express';
import { HTTPSTATUS } from '@/config/http-config';
import { asyncHandler } from '@/middleware/asyncHandler.middlerware';
import { UserModel } from '@/models/user-model';
import { BadRequestException, NotFoundException } from '@/utils/app-error';
import Logger from '@/utils/logger';

// controllers/user-controller.ts
export const getCurrentUserController = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  Logger.info('Fetching current user', { userId: user?._id });

  if (!user) {
    throw new NotFoundException('User not found or does not exist! 🚫');
  }

  // Get the complete user data from database to ensure we have all fields
  const completeUser = await UserModel.findById(user._id).select(
    '-password -passwordResetToken -emailVerificationToken'
  );

  if (!completeUser) {
    throw new NotFoundException('User not found in database');
  }

  // Convert to plain object and enhance with additional data
  const userData = completeUser.toObject ? completeUser.toObject() : completeUser;

  const enhancedUserData = {
    ...userData,
    // Add computed fields
    accountStats: {
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      lastLogin: userData.lastLogin,
      isEmailVerified: userData.isEmailVerified,
      onboardingCompleted: userData.onboardingCompleted,
      onboardingProgress: `${(userData.onboardingStep / 5) * 100}%`, // 5-step onboarding
    },
    // Add profile completeness score
    profileCompleteness: calculateProfileCompleteness(userData),
  };

  Logger.info('Current user fetched successfully', { userId: user._id });

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Current user fetched successfully ✅',
    data: {
      user: enhancedUserData,
      // Add metadata about the user
      metadata: {
        timestamp: new Date().toISOString(),
        profileComplete: enhancedUserData.profileCompleteness > 70, // arbitrary threshold
        nextOnboardingStep: userData.onboardingCompleted ? null : userData.onboardingStep + 1,
      },
    },
  });
});

// Helper function to calculate profile completeness
const calculateProfileCompleteness = (user: any): number => {
  let completedFields = 0;
  let totalFields = 0;

  // Base fields
  const baseFields = ['firstName', 'lastName', 'email'];
  totalFields += baseFields.length;
  completedFields += baseFields.filter(field => user[field]).length;

  // Profile fields
  const profileFields = [
    'phoneNumber',
    'stateOfService',
    'placeOfPrimaryAssignment',
    'bio',
    'profilePicture',
  ];
  totalFields += profileFields.length;
  completedFields += profileFields.filter(field => user.profile?.[field]).length;

  // Skills (count as one field but weighted)
  if (user.profile?.skills?.length > 0) completedFields += 1;
  totalFields += 1;

  // staff profile (if applicable)
  if (user.role === 'staff') {
    const staffFields = ['companyName', 'companySize', 'industry', 'website'];
    totalFields += staffFields.length;
    completedFields += staffFields.filter(field => user.staffProfile?.[field]).length;
  }

  return Math.round((completedFields / totalFields) * 100);
};
export const getUserProfileController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.userId ?? req.user?._id;

  if (!userId) {
    throw new BadRequestException('User ID is required');
  }

  const user = await UserModel.findById(userId).select(
    '-password -passwordResetToken -emailVerificationToken'
  );

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const userData = user.toObject ? user.toObject() : user;

  // Enhanced response with detailed information
  const detailedProfile = {
    basicInfo: {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: userData.role,
      fullName: `${userData.firstName} ${userData.lastName}`,
    },
    profile: {
      ...userData.profile,
      skills: userData.profile?.skills ?? [],
    },
    staffProfile: userData.staffProfile ?? {},
    accountInfo: {
      isEmailVerified: userData.isEmailVerified,
      onboardingCompleted: userData.onboardingCompleted,
      onboardingStep: userData.onboardingStep,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      lastLogin: userData.lastLogin,
    },
    statistics: {
      profileCompleteness: calculateProfileCompleteness(userData),
      accountAgeDays: Math.floor(
        (Date.now() - new Date(userData.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      ),
      lastActive: userData.lastLogin
        ? `${Math.floor(
            (Date.now() - new Date(userData.lastLogin).getTime()) / (1000 * 60 * 60 * 24)
          )} days ago`
        : 'Never',
    },
  };

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'User profile retrieved successfully ✅',
    data: detailedProfile,
  });
});
