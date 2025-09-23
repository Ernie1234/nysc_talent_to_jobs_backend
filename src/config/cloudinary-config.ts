import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import envConfig from '@/config/env-config';

const env = envConfig();

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME, // Fixed typo
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const STORAGE_PARAMS = {
  folder: 'images',
  allowed_formats: ['jpg', 'png', 'jpeg'],
  rescource_type: 'image' as const,
  quality: 'auto:good' as const,
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: (_req, _file) => ({
    ...STORAGE_PARAMS,
  }),
});

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (_, file, cb) => {
    const isValid = /^image\/(jpe?g|png)$/.test(file.mimetype);
    if (!isValid) {
      return;
    }

    cb(null, true);
  },
});
