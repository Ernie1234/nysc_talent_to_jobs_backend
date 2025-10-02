// src/validations/onboarding-validation.ts
import { z } from 'zod';

// Role-specific personal info schema
export const personalInfoSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number cannot exceed 15 digits')
    .regex(/^\+?[\d\s-()]+$/, 'Please enter a valid phone number'),
  stateOfService: z.string().optional(), // For CORPS_MEMBER
  tertiarySchool: z.string().optional(), // For SIWES
  stateCode: z.string().optional(), // For CORPS_MEMBER
  callUpNumber: z.string().optional(), // For CORPS_MEMBER
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
});

export const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  level: z.number().min(1).max(5), // 1-5 scale for chart
});

export const documentSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileUrl: z.string().url('Valid file URL is required'),
  fileType: z.enum(['ppa_letter', 'request_letter']),
  fileSize: z.number().positive('File size must be positive'),
  uploadedAt: z.union([z.string(), z.date()]).transform(val => new Date(val)),
});

// Make personalInfo and documents required only for complete onboarding
export const onboardingStepSchema = z.object({
  step: z.number().min(1).max(4),
  personalInfo: personalInfoSchema.optional(),
  documents: z.array(documentSchema).optional(),
  skills: z.array(skillSchema).optional(),
});

export const completeOnboardingSchema = z.object({
  personalInfo: personalInfoSchema,
  documents: z.array(documentSchema).min(1, 'At least one document is required'),
  skills: z.array(skillSchema).optional(),
});

export type PersonalInfoSchemaType = z.infer<typeof personalInfoSchema>;
export type SkillSchemaType = z.infer<typeof skillSchema>;
export type DocumentSchemaType = z.infer<typeof documentSchema>;
export type OnboardingStepSchemaType = z.infer<typeof onboardingStepSchema>;
export type CompleteOnboardingSchemaType = z.infer<typeof completeOnboardingSchema>;
