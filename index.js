import 'dotenv/config';
import {
  getAllProductsWithCategory,
  insertSampleData,
  updateProductPrice,
  deleteProduct,
} from './db/queries.js';
import { sequelize, Category, Product } from './models/index.js';

async function runRawQueries() {
  console.log('\n=== Raw SQL Queries (mysql2) ===');

  console.log('\n[INSERT] Adding sample category and product...');
  const { categoryId, productId } = await insertSampleData();
  console.log(`  Created category id=${categoryId}, product id=${productId}`);

  console.log('\n[SELECT] Products with category:');
  const products = await getAllProductsWithCategory();
  console.table(products);

  console.log('\n[UPDATE] Updating product price...');
  const affected = await updateProductPrice(productId, 24.99);
  console.log(`  Rows affected: ${affected}`);

  console.log('\n[DELETE] Deleting product...');
  const deleted = await deleteProduct(productId);
  console.log(`  Rows deleted: ${deleted}`);
}

async function runSequelizeExamples() {
  console.log('\n=== Sequelize ORM ===');

  await sequelize.authenticate();
  console.log('\n[OK] Sequelize connected.');

  await sequelize.sync({ force: false });
  console.log('[OK] Models synced.');

  console.log('\n[CREATE] Creating category via Sequelize...');
  const category = await Category.create({
    name: 'Accessories',
    description: 'Various accessories',
  });
  console.log(`  Category created: id=${category.id}, name=${category.name}`);

  console.log('\n[CREATE] Creating product via Sequelize...');
  const product = await Product.create({
    name: 'USB Hub',
    price: 19.99,
    description: '7-port USB 3.0 hub',
    category_id: category.id,
  });
  console.log(`  Product created: id=${product.id}, name=${product.name}`);

  console.log('\n[FIND] Products with Category (eager loading):');
  const all = await Product.findAll({ include: [Category] });
  all.forEach((p) => {
    const catName = p.Category ? p.Category.name : 'N/A';
    console.log(`  [${p.id}] ${p.name} — $${p.price} (${catName})`);
  });
}

(async () => {
  try {
    await runRawQueries();
    await runSequelizeExamples();
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
})();
