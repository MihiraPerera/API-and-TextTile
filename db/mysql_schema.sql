-- =============================================================================
-- API & TEXTILE - MYSQL DATABASE SCHEMA & MIGRATION SCRIPT
-- Target Engine: MySQL 8.0+ / MariaDB 10.5+
-- Generated Date: 2026-11-09
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `wearora_ecommerce` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `wearora_ecommerce`;

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. CATEGORIES TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `image` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. COLORS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `colors`;
CREATE TABLE `colors` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `hex` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. SIZES TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `sizes`;
CREATE TABLE `sizes` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. WAREHOUSES TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `warehouses`;
CREATE TABLE `warehouses` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. PRODUCTS CATALOG TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `brand` VARCHAR(100) DEFAULT 'Ceylon Couture',
  `description` TEXT NULL,
  `short_description` TEXT NULL,
  `category` VARCHAR(100) NOT NULL,
  `gender` ENUM('Men', 'Women', 'Kids', 'Unisex') DEFAULT 'Women',
  `material` VARCHAR(255) NULL,
  `fit` VARCHAR(255) NULL,
  `care_instructions` TEXT NULL,
  `rating` DECIMAL(3,2) DEFAULT 5.00,
  `review_count` INT DEFAULT 0,
  `is_new_arrival` TINYINT(1) DEFAULT 1,
  `is_best_seller` TINYINT(1) DEFAULT 0,
  `is_sale` TINYINT(1) DEFAULT 0,
  `base_price` DECIMAL(12,2) NOT NULL,
  `compare_at_price` DECIMAL(12,2) DEFAULT NULL,
  `images_json` JSON NULL COMMENT 'Array of product image URLs',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_slug` (`slug`),
  KEY `idx_product_category` (`category`),
  KEY `idx_product_gender` (`gender`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. PRODUCT VARIANTS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `product_variants`;
CREATE TABLE `product_variants` (
  `id` VARCHAR(64) NOT NULL,
  `product_id` VARCHAR(64) NOT NULL,
  `sku` VARCHAR(100) NOT NULL,
  `color_id` VARCHAR(64) NOT NULL,
  `size_id` VARCHAR(64) NOT NULL,
  `selling_price` DECIMAL(12,2) NOT NULL,
  `compare_at_price` DECIMAL(12,2) DEFAULT NULL,
  `cost_price` DECIMAL(12,2) DEFAULT NULL,
  `weight_grams` INT DEFAULT 300,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_variant_sku` (`sku`),
  KEY `fk_variant_product` (`product_id`),
  KEY `fk_variant_color` (`color_id`),
  KEY `fk_variant_size` (`size_id`),
  CONSTRAINT `fk_variant_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_variant_color` FOREIGN KEY (`color_id`) REFERENCES `colors` (`id`),
  CONSTRAINT `fk_variant_size` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. INVENTORY ITEMS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `inventory_items`;
CREATE TABLE `inventory_items` (
  `id` VARCHAR(64) NOT NULL,
  `variant_id` VARCHAR(64) NOT NULL,
  `warehouse_id` VARCHAR(64) NOT NULL,
  `on_hand` INT NOT NULL DEFAULT 0,
  `reserved` INT NOT NULL DEFAULT 0,
  `damaged` INT NOT NULL DEFAULT 0,
  `reorder_level` INT NOT NULL DEFAULT 10,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_variant_warehouse` (`variant_id`, `warehouse_id`),
  KEY `fk_inventory_warehouse` (`warehouse_id`),
  CONSTRAINT `fk_inventory_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_inventory_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. PROMO COUPONS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `coupons`;
CREATE TABLE `coupons` (
  `code` VARCHAR(50) NOT NULL,
  `type` ENUM('PERCENTAGE', 'FIXED') NOT NULL DEFAULT 'PERCENTAGE',
  `value` DECIMAL(12,2) NOT NULL,
  `min_spend` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `max_discount` DECIMAL(12,2) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `description` TEXT NULL,
  `show_as_popup` TINYINT(1) DEFAULT 0,
  `popup_title` VARCHAR(255) DEFAULT NULL,
  `popup_subtitle` TEXT DEFAULT NULL,
  `popup_badge` VARCHAR(100) DEFAULT NULL,
  `popup_bg_theme` VARCHAR(50) DEFAULT 'gold',
  `expires_at` DATETIME DEFAULT NULL,
  `active_days_json` JSON NULL COMMENT 'Array of active days e.g. ["Mon","Fri","Sat"]',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. CUSTOMER ORDERS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` VARCHAR(64) NOT NULL,
  `order_number` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `status` ENUM('PENDING_PAYMENT', 'PAID', 'CONFIRMED', 'PICKING', 'PACKED', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED', 'REFUNDED') DEFAULT 'PENDING_PAYMENT',
  `subtotal` DECIMAL(12,2) NOT NULL,
  `discount_total` DECIMAL(12,2) DEFAULT 0.00,
  `shipping_total` DECIMAL(12,2) DEFAULT 0.00,
  `grand_total` DECIMAL(12,2) NOT NULL,
  `payment_method` VARCHAR(100) NOT NULL,
  `payment_status` ENUM('UNPAID', 'PAID', 'REFUNDED') DEFAULT 'UNPAID',
  `bank_slip_url` TEXT NULL,
  `address_json` JSON NOT NULL,
  `status_history_json` JSON NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_number` (`order_number`),
  KEY `idx_order_email` (`email`),
  KEY `idx_order_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 10. ORDER ITEMS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` VARCHAR(64) NOT NULL,
  `order_id` VARCHAR(64) NOT NULL,
  `product_id` VARCHAR(64) NOT NULL,
  `variant_id` VARCHAR(64) NOT NULL,
  `sku` VARCHAR(100) NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `variant_name` VARCHAR(100) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(12,2) NOT NULL,
  `discount` DECIMAL(12,2) DEFAULT 0.00,
  `line_total` DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_order_item_order` (`order_id`),
  CONSTRAINT `fk_order_item_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 11. STOCK LEDGER MOVEMENTS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `stock_movements`;
CREATE TABLE `stock_movements` (
  `id` VARCHAR(64) NOT NULL,
  `variant_id` VARCHAR(64) NOT NULL,
  `warehouse_id` VARCHAR(64) NOT NULL,
  `movement_type` ENUM('OPENING', 'SALE', 'SALE_CANCEL', 'CUSTOMER_RETURN', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT') NOT NULL,
  `quantity_change` INT NOT NULL,
  `note` TEXT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_movement_variant` (`variant_id`),
  KEY `idx_movement_warehouse` (`warehouse_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 12. BODY SIZE MEASUREMENT RULES TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `size_measurement_rules`;
CREATE TABLE `size_measurement_rules` (
  `id` VARCHAR(64) NOT NULL,
  `size_label` VARCHAR(100) NOT NULL,
  `size_code` VARCHAR(50) NOT NULL,
  `bust_min_inches` DECIMAL(5,2) DEFAULT 0.00,
  `bust_max_inches` DECIMAL(5,2) DEFAULT 0.00,
  `waist_min_inches` DECIMAL(5,2) DEFAULT 0.00,
  `waist_max_inches` DECIMAL(5,2) DEFAULT 0.00,
  `hips_min_inches` DECIMAL(5,2) DEFAULT 0.00,
  `hips_max_inches` DECIMAL(5,2) DEFAULT 0.00,
  `shoulder_inches` DECIMAL(5,2) DEFAULT 0.00,
  `length_inches` DECIMAL(5,2) DEFAULT 0.00,
  `notes` TEXT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
