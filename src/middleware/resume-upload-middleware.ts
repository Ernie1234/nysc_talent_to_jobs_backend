// middleware/resume-upload-middleware.ts
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export const handleResumeUploadError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only one file allowed',
      });
    }
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message ?? 'File upload error',
    });
  }

  next();
};
