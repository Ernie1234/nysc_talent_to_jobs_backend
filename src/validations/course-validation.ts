import { z } from 'zod';

// Base schemas
export const courseTitleSchema = z
  .string()
  .trim()
  .min(1, 'Course title is required')
  .max(200, 'Course title cannot exceed 200 characters');

export const courseDescriptionSchema = z
  .string()
  .min(1, 'Course description is required')
  .max(2000, 'Course description cannot exceed 2000 characters');

export const courseStatusSchema = z.enum(['draft', 'published', 'archived']);

export const createCourseSchema = z.object({
  title: courseTitleSchema,
  description: courseDescriptionSchema,
  duration: z.number().min(1, 'Duration must be at least 1 hour'),
  prerequisites: z
    .array(z.string().trim().max(200, 'Prerequisite cannot exceed 200 characters'))
    .optional(),
  learningObjectives: z
    .array(z.string().trim().max(200, 'Learning objective cannot exceed 200 characters'))
    .optional(),
  coverImage: z.string().url('Please enter a valid URL').optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

export const courseQuerySchema = z.object({
  status: courseStatusSchema.optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
});

export const enrollCourseSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
});

export const generateQrSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  duration: z.number().min(1).max(120).default(15),
});

export const scanQrSchema = z.object({
  sessionCode: z.string().min(1, 'Session code is required'),
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
});

// Type exports
export type CreateCourseSchemaType = z.infer<typeof createCourseSchema>;
export type UpdateCourseSchemaType = z.infer<typeof updateCourseSchema>;
export type CourseQuerySchemaType = z.infer<typeof courseQuerySchema>;
export type EnrollCourseSchemaType = z.infer<typeof enrollCourseSchema>;
export type GenerateQrSchemaType = z.infer<typeof generateQrSchema>;
export type ScanQrSchemaType = z.infer<typeof scanQrSchema>;
