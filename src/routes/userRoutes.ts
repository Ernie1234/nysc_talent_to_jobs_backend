import express from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} from '@/controllers/userController';
import { authenticate, authorize } from '@/middleware/auth';

const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
router.get('/', authenticate, authorize('admin'), getUsers);

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', authenticate, getUser);

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', authenticate, updateUser);

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
router.delete('/:id', authenticate, deleteUser);

export default router;