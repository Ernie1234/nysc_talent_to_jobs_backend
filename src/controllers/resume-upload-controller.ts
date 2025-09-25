// controllers/resume-upload-controller.ts
import path from 'path';
import { mkdir } from 'fs/promises';
import { Request, Response } from 'express';
import { asyncHandler } from '@/middleware/asyncHandler.middlerware';
import { HTTPSTATUS } from '@/config/http-config';
import { BadRequestException } from '@/utils/app-error';
import Logger from '@/utils/logger';
import {
  createResumeUploadService,
  getUserResumesService,
  getResumeByIdService,
  deleteResumeService,
} from '@/services/resume-upload-service';

export const uploadResumeController = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new BadRequestException('User not authenticated');
  }

  if (!req.file) {
    throw new BadRequestException('No file provided');
  }

  // Ensure upload directory exists
  try {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'resumes');
    await mkdir(uploadsDir, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directory:', error);
    throw new BadRequestException('Server error: Could not create upload directory');
  }

  // Create resume upload record
  const resumeUpload = await createResumeUploadService(req.file, user._id);

  Logger.info('Resume uploaded successfully', {
    userId: user._id,
    resumeId: resumeUpload._id,
    fileName: req.file.originalname,
  });

  return res.status(HTTPSTATUS.CREATED).json({
    success: true,
    message: 'Resume uploaded successfully ✅',
    data: resumeUpload,
  });
});
export const getUserResumesController = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new BadRequestException('User not authenticated');
  }

  const resumes = await getUserResumesService(user._id.toString());

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'User resumes fetched successfully ✅',
    data: resumes,
  });
});

export const getResumeByIdController = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const { resumeId } = req.params;

  if (!user) {
    throw new BadRequestException('User not authenticated');
  }

  const resume = await getResumeByIdService(resumeId!, user._id.toString());

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Resume fetched successfully ✅',
    data: resume,
  });
});

export const deleteResumeController = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const { resumeId } = req.params;

  if (!user) {
    throw new BadRequestException('User not authenticated');
  }

  const resume = await deleteResumeService(resumeId!, user._id.toString());

  Logger.info('Resume deleted successfully', {
    userId: user._id,
    resumeId: resume._id,
  });

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Resume deleted successfully ✅',
    data: { id: resume._id },
  });
});

export const downloadResumeController = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const { resumeId } = req.params;

  if (!user) {
    throw new BadRequestException('User not authenticated');
  }

  const resume = await getResumeByIdService(resumeId!, user._id.toString());

  // Set appropriate headers for download
  res.setHeader('Content-Type', resume.mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${resume.originalName}"`);
  res.setHeader('Content-Length', resume.fileSize);

  // Stream the file directly from the filesystem
  const { createReadStream } = await import('fs');
  const fileStream = createReadStream(resume.filePath);

  fileStream.on('error', error => {
    console.error('Error streaming file:', error);
    res.status(500).json({ error: 'Error downloading file' });
  });

  fileStream.pipe(res);
});
