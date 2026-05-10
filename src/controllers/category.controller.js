import { Category, Product } from '../../models/index.js';
import logger from '../utils/logger.js';

export async function listCategories(_req, res) {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    return res.json({ success: true, data: categories });
  } catch (err) {
    logger.error(`List categories error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
}

export async function getCategory(req, res) {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [{ model: Product, as: 'Products' }],
    });
    if (!category) return res.status(404).json({ success: false, error: 'Category not found' });
    return res.json({ success: true, data: category });
  } catch (err) {
    logger.error(`Get category error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'Failed to fetch category' });
  }
}

export async function createCategory(req, res) {
  const { name, description } = req.body;
  try {
    const category = await Category.create({ name, description });
    logger.info(`Category created: ${name}`);
    return res.status(201).json({ success: true, data: category });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, error: 'Category already exists' });
    }
    logger.error(`Create category error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'Failed to create category' });
  }
}

export async function updateCategory(req, res) {
  const { name, description } = req.body;
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ success: false, error: 'Category not found' });

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;

    await category.update(updates);
    logger.info(`Category updated: ${category.id}`);
    return res.json({ success: true, data: category });
  } catch (err) {
    logger.error(`Update category error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'Failed to update category' });
  }
}

export async function deleteCategory(req, res) {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ success: false, error: 'Category not found' });

    await category.destroy();
    logger.info(`Category deleted: ${req.params.id}`);
    return res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    logger.error(`Delete category error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'Failed to delete category' });
  }
}
