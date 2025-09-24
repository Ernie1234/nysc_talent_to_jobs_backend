import getEnv from '@/utils/get-env';

interface EnvConfig {
  NODE_ENV: string;
  PORT: string;
  BASE_PATH: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  FRONTEND_ORIGIN: string;
  FRONTEND_PROD_ORIGIN: string;
  GEMINI_API_KEY: string;
  CRON_SECRET: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
}

const envConfig = (): EnvConfig => ({
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  PORT: getEnv('PORT', '5000'),
  BASE_PATH: getEnv('BASE_PATH', '/api'),
  MONGODB_URI: getEnv('MONGODB_URI', ''),
  JWT_SECRET: getEnv('JWT_SECRET', 'secret_jwt_key'),
  JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', '1d'),
  JWT_REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET', 'secret_jwt_refresh_key'),
  JWT_REFRESH_EXPIRES_IN: getEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
  FRONTEND_ORIGIN: getEnv('FRONTEND_ORIGIN', 'http://localhost:5173'),
  FRONTEND_PROD_ORIGIN: getEnv('FRONTEND_PROD_ORIGIN', 'http://localhost:5173'),
  GEMINI_API_KEY: getEnv('GEMINI_API_KEY', ''),
  CRON_SECRET: getEnv('CRON_SECRET', '0 0 * * *'),
  CLOUDINARY_CLOUD_NAME: getEnv('CLOUDINARY_CLOUD_NAME', ''),
  CLOUDINARY_API_KEY: getEnv('CLOUDINARY_API_KEY', ''),
  CLOUDINARY_API_SECRET: getEnv('CLOUDINARY_API_SECRET', ''),
  GOOGLE_CLIENT_ID: getEnv('GOOGLE_CLIENT_ID', ''),
  GOOGLE_CLIENT_SECRET: getEnv('GOOGLE_CLIENT_SECRET', ''),
  GOOGLE_REDIRECT_URI: getEnv('GOOGLE_REDIRECT_URI', ''),
});

export const envValues = envConfig();
export default envConfig;
