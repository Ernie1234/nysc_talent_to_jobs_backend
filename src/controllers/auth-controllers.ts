import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '@/middleware/asyncHandler.middlerware';
import { HTTPSTATUS } from '@/config/http-config';
import { loginSchema, registerSchema } from '@/validations/auth-validation';
import { loginService, registerService } from '@/services/auth-service';
import Logger from '@/utils/logger';
import envConfig from '@/config/env-config';

const env = envConfig();
export const RegisterController = asyncHandler(async (req: Request, res: Response) => {
  const registerData = registerSchema.parse(req.body);

  const result = await registerService(registerData);
  Logger.info('User registered successfully', { userId: result.user._id });

  return res.status(HTTPSTATUS.CREATED).json({
    success: true,
    message: 'User registered successfully',
    data: result,
  });
});

export const loginController = asyncHandler(async (req: Request, res: Response) => {
  const body = loginSchema.parse({
    ...req.body,
  });
  const { user, accessToken, expiresAt } = await loginService(body);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'User logged in successfully',
    data: {
      user,
    },
    accessToken,
    expiresAt,
  });
});
export const LogoutController = asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      success: false,
      message: 'No token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET as string) as jwt.JwtPayload;

    Logger.info('User logged out successfully', {
      userId: decoded.userId,
      token: `${token.substring(0, 10)}...`,
    });

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: 'User logged out successfully',
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      Logger.info('User logged out with expired token');
      return res.status(HTTPSTATUS.OK).json({
        success: true,
        message: 'User logged out successfully',
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      Logger.warn('Invalid token provided for logout', { error: error.message });
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid token',
      });
    }

    // For other errors, log and return error
    Logger.error('Logout error', { error });
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error during logout',
    });
  }
});

export const PasswordResetController = asyncHandler(async (req: Request, res: Response) => {
  res.send('Password reset endpoint');
});

export const EmailVerificationController = asyncHandler(async (req: Request, res: Response) => {
  res.send('Email verification endpoint');
});
export const GetProfileController = asyncHandler(async (req: Request, res: Response) => {
  res.send('Get profile endpoint');
});
export const UpdateProfileController = asyncHandler(async (req: Request, res: Response) => {
  res.send('Update profile endpoint');
});
export const ChangePasswordController = asyncHandler(async (req: Request, res: Response) => {
  res.send('Change password endpoint');
});
export const ResendVerificationEmailController = asyncHandler(
  async (req: Request, res: Response) => {
    res.send('Resend verification email endpoint');
  }
);
export const ForgotPasswordController = asyncHandler(async (req: Request, res: Response) => {
  res.send('Forgot password endpoint');
});
