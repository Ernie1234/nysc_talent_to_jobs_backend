import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CreateUserDto, LoginDto, AuthResponse } from '@/types/user';

// Mock user storage (replace with actual database)
const users: any[] = [];

const generateToken = (userId: string, email: string, role: string): string => {
  return jwt.sign(
    { id: userId, email, role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

export const register = async (
  req: Request<{}, AuthResponse, CreateUserDto>,
  res: Response<AuthResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Check if user exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      res.status(400).json({
        success: false,
        token: '',
        user: {} as any,
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.push(newUser);

    // Generate token
    const token = generateToken(newUser.id, newUser.email, newUser.role);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<{}, AuthResponse, LoginDto>,
  res: Response<AuthResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find(user => user.email === email);
    if (!user) {
      res.status(401).json({
        success: false,
        token: '',
        user: {} as any,
      });
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        token: '',
        user: {} as any,
      });
      return;
    }

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = users.find(user => user.id === req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
      return;
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};