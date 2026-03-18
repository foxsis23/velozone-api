import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    composition: {
      type: DataTypes.TEXT,
    },
    category_id: {
      type: DataTypes.INTEGER,
    },
  }, {
    tableName: 'Products',
    timestamps: false,
  });
};
