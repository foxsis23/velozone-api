import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'Categories',
    timestamps: false,
  });
};
