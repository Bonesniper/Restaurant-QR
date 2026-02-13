-- ============================================================
-- IMPORT THIS FILE in phpMyAdmin (NOT the .js script file)
-- phpMyAdmin → Import → Choose database.sql → Go
-- ============================================================
-- Restaurant QR - MySQL/MariaDB (XAMPP)

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS restaurant_qr DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE restaurant_qr;

-- ----------------------------
-- User (staff/admin)
-- ----------------------------
DROP TABLE IF EXISTS User;
CREATE TABLE User (
  id VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  password VARCHAR(191) NOT NULL,
  name VARCHAR(191) NOT NULL,
  role ENUM('STAFF', 'ADMIN') NOT NULL DEFAULT 'STAFF',
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY User_email_key (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Restaurant
-- ----------------------------
DROP TABLE IF EXISTS Restaurant;
CREATE TABLE Restaurant (
  id VARCHAR(191) NOT NULL,
  name VARCHAR(191) NOT NULL,
  slug VARCHAR(191) NOT NULL,
  logoUrl VARCHAR(191) NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY Restaurant_slug_key (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table (reserved word in MySQL)
-- ----------------------------
DROP TABLE IF EXISTS `Table`;
CREATE TABLE `Table` (
  id VARCHAR(191) NOT NULL,
  label VARCHAR(191) NOT NULL,
  restaurantId VARCHAR(191) NOT NULL,
  PRIMARY KEY (id),
  KEY Table_restaurantId_idx (restaurantId),
  CONSTRAINT Table_restaurantId_fkey FOREIGN KEY (restaurantId) REFERENCES Restaurant (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Category
-- ----------------------------
DROP TABLE IF EXISTS Category;
CREATE TABLE Category (
  id VARCHAR(191) NOT NULL,
  name VARCHAR(191) NOT NULL,
  sortOrder INT NOT NULL DEFAULT 0,
  restaurantId VARCHAR(191) NOT NULL,
  PRIMARY KEY (id),
  KEY Category_restaurantId_idx (restaurantId),
  CONSTRAINT Category_restaurantId_fkey FOREIGN KEY (restaurantId) REFERENCES Restaurant (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- MenuItem
-- ----------------------------
DROP TABLE IF EXISTS MenuItem;
CREATE TABLE MenuItem (
  id VARCHAR(191) NOT NULL,
  name VARCHAR(191) NOT NULL,
  description VARCHAR(191) NULL,
  price DECIMAL(10,2) NOT NULL,
  imageUrl VARCHAR(191) NULL,
  available TINYINT(1) NOT NULL DEFAULT 1,
  categoryId VARCHAR(191) NOT NULL,
  PRIMARY KEY (id),
  KEY MenuItem_categoryId_idx (categoryId),
  CONSTRAINT MenuItem_categoryId_fkey FOREIGN KEY (categoryId) REFERENCES Category (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Order (reserved word in MySQL)
-- ----------------------------
DROP TABLE IF EXISTS `Order`;
CREATE TABLE `Order` (
  id VARCHAR(191) NOT NULL,
  tableId VARCHAR(191) NOT NULL,
  status ENUM('PENDING', 'PREPARING', 'READY', 'SERVED', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
  paymentType ENUM('ONLINE', 'COUNTER') NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  KEY Order_tableId_idx (tableId),
  CONSTRAINT Order_tableId_fkey FOREIGN KEY (tableId) REFERENCES `Table` (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- OrderItem
-- ----------------------------
DROP TABLE IF EXISTS OrderItem;
CREATE TABLE OrderItem (
  id VARCHAR(191) NOT NULL,
  orderId VARCHAR(191) NOT NULL,
  menuItemId VARCHAR(191) NOT NULL,
  quantity INT NOT NULL,
  unitPrice DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (id),
  KEY OrderItem_orderId_idx (orderId),
  KEY OrderItem_menuItemId_idx (menuItemId),
  CONSTRAINT OrderItem_orderId_fkey FOREIGN KEY (orderId) REFERENCES `Order` (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT OrderItem_menuItemId_fkey FOREIGN KEY (menuItemId) REFERENCES MenuItem (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Payment
-- ----------------------------
DROP TABLE IF EXISTS Payment;
CREATE TABLE Payment (
  id VARCHAR(191) NOT NULL,
  orderId VARCHAR(191) NOT NULL,
  type ENUM('ONLINE', 'COUNTER') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
  gatewayRef VARCHAR(191) NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY Payment_orderId_key (orderId),
  CONSTRAINT Payment_orderId_fkey FOREIGN KEY (orderId) REFERENCES `Order` (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------
-- Seed data
-- ----------------------------
INSERT INTO User (id, email, password, name, role, createdAt, updatedAt) VALUES
('user_admin_01', 'admin@restaurant.com', '$2a$12$nWxHzzpj2uDv5.ur87dtJeTHVQLqen.GV2J3r/W5QE7W3/wSACh8u', 'Admin', 'ADMIN', NOW(3), NOW(3)),
('user_staff_01', 'staff@restaurant.com', '$2a$12$nWxHzzpj2uDv5.ur87dtJeTHVQLqen.GV2J3r/W5QE7W3/wSACh8u', 'Staff', 'STAFF', NOW(3), NOW(3));

INSERT INTO Restaurant (id, name, slug, logoUrl, createdAt, updatedAt) VALUES
('rest_demo_001', 'Demo Restaurant', 'demo-restaurant', NULL, NOW(3), NOW(3));

INSERT INTO `Table` (id, label, restaurantId) VALUES
('tbl_001', '1', 'rest_demo_001'),
('tbl_002', '2', 'rest_demo_001'),
('tbl_003', '3', 'rest_demo_001'),
('tbl_004', '4', 'rest_demo_001'),
('tbl_005', '5', 'rest_demo_001');

INSERT INTO Category (id, name, sortOrder, restaurantId) VALUES
('cat_food', 'Food', 0, 'rest_demo_001'),
('cat_drinks', 'Drinks', 1, 'rest_demo_001'),
('cat_desserts', 'Desserts', 2, 'rest_demo_001');

INSERT INTO MenuItem (id, name, description, price, imageUrl, available, categoryId) VALUES
('item_burger', 'Burger', 'Classic beef burger', 12.99, NULL, 1, 'cat_food'),
('item_pizza', 'Pizza Margherita', 'Tomato, mozzarella, basil', 14.99, NULL, 1, 'cat_food'),
('item_salad', 'Caesar Salad', 'Romaine, parmesan, croutons', 9.99, NULL, 1, 'cat_food'),
('item_fish', 'Fish & Chips', 'Crispy battered fish with fries', 13.99, NULL, 1, 'cat_food'),
('item_cola', 'Cola', 'Cold cola', 2.99, NULL, 1, 'cat_drinks'),
('item_oj', 'Fresh Orange Juice', 'Freshly squeezed', 4.99, NULL, 1, 'cat_drinks'),
('item_coffee', 'Coffee', 'Espresso or filter', 3.49, NULL, 1, 'cat_drinks'),
('item_tea', 'Iced Tea', 'Lemon iced tea', 3.99, NULL, 1, 'cat_drinks'),
('item_cake', 'Chocolate Cake', 'Rich chocolate slice', 6.99, NULL, 1, 'cat_desserts'),
('item_ice', 'Ice Cream', 'Vanilla, chocolate, strawberry', 4.99, NULL, 1, 'cat_desserts'),
('item_cheese', 'Cheesecake', 'New York style', 7.99, NULL, 1, 'cat_desserts');

-- Done. Login: admin@restaurant.com / admin123
