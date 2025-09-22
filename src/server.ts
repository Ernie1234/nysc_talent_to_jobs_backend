import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from '@/config/env';
import connectDB from '@/config/database';
import { errorHandler } from '@/middleware/errorHandler';
import { ApiResponse } from '@/types';

const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(',').map(origin => origin.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
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
app.use('/api/v1', (req, res) => {
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

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  if (env.NODE_ENV === 'development') {
    console.log(`📖 API docs: http://localhost:${PORT}/api/v1`);
  }
});
