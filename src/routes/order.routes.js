/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Замовлення
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Список замовлень (admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, cancelled]
 *         description: Фільтр по статусу
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Список замовлень
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Order' }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total: { type: integer }
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     pages: { type: integer }
 *       403:
 *         description: Доступ заборонено
 *   post:
 *     summary: Створити замовлення
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customer_name, items]
 *             properties:
 *               customer_name:
 *                 type: string
 *                 example: Іван Петренко
 *               phone:
 *                 type: string
 *                 example: "+380501234567"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [product_id, quantity]
 *                   properties:
 *                     product_id: { type: integer, example: 1 }
 *                     quantity: { type: integer, example: 2 }
 *     responses:
 *       201:
 *         description: Замовлення створено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Order' }
 *       400:
 *         description: Помилка валідації або товар не знайдено
 */

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Отримати замовлення з позиціями (admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Замовлення з усіма позиціями
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Order' }
 *       404:
 *         description: Замовлення не знайдено
 *   delete:
 *     summary: Видалити замовлення (admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Замовлення видалено
 *       404:
 *         description: Замовлення не знайдено
 */

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Змінити статус замовлення (admin)
 *     tags: [Orders]
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, completed, cancelled]
 *                 example: processing
 *     responses:
 *       200:
 *         description: Статус оновлено
 *       400:
 *         description: Невалідний статус
 *       404:
 *         description: Замовлення не знайдено
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { listOrders, getOrder, createOrder, updateOrderStatus, deleteOrder } from '../controllers/order.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { handleValidation } from '../middleware/validate.js';

const router = Router();

const orderValidation = [
  body('customer_name').trim().notEmpty().withMessage('Customer name is required'),
  body('phone').optional().trim(),
  body('items').isArray({ min: 1 }).withMessage('At least one item required'),
  body('items.*.product_id').isInt({ min: 1 }).withMessage('product_id must be a positive integer'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('quantity must be at least 1'),
];

router.get('/', authenticate, authorize('admin'), listOrders);
router.get('/:id', authenticate, authorize('admin'), getOrder);
router.post('/', orderValidation, handleValidation, createOrder);
router.patch('/:id/status', authenticate, authorize('admin'), [body('status').notEmpty()], handleValidation, updateOrderStatus);
router.delete('/:id', authenticate, authorize('admin'), deleteOrder);

export default router;
