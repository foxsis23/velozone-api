import { Router } from 'express';
import { body } from 'express-validator';
import {
  getProfile,
  updateProfile,
  deleteAccount,
  listUsers,
  deleteUser,
  updateUserRole,
} from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { handleValidation } from '../middleware/validate.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// ─── Own user routes ─────────────────────────────────────────────────────────

// GET /api/users/me
router.get('/me', getProfile);

// PATCH /api/users/me
router.patch(
  '/me',
  [
    body('username').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Username must be 3-100 characters'),
    body('avatar_url').optional().isURL().withMessage('Must be a valid URL'),
  ],
  handleValidation,
  updateProfile
);

// DELETE /api/users/me
router.delete('/me', deleteAccount);

// ─── Admin-only routes ────────────────────────────────────────────────────────

// GET /api/users  (admin only)
router.get('/', authorize('admin'), listUsers);

// DELETE /api/users/:id  (admin only)
router.delete('/:id', authorize('admin'), deleteUser);

// PATCH /api/users/:id/role  (admin only)
router.patch(
  '/:id/role',
  authorize('admin'),
  [body('role').isIn(['admin', 'user']).withMessage('Role must be admin or user')],
  handleValidation,
  updateUserRole
);

export default router;
