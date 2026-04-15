CREATE DATABASE IF NOT EXISTS `velozone-api`;
USE `velozone-api`;

CREATE TABLE IF NOT EXISTS Admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  login VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('superadmin','admin','moderator') DEFAULT 'admin',
  last_login DATETIME
);

CREATE TABLE IF NOT EXISTS Categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS Products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  composition TEXT,
  category_id INT,
  FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending','processing','completed','cancelled') DEFAULT 'pending',
  admin_id INT,
  FOREIGN KEY (admin_id) REFERENCES Admins(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Order_Items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price_at_order DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE
);

-- ─── Auth tables ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),              -- NULL for OAuth-only accounts
  role ENUM('admin','user') NOT NULL DEFAULT 'user',
  is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  email_token VARCHAR(255),
  email_token_expires DATETIME,
  reset_token VARCHAR(255),
  reset_token_expires DATETIME,
  google_id VARCHAR(255) UNIQUE,
  avatar_url VARCHAR(500),
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS RefreshTokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(512) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS LoginAttempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45),
  success BOOLEAN NOT NULL DEFAULT FALSE,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email_created (email, createdAt),
  INDEX idx_ip_created (ip_address, createdAt)
);
