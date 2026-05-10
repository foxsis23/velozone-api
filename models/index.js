import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

import defineAdmin from './Admin.js';
import defineCategory from './Category.js';
import defineProduct from './Product.js';
import defineOrder from './Order.js';
import defineOrderItem from './OrderItem.js';
import defineUser from './User.js';
import defineRefreshToken from './RefreshToken.js';
import defineLoginAttempt from './LoginAttempt.js';

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
    dialectOptions: process.env.DB_SSL === 'true'
      ? { ssl: { rejectUnauthorized: false } }
      : {},
  }
);

const Admin = defineAdmin(sequelize);
const Category = defineCategory(sequelize);
const Product = defineProduct(sequelize);
const Order = defineOrder(sequelize);
const OrderItem = defineOrderItem(sequelize);
const User = defineUser(sequelize);
const RefreshToken = defineRefreshToken(sequelize);
const LoginAttempt = defineLoginAttempt(sequelize);

// Associations
Category.hasMany(Product, { foreignKey: 'category_id', as: 'Products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'Category' });

Admin.hasMany(Order, { foreignKey: 'admin_id', as: 'Orders' });
Order.belongsTo(Admin, { foreignKey: 'admin_id', as: 'Admin' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'OrderItems' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'Order' });

OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'Product' });
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'OrderItems' });

// User associations
User.hasMany(RefreshToken, { foreignKey: 'user_id', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id' });

export { sequelize, Admin, Category, Product, Order, OrderItem, User, RefreshToken, LoginAttempt };
