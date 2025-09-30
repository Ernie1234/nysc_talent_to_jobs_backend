/* eslint-disable indent */
// middleware/resume-upload-middleware.ts
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export const handleResumeUploadError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // If there's no error, proceed to next middleware
  if (!err) {
    next();
    return;
  }

  // Handle Multer specific errors
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5MB',
        });
        return;
      case 'LIMIT_FILE_COUNT':
        res.status(400).json({
          success: false,
          message: 'Too many files. Only one file allowed',
        });
        return;
      case 'LIMIT_UNEXPECTED_FILE':
        res.status(400).json({
          success: false,
          message: 'Unexpected field name for file upload',
        });
        return;
      default:
        res.status(400).json({
          success: false,
          message: `File upload error: ${err.message}`,
        });
        return;
    }
  }

  // Handle other errors
  res.status(400).json({
    success: false,
    message: err.message ?? 'File upload error',
  });
};
