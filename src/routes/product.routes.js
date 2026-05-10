/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Запчастини та товари
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Список товарів з фільтрацією
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category_id
 *         schema: { type: integer }
 *         description: Фільтр по категорії
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Пошук по назві
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Список товарів
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Product' }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total: { type: integer }
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     pages: { type: integer }
 *   post:
 *     summary: Створити товар (admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price]
 *             properties:
 *               name: { type: string, example: Гальмівна колодка Shimano }
 *               price: { type: number, format: float, example: 349.99 }
 *               description: { type: string, example: Органічні колодки для дискових гальм }
 *               composition: { type: string, example: Органічний матеріал, алюмінієвий корпус }
 *               category_id: { type: integer, example: 1 }
 *     responses:
 *       201:
 *         description: Товар створено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Product' }
 *       400:
 *         description: Помилка валідації або категорія не знайдена
 */

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Отримати товар за ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Дані товару
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Product' }
 *       404:
 *         description: Товар не знайдено
 *   put:
 *     summary: Оновити товар (admin)
 *     tags: [Products]
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
 *               name: { type: string }
 *               price: { type: number, format: float }
 *               description: { type: string }
 *               composition: { type: string }
 *               category_id: { type: integer }
 *     responses:
 *       200:
 *         description: Товар оновлено
 *       404:
 *         description: Товар не знайдено
 *   delete:
 *     summary: Видалити товар (admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Товар видалено
 *       404:
 *         description: Товар не знайдено
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { listProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { handleValidation } from '../middleware/validate.js';

const router = Router();

const productValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 200 }),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category_id').optional().isInt({ min: 1 }).withMessage('category_id must be a positive integer'),
];

const productUpdateValidation = [
  body('name').optional().trim().notEmpty().isLength({ max: 200 }),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category_id').optional().isInt({ min: 1 }),
];

router.get('/', listProducts);
router.get('/:id', getProduct);
router.post('/', authenticate, authorize('admin'), productValidation, handleValidation, createProduct);
router.put('/:id', authenticate, authorize('admin'), productUpdateValidation, handleValidation, updateProduct);
router.delete('/:id', authenticate, authorize('admin'), deleteProduct);

export default router;
