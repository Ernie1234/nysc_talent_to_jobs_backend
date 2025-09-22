import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiResponse } from '@/types';
import { env } from '@/config/env';

export class AppError extends Error {
  public statusCode: number;

  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const handleZodError = (error: ZodError): ApiResponse => {
  const errors: Record<string, string> = {};

  error.errors.forEach(err => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });

  return {
    success: false,
    message: 'Validation failed',
    errors,
  };
};

const handleMongooseError = (error: any): ApiResponse => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue ?? {})[0];
    return {
      success: false,
      message: `${field} already exists`,
      error: `Duplicate field: ${field}`,
    };
  }

  if (error.name === 'ValidationError') {
    const errors: Record<string, string> = {};
    Object.keys(error.errors).forEach(key => {
      errors[key] = error.errors[key].message;
    });

    return {
      success: false,
      message: 'Validation failed',
      errors,
    };
  }

  if (error.name === 'CastError') {
    return {
      success: false,
      message: 'Invalid ID format',
      error: 'Resource not found',
    };
  }

  return {
    success: false,
    message: 'Database error',
    error: error.message,
  };
};

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let response: ApiResponse;

  // Log error
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  if (error instanceof ZodError) {
    response = handleZodError(error);
    res.status(400).json(response);
  } else if (error instanceof AppError) {
    response = {
      success: false,
      message: error.message,
      ...(env.NODE_ENV === 'development' && { error: error.stack }),
    };
    res.status(error.statusCode).json(response);
  } else if (
    error.name === 'MongoError' ||
    error.name === 'ValidationError' ||
    error.name === 'CastError' ||
    (error as any).code === 11000
  ) {
    response = handleMongooseError(error);
    res.status(400).json(response);
  } else if (error.name === 'JsonWebTokenError') {
    response = {
      success: false,
      message: 'Invalid token',
      error: 'Authentication failed',
    };
    res.status(401).json(response);
  } else if (error.name === 'TokenExpiredError') {
    response = {
      success: false,
      message: 'Token expired',
      error: 'Authentication failed',
    };
    res.status(401).json(response);
  } else {
    response = {
      success: false,
      message: env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      ...(env.NODE_ENV === 'development' && { error: error.stack }),
    };
    res.status(500).json(response);
  }
};
