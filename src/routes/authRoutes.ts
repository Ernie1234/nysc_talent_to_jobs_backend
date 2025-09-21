import express, { RequestHandler } from 'express';
import passport from 'passport';
import { register, login, getMe } from '@/controllers/authController';
import { authenticate } from '@/middleware/auth';
import { validateBody } from '@/middleware/validation';
import { registerSchema, loginSchema } from '@/schemas/authSchemas';
import { generateToken } from '@/utils/jwt';

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', validateBody(registerSchema), register);

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', validateBody(loginSchema), login);

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', authenticate, getMe as RequestHandler);

// Google OAuth Routes

// @desc    Initiate Google OAuth
// @route   GET /api/auth/google
// @access  Public
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    try {
      const user = req.user;

      if (!user) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/login?error=authentication_failed`
        );
      }

      // Generate JWT token
      const token = generateToken(user._id.toString(), user.email, user.role);

      // Redirect to frontend with token
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendURL}/auth/success?token=${token}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
  }
);

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', authenticate, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
