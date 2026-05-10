/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Аутентифікація та авторизація
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Реєстрація нового користувача
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password, passwordConfirm]
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: john_doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: Secret123
 *               passwordConfirm:
 *                 type: string
 *                 example: Secret123
 *     responses:
 *       201:
 *         description: Користувача зареєстровано, надіслано лист підтвердження
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { type: object, properties: { message: { type: string } } }
 *       400:
 *         description: Помилка валідації
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вхід у систему
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Secret123
 *     responses:
 *       200:
 *         description: Успішний вхід
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Невірний email або пароль
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Вихід із системи
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успішний вихід
 *       401:
 *         description: Не авторизовано
 */

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Оновлення access токена
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Новий access токен
 *       401:
 *         description: Невалідний refresh токен
 */

/**
 * @swagger
 * /api/auth/verify-email:
 *   get:
 *     summary: Підтвердження email
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Токен підтвердження з листа
 *     responses:
 *       200:
 *         description: Email підтверджено
 *       400:
 *         description: Невалідний або прострочений токен
 */

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Повторно надіслати лист підтвердження
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Лист надіслано
 *       404:
 *         description: Користувача не знайдено
 */

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Запит на скидання паролю
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Лист зі скиданням паролю надіслано
 */

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Скидання паролю за токеном
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password, passwordConfirm]
 *             properties:
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: NewSecret123
 *               passwordConfirm:
 *                 type: string
 *                 example: NewSecret123
 *     responses:
 *       200:
 *         description: Пароль успішно змінено
 *       400:
 *         description: Невалідний токен або помилка валідації
 */

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Зміна паролю (авторизований користувач)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword, newPasswordConfirm]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: Secret123
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: NewSecret456
 *               newPasswordConfirm:
 *                 type: string
 *                 example: NewSecret456
 *     responses:
 *       200:
 *         description: Пароль змінено
 *       401:
 *         description: Невірний поточний пароль
 */

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Вхід через Google OAuth
 *     tags: [Auth]
 *     description: Перенаправляє на сторінку авторизації Google
 *     responses:
 *       302:
 *         description: Редирект на Google OAuth
 */

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
