import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import connectDB from '@/config/database';
import { errorHandler } from '@/middleware/errorHandler';
import { ApiResponse } from '@/types';
import envConfig from '@/config/env-config';
import { HTTPSTATUS } from './config/http-config';

const app = express();
const env = envConfig();
const BASE_PATH = env.BASE_PATH ?? '/api/v1';
// Connect to database
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true,
    // methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    // allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging middleware (development only)
if (env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`, {
      body: Object.keys(req.body ?? {}).length > 0 ? req.body : undefined,
      query: Object.keys(req.query ?? {}).length > 0 ? req.query : undefined,
      timestamp: new Date().toISOString(),
    });
    next();
  });
}

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
app.get('/health', (_req, res) => {
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

// API routes will be added here
app.use(BASE_PATH, (req, res) => {
  const response: ApiResponse = {
    success: false,
    message: 'API endpoint not implemented yet',
    error: `Route ${req.method} ${req.path} not found`,
  };
  res.status(404).json(response);
});

// Handle 404 for all other routes
app.use('*', (req, res) => {
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

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  if (env.NODE_ENV === 'development') {
    console.log(`📖 API docs: http://localhost:${PORT}/api/v1`);
  }
});
