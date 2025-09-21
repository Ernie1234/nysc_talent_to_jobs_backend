import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/utils/jwt';

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let token: string | undefined;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    res.status(401).json({
      success: false,
      error: { message: 'Not authorized to access this resource' },
    });
    return;
  }

  try {
    // Verify token
    const decoded = verifyToken(token);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { message: 'Not authorized to access this resource' },
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { message: 'Not authorized to access this resource' },
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: { message: 'User role is not authorized to access this resource' },
      });
      return;
    }

    next();
  };
};