import { Request, Response, NextFunction } from 'express';
import { UpdateUserDto } from '@/types/user';
import User from '@/models/User';

/**
 * @desc    Get all users
 * @route   GET /api/V1/users
 * @access  Private (Admin only)
 */
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Remove passwords from response
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });

    res.status(200).json({
      success: true,
      count: users.length,
      message: 'Users retrieved successfully',
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single user by ID
 * @route   GET /api/V1/users/:id
 * @access  Private
 */
export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/V1/users/:id
 * @access  Private
 */
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdateUserDto = req.body;

    // Check if user is updating their own profile or is an admin
    if (req.user?.id !== id && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: { message: 'Not authorized to update this user' },
      });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a user
 * @route   DELETE /api/V1/users/:id
 * @access  Private
 */
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user is deleting their own profile or is an admin
    if (req.user?.id !== id && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: { message: 'Not authorized to delete this user' },
      });
      return;
    }

    const deletedUser = await User.findByIdAndDelete(id).select('-password');

    if (!deletedUser) {
      res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
