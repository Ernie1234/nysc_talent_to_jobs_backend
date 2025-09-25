// validations/resume-upload-validation.ts
import { Express } from 'express';
import { z } from 'zod';

export const resumeUploadSchema = z.object({
  // You can add additional fields if needed in the future
  title: z.string().min(1, 'Title is required').max(255).optional(),
  description: z.string().max(1000).optional(),
});

// Validation for the file itself (this will be handled by multer, but we can validate in service)
export const validateResumeFile = (file: Express.Multer.File) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];

  const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
  const fileExtension = file.originalname.split('.').pop()?.toLowerCase() ?? '';

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error(`Invalid MIME type: ${file.mimetype}`);
  }

  if (!allowedExtensions.includes(`.${fileExtension}`)) {
    throw new Error(`Invalid file extension: .${fileExtension}`);
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size exceeds 5MB limit');
  }

  return true;
};

export type ResumeUploadSchemaType = z.infer<typeof resumeUploadSchema>;
