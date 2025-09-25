// config/resume-upload-config.ts
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Express } from 'express';

// Ensure upload directory exists
const ensureUploadDirExists = (uploadDir: string) => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created upload directory: ${uploadDir}`);
  }
};

const uploadDir = path.join(process.cwd(), 'uploads', 'resumes');
ensureUploadDirExists(uploadDir);

// Configure storage for resume files
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // Ensure directory exists every time (in case it was deleted)
    ensureUploadDirExists(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const fileExtension = path.extname(file.originalname);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    cb(null, uniqueFileName);
  },
});

// File filter for resume-specific files
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];

  const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Supported formats: ${allowedExtensions.join(', ')}`));
  }
};

export const resumeUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for resumes
    files: 1,
  },
});

export { uploadDir };
