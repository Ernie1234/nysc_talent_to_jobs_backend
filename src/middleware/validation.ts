import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodIssue } from 'zod';

// Generic validation middleware
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue: ZodIssue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            details: errorMessages,
          },
        });
        return;
      }
      next(error);
    }
  };
};

// Validate request body
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue: ZodIssue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        res.status(400).json({
          success: false,
          error: {
            message: 'Request body validation failed',
            details: errorMessages,
          },
        });
        return;
      }
      next(error);
    }
  };
};

// Validate request parameters
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue: ZodIssue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        res.status(400).json({
          success: false,
          error: {
            message: 'Request parameters validation failed',
            details: errorMessages,
          },
        });
        return;
      }
      next(error);
    }
  };
};

// Validate query parameters
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as any;
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue: ZodIssue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        res.status(400).json({
          success: false,
          error: {
            message: 'Query parameters validation failed',
            details: errorMessages,
          },
        });
        return;
      }
      next(error);
    }
  };
};

// Combined validation middleware for body, params, and query
export const validateAll = (schemas: {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: any[] = [];

    // Validate body
    if (schemas.body) {
      try {
        req.body = schemas.body.parse(req.body);
      } catch (error) {
        if (error instanceof ZodError) {
          errors.push(
            ...error.issues.map((issue: ZodIssue) => ({
              type: 'body',
              field: issue.path.join('.'),
              message: issue.message,
            }))
          );
        }
      }
    }

    // Validate params
    if (schemas.params) {
      try {
        req.params = schemas.params.parse(req.params) as any;
      } catch (error) {
        if (error instanceof ZodError) {
          errors.push(
            ...error.issues.map((issue: ZodIssue) => ({
              type: 'params',
              field: issue.path.join('.'),
              message: issue.message,
            }))
          );
        }
      }
    }

    // Validate query
    if (schemas.query) {
      try {
        req.query = schemas.query.parse(req.query) as any;
      } catch (error) {
        if (error instanceof ZodError) {
          errors.push(
            ...error.issues.map((issue: ZodIssue) => ({
              type: 'query',
              field: issue.path.join('.'),
              message: issue.message,
            }))
          );
        }
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors,
        },
      });
      return;
    }

    next();
  };
};