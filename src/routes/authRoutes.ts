import express from 'express';
import { register, login, getMe } from '@/controllers/authController';
import { authenticate } from '@/middleware/auth';

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', register);

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', login);

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', authenticate, getMe);

export default router;