import { Router } from 'express';
import passport from 'passport';
import { body, query } from 'express-validator';
import {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  googleCallback,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { loginRateLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js';
import { handleValidation } from '../middleware/validate.js';

const router = Router();

// ─── Validation schemas ────────────────────────────────────────────────────────

const registerValidation = [
  body('username').trim().isLength({ min: 3, max: 100 }).withMessage('Username must be 3-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/\d/).withMessage('Password must contain a number')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter'),
  body('passwordConfirm').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match');
    return true;
  }),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/\d/).withMessage('New password must contain a number')
    .matches(/[A-Z]/).withMessage('New password must contain an uppercase letter'),
  body('newPasswordConfirm').custom((value, { req }) => {
    if (value !== req.body.newPassword) throw new Error('Passwords do not match');
    return true;
  }),
];

const resetPasswordValidation = [
  query('token').notEmpty().withMessage('Token required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/\d/).withMessage('Must contain a number')
    .matches(/[A-Z]/).withMessage('Must contain an uppercase letter'),
  body('passwordConfirm').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match');
    return true;
  }),
];

// ─── Routes ───────────────────────────────────────────────────────────────────

// POST /api/auth/register
router.post('/register', registerValidation, handleValidation, register);

// POST /api/auth/login
router.post('/login', loginRateLimiter, loginValidation, handleValidation, login);

// POST /api/auth/logout  (authenticated)
router.post('/logout', authenticate, logout);

// POST /api/auth/refresh
router.post('/refresh', refreshToken);

// GET /api/auth/verify-email?token=...
router.get('/verify-email', verifyEmail);

// POST /api/auth/resend-verification
router.post('/resend-verification', [body('email').isEmail().normalizeEmail()], handleValidation, resendVerification);

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  passwordResetLimiter,
  [body('email').isEmail().normalizeEmail().withMessage('Valid email required')],
  handleValidation,
  forgotPassword
);

// POST /api/auth/reset-password?token=...
router.post('/reset-password', resetPasswordValidation, handleValidation, resetPassword);

// POST /api/auth/change-password  (authenticated)
router.post('/change-password', authenticate, changePasswordValidation, handleValidation, changePassword);

// ─── Google OAuth ─────────────────────────────────────────────────────────────

// GET /api/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// GET /api/auth/google/callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/api/auth/google/failure' }),
  googleCallback
);

router.get('/google/failure', (_req, res) => {
  res.status(401).json({ success: false, error: 'Google authentication failed' });
});

export default router;
