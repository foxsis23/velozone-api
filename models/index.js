import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

import defineAdmin from './Admin.js';
import defineCategory from './Category.js';
import defineProduct from './Product.js';
import defineOrder from './Order.js';
import defineOrderItem from './OrderItem.js';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
  }
);

const Admin = defineAdmin(sequelize);
const Category = defineCategory(sequelize);
const Product = defineProduct(sequelize);
const Order = defineOrder(sequelize);
const OrderItem = defineOrderItem(sequelize);

// Associations
Category.hasMany(Product, { foreignKey: 'category_id' });
Product.belongsTo(Category, { foreignKey: 'category_id' });

Admin.hasMany(Order, { foreignKey: 'admin_id' });
Order.belongsTo(Admin, { foreignKey: 'admin_id' });

Order.belongsToMany(Product, { through: OrderItem, foreignKey: 'order_id', otherKey: 'product_id' });
Product.belongsToMany(Order, { through: OrderItem, foreignKey: 'product_id', otherKey: 'order_id' });

Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

OrderItem.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(OrderItem, { foreignKey: 'product_id' });

export { sequelize, Admin, Category, Product, Order, OrderItem };
