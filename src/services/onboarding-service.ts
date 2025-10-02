// src/services/onboarding-service.ts
import { IUser, UserModel } from '@/models/user-model';
import { NotFoundException, UnauthorizedException } from '@/utils/app-error';
import {
  CompleteOnboardingSchemaType,
  OnboardingStepSchemaType,
} from '@/validations/onboarding-validation';

/**
 * Utility to filter out properties that are explicitly undefined.
 * This is necessary when 'exactOptionalPropertyTypes' is enabled in tsconfig.
 */
const removeUndefinedProperties = (obj: any) => {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));
};

export const updateOnboardingStepService = async (
  userId: string,
  data: OnboardingStepSchemaType
): Promise<IUser> => {
  const user = await UserModel.findById(userId);
  if (!user) throw new NotFoundException('User not found');

  if (!['CORPS_MEMBER', 'SIWES'].includes(user.role)) {
    throw new UnauthorizedException('Onboarding not available for your role');
  }

  // Update step
  user.onboardingStep = data.step;

  // Update profile with the provided data
  if (data.personalInfo) {
    user.profile = {
      ...user.profile,
      // Filter out undefined values to satisfy exactOptionalPropertyTypes
      ...removeUndefinedProperties(data.personalInfo),
    };
  }

  if (data.skills && data.skills.length > 0) {
    // Note: When updating an embedded object like 'profile',
    // it's generally safer to ensure 'user.profile' is initialized.
    // Mongoose handles this if you've set a default, but it's a good practice.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (!user.profile) user.profile = {};

    user.profile.skills = data.skills.map(skill => ({
      name: skill.name,
      level: skill.level,
    }));
  }

  await user.save();
  return user;
};

export const completeOnboardingService = async (
  userId: string,
  data: CompleteOnboardingSchemaType
): Promise<IUser> => {
  const user = await UserModel.findById(userId);
  if (!user) throw new NotFoundException('User not found');

  if (!['CORPS_MEMBER', 'SIWES'].includes(user.role)) {
    throw new UnauthorizedException('Onboarding not available for your role');
  }

  // Filter undefined properties from personalInfo
  const filteredPersonalInfo = data.personalInfo
    ? removeUndefinedProperties(data.personalInfo)
    : {};

  // Map skills data
  const mappedSkills =
    data.skills?.map(skill => ({
      name: skill.name,
      level: skill.level,
    })) ?? [];

  // Update user profile with all onboarding data
  user.profile = {
    ...user.profile,
    // Merge filtered personal info
    ...filteredPersonalInfo,
    // Assign mapped skills
    skills: mappedSkills,
  };

  user.onboardingCompleted = true;
  user.onboardingStep = 4;

  await user.save();
  return user;
};

export const getOnboardingProgressService = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new NotFoundException('User not found');

  return {
    onboardingCompleted: user.onboardingCompleted,
    onboardingStep: user.onboardingStep,
    profile: user.profile,
  };
};
