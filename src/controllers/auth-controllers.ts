import { Request, Response } from 'express';
import { asyncHandler } from '@/middleware/asyncHandler.middlerware';
import { HTTPSTATUS } from '@/config/http-config';
import { loginSchema, registerSchema } from '@/validations/auth-validation';
import { loginService, registerService } from '@/services/auth-service';
import Logger from '@/utils/logger';

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
  res.send('Logout endpoint');
});

export const OnboardingController = asyncHandler(async (req: Request, res: Response) => {
  res.send('Onboarding endpoint');
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
