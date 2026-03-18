import pool from './connection.js';

// SELECT — all products with their category name (JOIN)
export async function getAllProductsWithCategory() {
  const [rows] = await pool.query(`
    SELECT p.id, p.name, p.price, p.description, c.name AS category_name
    FROM Products p
    LEFT JOIN Categories c ON p.category_id = c.id
  `);
  return rows;
}

// INSERT — add a Category, then a Product in that category
export async function insertSampleData() {
  const [catResult] = await pool.query(
    'INSERT INTO Categories (name, description) VALUES (?, ?)',
    ['Electronics', 'Electronic devices and accessories']
  );
  const categoryId = catResult.insertId;

  const [prodResult] = await pool.query(
    'INSERT INTO Products (name, price, description, category_id) VALUES (?, ?, ?, ?)',
    ['Wireless Mouse', 29.99, 'Ergonomic wireless mouse', categoryId]
  );

  return { categoryId, productId: prodResult.insertId };
}

// UPDATE — change a product's price by id
export async function updateProductPrice(productId, newPrice) {
  const [result] = await pool.query(
    'UPDATE Products SET price = ? WHERE id = ?',
    [newPrice, productId]
  );
  return result.affectedRows;
}

// DELETE — remove a product by id
export async function deleteProduct(productId) {
  const [result] = await pool.query(
    'DELETE FROM Products WHERE id = ?',
    [productId]
  );
  return result.affectedRows;
}
