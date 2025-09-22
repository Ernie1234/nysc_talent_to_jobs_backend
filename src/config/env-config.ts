import getEnv from '@/utils/get-env';

const envConfig = (): Record<string, string> => ({
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  PORT: getEnv('PORT', '5000'),
  BASE_PATH: getEnv('BASE_PATH', '/api'),
  MONGODB_URI: getEnv('MONGODB_URI', ''),
  JWT_SECRET: getEnv('JWT_SECRET', 'secret_jwt_key'),
  JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', '7d'),
  JWT_REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET', 'secret_jwt_refresh_key'),
  JWT_REFRESH_EXPIRES_IN: getEnv('JWT_REFRESH_EXPIRES_IN', '30d'),
  FRONTEND_ORIGIN: getEnv('FRONTEND_ORIGIN', 'http://localhost:5173'),
  GEMINI_API_KEY: getEnv('GEMINI_API_KEY', ''),
  CRON_SECRET: getEnv('CRON_SECRET', '0 0 * * *'), // Default: every day at midnight
  CLOUDINARY_CLOUD_NAME: getEnv('CLOUDINARY_CLOUD_NAME', ''),
  CLOUDINARY_API_KEY: getEnv('CLOUDINARY_API_KEY', ''),
  CLOUDINARY_API_SECRET: getEnv('CLOUDINARY_API_SECRET', ''),
});

export const envValues = envConfig();

export default envConfig;
