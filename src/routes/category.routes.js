/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Категорії запчастин
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Список усіх категорій
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Список категорій
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *   post:
 *     summary: Створити категорію (admin)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Гальма
 *               description:
 *                 type: string
 *                 example: Гальмівні системи та комплектуючі
 *     responses:
 *       201:
 *         description: Категорію створено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Category' }
 *       403:
 *         description: Доступ заборонено
 */

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Отримати категорію з продуктами
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Категорія з товарами
 *       404:
 *         description: Категорію не знайдено
 *   put:
 *     summary: Оновити категорію (admin)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: Колеса }
 *               description: { type: string, example: Колеса та обода }
 *     responses:
 *       200:
 *         description: Категорію оновлено
 *       404:
 *         description: Категорію не знайдено
 *   delete:
 *     summary: Видалити категорію (admin)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Категорію видалено
 *       404:
 *         description: Категорію не знайдено
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { listCategories, getCategory, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { handleValidation } from '../middleware/validate.js';

const router = Router();

const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 150 }),
  body('description').optional().trim(),
];

router.get('/', listCategories);
router.get('/:id', getCategory);
router.post('/', authenticate, authorize('admin'), categoryValidation, handleValidation, createCategory);
router.put('/:id', authenticate, authorize('admin'), categoryValidation, handleValidation, updateCategory);
router.delete('/:id', authenticate, authorize('admin'), deleteCategory);

export default router;
