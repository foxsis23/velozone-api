import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Admin', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    login: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('superadmin', 'admin', 'moderator'),
      defaultValue: 'admin',
    },
    last_login: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'Admins',
    timestamps: false,
  });
};
