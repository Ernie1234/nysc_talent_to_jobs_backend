import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import 'dotenv/config';
import connectDB from '@/config/database';
import { errorHandler } from '@/middleware/errorHandler';
import { ApiResponse } from '@/types';
import envConfig from '@/config/env-config';
import { HTTPSTATUS } from './config/http-config';
import Logger from './utils/logger';
import apiRouter from './routes';

const app = express();
const env = envConfig();
const BASE_PATH = env.BASE_PATH ?? '/api/v1';

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Request logging middleware (development only)
if (env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    Logger.info(`${req.method} ${req.path}`, {
      body: Object.keys(req.body ?? {}).length > 0 ? req.body : undefined,
      query: Object.keys(req.query ?? {}).length > 0 ? req.query : undefined,
      timestamp: new Date().toISOString(),
    });
    next();
  });
}

// Root route
app.get('/', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    message: 'Welcome to the NYSC Talents to Jobs API',
    data: {
      version: '1.0.0',
      documentation: `${BASE_PATH}/docs`,
    },
  };
  res.status(HTTPSTATUS.OK).json(response);
});

// Health check endpoint
app.get(`${BASE_PATH}/health`, (_req, res) => {
  const response: ApiResponse = {
    success: true,
    message: 'Server is healthy',
    data: {
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      version: '1.0.0',
    },
  };
  res.json(response);
});

// API base route
app.get(BASE_PATH, apiRouter);

// app.get('/error-test', () => {
//   throw new BadRequestException('This is a test error for the error handling middleware.');
// });
// API route placeholder - this will be replaced with actual routes later
// Use a specific middleware for unmatched API routes
app.use(BASE_PATH, (req, res, next) => {
  // If this is exactly the base path, skip (it's handled above)
  if (req.path === '/' || req.path === '') {
    return next();
  }

  // Handle all other API sub-routes as 404
  const response: ApiResponse = {
    success: false,
    message: 'API endpoint not implemented',
    error: `Route ${req.method} ${req.originalUrl} not found`,
  };
  res.status(404).json(response);
});

// Handle 404 for all other routes - FIXED: Remove the problematic wildcard
app.use((req, res, next) => {
  // Skip if the request was already handled by API routes
  if (req.path.startsWith(BASE_PATH)) {
    return next();
  }

  // Only handle non-API routes that haven't been matched
  const response: ApiResponse = {
    success: false,
    message: 'Route not found',
    error: `Can't find ${req.originalUrl} on this server!`,
  };
  res.status(404).json(response);
});

// Global error handling middleware
app.use(errorHandler);

const PORT = env.PORT ?? 5000;

app.listen(PORT, async () => {
  // Connect to database
  await connectDB();

  Logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
  Logger.info(`📍 Health check: http://localhost:${PORT}/health`);
  Logger.info(`🌐 Base API path: http://localhost:${PORT}${BASE_PATH}`);
});
