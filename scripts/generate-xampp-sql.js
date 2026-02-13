/**
 * Generates database.sql for import in XAMPP phpMyAdmin.
 * Run: node scripts/generate-xampp-sql.js
 * Then in phpMyAdmin: Import → Choose database.sql → Go
 */

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const passwordHash = bcrypt.hashSync("admin123", 12);

// IDs that match Prisma-style (short for readability in SQL)
const REST_ID = "rest_demo_001";
const TABLE_IDS = ["tbl_001", "tbl_002", "tbl_003", "tbl_004", "tbl_005"];
const CAT_FOOD = "cat_food";
const CAT_DRINKS = "cat_drinks";
const CAT_DESSERTS = "cat_desserts";

const sql = `-- Restaurant QR - Import this file in phpMyAdmin (XAMPP)
-- Generated for MySQL/MariaDB

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
DROP TABLE IF EXISTS \`Table\`;
CREATE TABLE \`Table\` (
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
DROP TABLE IF EXISTS \`Order\`;
CREATE TABLE \`Order\` (
  id VARCHAR(191) NOT NULL,
  tableId VARCHAR(191) NOT NULL,
  status ENUM('PENDING', 'PREPARING', 'READY', 'SERVED', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
  paymentType ENUM('ONLINE', 'COUNTER') NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  KEY Order_tableId_idx (tableId),
  CONSTRAINT Order_tableId_fkey FOREIGN KEY (tableId) REFERENCES \`Table\` (id) ON DELETE CASCADE ON UPDATE CASCADE
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
  CONSTRAINT OrderItem_orderId_fkey FOREIGN KEY (orderId) REFERENCES \`Order\` (id) ON DELETE CASCADE ON UPDATE CASCADE,
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
  CONSTRAINT Payment_orderId_fkey FOREIGN KEY (orderId) REFERENCES \`Order\` (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------
-- Seed data
-- ----------------------------
INSERT INTO User (id, email, password, name, role, createdAt, updatedAt) VALUES
('user_admin_01', 'admin@restaurant.com', '${passwordHash}', 'Admin', 'ADMIN', NOW(3), NOW(3)),
('user_staff_01', 'staff@restaurant.com', '${passwordHash}', 'Staff', 'STAFF', NOW(3), NOW(3));

INSERT INTO Restaurant (id, name, slug, logoUrl, createdAt, updatedAt) VALUES
('${REST_ID}', 'Demo Restaurant', 'demo-restaurant', NULL, NOW(3), NOW(3));

INSERT INTO \`Table\` (id, label, restaurantId) VALUES
('${TABLE_IDS[0]}', '1', '${REST_ID}'),
('${TABLE_IDS[1]}', '2', '${REST_ID}'),
('${TABLE_IDS[2]}', '3', '${REST_ID}'),
('${TABLE_IDS[3]}', '4', '${REST_ID}'),
('${TABLE_IDS[4]}', '5', '${REST_ID}');

INSERT INTO Category (id, name, sortOrder, restaurantId) VALUES
('${CAT_FOOD}', 'Food', 0, '${REST_ID}'),
('${CAT_DRINKS}', 'Drinks', 1, '${REST_ID}'),
('${CAT_DESSERTS}', 'Desserts', 2, '${REST_ID}');

INSERT INTO MenuItem (id, name, description, price, imageUrl, available, categoryId) VALUES
('item_burger', 'Burger', 'Classic beef burger', 12.99, NULL, 1, '${CAT_FOOD}'),
('item_pizza', 'Pizza Margherita', 'Tomato, mozzarella, basil', 14.99, NULL, 1, '${CAT_FOOD}'),
('item_salad', 'Caesar Salad', 'Romaine, parmesan, croutons', 9.99, NULL, 1, '${CAT_FOOD}'),
('item_fish', 'Fish & Chips', 'Crispy battered fish with fries', 13.99, NULL, 1, '${CAT_FOOD}'),
('item_cola', 'Cola', 'Cold cola', 2.99, NULL, 1, '${CAT_DRINKS}'),
('item_oj', 'Fresh Orange Juice', 'Freshly squeezed', 4.99, NULL, 1, '${CAT_DRINKS}'),
('item_coffee', 'Coffee', 'Espresso or filter', 3.49, NULL, 1, '${CAT_DRINKS}'),
('item_tea', 'Iced Tea', 'Lemon iced tea', 3.99, NULL, 1, '${CAT_DRINKS}'),
('item_cake', 'Chocolate Cake', 'Rich chocolate slice', 6.99, NULL, 1, '${CAT_DESSERTS}'),
('item_ice', 'Ice Cream', 'Vanilla, chocolate, strawberry', 4.99, NULL, 1, '${CAT_DESSERTS}'),
('item_cheese', 'Cheesecake', 'New York style', 7.99, NULL, 1, '${CAT_DESSERTS}');

-- Done. Login: admin@restaurant.com / admin123
`;

const outPath = path.join(__dirname, "..", "database.sql");
fs.writeFileSync(outPath, sql, "utf8");
console.log("Created: database.sql");
console.log("Import this file in phpMyAdmin: http://localhost/phpmyadmin");
console.log("  → Select or create database 'restaurant_qr' → Import → Choose database.sql → Go");
console.log("Login: admin@restaurant.com / admin123");
console.log("Demo table ID for customer link: " + TABLE_IDS[0]);
