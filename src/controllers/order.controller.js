import { Order, OrderItem, Product } from '../../models/index.js';
import logger from '../utils/logger.js';

export async function listOrders(req, res) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const offset = (page - 1) * limit;
  const { status } = req.query;

  const where = {};
  if (status) where.status = status;

  try {
    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [{ model: OrderItem, as: 'OrderItems', include: [{ model: Product, as: 'Product', attributes: ['id', 'name', 'price'] }] }],
      limit,
      offset,
      order: [['order_date', 'DESC']],
    });
    return res.json({
      success: true,
      data: rows,
      meta: { total: count, page, limit, pages: Math.ceil(count / limit) },
    });
  } catch (err) {
    logger.error(`List orders error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
}

export async function getOrder(req, res) {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: 'OrderItems', include: [{ model: Product, as: 'Product', attributes: ['id', 'name', 'price'] }] }],
    });
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    return res.json({ success: true, data: order });
  } catch (err) {
    logger.error(`Get order error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'Failed to fetch order' });
  }
}

export async function createOrder(req, res) {
  const { customer_name, phone, items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, error: 'Order must contain at least one item' });
  }

  try {
    const productIds = items.map(i => i.product_id);
    const products = await Product.findAll({ where: { id: productIds } });

    if (products.length !== productIds.length) {
      return res.status(400).json({ success: false, error: 'One or more products not found' });
    }

    const priceMap = Object.fromEntries(products.map(p => [p.id, p.price]));

    const order = await Order.create({ customer_name, phone });

    const orderItems = items.map(i => ({
      order_id: order.id,
      product_id: i.product_id,
      quantity: i.quantity || 1,
      price_at_order: priceMap[i.product_id],
    }));

    await OrderItem.bulkCreate(orderItems);

    const created = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'OrderItems', include: [{ model: Product, as: 'Product', attributes: ['id', 'name', 'price'] }] }],
    });

    logger.info(`Order created: ${order.id} for ${customer_name}`);
    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    logger.error(`Create order error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'Failed to create order' });
  }
}

export async function updateOrderStatus(req, res) {
  const { status } = req.body;
  const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    await order.update({ status });
    logger.info(`Order ${order.id} status changed to ${status}`);
    return res.json({ success: true, data: order });
  } catch (err) {
    logger.error(`Update order status error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
}

export async function deleteOrder(req, res) {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    await OrderItem.destroy({ where: { order_id: order.id } });
    await order.destroy();

    logger.info(`Order deleted: ${req.params.id}`);
    return res.json({ success: true, message: 'Order deleted' });
  } catch (err) {
    logger.error(`Delete order error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'Failed to delete order' });
  }
}
