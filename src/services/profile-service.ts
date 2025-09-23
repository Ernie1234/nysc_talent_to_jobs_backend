// services/user-service.ts

import { UserModel } from '@/models/user-model';
import { NotFoundException } from '@/utils/app-error';

/**
 * Gets complete user data with all populated fields
 */
export const getCompleteUserDataService = async (userId: string): Promise<any> => {
  const user = await UserModel.findById(userId)
    .select('-password -passwordResetToken -emailVerificationToken')
    .lean(); // Convert to plain JavaScript object

  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Add any computed fields or additional data
  const enhancedUser = {
    ...user,
    // Add any computed fields here
    accountAge: Math.floor(
      (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    ), // days since account creation
    isActive: user.lastLogin
      ? Date.now() - new Date(user.lastLogin).getTime() < 30 * 24 * 60 * 60 * 1000
      : false, // active if logged in last 30 days
  };

  return enhancedUser;
};
