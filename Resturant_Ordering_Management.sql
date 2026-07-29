-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jul 29, 2026 at 08:04 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `Resturant_Ordering_Management`
--

-- --------------------------------------------------------

--
-- Table structure for table `abandoned_carts`
--

CREATE TABLE `abandoned_carts` (
  `id` varchar(36) NOT NULL,
  `customer_id` varchar(36) DEFAULT NULL,
  `customer_name` varchar(120) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`items`)),
  `value` decimal(12,2) NOT NULL DEFAULT 0.00,
  `abandoned_at` datetime NOT NULL DEFAULT current_timestamp(),
  `recovered` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `abandoned_carts`
--

INSERT INTO `abandoned_carts` (`id`, `customer_id`, `customer_name`, `email`, `items`, `value`, `abandoned_at`, `recovered`, `created_at`, `updated_at`) VALUES
('cart_1', NULL, 'David Brown', 'david@email.com', '[{\"productId\":\"prod_1\",\"name\":\"Margherita Pizza\",\"qty\":1,\"price\":14.99}]', 499.00, '2026-07-15 23:32:27', 0, '2026-07-16 01:32:28', '2026-07-18 18:42:46'),
('cart_2', NULL, 'Henry Wilson', 'henry@email.com', '[{\"productId\":\"prod_4\",\"name\":\"Grilled Salmon\",\"qty\":1,\"price\":24.99},{\"productId\":\"prod_8\",\"name\":\"Fresh Lemonade\",\"qty\":1,\"price\":4.99}]', 2298.00, '2026-07-15 20:32:27', 0, '2026-07-16 01:32:28', '2026-07-18 18:42:46');

-- --------------------------------------------------------

--
-- Table structure for table `addons`
--

CREATE TABLE `addons` (
  `id` varchar(36) NOT NULL,
  `name` varchar(120) NOT NULL,
  `price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `addons`
--

INSERT INTO `addons` (`id`, `name`, `price`, `status`, `created_at`, `updated_at`) VALUES
('addon_1', 'Extra Cheese', 150.00, 'active', '2026-07-18 19:00:39', '2026-07-18 19:00:39'),
('addon_2', 'Double Meat', 250.00, 'active', '2026-07-18 19:00:39', '2026-07-18 19:00:39'),
('addon_3', 'Add Fries', 200.00, 'active', '2026-07-18 19:00:39', '2026-07-18 19:00:39'),
('addon_4', 'Extra Sauce', 50.00, 'active', '2026-07-18 19:00:39', '2026-07-18 19:00:39'),
('addon_5', 'Soft Drink', 120.00, 'active', '2026-07-18 19:00:39', '2026-07-18 19:00:39');

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
  `id` varchar(36) NOT NULL,
  `name` varchar(120) NOT NULL,
  `logo` varchar(32) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `brands`
--

INSERT INTO `brands` (`id`, `name`, `logo`, `created_at`, `updated_at`) VALUES
('brand_1', 'House Signature', '🍽️', '2026-07-18 19:00:39', '2026-07-18 19:00:39'),
('brand_2', 'Chef Specials', '👨‍🍳', '2026-07-18 19:00:39', '2026-07-18 19:00:39'),
('brand_3', 'Italian Classics', '🇮🇹', '2026-07-18 19:00:39', '2026-07-18 19:00:39'),
('brand_4', 'Farm Fresh', '🌿', '2026-07-18 19:00:39', '2026-07-18 19:00:39'),
('brand_5', 'Weekend Brunch', '🥞', '2026-07-18 19:00:39', '2026-07-18 19:00:39');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` varchar(36) NOT NULL,
  `name` varchar(120) NOT NULL,
  `slug` varchar(160) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `image` varchar(500) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_visible` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `created_at`, `updated_at`, `image`, `sort_order`, `is_visible`) VALUES
('cat_beverages', 'Beverages', 'beverages', '2026-07-18 19:00:39', '2026-07-18 19:00:39', '', 6, 1),
('cat_breakfast', 'Breakfast', 'breakfast', '2026-07-18 19:00:39', '2026-07-18 19:00:39', '', 1, 1),
('cat_burgers', 'Burgers', 'burgers', '2026-07-18 19:00:39', '2026-07-18 19:00:39', '', 2, 1),
('cat_deals', 'Deals', 'deals', '2026-07-18 19:00:39', '2026-07-18 19:00:39', '', 3, 1),
('cat_desserts', 'Desserts', 'desserts', '2026-07-18 19:00:39', '2026-07-18 19:00:39', '', 7, 1),
('cat_featured', 'Featured', 'featured', '2026-07-18 19:00:39', '2026-07-18 19:00:39', '', 0, 1),
('cat_pasta', 'Pasta', 'pasta', '2026-07-18 19:00:39', '2026-07-18 19:00:39', '', 5, 1),
('cat_pizza', 'Pizza', 'pizza', '2026-07-18 19:00:39', '2026-07-18 19:00:39', '', 4, 1);

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` varchar(36) NOT NULL,
  `code` varchar(60) NOT NULL,
  `type` enum('percentage','fixed') NOT NULL DEFAULT 'percentage',
  `value` decimal(12,2) NOT NULL DEFAULT 0.00,
  `min_order` decimal(12,2) NOT NULL DEFAULT 0.00,
  `max_uses` int(11) NOT NULL DEFAULT 0,
  `used_count` int(11) NOT NULL DEFAULT 0,
  `expiry` datetime DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`id`, `code`, `type`, `value`, `min_order`, `max_uses`, `used_count`, `expiry`, `active`, `created_at`, `updated_at`) VALUES
('coup_1', 'WELCOME10', 'percentage', 10.00, 20.00, 100, 45, '2026-08-15 01:32:27', 1, '2026-07-16 01:32:27', '2026-07-16 01:32:27'),
('coup_2', 'FLAT5', 'fixed', 5.00, 15.00, 200, 89, '2026-07-31 01:32:27', 1, '2026-07-16 01:32:28', '2026-07-16 01:32:28');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` varchar(36) NOT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `total_orders` int(11) NOT NULL DEFAULT 0,
  `spent` decimal(12,2) NOT NULL DEFAULT 0.00,
  `joined_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `name`, `email`, `phone`, `total_orders`, `spent`, `joined_at`, `created_at`, `updated_at`) VALUES
('20cbfd49-91d9-4bc3-bd5a-913147b20014', 'Mr. abc', 'a@gmail.com', '09993', 1, 1497.00, '2026-07-09 22:55:47', '2026-07-09 22:55:47', '2026-07-10 22:40:43'),
('28fd60f5-3b76-4335-94f4-01fce04223ca', 'Mr. Muhammad Hunain', 'm.hunainofficial@outlook.com', '03435980052', 1, 0.00, '2026-07-25 18:52:50', '2026-07-25 18:52:50', '2026-07-25 18:52:50'),
('6e10c474-b8e8-449a-b15a-3cd33bde8671', 'Mr. hunain', 'h@test.com', '123', 1, 0.00, '2026-07-23 23:28:45', '2026-07-23 23:28:45', '2026-07-23 23:28:45'),
('8431b1ca-3616-45ca-a185-f3fb02f40cb8', 'Mr. Muhammad Hunain', 'redwolfgaming@test.com', '03435980052', 2, 416.99, '2026-07-08 22:54:36', '2026-07-08 22:54:36', '2026-07-10 22:42:04'),
('91107925-198c-4741-bb24-2f42265b07b6', 'Website User', 'web@test.com', NULL, 1, 0.00, '2026-07-03 23:28:14', '2026-07-03 23:28:14', '2026-07-03 23:28:14'),
('af82022c-21a2-4b3a-910a-730d3c5ba2fa', 'Mr. Test User', 'test-website-order@example.com', '+923001234567', 1, 0.00, '2026-07-08 22:43:48', '2026-07-08 22:43:48', '2026-07-08 22:43:51'),
('cust_1', 'Alice Johnson', 'alice@email.com', '+92 300-0101', 1, 0.00, '2024-03-15 15:00:00', '2026-07-03 23:27:19', '2026-07-03 23:27:19'),
('cust_10', 'Jack Taylor', 'jack@email.com', '+92 300-0110', 1, 0.00, '2024-04-05 13:00:00', '2026-07-03 23:27:19', '2026-07-03 23:27:19'),
('cust_2', 'Bob Smith', 'bob@email.com', '+92 300-0102', 1, 0.00, '2024-05-20 19:30:00', '2026-07-03 23:27:19', '2026-07-03 23:27:19'),
('cust_3', 'Carol Williams', 'carol@email.com', '+92 300-0103', 1, 3498.00, '2024-01-10 14:00:00', '2026-07-03 23:27:19', '2026-07-03 23:37:45'),
('cust_4', 'David Brown', 'david@email.com', '+92 300-0104', 2, 0.00, '2025-01-05 21:00:00', '2026-07-03 23:27:19', '2026-07-09 22:57:10'),
('cust_5', 'Emma Davis', 'emma@email.com', '+92 300-0105', 1, 0.00, '2023-11-22 16:00:00', '2026-07-03 23:27:19', '2026-07-03 23:27:19'),
('cust_6', 'Frank Miller', 'frank@email.com', '+92 300-0106', 1, 0.00, '2024-08-14 18:00:00', '2026-07-03 23:27:19', '2026-07-03 23:27:19'),
('cust_7', 'Grace Lee', 'grace@email.com', '+92 300-0107', 1, 0.00, '2024-02-28 15:30:00', '2026-07-03 23:27:19', '2026-07-03 23:27:19'),
('cust_8', 'Henry Wilson', 'henry@email.com', '+92 300-0108', 1, 3498.00, '2025-02-10 20:00:00', '2026-07-03 23:27:19', '2026-07-03 23:27:19'),
('cust_9', 'Ivy Martinez', 'ivy@email.com', '+92 300-0109', 1, 6598.00, '2024-06-18 17:00:00', '2026-07-03 23:27:19', '2026-07-03 23:27:19'),
('f1514238-eda7-4d15-9d3b-ab2f363c1e79', 'Mr. uniuq', 'n@gmail.com', '8287374', 1, 0.00, '2026-07-10 22:57:05', '2026-07-10 22:57:05', '2026-07-10 22:57:05');

-- --------------------------------------------------------

--
-- Table structure for table `deals`
--

CREATE TABLE `deals` (
  `id` varchar(36) NOT NULL,
  `title` varchar(180) NOT NULL,
  `description` text DEFAULT NULL,
  `badge_text` varchar(80) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `original_price` decimal(12,2) DEFAULT NULL,
  `coupon_id` varchar(36) DEFAULT NULL,
  `discount_id` varchar(36) DEFAULT NULL,
  `offer_id` varchar(36) DEFAULT NULL,
  `start_at` datetime DEFAULT NULL,
  `end_at` datetime DEFAULT NULL,
  `days_of_week` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`days_of_week`)),
  `daily_start_time` time DEFAULT NULL,
  `daily_end_time` time DEFAULT NULL,
  `show_countdown` tinyint(1) NOT NULL DEFAULT 1,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `deals`
--

INSERT INTO `deals` (`id`, `title`, `description`, `badge_text`, `image`, `price`, `original_price`, `coupon_id`, `discount_id`, `offer_id`, `start_at`, `end_at`, `days_of_week`, `daily_start_time`, `daily_end_time`, `show_countdown`, `active`, `sort_order`, `created_at`, `updated_at`) VALUES
('deal_1784827924041_cabc8e3b', 'aa', 'aaa', '23', '', 649.00, 550.00, 'coup_2', 'disc_1', NULL, '2026-07-23 02:31:00', '2026-08-08 02:31:00', NULL, '22:34:00', '15:36:00', 1, 1, 0, '2026-07-23 22:32:04', '2026-07-29 22:38:36'),
('deal_1784831167000_60af9430', 'hhh', 'tyy', '', '', 100.00, 299.00, 'coup_1', 'disc_2', 'offer_1', '2026-07-23 13:23:00', '2026-07-30 14:01:00', NULL, '23:28:00', '23:45:00', 1, 1, 0, '2026-07-23 23:26:07', '2026-07-23 23:27:32');

-- --------------------------------------------------------

--
-- Table structure for table `deal_items`
--

CREATE TABLE `deal_items` (
  `id` varchar(36) NOT NULL,
  `deal_id` varchar(36) NOT NULL,
  `item_type` enum('product','drink','addon') NOT NULL DEFAULT 'product',
  `product_id` varchar(36) DEFAULT NULL,
  `drink_id` varchar(36) DEFAULT NULL,
  `addon_id` varchar(36) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `qty` int(11) NOT NULL DEFAULT 1,
  `unit_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `deal_items`
--

INSERT INTO `deal_items` (`id`, `deal_id`, `item_type`, `product_id`, `drink_id`, `addon_id`, `name`, `qty`, `unit_price`, `sort_order`, `created_at`) VALUES
('di_1784831252877_ce00dc53', 'deal_1784831167000_60af9430', 'product', 'prod_10', NULL, NULL, 'Fresh Lemonade', 1, 299.00, 0, '2026-07-23 23:27:32'),
('di_1785346716212_a313d3ce', 'deal_1784827924041_cabc8e3b', 'product', 'prod_7', NULL, NULL, 'Beef Smash Burger', 1, 649.00, 0, '2026-07-29 22:38:36'),
('di_1785346716213_760e7fb1', 'deal_1784827924041_cabc8e3b', 'drink', NULL, 'drink_1784972632452_d40c90bc', NULL, '7up', 1, 100.00, 1, '2026-07-29 22:38:36');

-- --------------------------------------------------------

--
-- Table structure for table `discounts`
--

CREATE TABLE `discounts` (
  `id` varchar(36) NOT NULL,
  `name` varchar(120) NOT NULL,
  `type` enum('percentage','fixed') NOT NULL DEFAULT 'percentage',
  `value` decimal(12,2) NOT NULL DEFAULT 0.00,
  `category` varchar(120) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `discounts`
--

INSERT INTO `discounts` (`id`, `name`, `type`, `value`, `category`, `active`, `start_date`, `end_date`, `created_at`, `updated_at`) VALUES
('disc_1', 'Happy Hour', 'percentage', 15.00, 'Beverages', 1, '2026-06-16 01:32:27', '2026-09-14 01:32:27', '2026-07-16 01:32:28', '2026-07-16 01:32:28'),
('disc_2', 'Weekend Special', 'percentage', 20.00, 'All', 1, '2026-07-09 01:32:27', '2026-08-15 01:32:27', '2026-07-16 01:32:28', '2026-07-16 01:32:28');

-- --------------------------------------------------------

--
-- Table structure for table `drinks`
--

CREATE TABLE `drinks` (
  `id` varchar(36) NOT NULL,
  `name` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `stock` int(11) NOT NULL DEFAULT -1,
  `image` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive','out_of_stock') NOT NULL DEFAULT 'active',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `drinks`
--

INSERT INTO `drinks` (`id`, `name`, `description`, `price`, `stock`, `image`, `status`, `sort_order`, `created_at`, `updated_at`) VALUES
('drink_1784972632452_d40c90bc', '7up', 'Mint and Soda', 100.00, 100, '', 'active', 0, '2026-07-25 14:43:52', '2026-07-25 14:43:52');

-- --------------------------------------------------------

--
-- Table structure for table `offers`
--

CREATE TABLE `offers` (
  `id` varchar(36) NOT NULL,
  `title` varchar(180) NOT NULL,
  `type` varchar(60) NOT NULL DEFAULT 'bundle',
  `conditions` text DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `offers`
--

INSERT INTO `offers` (`id`, `title`, `type`, `conditions`, `active`, `start_date`, `end_date`, `created_at`, `updated_at`) VALUES
('offer_1', 'Buy 1 Get 1 Pizza', 'bogo', 'Buy any large pizza, get one free', 1, '2026-07-09 01:32:27', '2026-08-06 01:32:27', '2026-07-16 01:32:28', '2026-07-16 01:32:28'),
('offer_2', 'Family Feast Bundle', 'bundle', '2 pizzas + 2 sides + 4 drinks for Rs 4,999', 1, '2026-07-02 01:32:27', '2026-08-30 01:32:27', '2026-07-16 01:32:28', '2026-07-16 01:32:28');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` varchar(36) NOT NULL,
  `customer_id` varchar(36) DEFAULT NULL,
  `customer_name` varchar(120) NOT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `customer_phone` varchar(30) DEFAULT NULL,
  `status` enum('pending','confirmed','preparing','delivered','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `source` varchar(50) NOT NULL DEFAULT 'admin',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `customer_id`, `customer_name`, `customer_email`, `customer_phone`, `status`, `total`, `notes`, `rejection_reason`, `source`, `created_at`, `updated_at`) VALUES
('ord_1', 'cust_1', 'Alice Johnson', 'alice@email.com', '+92 300-0101', 'confirmed', 2998.00, NULL, NULL, 'seed', '2026-07-03 22:27:19', '2026-07-29 22:38:09'),
('ord_10', 'cust_6', 'Frank Miller', 'frank@email.com', '+92 300-0106', 'cancelled', 2197.00, NULL, NULL, 'seed', '2026-07-01 23:27:19', '2026-07-03 23:27:19'),
('ord_1783103294733_8ce56704', '91107925-198c-4741-bb24-2f42265b07b6', 'Website User', 'web@test.com', NULL, 'confirmed', 1798.00, NULL, NULL, 'website', '2026-07-03 23:28:14', '2026-07-29 22:38:05'),
('ord_1783532629683_a9de48b1', 'af82022c-21a2-4b3a-910a-730d3c5ba2fa', 'Mr. Test User', 'test-website-order@example.com', '+923001234567', 'rejected', 900.00, 'Delivery type: delivery\nAddress: 123 Test St\nPayment: cash', 'user not confirming', 'website', '2026-07-08 22:43:49', '2026-07-15 15:54:54'),
('ord_1783533276998_1c63d2c0', '8431b1ca-3616-45ca-a185-f3fb02f40cb8', 'Mr. Muhammad Hunain', 'redwolfgaming@test.com', '03435980052', 'preparing', 499.00, 'Delivery type: delivery\nAddress: aa\nLandmark: vv\nPayment: cash\nAlternate phone: 09876543321\nInstructions: aaa', NULL, 'website', '2026-07-08 22:54:36', '2026-07-16 01:43:44'),
('ord_1783619747537_f23ccab7', '20cbfd49-91d9-4bc3-bd5a-913147b20014', 'Mr. abc', 'a@gmail.com', '09993', 'delivered', 1497.00, 'Delivery type: delivery\nAddress: ahha\nLandmark: nxbhdb\nPayment: cash\nAlternate phone: 111\nInstructions: dnbn \nZinger Burger addons: Extra Cheese, Double Meat', NULL, 'website', '2026-07-09 22:55:47', '2026-07-10 22:40:43'),
('ord_1783619830095_87584978', 'cust_4', 'David Brown', 'david@email.com', '+92 300-0104', 'rejected', 887.00, 'uui', NULL, 'admin', '2026-07-09 22:57:10', '2026-07-15 16:00:03'),
('ord_1783705306688_d95b1acb', '8431b1ca-3616-45ca-a185-f3fb02f40cb8', 'Mr. Muhammad Hunain', 'redwolfgaming@test.com', '03435980052', 'delivered', 416.99, 'ASAP\nPepperoni Pizza addons: Extra Cheese, Add Fries, Extra Sauce\nPepperoni Pizza note: ASAP', NULL, 'admin', '2026-07-10 22:41:46', '2026-07-10 22:42:04'),
('ord_1783706225772_3653058a', 'f1514238-eda7-4d15-9d3b-ab2f363c1e79', 'Mr. uniuq', 'n@gmail.com', '8287374', 'preparing', 499.00, 'Delivery type: delivery\nAddress: nsnckj\nLandmark: cscsd\nPayment: cash\nAlternate phone: 1uhuehu\nInstructions: dscd', NULL, 'website', '2026-07-10 22:57:05', '2026-07-16 01:38:29'),
('ord_1784831325653_8e5857ec', '6e10c474-b8e8-449a-b15a-3cd33bde8671', 'Mr. hunain', 'h@test.com', '123', 'preparing', 100.00, 'Delivery type: delivery\nAddress: jiji\nLandmark: njn\nPayment: cash\nAlternate phone: 123\nInstructions: a n\nhhh addons: 1× Fresh Lemonade\nhhh note: Includes: 1× Fresh Lemonade · Promo code: WELCOME10', NULL, 'website', '2026-07-23 23:28:45', '2026-07-23 23:32:39'),
('ord_1784987570554_515f4073', '28fd60f5-3b76-4335-94f4-01fce04223ca', 'Mr. Muhammad Hunain', 'm.hunainofficial@outlook.com', '03435980052', 'confirmed', 599.00, 'Delivery type: delivery\nAddress: Shan Residency Block K North Nazimabad Karachi\nLandmark: Farooq Azam Masjid\nPayment: cash\nAlternate phone: 03123598003', NULL, 'website', '2026-07-25 18:52:50', '2026-07-25 18:53:54'),
('ord_2', 'cust_2', 'Bob Smith', 'bob@email.com', '+92 300-0102', 'confirmed', 2197.00, NULL, NULL, 'seed', '2026-07-03 21:27:19', '2026-07-03 23:27:19'),
('ord_3', 'cust_3', 'Carol Williams', 'carol@email.com', '+92 300-0103', 'delivered', 3498.00, NULL, NULL, 'seed', '2026-07-03 20:27:19', '2026-07-03 23:37:45'),
('ord_4', 'cust_5', 'Emma Davis', 'emma@email.com', '+92 300-0105', 'rejected', 6598.00, NULL, NULL, 'seed', '2026-07-03 19:27:19', '2026-07-10 22:40:52'),
('ord_5', 'cust_7', 'Grace Lee', 'grace@email.com', '+92 300-0107', 'confirmed', 4797.00, NULL, NULL, 'seed', '2026-07-03 18:27:19', '2026-07-29 22:38:11'),
('ord_6', 'cust_10', 'Jack Taylor', 'jack@email.com', '+92 300-0110', 'rejected', 4797.00, NULL, NULL, 'seed', '2026-07-03 17:27:19', '2026-07-10 22:42:39'),
('ord_7', 'cust_8', 'Henry Wilson', 'henry@email.com', '+92 300-0108', 'delivered', 3498.00, NULL, NULL, 'seed', '2026-07-02 23:27:19', '2026-07-03 23:27:19'),
('ord_8', 'cust_9', 'Ivy Martinez', 'ivy@email.com', '+92 300-0109', 'delivered', 6598.00, NULL, NULL, 'seed', '2026-07-02 23:27:19', '2026-07-03 23:27:19'),
('ord_9', 'cust_4', 'David Brown', 'david@email.com', '+92 300-0104', 'rejected', 2998.00, NULL, NULL, 'seed', '2026-07-01 23:27:19', '2026-07-03 23:27:19');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` varchar(36) NOT NULL,
  `order_id` varchar(36) NOT NULL,
  `product_id` varchar(36) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `qty` int(11) NOT NULL DEFAULT 1,
  `price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `name`, `qty`, `price`, `created_at`) VALUES
('149e47f3-612e-4246-b0e2-f3ec43ef4861', 'ord_1783532629683_a9de48b1', '1', 'Singaporean Rice', 2, 450.00, '2026-07-08 22:43:50'),
('160648d5-3e04-4758-8e69-2d991c3e97fc', 'ord_10', 'prod_8', 'Fresh Lemonade', 2, 499.00, '2026-07-03 23:27:19'),
('1896b539-8025-4a6f-bda4-5454982d6b68', 'ord_1784831325653_8e5857ec', 'deal:deal_1784831167000_60af9430', 'hhh', 1, 100.00, '2026-07-23 23:28:45'),
('348ed5de-dbce-442e-a77f-c91f00268ef3', 'ord_1783103294733_8ce56704', NULL, 'Burger', 2, 899.00, '2026-07-03 23:28:14'),
('350e65bf-a893-4702-8faf-f9580737b734', 'ord_3', 'prod_4', 'Grilled Salmon', 1, 2499.00, '2026-07-03 23:27:19'),
('3fd76fe7-2284-4208-8e6e-541bd0730105', 'ord_1783706225772_3653058a', '1', 'Zinger Burger', 1, 499.00, '2026-07-10 22:57:05'),
('41134d26-d72c-4439-a4ed-27a2c53100d2', 'ord_1', 'prod_1', 'Margherita Pizza', 2, 1499.00, '2026-07-03 23:27:19'),
('54154cd1-b25f-4cdc-9189-a9464ac7e127', 'ord_2', 'prod_8', 'Fresh Lemonade', 2, 499.00, '2026-07-03 23:27:19'),
('558d8f87-afbc-465d-9b06-3f407176af38', 'ord_3', 'prod_3', 'Caesar Salad', 1, 999.00, '2026-07-03 23:27:19'),
('62c614ca-073f-4b8e-bc56-5fc58da33b52', 'ord_1783705306688_d95b1acb', 'prod_2', 'Pepperoni Pizza', 1, 416.99, '2026-07-10 22:41:46'),
('6c62f5ba-ba3b-4965-8dc8-1d38b7171516', 'ord_4', 'prod_10', 'Ribeye Steak', 2, 3299.00, '2026-07-03 23:27:19'),
('7af82911-7d17-4e16-8f7f-0d6efb405ce4', 'ord_10', 'prod_6', 'Chicken Wings', 1, 1199.00, '2026-07-03 23:27:19'),
('9562a691-a926-4bbb-b738-270a8a2e7121', 'ord_6', 'prod_5', 'Spaghetti Carbonara', 3, 1599.00, '2026-07-03 23:27:19'),
('9a2203b9-ee36-4465-8af2-839c7d6e36d5', 'ord_1783533276998_1c63d2c0', '1', 'Zinger Burger', 1, 499.00, '2026-07-08 22:54:37'),
('9d006b70-54e5-4ab2-bec6-d34d4ee8f90f', 'ord_7', 'prod_3', 'Caesar Salad', 1, 999.00, '2026-07-03 23:27:19'),
('b12b4c38-94ea-4df0-bfa0-432f3039d2ba', 'ord_1784987570554_515f4073', 'prod_5', 'Classic Eggs Benedict', 1, 599.00, '2026-07-25 18:52:50'),
('b9097ff4-828d-4253-88b2-208eaeb515d5', 'ord_1783619747537_f23ccab7', '1', 'Zinger Burger', 3, 499.00, '2026-07-09 22:55:47'),
('c46205c0-9cbd-4b8d-8d67-285c6f39fae7', 'ord_5', 'prod_5', 'Spaghetti Carbonara', 3, 1599.00, '2026-07-03 23:27:19'),
('c7c20822-318c-4e4f-9756-717d641d6518', 'ord_2', 'prod_6', 'Chicken Wings', 1, 1199.00, '2026-07-03 23:27:19'),
('c8d40b1c-55bf-43a0-b554-c1ecb26caef7', 'ord_7', 'prod_4', 'Grilled Salmon', 1, 2499.00, '2026-07-03 23:27:19'),
('cf85dd4e-4554-45a8-ba81-1f9d7248825e', 'ord_9', 'prod_1', 'Margherita Pizza', 2, 1499.00, '2026-07-03 23:27:19'),
('d3a91728-efbc-4eb6-a5d5-17cfb1dc0c0d', 'ord_1783619830095_87584978', NULL, 'vvggg', 1, 887.00, '2026-07-09 22:57:10'),
('ed96a599-1a9e-4142-80d5-302d40acaca0', 'ord_8', 'prod_10', 'Ribeye Steak', 2, 3299.00, '2026-07-03 23:27:19');

-- --------------------------------------------------------

--
-- Table structure for table `payment_gateways`
--

CREATE TABLE `payment_gateways` (
  `id` varchar(36) NOT NULL,
  `name` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(32) DEFAULT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_gateways`
--

INSERT INTO `payment_gateways` (`id`, `name`, `description`, `icon`, `enabled`, `created_at`, `updated_at`) VALUES
('pay_1', 'Stripe', 'Credit/debit card payments', '💳', 1, '2026-07-16 01:32:28', '2026-07-18 18:42:46'),
('pay_2', 'PayPal', 'PayPal checkout', '🅿️', 1, '2026-07-16 01:32:28', '2026-07-18 18:42:46'),
('pay_3', 'Cash on Delivery', 'Pay when order arrives', '💵', 1, '2026-07-16 01:32:28', '2026-07-16 01:32:28');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category_id` varchar(36) DEFAULT NULL,
  `brand_id` varchar(36) DEFAULT NULL,
  `price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `stock` int(11) NOT NULL DEFAULT 0,
  `status` enum('active','inactive','out_of_stock') NOT NULL DEFAULT 'active',
  `image` varchar(500) DEFAULT NULL,
  `sales` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `description` text DEFAULT NULL,
  `discounted_price` decimal(12,2) DEFAULT NULL,
  `tag` varchar(60) DEFAULT NULL,
  `rating` decimal(2,1) NOT NULL DEFAULT 4.5,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `category_id`, `brand_id`, `price`, `stock`, `status`, `image`, `sales`, `created_at`, `updated_at`, `description`, `discounted_price`, `tag`, `rating`, `is_featured`, `sort_order`) VALUES
('prod_1', 'Zinger Burger', 'cat_burgers', 'brand_1', 561.00, -1, 'active', '/uploads/ai_1785347247036_s1uwaz.png', 145, '2026-07-18 19:00:39', '2026-07-29 22:47:30', 'Double patty · Spicy aioli', 499.00, 'Bestseller', 4.9, 1, 1),
('prod_10', 'Fresh Lemonade', 'cat_beverages', 'brand_4', 299.00, -1, 'active', '/uploads/ai_1785347143737_ur85ju.png', 203, '2026-07-18 19:00:39', '2026-07-29 22:45:54', 'Freshly squeezed lemon', NULL, '', 4.5, 0, 1),
('prod_11', 'Tiramisu', 'cat_desserts', 'brand_3', 499.00, -1, 'active', '', 76, '2026-07-18 19:00:39', '2026-07-18 21:32:58', 'Classic Italian dessert', NULL, '', 4.8, 0, 1),
('prod_3', 'Fettuccine Alfredo Pasta', 'cat_pasta', 'brand_3', 1100.00, -1, 'active', '', 112, '2026-07-18 19:00:39', '2026-07-18 21:32:58', 'Creamy alfredo · Parmesan', 899.00, '', 4.7, 1, 3),
('prod_4', 'Grilled Chicken Sandwich', 'cat_burgers', 'brand_1', 875.00, -1, 'active', '', 87, '2026-07-18 19:00:39', '2026-07-18 21:32:58', 'Triple stack · Lime crema', 799.00, 'New', 4.8, 1, 4),
('prod_5', 'Classic Eggs Benedict', 'cat_breakfast', 'brand_5', 700.00, -1, 'active', '/uploads/ai_1784972931519_0m916p.png', 54, '2026-07-18 19:00:39', '2026-07-25 14:48:57', 'Poached eggs · Hollandaise', 599.00, 'Morning', 4.6, 1, 1),
('prod_6', 'Fluffy Pancake Stack', 'cat_breakfast', 'brand_5', 550.00, -1, 'active', '', 61, '2026-07-18 19:00:39', '2026-07-18 21:32:58', 'Maple syrup · Fresh berries', NULL, '', 4.7, 0, 2),
('prod_7', 'Beef Smash Burger', 'cat_burgers', 'brand_1', 720.00, -1, 'active', '', 130, '2026-07-18 19:00:39', '2026-07-18 21:32:58', 'Double smash · Cheddar', 649.00, 'Hot', 4.9, 0, 2),
('prod_9', 'Margherita Pizza', 'cat_pizza', 'brand_3', 1499.00, -1, 'active', '', 145, '2026-07-18 19:00:39', '2026-07-18 21:32:58', 'Fresh mozzarella · Basil', 1299.00, '', 4.7, 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `product_addons`
--

CREATE TABLE `product_addons` (
  `product_id` varchar(36) NOT NULL,
  `addon_id` varchar(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_addons`
--

INSERT INTO `product_addons` (`product_id`, `addon_id`) VALUES
('prod_1', 'addon_1'),
('prod_1', 'addon_2'),
('prod_1', 'addon_3'),
('prod_1', 'addon_4'),
('prod_4', 'addon_1'),
('prod_4', 'addon_3'),
('prod_5', 'addon_1'),
('prod_7', 'addon_1'),
('prod_7', 'addon_2'),
('prod_7', 'addon_5'),
('prod_9', 'addon_1');

-- --------------------------------------------------------

--
-- Table structure for table `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` varchar(36) NOT NULL,
  `product_id` varchar(36) DEFAULT NULL,
  `customer_name` varchar(120) NOT NULL,
  `rating` tinyint(4) NOT NULL DEFAULT 5,
  `comment` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `product_id`, `customer_name`, `rating`, `comment`, `status`, `created_at`) VALUES
('rev_1', 'prod_1', 'Alice Johnson', 5, 'Best burger in town!', 'approved', '2026-07-16 19:00:39'),
('rev_2', 'prod_7', 'Bob Smith', 4, 'Smash burger hits hard.', 'approved', '2026-07-15 19:00:39'),
('rev_4', 'prod_11', 'David Brown', 3, 'Good but a bit sweet.', 'pending', '2026-07-17 19:00:39');

-- --------------------------------------------------------

--
-- Table structure for table `shipping_methods`
--

CREATE TABLE `shipping_methods` (
  `id` varchar(36) NOT NULL,
  `name` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `estimated_time` varchar(60) DEFAULT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shipping_methods`
--

INSERT INTO `shipping_methods` (`id`, `name`, `description`, `price`, `estimated_time`, `enabled`, `created_at`, `updated_at`) VALUES
('ship_1', 'Standard Delivery', '30-45 min delivery', 4.99, '30-45 min', 1, '2026-07-16 01:32:28', '2026-07-16 01:32:28'),
('ship_2', 'Express Delivery', '15-20 min delivery', 8.99, '15-20 min', 1, '2026-07-16 01:32:28', '2026-07-16 01:32:28'),
('ship_3', 'Pickup', 'Customer picks up at restaurant', 0.00, '15 min', 1, '2026-07-16 01:32:28', '2026-07-16 01:32:28');

-- --------------------------------------------------------

--
-- Table structure for table `tracking_settings`
--

CREATE TABLE `tracking_settings` (
  `id` varchar(36) NOT NULL,
  `restaurant_name` varchar(120) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `support_email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `help_text` text DEFAULT NULL,
  `poll_interval_seconds` int(11) NOT NULL DEFAULT 20,
  `show_rejection_reason` tinyint(1) NOT NULL DEFAULT 1,
  `status_messages` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`status_messages`)),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tracking_settings`
--

INSERT INTO `tracking_settings` (`id`, `restaurant_name`, `phone`, `support_email`, `address`, `logo_url`, `help_text`, `poll_interval_seconds`, `show_rejection_reason`, `status_messages`, `updated_at`) VALUES
('tracking_default', 'Studio 7teas', NULL, NULL, NULL, NULL, NULL, 20, 1, '{\"pending\":{\"label\":\"Order Received\",\"message\":\"We\'ve received your order and will confirm it shortly.\",\"eta\":\"5-10 min\"},\"confirmed\":{\"label\":\"Confirmed\",\"message\":\"soory\",\"eta\":\"20-40 min\"},\"preparing\":{\"label\":\"Preparing\",\"message\":\"Our kitchen is preparing your order.\",\"eta\":\"15-20 min\"},\"delivered\":{\"label\":\"Delivered\",\"message\":\"Your order has been delivered. Enjoy!\",\"eta\":null},\"rejected\":{\"label\":\"Rejected\",\"message\":\"Unfortunately your order could not be fulfilled.\",\"eta\":null},\"cancelled\":{\"label\":\"Cancelled\",\"message\":\"This order has been cancelled.\",\"eta\":null}}', '2026-07-15 22:04:29');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','manager','staff') NOT NULL DEFAULT 'staff',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `status`, `last_login`, `created_at`, `updated_at`) VALUES
('106fa1e3-b473-45b1-a43b-a6f7580a4ee2', 'Mike Staff', 'mike@restaurant.com', '$2b$10$cysGfrnrRSDVzbxw8m4umuYMDIMmVOWy1DcaXvXYJJlKW.GJjPywG', 'staff', 'active', '2026-07-29 22:42:59', '2026-07-03 23:15:19', '2026-07-29 22:42:59'),
('1aaad9e4-4288-4f2f-9175-b99f7f9e780e', 'Tom Manager', 'tom@restaurant.com', '$2b$10$JTu6iLQBon0/2Ouw9.B7r.NZkxI6f5sakf4U.ZDZZVd3zs6yA1E4K', 'manager', 'inactive', NULL, '2026-07-03 23:15:19', '2026-07-03 23:15:19'),
('82fcd99b-5c0d-4b2a-9258-f1000f7fb412', 'Lisa Staff', 'lisa@restaurant.com', '$2b$10$OH6ofFS9HxUhakY2sWHgA.XrwRMZuLLYc6Q/CncYWQmexP0lMVR8S', 'staff', 'active', NULL, '2026-07-03 23:15:19', '2026-07-03 23:15:19'),
('85ddc4f7-c0a5-4edb-b3af-c5d58684a10b', 'Admin User', 'admin@restaurant.com', '$2b$10$3lNNG2PNzVbOZHcJeKoKwujhPcDbL/jE2p4IcYI1wrmfhpDRk7g3m', 'admin', 'active', '2026-07-29 22:37:40', '2026-07-03 23:15:19', '2026-07-29 22:37:40'),
('8e4eb2de-5382-4068-8575-fe51d3cb1b39', 'Admin Test', 'admin@test.com', '$2b$10$OftzbnlRqL0VAf8FRdJaYeJp5Qv1QedG012IXBamXI9bAYnP299E2', 'admin', 'active', '2026-07-03 23:35:45', '2026-07-03 23:18:04', '2026-07-03 23:35:45'),
('f2a334c2-2d6c-438d-920c-3d9d79baf8af', 'Sarah Manager', 'sarah@restaurant.com', '$2b$10$daFZkMDgO8G/eKp3/NaWjO51D1vMDJq3yObMAZf1Z927C3Bwfsrd.', 'manager', 'active', '2026-07-29 22:42:50', '2026-07-03 23:15:19', '2026-07-29 22:42:50');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `abandoned_carts`
--
ALTER TABLE `abandoned_carts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_carts_recovered` (`recovered`);

--
-- Indexes for table `addons`
--
ALTER TABLE `addons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_addons_status` (`status`),
  ADD KEY `idx_addons_name` (`name`);

--
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_brands_name` (`name`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_categories_name` (`name`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_customers_email` (`email`),
  ADD KEY `idx_customers_name` (`name`);

--
-- Indexes for table `deals`
--
ALTER TABLE `deals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_deals_coupon` (`coupon_id`),
  ADD KEY `fk_deals_discount` (`discount_id`),
  ADD KEY `fk_deals_offer` (`offer_id`),
  ADD KEY `idx_deals_active_schedule` (`active`,`start_at`,`end_at`),
  ADD KEY `idx_deals_sort` (`sort_order`);

--
-- Indexes for table `deal_items`
--
ALTER TABLE `deal_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_deal_items_product` (`product_id`),
  ADD KEY `idx_deal_items_deal` (`deal_id`),
  ADD KEY `fk_deal_items_drink` (`drink_id`),
  ADD KEY `fk_deal_items_addon` (`addon_id`);

--
-- Indexes for table `discounts`
--
ALTER TABLE `discounts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `drinks`
--
ALTER TABLE `drinks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_drinks_status` (`status`),
  ADD KEY `idx_drinks_sort` (`sort_order`),
  ADD KEY `idx_drinks_name` (`name`);

--
-- Indexes for table `offers`
--
ALTER TABLE `offers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_orders_status` (`status`),
  ADD KEY `idx_orders_customer` (`customer_id`),
  ADD KEY `idx_orders_created` (`created_at`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_items_order` (`order_id`);

--
-- Indexes for table `payment_gateways`
--
ALTER TABLE `payment_gateways`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_products_category` (`category_id`),
  ADD KEY `fk_products_brand` (`brand_id`),
  ADD KEY `idx_products_name` (`name`),
  ADD KEY `idx_products_status` (`status`);

--
-- Indexes for table `product_addons`
--
ALTER TABLE `product_addons`
  ADD PRIMARY KEY (`product_id`,`addon_id`),
  ADD KEY `fk_product_addons_addon` (`addon_id`);

--
-- Indexes for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_refresh_tokens_user` (`user_id`),
  ADD KEY `idx_refresh_tokens_expires` (`expires_at`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_reviews_product` (`product_id`),
  ADD KEY `idx_reviews_status` (`status`);

--
-- Indexes for table `shipping_methods`
--
ALTER TABLE `shipping_methods`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tracking_settings`
--
ALTER TABLE `tracking_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_users_status` (`status`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `deals`
--
ALTER TABLE `deals`
  ADD CONSTRAINT `fk_deals_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_deals_discount` FOREIGN KEY (`discount_id`) REFERENCES `discounts` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_deals_offer` FOREIGN KEY (`offer_id`) REFERENCES `offers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `deal_items`
--
ALTER TABLE `deal_items`
  ADD CONSTRAINT `fk_deal_items_addon` FOREIGN KEY (`addon_id`) REFERENCES `addons` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_deal_items_deal` FOREIGN KEY (`deal_id`) REFERENCES `deals` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_deal_items_drink` FOREIGN KEY (`drink_id`) REFERENCES `drinks` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_deal_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `product_addons`
--
ALTER TABLE `product_addons`
  ADD CONSTRAINT `fk_product_addons_addon` FOREIGN KEY (`addon_id`) REFERENCES `addons` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_product_addons_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `fk_refresh_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
