import { Request, Response, NextFunction } from 'express';
import { UpdateUserDto } from '@/types/user';
import { AuthenticatedRequest } from '@/middleware/auth';

// Mock user storage (replace with actual database)
const users: any[] = [];

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Remove passwords from response
    const usersWithoutPassword = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.status(200).json({
      success: true,
      count: usersWithoutPassword.length,
      data: usersWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    const user = users.find(user => user.id === id);
    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
      return;
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdateUserDto = req.body;

    // Check if user is updating their own profile or is admin
    if (req.user?.id !== id && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: { message: 'Not authorized to update this user' },
      });
      return;
    }

    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
      return;
    }

    // Update user
    users[userIndex] = {
      ...users[userIndex],
      ...updateData,
      updatedAt: new Date(),
    };

    // Remove password from response
    const { password, ...userWithoutPassword } = users[userIndex];

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user is deleting their own profile or is admin
    if (req.user?.id !== id && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: { message: 'Not authorized to delete this user' },
      });
      return;
    }

    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
      return;
    }

    // Remove user
    users.splice(userIndex, 1);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};