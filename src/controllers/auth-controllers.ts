import { Request, Response } from 'express';
import { asyncHandler } from '@/middleware/asyncHandler.middlerware';
import { HTTPSTATUS } from '@/config/http-config';
import { registerSchema } from '@/validations/auth-validation';

export const RegisterController = asyncHandler(async (req: Request, res: Response) => {
  const registerData = registerSchema.parse(req.body);

  console.log(registerData);
  return res.status(HTTPSTATUS.CREATED).json({
    success: true,
    message: 'User registered successfully',
  });
});

export const LoginController = asyncHandler(async (req: Request, res: Response) => {
  res.send('Login endpoint');
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
