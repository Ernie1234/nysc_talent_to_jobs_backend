import { z } from 'zod';
import {
  jobTypeEnum,
  experienceLevelEnum,
  workLocationEnum,
  jobPeriodEnum,
  jobStatusEnum,
} from '@/models/job-model';

// Nigerian states for validation
export const nigerianStates = [
  'abia',
  'adamawa',
  'akwa-ibom',
  'anambra',
  'bauchi',
  'bayelsa',
  'benue',
  'borno',
  'cross-river',
  'delta',
  'ebonyi',
  'edo',
  'ekiti',
  'enugu',
  'gombe',
  'imo',
  'jigawa',
  'kaduna',
  'kano',
  'katsina',
  'kebbi',
  'kogi',
  'kwara',
  'lagos',
  'nasarawa',
  'niger',
  'ogun',
  'ondo',
  'osun',
  'oyo',
  'plateau',
  'rivers',
  'sokoto',
  'taraba',
  'yobe',
  'zamfara',
  'fct',
] as const;

export const salaryRangeSchema = z
  .object({
    min: z.number().min(0, 'Minimum salary must be positive'),
    max: z.number().min(0, 'Maximum salary must be positive'),
    currency: z.string().default('USD'),
    isPublic: z.boolean().default(true),
  })
  .refine(data => data.max >= data.min, {
    message: 'Maximum salary must be greater than or equal to minimum salary',
  });

export const hiringLocationSchema = z
  .object({
    type: z.enum(['nation-wide', 'state']),
    state: z.string().optional(),
  })
  .refine(
    data => {
      if (data.type === 'state') {
        return data.state && data.state.length > 0;
      }
      return true;
    },
    {
      message: 'State is required when location type is state',
    }
  );

export const createJobSchema = z.object({
  title: z
    .string()
    .min(1, 'Job title is required')
    .max(200, 'Job title must be 200 characters or less'),
  jobType: z.enum(jobTypeEnum, {
    required_error: 'Job type is required',
  }),
  experienceLevel: z.enum(experienceLevelEnum, {
    required_error: 'Experience level is required',
  }),
  workLocation: z.enum(workLocationEnum, {
    required_error: 'Work location is required',
  }),
  jobPeriod: z.enum(jobPeriodEnum, {
    required_error: 'Job period is required',
  }),
  skills: z
    .array(z.string().min(1).max(50))
    .min(1, 'At least one skill is required')
    .max(10, 'Maximum 10 skills allowed'),
  aboutJob: z
    .string()
    .min(50, 'Job description must be at least 50 characters')
    .max(2000, 'Job description must be less than 2000 characters'),
  requirements: z
    .string()
    .min(50, 'Job requirements must be at least 50 characters')
    .max(1000, 'Job requirements must be less than 1000 characters'),
  salaryRange: salaryRangeSchema,
  hiringLocation: hiringLocationSchema,
  status: z.enum(jobStatusEnum).default('draft'),
});

export const updateJobSchema = createJobSchema.partial().extend({
  status: z.enum(jobStatusEnum).optional(),
});

export const jobQuerySchema = z.object({
  status: z.enum(jobStatusEnum).optional(),
  page: z.string().transform(Number).pipe(z.number().int().positive()).default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).default('10'),
  search: z.string().optional(),
  jobType: z.enum(jobTypeEnum).optional(),
  experienceLevel: z.enum(experienceLevelEnum).optional(),
  workLocation: z.enum(workLocationEnum).optional(),
});
export const publicJobQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  jobType: z.enum(jobTypeEnum).optional(),
  experienceLevel: z.enum(experienceLevelEnum).optional(),
  workLocation: z.enum(workLocationEnum).optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type JobQueryInput = z.infer<typeof jobQuerySchema>;
