import { DataTypes } from 'sequelize';

export default function defineUser(sequelize) {
  return sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 100],
          notEmpty: true,
        },
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: true, // null for OAuth users
      },
      role: {
        type: DataTypes.ENUM('admin', 'user'),
        allowNull: false,
        defaultValue: 'user',
      },
      is_email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      email_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      email_token_expires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      reset_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      reset_token_expires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      google_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
      avatar_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
    },
    {
      tableName: 'Users',
      timestamps: true,
    }
  );
}
