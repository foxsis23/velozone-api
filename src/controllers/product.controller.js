import { Op } from 'sequelize';
import { Product, Category } from '../../models/index.js';
import logger from '../utils/logger.js';

export async function listProducts(req, res) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const offset = (page - 1) * limit;
  const { category_id, search } = req.query;

  const where = {};
  if (category_id) where.category_id = category_id;
  if (search) where.name = { [Op.like]: `%${search}%` };

  try {
    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{ model: Category, as: 'Category', attributes: ['id', 'name'] }],
      limit,
      offset,
      order: [['name', 'ASC']],
    });
    return res.json({
      success: true,
      data: rows,
      meta: { total: count, page, limit, pages: Math.ceil(count / limit) },
    });
  } catch (err) {
    logger.error(`List products error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
}

export async function getProduct(req, res) {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: 'Category', attributes: ['id', 'name'] }],
    });
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    return res.json({ success: true, data: product });
  } catch (err) {
    logger.error(`Get product error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'Failed to fetch product' });
  }
}

export async function createProduct(req, res) {
  const { name, price, description, composition, category_id } = req.body;
  try {
    if (category_id) {
      const cat = await Category.findByPk(category_id);
      if (!cat) return res.status(400).json({ success: false, error: 'Category not found' });
    }
    const product = await Product.create({ name, price, description, composition, category_id });
    logger.info(`Product created: ${name}`);
    return res.status(201).json({ success: true, data: product });
  } catch (err) {
    logger.error(`Create product error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'Failed to create product' });
  }
}

export async function updateProduct(req, res) {
  const { name, price, description, composition, category_id } = req.body;
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (price !== undefined) updates.price = price;
    if (description !== undefined) updates.description = description;
    if (composition !== undefined) updates.composition = composition;
    if (category_id !== undefined) updates.category_id = category_id;

    await product.update(updates);
    logger.info(`Product updated: ${product.id}`);
    return res.json({ success: true, data: product });
  } catch (err) {
    logger.error(`Update product error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'Failed to update product' });
  }
}

export async function deleteProduct(req, res) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

    await product.destroy();
    logger.info(`Product deleted: ${req.params.id}`);
    return res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    logger.error(`Delete product error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'Failed to delete product' });
  }
}
