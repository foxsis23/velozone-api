import { DataTypes } from 'sequelize';

export default function defineLoginAttempt(sequelize) {
  return sequelize.define(
    'LoginAttempt',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      success: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'LoginAttempts',
      timestamps: true,
      updatedAt: false,
    }
  );
}
