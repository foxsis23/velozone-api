/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Керування профілями користувачів
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Отримати профіль поточного користувача
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Дані профілю
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Не авторизовано
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   patch:
 *     summary: Оновити профіль поточного користувача
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: new_username
 *               avatar_url:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/new-avatar.png
 *     responses:
 *       200:
 *         description: Профіль оновлено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Помилка валідації
 *   delete:
 *     summary: Видалити власний акаунт
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Акаунт видалено
 *       401:
 *         description: Не авторизовано
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Отримати список усіх користувачів (тільки admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список користувачів
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       403:
 *         description: Доступ заборонено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Видалити користувача за ID (тільки admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID користувача
 *     responses:
 *       200:
 *         description: Користувача видалено
 *       403:
 *         description: Доступ заборонено
 *       404:
 *         description: Користувача не знайдено
 */

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     summary: Змінити роль користувача (тільки admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID користувача
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *                 example: admin
 *     responses:
 *       200:
 *         description: Роль оновлено
 *       400:
 *         description: Невалідна роль
 *       403:
 *         description: Доступ заборонено
 */

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
