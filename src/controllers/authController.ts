import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '@/models/User';
import { AuthResponse } from '@/types/user';
import { RegisterInput, LoginInput } from '@/schemas/authSchemas';
import { generateToken } from '@/utils/jwt';

export const register = async (
  req: Request<{}, AuthResponse, RegisterInput>,
  res: Response<AuthResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        token: '',
        user: {} as any,
        error: { message: 'User already exists with this email' }
      });
      return;
    }

    // Create user (password will be hashed automatically by the model)
    const newUser = new User({
      email,
      password,
      firstName,
      lastName,
      role: role || 'job_seeker',
      provider: 'local'
    });

    await newUser.save();

    // Generate token
    const token = generateToken(newUser._id.toString(), newUser.email, newUser.role);

    res.status(201).json({
      success: true,
      token,
      user: newUser.toJSON() as any,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        token: '',
        user: {} as any,
        error: { message: 'User already exists with this email' }
      });
      return;
    }
    next(error);
  }
};

export const login = async (
  req: Request<{}, AuthResponse, LoginInput>,
  res: Response<AuthResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({
        success: false,
        token: '',
        user: {} as any,
        error: { message: 'Invalid credentials' }
      });
      return;
    }

    // Check password (only for local users)
    if (user.provider === 'local') {
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          token: '',
          user: {} as any,
          error: { message: 'Invalid credentials' }
        });
        return;
      }
    } else {
      res.status(400).json({
        success: false,
        token: '',
        user: {} as any,
        error: { message: 'Please use Google login for this account' }
      });
      return;
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id.toString(), user.email, user.role);

    res.status(200).json({
      success: true,
      token,
      user: user.toJSON() as any,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { message: 'Not authenticated' },
      });
      return;
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};
