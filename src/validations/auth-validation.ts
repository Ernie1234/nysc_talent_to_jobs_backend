/* eslint-disable max-len */
import { z } from 'zod';

// Base schemas for reusability
export const emailSchema = z
  .string()
  .trim()
  .email('Invalid email address')
  .min(1, 'Email is required')
  .max(255, 'Email cannot exceed 255 characters')
  .toLowerCase();

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
  });

export const nameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(50, 'Name cannot exceed 50 characters');

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s-()]+$/, 'Please enter a valid phone number')
  .optional();

export const urlSchema = z.string().url('Please enter a valid URL').optional();

export const linkedinUrlSchema = z
  .string()
  .regex(/^https?:\/\/.*linkedin\.com\/.*/, 'Please enter a valid LinkedIn URL')
  .optional();

export const githubUrlSchema = z
  .string()
  .regex(/^https?:\/\/.*github\.com\/.*/, 'Please enter a valid GitHub URL')
  .optional();

// Profile schemas
export const profileSchema = z.object({
  phoneNumber: phoneSchema,
  stateOfService: z.string().max(100, 'State of service cannot exceed 100 characters').optional(),
  placeOfPrimaryAssignment: z
    .string()
    .max(200, 'Place of primary assignment cannot exceed 200 characters')
    .optional(),
  skills: z.array(z.string().trim().max(50, 'Skill name cannot exceed 50 characters')).optional(),
  bio: z.string().max(1000, 'Bio cannot exceed 1000 characters').optional(),
  profilePicture: z.string().url('Please enter a valid URL').optional(),
  resume: z.string().url('Please enter a valid URL').optional(),
  linkedin: linkedinUrlSchema,
  github: githubUrlSchema,
});

export const employerProfileSchema = z.object({
  companyName: z.string().max(100, 'Company name cannot exceed 100 characters').optional(),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).optional(),
  industry: z.string().max(100, 'Industry cannot exceed 100 characters').optional(),
  companyDescription: z
    .string()
    .max(1000, 'Company description cannot exceed 1000 characters')
    .optional(),
  website: urlSchema,
  location: z.string().max(100, 'Location cannot exceed 100 characters').optional(),
});

// User schemas
export const userRoleSchema = z.enum(['corps_member', 'employer', 'nitda']);

export const userBaseSchema = z.object({
  email: emailSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  role: userRoleSchema.default('corps_member'),
});

export const userCreateSchema = userBaseSchema.extend({
  password: passwordSchema,
  profile: profileSchema.optional(),
  employerProfile: employerProfileSchema.optional(),
});

export const userUpdateSchema = userBaseSchema.partial().extend({
  // password: passwordSchema.optional(),
  profile: profileSchema.partial().optional(),
  employerProfile: employerProfileSchema.partial().optional(),
  onboardingCompleted: z.boolean().optional(),
  onboardingStep: z.number().min(1).max(5).optional(),
  isEmailVerified: z.boolean().optional(),
});

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const userOnboardingSchema = z.object({
  onboardingStep: z.number().min(1).max(5),
  profile: profileSchema.partial().optional(),
  employerProfile: employerProfileSchema.partial().optional(),
});

export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
});

export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

// Authentication schemas (reusing your existing ones)
export const registerSchema = userCreateSchema.pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  role: true,
});

export const loginSchema = userLoginSchema;

// Type exports
export type EmailSchemaType = z.infer<typeof emailSchema>;
export type PasswordSchemaType = z.infer<typeof passwordSchema>;
export type ProfileSchemaType = z.infer<typeof profileSchema>;
export type EmployerProfileSchemaType = z.infer<typeof employerProfileSchema>;
export type UserRoleSchemaType = z.infer<typeof userRoleSchema>;
export type UserBaseSchemaType = z.infer<typeof userBaseSchema>;
export type UserCreateSchemaType = z.infer<typeof userCreateSchema>;
export type UserUpdateSchemaType = z.infer<typeof userUpdateSchema>;
export type UserLoginSchemaType = z.infer<typeof userLoginSchema>;
export type UserOnboardingSchemaType = z.infer<typeof userOnboardingSchema>;
export type PasswordResetSchemaType = z.infer<typeof passwordResetSchema>;
export type EmailVerificationSchemaType = z.infer<typeof emailVerificationSchema>;
export type RegisterSchemaType = z.infer<typeof registerSchema>;
export type LoginSchemaType = z.infer<typeof loginSchema>;
