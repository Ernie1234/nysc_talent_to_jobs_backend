// validations/applicant-validation.ts
import { z } from 'zod';
import { applicationStatusEnum } from '@/models/applicant-model';

export const applyToJobSchema = z
  .object({
    coverLetter: z.string().max(2000, 'Cover letter cannot exceed 2000 characters').optional(),
    documentId: z.string().optional(),
    resumeUploadId: z.string().optional(),
  })
  .refine(data => data.documentId ?? data.resumeUploadId ?? data.coverLetter, {
    message: 'Either a resume document, uploaded resume, or cover letter is required',
  });

export const updateApplicationSchema = z.object({
  status: z.enum(applicationStatusEnum).optional(),
});

export const applicationQuerySchema = z.object({
  status: z.enum(applicationStatusEnum).optional(),
  page: z.string().transform(Number).pipe(z.number().int().positive()).default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).default('10'),
});

export type ApplyToJobInput = z.infer<typeof applyToJobSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type ApplicationQueryInput = z.infer<typeof applicationQuerySchema>;
