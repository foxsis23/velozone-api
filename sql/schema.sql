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
