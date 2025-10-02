// validations/admin-validation.ts
import { z } from 'zod';

export const applicationQuerySchema = z.object({
  status: z
    .enum([
      'pending',
      'under_review',
      'shortlisted',
      'interview',
      'rejected',
      'accepted',
      'withdrawn',
    ])
    .optional(),
  role: z.enum(['CORPS_MEMBER', 'SIWES']).optional(),
  page: z.coerce.number().int().positive().default(1), // Changed to coerce.number
  limit: z.coerce.number().int().positive().max(100).default(20), // Changed to coerce.number
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const userQuerySchema = z.object({
  role: z.enum(['CORPS_MEMBER', 'SIWES', 'STAFF', 'ADMIN']).optional(),
  status: z.enum(['ACCEPTED', 'REJECTED', 'SUSPENDED', 'PENDING']).optional(),
  page: z.coerce.number().int().positive().default(1), // Changed to coerce.number
  limit: z.coerce.number().int().positive().max(100).default(20), // Changed to coerce.number
  search: z.string().optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum([
    'pending',
    'under_review',
    'shortlisted',
    'interview',
    'rejected',
    'accepted',
    'withdrawn',
  ]),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED', 'SUSPENDED', 'PENDING']),
});

// Type exports
export type ApplicationQuerySchemaType = z.infer<typeof applicationQuerySchema>;
export type UserQuerySchemaType = z.infer<typeof userQuerySchema>;
export type UpdateApplicationStatusSchemaType = z.infer<typeof updateApplicationStatusSchema>;
export type UpdateUserStatusSchemaType = z.infer<typeof updateUserStatusSchema>;
