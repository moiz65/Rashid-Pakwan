-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 10, 2026 at 09:31 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `resturant_ordering_management`
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
  `phone` varchar(40) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `landmark` varchar(255) DEFAULT NULL,
  `delivery_type` varchar(20) DEFAULT NULL,
  `session_key` varchar(64) DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`items`)),
  `value` decimal(12,2) NOT NULL DEFAULT 0.00,
  `abandoned_at` datetime NOT NULL DEFAULT current_timestamp(),
  `recovered` tinyint(1) NOT NULL DEFAULT 0,
  `branch_id` varchar(36) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `addons`
--

CREATE TABLE `addons` (
  `id` varchar(36) NOT NULL,
  `name` varchar(120) NOT NULL,
  `price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `image` varchar(500) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `branch_id` varchar(36) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `id` varchar(36) NOT NULL,
  `name` varchar(180) NOT NULL,
  `code` varchar(20) NOT NULL,
  `city` varchar(120) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `manager` varchar(120) DEFAULT NULL,
  `hours` varchar(120) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `is_primary` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `branches`
--

INSERT INTO `branches` (`id`, `name`, `code`, `city`, `address`, `phone`, `manager`, `hours`, `status`, `is_primary`, `created_at`, `updated_at`) VALUES
('br_1788026544351_51d763a8', 'DHA', 'DHA', 'karachi', 'xyz address', '03181210257', 'AMK', '', 'active', 0, '2026-08-29 23:02:24', '2026-08-29 23:02:24'),
('br_xyz_karachi', 'North Nazimabad', 'NN', 'Karachi', 'Blcok H 33/16 FC Area karachi', '+92 21 111 2000', 'Ahmed Khan', '11:00 AM – 11:00 PM', 'active', 1, '2026-08-19 21:22:18', '2026-08-29 21:42:15');

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
  `id` varchar(36) NOT NULL,
  `name` varchar(120) NOT NULL,
  `logo` varchar(32) DEFAULT NULL,
  `branch_id` varchar(36) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `is_visible` tinyint(1) NOT NULL DEFAULT 1,
  `branch_id` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `created_at`, `updated_at`, `image`, `sort_order`, `is_visible`, `branch_id`) VALUES
('cat_1788026843015_bc30e498', 'Burgers', 'burgers', '2026-08-29 23:07:23', '2026-08-29 23:07:23', '', 0, 1, NULL);

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
  `branch_id` varchar(36) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `branch_id` varchar(36) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `name`, `email`, `phone`, `total_orders`, `spent`, `joined_at`, `branch_id`, `created_at`, `updated_at`) VALUES
('16468347-97c1-40d0-92ac-3d188ec2e221', 'Mr. Abdul Moiz', 'digious.moiz@gmail.com', '23142314', 2, 441.50, '2026-08-29 23:22:06', 'br_1788026544351_51d763a8', '2026-08-29 23:22:06', '2026-08-29 23:23:18');

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
  `tax_code_id` varchar(36) DEFAULT NULL,
  `tax_mode` enum('inclusive','exclusive') NOT NULL DEFAULT 'inclusive',
  `start_at` datetime DEFAULT NULL,
  `end_at` datetime DEFAULT NULL,
  `days_of_week` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`days_of_week`)),
  `daily_start_time` time DEFAULT NULL,
  `daily_end_time` time DEFAULT NULL,
  `show_countdown` tinyint(1) NOT NULL DEFAULT 1,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `addon_mode` enum('none','all','selected') NOT NULL DEFAULT 'none',
  `addon_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`addon_ids`)),
  `branch_id` varchar(36) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `customer_choice` tinyint(1) NOT NULL DEFAULT 0,
  `choice_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`choice_ids`)),
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `delivery_areas`
--

CREATE TABLE `delivery_areas` (
  `id` varchar(64) NOT NULL,
  `branch_id` varchar(36) DEFAULT NULL,
  `name` varchar(160) NOT NULL,
  `slug` varchar(160) NOT NULL,
  `charge` decimal(10,2) NOT NULL DEFAULT 0.00,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `delivery_areas`
--

INSERT INTO `delivery_areas` (`id`, `branch_id`, `name`, `slug`, `charge`, `sort_order`, `enabled`, `created_at`, `updated_at`) VALUES
('da_1787249357022_510a2e8e_abdullah_goth', 'br_1787249357022_510a2e8e', 'Abdullah Goth', 'abdullah_goth', 149.00, 1, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_abul_hassan_isphahani_road', 'br_1787249357022_510a2e8e', 'Abul Hassan Isphahani Road', 'abul_hassan_isphahani_road', 149.00, 2, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_airport', 'br_1787249357022_510a2e8e', 'Airport', 'airport', 149.00, 3, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_akhtar_colony', 'br_1787249357022_510a2e8e', 'Akhtar Colony', 'akhtar_colony', 149.00, 4, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_al_falah_society', 'br_1787249357022_510a2e8e', 'Al-Falah Society', 'al_falah_society', 149.00, 5, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_al_hilal_society', 'br_1787249357022_510a2e8e', 'Al-Hilal Society', 'al_hilal_society', 149.00, 6, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_allah_wala_town', 'br_1787249357022_510a2e8e', 'Allah Wala Town', 'allah_wala_town', 149.00, 7, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_ancholi', 'br_1787249357022_510a2e8e', 'Ancholi', 'ancholi', 149.00, 8, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_ashraf_nagar', 'br_1787249357022_510a2e8e', 'Ashraf Nagar', 'ashraf_nagar', 149.00, 9, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_askari_1', 'br_1787249357022_510a2e8e', 'Askari 1', 'askari_1', 149.00, 10, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_askari_2', 'br_1787249357022_510a2e8e', 'Askari 2', 'askari_2', 149.00, 11, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_askari_3', 'br_1787249357022_510a2e8e', 'Askari 3', 'askari_3', 149.00, 12, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_askari_4', 'br_1787249357022_510a2e8e', 'Askari 4', 'askari_4', 149.00, 13, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_askari_5', 'br_1787249357022_510a2e8e', 'Askari 5', 'askari_5', 149.00, 14, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_ayesha_manzil', 'br_1787249357022_510a2e8e', 'Ayesha Manzil', 'ayesha_manzil', 149.00, 15, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_azam_basti', 'br_1787249357022_510a2e8e', 'Azam Basti', 'azam_basti', 149.00, 16, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_azam_town', 'br_1787249357022_510a2e8e', 'Azam Town', 'azam_town', 149.00, 17, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_baba_wilayat_shah_colony', 'br_1787249357022_510a2e8e', 'Baba Wilayat Shah Colony', 'baba_wilayat_shah_colony', 149.00, 28, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_babar_market', 'br_1787249357022_510a2e8e', 'Babar Market', 'babar_market', 149.00, 18, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_bachayo_narain', 'br_1787249357022_510a2e8e', 'Bachayo Narain', 'bachayo_narain', 149.00, 19, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_bagh_e_korangi', 'br_1787249357022_510a2e8e', 'Bagh e Korangi', 'bagh_e_korangi', 149.00, 20, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_bahadurabad', 'br_1787249357022_510a2e8e', 'Bahadurabad', 'bahadurabad', 149.00, 21, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_bahria_town_karachi', 'br_1787249357022_510a2e8e', 'Bahria Town Karachi', 'bahria_town_karachi', 149.00, 22, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_baldia_town', 'br_1787249357022_510a2e8e', 'Baldia Town', 'baldia_town', 149.00, 23, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_baloch_colony', 'br_1787249357022_510a2e8e', 'Baloch Colony', 'baloch_colony', 149.00, 24, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_banaras_colony', 'br_1787249357022_510a2e8e', 'Banaras Colony', 'banaras_colony', 149.00, 25, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_bandhani_colony', 'br_1787249357022_510a2e8e', 'Bandhani Colony', 'bandhani_colony', 149.00, 26, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_bath_island', 'br_1787249357022_510a2e8e', 'Bath Island', 'bath_island', 149.00, 27, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_beacon_house', 'br_1787249357022_510a2e8e', 'Beacon House', 'beacon_house', 149.00, 29, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_bhadur_colony', 'br_1787249357022_510a2e8e', 'Bhadur Colony', 'bhadur_colony', 149.00, 30, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_bhittaiabad', 'br_1787249357022_510a2e8e', 'Bhittaiabad', 'bhittaiabad', 149.00, 31, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_bihar_colony', 'br_1787249357022_510a2e8e', 'Bihar Colony', 'bihar_colony', 149.00, 32, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_bizm_e_alam_society', 'br_1787249357022_510a2e8e', 'Bizm-e-Alam Society', 'bizm_e_alam_society', 149.00, 33, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_block_1_gulshan_e_iqbal', 'br_1787249357022_510a2e8e', 'Block 1 Gulshan-e-Iqbal', 'block_1_gulshan_e_iqbal', 149.00, 34, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_block_10_gulshan_e_iqbal', 'br_1787249357022_510a2e8e', 'Block 10 Gulshan-e-Iqbal', 'block_10_gulshan_e_iqbal', 149.00, 43, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_block_11_gulshan_e_iqbal', 'br_1787249357022_510a2e8e', 'Block 11 Gulshan-e-Iqbal', 'block_11_gulshan_e_iqbal', 149.00, 44, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_block_12_gulshan_e_iqbal', 'br_1787249357022_510a2e8e', 'Block 12 Gulshan-e-Iqbal', 'block_12_gulshan_e_iqbal', 149.00, 45, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_block_13_gulshan_e_iqbal', 'br_1787249357022_510a2e8e', 'Block 13 Gulshan-e-Iqbal', 'block_13_gulshan_e_iqbal', 149.00, 46, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_block_14_gulshan_e_iqbal', 'br_1787249357022_510a2e8e', 'Block 14 Gulshan-e-Iqbal', 'block_14_gulshan_e_iqbal', 149.00, 47, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_block_15_gulshan_e_iqbal', 'br_1787249357022_510a2e8e', 'Block 15 Gulshan-e-Iqbal', 'block_15_gulshan_e_iqbal', 149.00, 48, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_block_16_gulshan_e_iqbal', 'br_1787249357022_510a2e8e', 'Block 16 Gulshan-e-Iqbal', 'block_16_gulshan_e_iqbal', 149.00, 49, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_block_17_gulshan_e_iqbal', 'br_1787249357022_510a2e8e', 'Block 17 Gulshan-e-Iqbal', 'block_17_gulshan_e_iqbal', 149.00, 50, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_block_18_gulshan_e_iqbal', 'br_1787249357022_510a2e8e', 'Block 18 Gulshan-e-Iqbal', 'block_18_gulshan_e_iqbal', 149.00, 51, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_block_2_gulshan_e_iqbal', 'br_1787249357022_510a2e8e', 'Block 2 Gulshan-e-Iqbal', 'block_2_gulshan_e_iqbal', 149.00, 35, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_block_3_gulshan_e_iqbal', 'br_1787249357022_510a2e8e', 'Block 3 Gulshan-e-Iqbal', 'block_3_gulshan_e_iqbal', 149.00, 36, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_block_4_gulshan_e_iqbal', 'br_1787249357022_510a2e8e', 'Block 4 Gulshan-e-Iqbal', 'block_4_gulshan_e_iqbal', 149.00, 37, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_block_5_gulshan_e_iqbal', 'br_1787249357022_510a2e8e', 'Block 5 Gulshan-e-Iqbal', 'block_5_gulshan_e_iqbal', 149.00, 38, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_block_6_gulshan_e_iqbal', 'br_1787249357022_510a2e8e', 'Block 6 Gulshan-e-Iqbal', 'block_6_gulshan_e_iqbal', 149.00, 39, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_block_7_gulshan_e_iqbal', 'br_1787249357022_510a2e8e', 'Block 7 Gulshan-e-Iqbal', 'block_7_gulshan_e_iqbal', 149.00, 40, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_block_8_gulshan_e_iqbal', 'br_1787249357022_510a2e8e', 'Block 8 Gulshan-e-Iqbal', 'block_8_gulshan_e_iqbal', 149.00, 41, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_block_9_gulshan_e_iqbal', 'br_1787249357022_510a2e8e', 'Block 9 Gulshan-e-Iqbal', 'block_9_gulshan_e_iqbal', 149.00, 42, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_bufferzone', 'br_1787249357022_510a2e8e', 'Bufferzone', 'bufferzone', 149.00, 52, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_burns_road', 'br_1787249357022_510a2e8e', 'Burns Road', 'burns_road', 149.00, 53, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_cantonment', 'br_1787249357022_510a2e8e', 'Cantonment', 'cantonment', 149.00, 54, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_chakra_goth', 'br_1787249357022_510a2e8e', 'Chakra Goth', 'chakra_goth', 149.00, 55, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_civil_lines', 'br_1787249357022_510a2e8e', 'Civil Lines', 'civil_lines', 149.00, 56, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_clifton_block_1', 'br_1787249357022_510a2e8e', 'Clifton Block 1', 'clifton_block_1', 149.00, 57, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_clifton_block_2', 'br_1787249357022_510a2e8e', 'Clifton Block 2', 'clifton_block_2', 149.00, 58, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_clifton_block_3', 'br_1787249357022_510a2e8e', 'Clifton Block 3', 'clifton_block_3', 149.00, 59, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_clifton_block_4', 'br_1787249357022_510a2e8e', 'Clifton Block 4', 'clifton_block_4', 149.00, 60, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_clifton_block_5', 'br_1787249357022_510a2e8e', 'Clifton Block 5', 'clifton_block_5', 149.00, 61, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_clifton_block_6', 'br_1787249357022_510a2e8e', 'Clifton Block 6', 'clifton_block_6', 149.00, 62, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_clifton_block_7', 'br_1787249357022_510a2e8e', 'Clifton Block 7', 'clifton_block_7', 149.00, 63, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_clifton_block_8', 'br_1787249357022_510a2e8e', 'Clifton Block 8', 'clifton_block_8', 149.00, 64, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_clifton_block_9', 'br_1787249357022_510a2e8e', 'Clifton Block 9', 'clifton_block_9', 149.00, 65, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_darakhshan_society', 'br_1787249357022_510a2e8e', 'Darakhshan Society', 'darakhshan_society', 149.00, 75, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_darul_aman_society', 'br_1787249357022_510a2e8e', 'Darul Aman Society', 'darul_aman_society', 149.00, 76, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_dastagir', 'br_1787249357022_510a2e8e', 'Dastagir', 'dastagir', 149.00, 77, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_defence_view', 'br_1787249357022_510a2e8e', 'Defence View', 'defence_view', 149.00, 78, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_delhi_colony', 'br_1787249357022_510a2e8e', 'Delhi Colony', 'delhi_colony', 149.00, 79, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_dha_phase_1', 'br_1787249357022_510a2e8e', 'DHA Phase 1', 'dha_phase_1', 149.00, 66, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_dha_phase_2', 'br_1787249357022_510a2e8e', 'DHA Phase 2', 'dha_phase_2', 149.00, 67, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_dha_phase_2_extension', 'br_1787249357022_510a2e8e', 'DHA Phase 2 Extension', 'dha_phase_2_extension', 149.00, 68, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_dha_phase_4', 'br_1787249357022_510a2e8e', 'DHA Phase 4', 'dha_phase_4', 149.00, 69, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_dha_phase_5', 'br_1787249357022_510a2e8e', 'DHA Phase 5', 'dha_phase_5', 149.00, 70, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_dha_phase_5_extension', 'br_1787249357022_510a2e8e', 'DHA Phase 5 Extension', 'dha_phase_5_extension', 149.00, 71, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_dha_phase_6', 'br_1787249357022_510a2e8e', 'DHA Phase 6', 'dha_phase_6', 149.00, 72, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_dha_phase_7', 'br_1787249357022_510a2e8e', 'DHA Phase 7', 'dha_phase_7', 149.00, 73, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_dha_phase_8', 'br_1787249357022_510a2e8e', 'DHA Phase 8', 'dha_phase_8', 149.00, 74, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_dhoraji_colony', 'br_1787249357022_510a2e8e', 'Dhoraji Colony', 'dhoraji_colony', 149.00, 80, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_do_talwar', 'br_1787249357022_510a2e8e', 'Do Talwar', 'do_talwar', 149.00, 81, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_drigh_road', 'br_1787249357022_510a2e8e', 'Drigh Road', 'drigh_road', 149.00, 82, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_eid_gah', 'br_1787249357022_510a2e8e', 'Eid Gah', 'eid_gah', 149.00, 83, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_f_b_area_block_1', 'br_1787249357022_510a2e8e', 'F.B. Area Block 1', 'f_b_area_block_1', 149.00, 84, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_f_b_area_block_10', 'br_1787249357022_510a2e8e', 'F.B. Area Block 10', 'f_b_area_block_10', 149.00, 93, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_f_b_area_block_11', 'br_1787249357022_510a2e8e', 'F.B. Area Block 11', 'f_b_area_block_11', 149.00, 94, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_f_b_area_block_12', 'br_1787249357022_510a2e8e', 'F.B. Area Block 12', 'f_b_area_block_12', 149.00, 95, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_f_b_area_block_13', 'br_1787249357022_510a2e8e', 'F.B. Area Block 13', 'f_b_area_block_13', 149.00, 96, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_f_b_area_block_14', 'br_1787249357022_510a2e8e', 'F.B. Area Block 14', 'f_b_area_block_14', 149.00, 97, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_f_b_area_block_15', 'br_1787249357022_510a2e8e', 'F.B. Area Block 15', 'f_b_area_block_15', 149.00, 98, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_f_b_area_block_16', 'br_1787249357022_510a2e8e', 'F.B. Area Block 16', 'f_b_area_block_16', 149.00, 99, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_f_b_area_block_17', 'br_1787249357022_510a2e8e', 'F.B. Area Block 17', 'f_b_area_block_17', 149.00, 100, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_f_b_area_block_18', 'br_1787249357022_510a2e8e', 'F.B. Area Block 18', 'f_b_area_block_18', 149.00, 101, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_f_b_area_block_19', 'br_1787249357022_510a2e8e', 'F.B. Area Block 19', 'f_b_area_block_19', 149.00, 102, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_f_b_area_block_2', 'br_1787249357022_510a2e8e', 'F.B. Area Block 2', 'f_b_area_block_2', 149.00, 85, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_f_b_area_block_20', 'br_1787249357022_510a2e8e', 'F.B. Area Block 20', 'f_b_area_block_20', 149.00, 103, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_f_b_area_block_21', 'br_1787249357022_510a2e8e', 'F.B. Area Block 21', 'f_b_area_block_21', 149.00, 104, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_f_b_area_block_3', 'br_1787249357022_510a2e8e', 'F.B. Area Block 3', 'f_b_area_block_3', 149.00, 86, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_f_b_area_block_4', 'br_1787249357022_510a2e8e', 'F.B. Area Block 4', 'f_b_area_block_4', 149.00, 87, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_f_b_area_block_5', 'br_1787249357022_510a2e8e', 'F.B. Area Block 5', 'f_b_area_block_5', 149.00, 88, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_f_b_area_block_6', 'br_1787249357022_510a2e8e', 'F.B. Area Block 6', 'f_b_area_block_6', 149.00, 89, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_f_b_area_block_7', 'br_1787249357022_510a2e8e', 'F.B. Area Block 7', 'f_b_area_block_7', 149.00, 90, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_f_b_area_block_8', 'br_1787249357022_510a2e8e', 'F.B. Area Block 8', 'f_b_area_block_8', 149.00, 91, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_f_b_area_block_9', 'br_1787249357022_510a2e8e', 'F.B. Area Block 9', 'f_b_area_block_9', 149.00, 92, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_faisal_cantonment', 'br_1787249357022_510a2e8e', 'Faisal Cantonment', 'faisal_cantonment', 149.00, 105, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_farooq_e_azam', 'br_1787249357022_510a2e8e', 'Farooq-e-Azam', 'farooq_e_azam', 149.00, 106, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_federal_b_area', 'br_1787249357022_510a2e8e', 'Federal B Area', 'federal_b_area', 149.00, 107, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_frere_town', 'br_1787249357022_510a2e8e', 'Frere Town', 'frere_town', 149.00, 108, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_garden_east', 'br_1787249357022_510a2e8e', 'Garden East', 'garden_east', 149.00, 109, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_garden_west', 'br_1787249357022_510a2e8e', 'Garden West', 'garden_west', 149.00, 110, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_gharibabad', 'br_1787249357022_510a2e8e', 'Gharibabad', 'gharibabad', 149.00, 111, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_gizri', 'br_1787249357022_510a2e8e', 'Gizri', 'gizri', 149.00, 112, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_gizri_boulevard', 'br_1787249357022_510a2e8e', 'Gizri Boulevard', 'gizri_boulevard', 149.00, 113, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_gulbahar', 'br_1787249357022_510a2e8e', 'Gulbahar', 'gulbahar', 149.00, 114, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_gulberg', 'br_1787249357022_510a2e8e', 'Gulberg', 'gulberg', 149.00, 115, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_gulistan_e_johar_block_1', 'br_1787249357022_510a2e8e', 'Gulistan-e-Johar Block 1', 'gulistan_e_johar_block_1', 149.00, 116, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_gulistan_e_johar_block_10', 'br_1787249357022_510a2e8e', 'Gulistan-e-Johar Block 10', 'gulistan_e_johar_block_10', 149.00, 125, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_gulistan_e_johar_block_11', 'br_1787249357022_510a2e8e', 'Gulistan-e-Johar Block 11', 'gulistan_e_johar_block_11', 149.00, 126, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_gulistan_e_johar_block_12', 'br_1787249357022_510a2e8e', 'Gulistan-e-Johar Block 12', 'gulistan_e_johar_block_12', 149.00, 127, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_gulistan_e_johar_block_13', 'br_1787249357022_510a2e8e', 'Gulistan-e-Johar Block 13', 'gulistan_e_johar_block_13', 149.00, 128, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_gulistan_e_johar_block_14', 'br_1787249357022_510a2e8e', 'Gulistan-e-Johar Block 14', 'gulistan_e_johar_block_14', 149.00, 129, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_gulistan_e_johar_block_15', 'br_1787249357022_510a2e8e', 'Gulistan-e-Johar Block 15', 'gulistan_e_johar_block_15', 149.00, 130, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_gulistan_e_johar_block_16', 'br_1787249357022_510a2e8e', 'Gulistan-e-Johar Block 16', 'gulistan_e_johar_block_16', 149.00, 131, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_gulistan_e_johar_block_17', 'br_1787249357022_510a2e8e', 'Gulistan-e-Johar Block 17', 'gulistan_e_johar_block_17', 149.00, 132, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_gulistan_e_johar_block_18', 'br_1787249357022_510a2e8e', 'Gulistan-e-Johar Block 18', 'gulistan_e_johar_block_18', 149.00, 133, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_gulistan_e_johar_block_19', 'br_1787249357022_510a2e8e', 'Gulistan-e-Johar Block 19', 'gulistan_e_johar_block_19', 149.00, 134, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_gulistan_e_johar_block_2', 'br_1787249357022_510a2e8e', 'Gulistan-e-Johar Block 2', 'gulistan_e_johar_block_2', 149.00, 117, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_gulistan_e_johar_block_3', 'br_1787249357022_510a2e8e', 'Gulistan-e-Johar Block 3', 'gulistan_e_johar_block_3', 149.00, 118, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_gulistan_e_johar_block_4', 'br_1787249357022_510a2e8e', 'Gulistan-e-Johar Block 4', 'gulistan_e_johar_block_4', 149.00, 119, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_gulistan_e_johar_block_5', 'br_1787249357022_510a2e8e', 'Gulistan-e-Johar Block 5', 'gulistan_e_johar_block_5', 149.00, 120, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_gulistan_e_johar_block_6', 'br_1787249357022_510a2e8e', 'Gulistan-e-Johar Block 6', 'gulistan_e_johar_block_6', 149.00, 121, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_gulistan_e_johar_block_7', 'br_1787249357022_510a2e8e', 'Gulistan-e-Johar Block 7', 'gulistan_e_johar_block_7', 149.00, 122, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_gulistan_e_johar_block_8', 'br_1787249357022_510a2e8e', 'Gulistan-e-Johar Block 8', 'gulistan_e_johar_block_8', 149.00, 123, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_gulistan_e_johar_block_9', 'br_1787249357022_510a2e8e', 'Gulistan-e-Johar Block 9', 'gulistan_e_johar_block_9', 149.00, 124, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_gulshan_e_hadeed', 'br_1787249357022_510a2e8e', 'Gulshan-e-Hadeed', 'gulshan_e_hadeed', 149.00, 135, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_gulshan_e_iqbal', 'br_1787249357022_510a2e8e', 'Gulshan-e-Iqbal', 'gulshan_e_iqbal', 149.00, 136, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_gulshan_e_jamal', 'br_1787249357022_510a2e8e', 'Gulshan-e-Jamal', 'gulshan_e_jamal', 149.00, 137, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_gulshan_e_maymar', 'br_1787249357022_510a2e8e', 'Gulshan-e-Maymar', 'gulshan_e_maymar', 149.00, 138, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_gulzar_e_hijri', 'br_1787249357022_510a2e8e', 'Gulzar-e-Hijri', 'gulzar_e_hijri', 149.00, 139, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_habib_bank_plaza', 'br_1787249357022_510a2e8e', 'Habib Bank Plaza', 'habib_bank_plaza', 149.00, 140, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_hajiyani_goth', 'br_1787249357022_510a2e8e', 'Hajiyani Goth', 'hajiyani_goth', 149.00, 141, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_harbour_front', 'br_1787249357022_510a2e8e', 'Harbour Front', 'harbour_front', 149.00, 142, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_hill_park', 'br_1787249357022_510a2e8e', 'Hill Park', 'hill_park', 149.00, 143, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_holy_family', 'br_1787249357022_510a2e8e', 'Holy Family', 'holy_family', 149.00, 144, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_hussainabad', 'br_1787249357022_510a2e8e', 'Hussainabad', 'hussainabad', 149.00, 145, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_hyderi', 'br_1787249357022_510a2e8e', 'Hyderi', 'hyderi', 149.00, 146, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_i_i_chundrigar_road', 'br_1787249357022_510a2e8e', 'I.I. Chundrigar Road', 'i_i_chundrigar_road', 149.00, 147, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_ibrahim_hyderi', 'br_1787249357022_510a2e8e', 'Ibrahim Hyderi', 'ibrahim_hyderi', 149.00, 148, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_jamshed_quarters', 'br_1787249357022_510a2e8e', 'Jamshed Quarters', 'jamshed_quarters', 149.00, 149, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_jauhar_chowrangi', 'br_1787249357022_510a2e8e', 'Jauhar Chowrangi', 'jauhar_chowrangi', 149.00, 150, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_jinnah_terminal', 'br_1787249357022_510a2e8e', 'Jinnah Terminal', 'jinnah_terminal', 149.00, 151, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_johar_complex', 'br_1787249357022_510a2e8e', 'Johar Complex', 'johar_complex', 149.00, 152, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_kda_scheme_1', 'br_1787249357022_510a2e8e', 'KDA Scheme 1', 'kda_scheme_1', 149.00, 153, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_kda_scheme_33', 'br_1787249357022_510a2e8e', 'KDA Scheme 33', 'kda_scheme_33', 149.00, 154, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_keamari', 'br_1787249357022_510a2e8e', 'Keamari', 'keamari', 149.00, 155, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_kehkashan', 'br_1787249357022_510a2e8e', 'Kehkashan', 'kehkashan', 149.00, 156, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_khadda_market', 'br_1787249357022_510a2e8e', 'Khadda Market', 'khadda_market', 149.00, 157, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_kharadar', 'br_1787249357022_510a2e8e', 'Kharadar', 'kharadar', 149.00, 158, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_khudadad_colony', 'br_1787249357022_510a2e8e', 'Khudadad Colony', 'khudadad_colony', 149.00, 159, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_korangi', 'br_1787249357022_510a2e8e', 'Korangi', 'korangi', 149.00, 160, 1, '2026-08-26 23:15:04', '2026-08-26 23:15:04'),
('da_1787249357022_510a2e8e_korangi_crossing', 'br_1787249357022_510a2e8e', 'Korangi Crossing', 'korangi_crossing', 149.00, 161, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_korangi_industrial_area', 'br_1787249357022_510a2e8e', 'Korangi Industrial Area', 'korangi_industrial_area', 149.00, 162, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_korangi_sector_31', 'br_1787249357022_510a2e8e', 'Korangi Sector 31', 'korangi_sector_31', 149.00, 163, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_korangi_sector_32', 'br_1787249357022_510a2e8e', 'Korangi Sector 32', 'korangi_sector_32', 149.00, 164, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_korangi_sector_33', 'br_1787249357022_510a2e8e', 'Korangi Sector 33', 'korangi_sector_33', 149.00, 165, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_korangi_sector_34', 'br_1787249357022_510a2e8e', 'Korangi Sector 34', 'korangi_sector_34', 149.00, 166, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_korangi_sector_35', 'br_1787249357022_510a2e8e', 'Korangi Sector 35', 'korangi_sector_35', 149.00, 167, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_korangi_sector_36', 'br_1787249357022_510a2e8e', 'Korangi Sector 36', 'korangi_sector_36', 149.00, 168, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_landhi', 'br_1787249357022_510a2e8e', 'Landhi', 'landhi', 149.00, 169, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_liaquatabad', 'br_1787249357022_510a2e8e', 'Liaquatabad', 'liaquatabad', 149.00, 170, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_lines_area', 'br_1787249357022_510a2e8e', 'Lines Area', 'lines_area', 149.00, 171, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_lyari', 'br_1787249357022_510a2e8e', 'Lyari', 'lyari', 149.00, 172, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_malir', 'br_1787249357022_510a2e8e', 'Malir', 'malir', 149.00, 173, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_malir_cantonment', 'br_1787249357022_510a2e8e', 'Malir Cantonment', 'malir_cantonment', 149.00, 174, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_malir_halt', 'br_1787249357022_510a2e8e', 'Malir Halt', 'malir_halt', 149.00, 175, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_manzoor_colony', 'br_1787249357022_510a2e8e', 'Manzoor Colony', 'manzoor_colony', 149.00, 176, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_maripur', 'br_1787249357022_510a2e8e', 'Maripur', 'maripur', 149.00, 177, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_mehmoodabad', 'br_1787249357022_510a2e8e', 'Mehmoodabad', 'mehmoodabad', 149.00, 178, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_metroville', 'br_1787249357022_510a2e8e', 'Metroville', 'metroville', 149.00, 179, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_millat_nagar', 'br_1787249357022_510a2e8e', 'Millat Nagar', 'millat_nagar', 149.00, 180, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_model_colony', 'br_1787249357022_510a2e8e', 'Model Colony', 'model_colony', 149.00, 181, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_moinabad', 'br_1787249357022_510a2e8e', 'Moinabad', 'moinabad', 149.00, 182, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_mujahid_colony', 'br_1787249357022_510a2e8e', 'Mujahid Colony', 'mujahid_colony', 149.00, 183, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_muslim_town', 'br_1787249357022_510a2e8e', 'Muslim Town', 'muslim_town', 149.00, 185, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_muslimabad', 'br_1787249357022_510a2e8e', 'Muslimabad', 'muslimabad', 149.00, 184, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_national_stadium', 'br_1787249357022_510a2e8e', 'National Stadium', 'national_stadium', 149.00, 186, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_nazimabad_1', 'br_1787249357022_510a2e8e', 'Nazimabad 1', 'nazimabad_1', 149.00, 187, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_nazimabad_2', 'br_1787249357022_510a2e8e', 'Nazimabad 2', 'nazimabad_2', 149.00, 188, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_nazimabad_3', 'br_1787249357022_510a2e8e', 'Nazimabad 3', 'nazimabad_3', 149.00, 189, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_nazimabad_4', 'br_1787249357022_510a2e8e', 'Nazimabad 4', 'nazimabad_4', 149.00, 190, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_nazimabad_5', 'br_1787249357022_510a2e8e', 'Nazimabad 5', 'nazimabad_5', 149.00, 191, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_nazimabad_6', 'br_1787249357022_510a2e8e', 'Nazimabad 6', 'nazimabad_6', 149.00, 192, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_nazimabad_7', 'br_1787249357022_510a2e8e', 'Nazimabad 7', 'nazimabad_7', 149.00, 193, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_new_karachi', 'br_1787249357022_510a2e8e', 'New Karachi', 'new_karachi', 149.00, 194, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_new_town', 'br_1787249357022_510a2e8e', 'New Town', 'new_town', 149.00, 195, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_nishat_commercial', 'br_1787249357022_510a2e8e', 'Nishat Commercial', 'nishat_commercial', 149.00, 196, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_north_karachi', 'br_1787249357022_510a2e8e', 'North Karachi', 'north_karachi', 149.00, 197, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_north_nazimabad_block_a', 'br_1787249357022_510a2e8e', 'North Nazimabad Block A', 'north_nazimabad_block_a', 149.00, 198, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_north_nazimabad_block_b', 'br_1787249357022_510a2e8e', 'North Nazimabad Block B', 'north_nazimabad_block_b', 149.00, 199, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_north_nazimabad_block_c', 'br_1787249357022_510a2e8e', 'North Nazimabad Block C', 'north_nazimabad_block_c', 149.00, 200, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_north_nazimabad_block_d', 'br_1787249357022_510a2e8e', 'North Nazimabad Block D', 'north_nazimabad_block_d', 149.00, 201, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_north_nazimabad_block_e', 'br_1787249357022_510a2e8e', 'North Nazimabad Block E', 'north_nazimabad_block_e', 149.00, 202, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_north_nazimabad_block_f', 'br_1787249357022_510a2e8e', 'North Nazimabad Block F', 'north_nazimabad_block_f', 149.00, 203, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_north_nazimabad_block_g', 'br_1787249357022_510a2e8e', 'North Nazimabad Block G', 'north_nazimabad_block_g', 149.00, 204, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_north_nazimabad_block_h', 'br_1787249357022_510a2e8e', 'North Nazimabad Block H', 'north_nazimabad_block_h', 149.00, 205, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_north_nazimabad_block_i', 'br_1787249357022_510a2e8e', 'North Nazimabad Block I', 'north_nazimabad_block_i', 149.00, 206, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_north_nazimabad_block_j', 'br_1787249357022_510a2e8e', 'North Nazimabad Block J', 'north_nazimabad_block_j', 149.00, 207, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_north_nazimabad_block_k', 'br_1787249357022_510a2e8e', 'North Nazimabad Block K', 'north_nazimabad_block_k', 149.00, 208, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_north_nazimabad_block_l', 'br_1787249357022_510a2e8e', 'North Nazimabad Block L', 'north_nazimabad_block_l', 149.00, 209, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_north_nazimabad_block_m', 'br_1787249357022_510a2e8e', 'North Nazimabad Block M', 'north_nazimabad_block_m', 149.00, 210, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_north_nazimabad_block_n', 'br_1787249357022_510a2e8e', 'North Nazimabad Block N', 'north_nazimabad_block_n', 149.00, 211, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_north_nazimabad_block_o', 'br_1787249357022_510a2e8e', 'North Nazimabad Block O', 'north_nazimabad_block_o', 149.00, 212, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_north_nazimabad_block_p', 'br_1787249357022_510a2e8e', 'North Nazimabad Block P', 'north_nazimabad_block_p', 149.00, 213, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_north_nazimabad_block_q', 'br_1787249357022_510a2e8e', 'North Nazimabad Block Q', 'north_nazimabad_block_q', 149.00, 214, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_north_nazimabad_block_r', 'br_1787249357022_510a2e8e', 'North Nazimabad Block R', 'north_nazimabad_block_r', 149.00, 215, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_north_nazimabad_block_s', 'br_1787249357022_510a2e8e', 'North Nazimabad Block S', 'north_nazimabad_block_s', 149.00, 216, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_north_nazimabad_block_t', 'br_1787249357022_510a2e8e', 'North Nazimabad Block T', 'north_nazimabad_block_t', 149.00, 217, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_old_town', 'br_1787249357022_510a2e8e', 'Old Town', 'old_town', 149.00, 218, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_orangi_town', 'br_1787249357022_510a2e8e', 'Orangi Town', 'orangi_town', 149.00, 219, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_p_e_c_h_s_block_1', 'br_1787249357022_510a2e8e', 'P.E.C.H.S Block 1', 'p_e_c_h_s_block_1', 149.00, 220, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_p_e_c_h_s_block_2', 'br_1787249357022_510a2e8e', 'P.E.C.H.S Block 2', 'p_e_c_h_s_block_2', 149.00, 221, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_p_e_c_h_s_block_3', 'br_1787249357022_510a2e8e', 'P.E.C.H.S Block 3', 'p_e_c_h_s_block_3', 149.00, 222, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_p_e_c_h_s_block_4', 'br_1787249357022_510a2e8e', 'P.E.C.H.S Block 4', 'p_e_c_h_s_block_4', 149.00, 223, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_p_e_c_h_s_block_5', 'br_1787249357022_510a2e8e', 'P.E.C.H.S Block 5', 'p_e_c_h_s_block_5', 149.00, 224, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_p_e_c_h_s_block_6', 'br_1787249357022_510a2e8e', 'P.E.C.H.S Block 6', 'p_e_c_h_s_block_6', 149.00, 225, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_pakistan_chowk', 'br_1787249357022_510a2e8e', 'Pakistan Chowk', 'pakistan_chowk', 149.00, 226, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_paposh_nagar', 'br_1787249357022_510a2e8e', 'Paposh Nagar', 'paposh_nagar', 149.00, 227, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_paradise_point', 'br_1787249357022_510a2e8e', 'Paradise Point', 'paradise_point', 149.00, 228, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_patel_para', 'br_1787249357022_510a2e8e', 'Patel Para', 'patel_para', 149.00, 229, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_pechs', 'br_1787249357022_510a2e8e', 'Pechs', 'pechs', 149.00, 230, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_pns_karsaz', 'br_1787249357022_510a2e8e', 'PNS Karsaz', 'pns_karsaz', 149.00, 231, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_port_qasim', 'br_1787249357022_510a2e8e', 'Port Qasim', 'port_qasim', 149.00, 232, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_qayyumabad', 'br_1787249357022_510a2e8e', 'Qayyumabad', 'qayyumabad', 149.00, 233, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_railway_colony', 'br_1787249357022_510a2e8e', 'Railway Colony', 'railway_colony', 149.00, 234, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_ranchore_line', 'br_1787249357022_510a2e8e', 'Ranchore Line', 'ranchore_line', 149.00, 235, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_rashid_minhas_road', 'br_1787249357022_510a2e8e', 'Rashid Minhas Road', 'rashid_minhas_road', 149.00, 236, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_rehmani_goth', 'br_1787249357022_510a2e8e', 'Rehmani Goth', 'rehmani_goth', 149.00, 237, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_rizvia_society', 'br_1787249357022_510a2e8e', 'Rizvia Society', 'rizvia_society', 149.00, 238, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_saddar', 'br_1787249357022_510a2e8e', 'Saddar', 'saddar', 149.00, 239, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_safoora_goth', 'br_1787249357022_510a2e8e', 'Safoora Goth', 'safoora_goth', 149.00, 240, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_sakhi_hassan', 'br_1787249357022_510a2e8e', 'Sakhi Hassan', 'sakhi_hassan', 149.00, 241, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_shah_faisal_colony', 'br_1787249357022_510a2e8e', 'Shah Faisal Colony', 'shah_faisal_colony', 149.00, 242, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_shah_latif_town', 'br_1787249357022_510a2e8e', 'Shah Latif Town', 'shah_latif_town', 149.00, 243, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_shahrah_e_faisal', 'br_1787249357022_510a2e8e', 'Shahrah-e-Faisal', 'shahrah_e_faisal', 149.00, 244, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_shahrah_e_quaideen', 'br_1787249357022_510a2e8e', 'Shahrah-e-Quaideen', 'shahrah_e_quaideen', 149.00, 245, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_sharafi_goth', 'br_1787249357022_510a2e8e', 'Sharafi Goth', 'sharafi_goth', 149.00, 246, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_sharfabad', 'br_1787249357022_510a2e8e', 'Sharfabad', 'sharfabad', 149.00, 247, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_shepherd_street', 'br_1787249357022_510a2e8e', 'Shepherd Street', 'shepherd_street', 149.00, 248, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_shipowner_college', 'br_1787249357022_510a2e8e', 'Shipowner College', 'shipowner_college', 149.00, 249, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_sindhi_muslim_society', 'br_1787249357022_510a2e8e', 'Sindhi Muslim Society', 'sindhi_muslim_society', 149.00, 250, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_sohrab_goth', 'br_1787249357022_510a2e8e', 'Sohrab Goth', 'sohrab_goth', 149.00, 251, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_soldier_bazaar', 'br_1787249357022_510a2e8e', 'Soldier Bazaar', 'soldier_bazaar', 149.00, 252, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_star_gate', 'br_1787249357022_510a2e8e', 'Star Gate', 'star_gate', 149.00, 253, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_steel_town', 'br_1787249357022_510a2e8e', 'Steel Town', 'steel_town', 149.00, 254, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_super_highway', 'br_1787249357022_510a2e8e', 'Super Highway', 'super_highway', 149.00, 255, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_surjani_town', 'br_1787249357022_510a2e8e', 'Surjani Town', 'surjani_town', 149.00, 256, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_tariq_road', 'br_1787249357022_510a2e8e', 'Tariq Road', 'tariq_road', 149.00, 257, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_test', 'br_1787249357022_510a2e8e', 'test', 'test', 149.00, 9999, 1, '2026-08-26 23:45:05', '2026-08-26 23:45:05'),
('da_1787249357022_510a2e8e_tipu_sultan_road', 'br_1787249357022_510a2e8e', 'Tipu Sultan Road', 'tipu_sultan_road', 149.00, 258, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_university_road', 'br_1787249357022_510a2e8e', 'University Road', 'university_road', 149.00, 259, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_water_pump', 'br_1787249357022_510a2e8e', 'Water Pump', 'water_pump', 149.00, 260, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_yaseenabad', 'br_1787249357022_510a2e8e', 'Yaseenabad', 'yaseenabad', 149.00, 261, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_zamzama', 'br_1787249357022_510a2e8e', 'Zamzama', 'zamzama', 149.00, 262, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1787249357022_510a2e8e_ziauddin_hospital', 'br_1787249357022_510a2e8e', 'Ziauddin Hospital', 'ziauddin_hospital', 149.00, 263, 1, '2026-08-26 23:15:05', '2026-08-26 23:15:05'),
('da_1788020777098_a34fe512_abdullah_goth', 'br_1788020777098_a34fe512', 'Abdullah Goth', 'abdullah_goth', 149.00, 1, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_abul_hassan_isphahani_road', 'br_1788020777098_a34fe512', 'Abul Hassan Isphahani Road', 'abul_hassan_isphahani_road', 149.00, 2, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_airport', 'br_1788020777098_a34fe512', 'Airport', 'airport', 149.00, 3, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_akhtar_colony', 'br_1788020777098_a34fe512', 'Akhtar Colony', 'akhtar_colony', 149.00, 4, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_al_falah_society', 'br_1788020777098_a34fe512', 'Al-Falah Society', 'al_falah_society', 149.00, 5, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_al_hilal_society', 'br_1788020777098_a34fe512', 'Al-Hilal Society', 'al_hilal_society', 149.00, 6, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_allah_wala_town', 'br_1788020777098_a34fe512', 'Allah Wala Town', 'allah_wala_town', 149.00, 7, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_ancholi', 'br_1788020777098_a34fe512', 'Ancholi', 'ancholi', 149.00, 8, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_ashraf_nagar', 'br_1788020777098_a34fe512', 'Ashraf Nagar', 'ashraf_nagar', 149.00, 9, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_askari_1', 'br_1788020777098_a34fe512', 'Askari 1', 'askari_1', 149.00, 10, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_askari_2', 'br_1788020777098_a34fe512', 'Askari 2', 'askari_2', 149.00, 11, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_askari_3', 'br_1788020777098_a34fe512', 'Askari 3', 'askari_3', 149.00, 12, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_askari_4', 'br_1788020777098_a34fe512', 'Askari 4', 'askari_4', 149.00, 13, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_askari_5', 'br_1788020777098_a34fe512', 'Askari 5', 'askari_5', 149.00, 14, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_ayesha_manzil', 'br_1788020777098_a34fe512', 'Ayesha Manzil', 'ayesha_manzil', 149.00, 15, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_azam_basti', 'br_1788020777098_a34fe512', 'Azam Basti', 'azam_basti', 149.00, 16, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_azam_town', 'br_1788020777098_a34fe512', 'Azam Town', 'azam_town', 149.00, 17, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_baba_wilayat_shah_colony', 'br_1788020777098_a34fe512', 'Baba Wilayat Shah Colony', 'baba_wilayat_shah_colony', 149.00, 28, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_babar_market', 'br_1788020777098_a34fe512', 'Babar Market', 'babar_market', 149.00, 18, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_bachayo_narain', 'br_1788020777098_a34fe512', 'Bachayo Narain', 'bachayo_narain', 149.00, 19, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_bagh_e_korangi', 'br_1788020777098_a34fe512', 'Bagh e Korangi', 'bagh_e_korangi', 149.00, 20, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_bahadurabad', 'br_1788020777098_a34fe512', 'Bahadurabad', 'bahadurabad', 149.00, 21, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48');
INSERT INTO `delivery_areas` (`id`, `branch_id`, `name`, `slug`, `charge`, `sort_order`, `enabled`, `created_at`, `updated_at`) VALUES
('da_1788020777098_a34fe512_bahria_town_karachi', 'br_1788020777098_a34fe512', 'Bahria Town Karachi', 'bahria_town_karachi', 149.00, 22, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_baldia_town', 'br_1788020777098_a34fe512', 'Baldia Town', 'baldia_town', 149.00, 23, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_baloch_colony', 'br_1788020777098_a34fe512', 'Baloch Colony', 'baloch_colony', 149.00, 24, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_banaras_colony', 'br_1788020777098_a34fe512', 'Banaras Colony', 'banaras_colony', 149.00, 25, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_bandhani_colony', 'br_1788020777098_a34fe512', 'Bandhani Colony', 'bandhani_colony', 149.00, 26, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_bath_island', 'br_1788020777098_a34fe512', 'Bath Island', 'bath_island', 149.00, 27, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_beacon_house', 'br_1788020777098_a34fe512', 'Beacon House', 'beacon_house', 149.00, 29, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_bhadur_colony', 'br_1788020777098_a34fe512', 'Bhadur Colony', 'bhadur_colony', 149.00, 30, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_bhittaiabad', 'br_1788020777098_a34fe512', 'Bhittaiabad', 'bhittaiabad', 149.00, 31, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_bihar_colony', 'br_1788020777098_a34fe512', 'Bihar Colony', 'bihar_colony', 149.00, 32, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_bizm_e_alam_society', 'br_1788020777098_a34fe512', 'Bizm-e-Alam Society', 'bizm_e_alam_society', 149.00, 33, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_block_1_gulshan_e_iqbal', 'br_1788020777098_a34fe512', 'Block 1 Gulshan-e-Iqbal', 'block_1_gulshan_e_iqbal', 149.00, 34, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_block_10_gulshan_e_iqbal', 'br_1788020777098_a34fe512', 'Block 10 Gulshan-e-Iqbal', 'block_10_gulshan_e_iqbal', 149.00, 43, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_block_11_gulshan_e_iqbal', 'br_1788020777098_a34fe512', 'Block 11 Gulshan-e-Iqbal', 'block_11_gulshan_e_iqbal', 149.00, 44, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_block_12_gulshan_e_iqbal', 'br_1788020777098_a34fe512', 'Block 12 Gulshan-e-Iqbal', 'block_12_gulshan_e_iqbal', 149.00, 45, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_block_13_gulshan_e_iqbal', 'br_1788020777098_a34fe512', 'Block 13 Gulshan-e-Iqbal', 'block_13_gulshan_e_iqbal', 149.00, 46, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_block_14_gulshan_e_iqbal', 'br_1788020777098_a34fe512', 'Block 14 Gulshan-e-Iqbal', 'block_14_gulshan_e_iqbal', 149.00, 47, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_block_15_gulshan_e_iqbal', 'br_1788020777098_a34fe512', 'Block 15 Gulshan-e-Iqbal', 'block_15_gulshan_e_iqbal', 149.00, 48, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_block_16_gulshan_e_iqbal', 'br_1788020777098_a34fe512', 'Block 16 Gulshan-e-Iqbal', 'block_16_gulshan_e_iqbal', 149.00, 49, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_block_17_gulshan_e_iqbal', 'br_1788020777098_a34fe512', 'Block 17 Gulshan-e-Iqbal', 'block_17_gulshan_e_iqbal', 149.00, 50, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_block_18_gulshan_e_iqbal', 'br_1788020777098_a34fe512', 'Block 18 Gulshan-e-Iqbal', 'block_18_gulshan_e_iqbal', 149.00, 51, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_block_2_gulshan_e_iqbal', 'br_1788020777098_a34fe512', 'Block 2 Gulshan-e-Iqbal', 'block_2_gulshan_e_iqbal', 149.00, 35, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_block_3_gulshan_e_iqbal', 'br_1788020777098_a34fe512', 'Block 3 Gulshan-e-Iqbal', 'block_3_gulshan_e_iqbal', 149.00, 36, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_block_4_gulshan_e_iqbal', 'br_1788020777098_a34fe512', 'Block 4 Gulshan-e-Iqbal', 'block_4_gulshan_e_iqbal', 149.00, 37, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_block_5_gulshan_e_iqbal', 'br_1788020777098_a34fe512', 'Block 5 Gulshan-e-Iqbal', 'block_5_gulshan_e_iqbal', 149.00, 38, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_block_6_gulshan_e_iqbal', 'br_1788020777098_a34fe512', 'Block 6 Gulshan-e-Iqbal', 'block_6_gulshan_e_iqbal', 149.00, 39, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_block_7_gulshan_e_iqbal', 'br_1788020777098_a34fe512', 'Block 7 Gulshan-e-Iqbal', 'block_7_gulshan_e_iqbal', 149.00, 40, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_block_8_gulshan_e_iqbal', 'br_1788020777098_a34fe512', 'Block 8 Gulshan-e-Iqbal', 'block_8_gulshan_e_iqbal', 149.00, 41, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_block_9_gulshan_e_iqbal', 'br_1788020777098_a34fe512', 'Block 9 Gulshan-e-Iqbal', 'block_9_gulshan_e_iqbal', 149.00, 42, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_bufferzone', 'br_1788020777098_a34fe512', 'Bufferzone', 'bufferzone', 149.00, 52, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_burns_road', 'br_1788020777098_a34fe512', 'Burns Road', 'burns_road', 149.00, 53, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_cantonment', 'br_1788020777098_a34fe512', 'Cantonment', 'cantonment', 149.00, 54, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_chakra_goth', 'br_1788020777098_a34fe512', 'Chakra Goth', 'chakra_goth', 149.00, 55, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_civil_lines', 'br_1788020777098_a34fe512', 'Civil Lines', 'civil_lines', 149.00, 56, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_clifton_block_1', 'br_1788020777098_a34fe512', 'Clifton Block 1', 'clifton_block_1', 149.00, 57, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_clifton_block_2', 'br_1788020777098_a34fe512', 'Clifton Block 2', 'clifton_block_2', 149.00, 58, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_clifton_block_3', 'br_1788020777098_a34fe512', 'Clifton Block 3', 'clifton_block_3', 149.00, 59, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_clifton_block_4', 'br_1788020777098_a34fe512', 'Clifton Block 4', 'clifton_block_4', 149.00, 60, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_clifton_block_5', 'br_1788020777098_a34fe512', 'Clifton Block 5', 'clifton_block_5', 149.00, 61, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_clifton_block_6', 'br_1788020777098_a34fe512', 'Clifton Block 6', 'clifton_block_6', 149.00, 62, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_clifton_block_7', 'br_1788020777098_a34fe512', 'Clifton Block 7', 'clifton_block_7', 149.00, 63, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_clifton_block_8', 'br_1788020777098_a34fe512', 'Clifton Block 8', 'clifton_block_8', 149.00, 64, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_clifton_block_9', 'br_1788020777098_a34fe512', 'Clifton Block 9', 'clifton_block_9', 149.00, 65, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_darakhshan_society', 'br_1788020777098_a34fe512', 'Darakhshan Society', 'darakhshan_society', 149.00, 75, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_darul_aman_society', 'br_1788020777098_a34fe512', 'Darul Aman Society', 'darul_aman_society', 149.00, 76, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_dastagir', 'br_1788020777098_a34fe512', 'Dastagir', 'dastagir', 149.00, 77, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_defence_view', 'br_1788020777098_a34fe512', 'Defence View', 'defence_view', 149.00, 78, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_delhi_colony', 'br_1788020777098_a34fe512', 'Delhi Colony', 'delhi_colony', 149.00, 79, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_dha_phase_1', 'br_1788020777098_a34fe512', 'DHA Phase 1', 'dha_phase_1', 149.00, 66, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_dha_phase_2', 'br_1788020777098_a34fe512', 'DHA Phase 2', 'dha_phase_2', 149.00, 67, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_dha_phase_2_extension', 'br_1788020777098_a34fe512', 'DHA Phase 2 Extension', 'dha_phase_2_extension', 149.00, 68, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_dha_phase_4', 'br_1788020777098_a34fe512', 'DHA Phase 4', 'dha_phase_4', 149.00, 69, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_dha_phase_5', 'br_1788020777098_a34fe512', 'DHA Phase 5', 'dha_phase_5', 149.00, 70, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_dha_phase_5_extension', 'br_1788020777098_a34fe512', 'DHA Phase 5 Extension', 'dha_phase_5_extension', 149.00, 71, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_dha_phase_6', 'br_1788020777098_a34fe512', 'DHA Phase 6', 'dha_phase_6', 149.00, 72, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_dha_phase_7', 'br_1788020777098_a34fe512', 'DHA Phase 7', 'dha_phase_7', 149.00, 73, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_dha_phase_8', 'br_1788020777098_a34fe512', 'DHA Phase 8', 'dha_phase_8', 149.00, 74, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_dhoraji_colony', 'br_1788020777098_a34fe512', 'Dhoraji Colony', 'dhoraji_colony', 149.00, 80, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_do_talwar', 'br_1788020777098_a34fe512', 'Do Talwar', 'do_talwar', 149.00, 81, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_drigh_road', 'br_1788020777098_a34fe512', 'Drigh Road', 'drigh_road', 149.00, 82, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_eid_gah', 'br_1788020777098_a34fe512', 'Eid Gah', 'eid_gah', 149.00, 83, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_f_b_area_block_1', 'br_1788020777098_a34fe512', 'F.B. Area Block 1', 'f_b_area_block_1', 149.00, 84, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_f_b_area_block_10', 'br_1788020777098_a34fe512', 'F.B. Area Block 10', 'f_b_area_block_10', 149.00, 93, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_f_b_area_block_11', 'br_1788020777098_a34fe512', 'F.B. Area Block 11', 'f_b_area_block_11', 149.00, 94, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_f_b_area_block_12', 'br_1788020777098_a34fe512', 'F.B. Area Block 12', 'f_b_area_block_12', 149.00, 95, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_f_b_area_block_13', 'br_1788020777098_a34fe512', 'F.B. Area Block 13', 'f_b_area_block_13', 149.00, 96, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_f_b_area_block_14', 'br_1788020777098_a34fe512', 'F.B. Area Block 14', 'f_b_area_block_14', 149.00, 97, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_f_b_area_block_15', 'br_1788020777098_a34fe512', 'F.B. Area Block 15', 'f_b_area_block_15', 149.00, 98, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_f_b_area_block_16', 'br_1788020777098_a34fe512', 'F.B. Area Block 16', 'f_b_area_block_16', 149.00, 99, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_f_b_area_block_17', 'br_1788020777098_a34fe512', 'F.B. Area Block 17', 'f_b_area_block_17', 149.00, 100, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_f_b_area_block_18', 'br_1788020777098_a34fe512', 'F.B. Area Block 18', 'f_b_area_block_18', 149.00, 101, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_f_b_area_block_19', 'br_1788020777098_a34fe512', 'F.B. Area Block 19', 'f_b_area_block_19', 149.00, 102, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_f_b_area_block_2', 'br_1788020777098_a34fe512', 'F.B. Area Block 2', 'f_b_area_block_2', 149.00, 85, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_f_b_area_block_20', 'br_1788020777098_a34fe512', 'F.B. Area Block 20', 'f_b_area_block_20', 149.00, 103, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_f_b_area_block_21', 'br_1788020777098_a34fe512', 'F.B. Area Block 21', 'f_b_area_block_21', 149.00, 104, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_f_b_area_block_3', 'br_1788020777098_a34fe512', 'F.B. Area Block 3', 'f_b_area_block_3', 149.00, 86, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_f_b_area_block_4', 'br_1788020777098_a34fe512', 'F.B. Area Block 4', 'f_b_area_block_4', 149.00, 87, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_f_b_area_block_5', 'br_1788020777098_a34fe512', 'F.B. Area Block 5', 'f_b_area_block_5', 149.00, 88, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_f_b_area_block_6', 'br_1788020777098_a34fe512', 'F.B. Area Block 6', 'f_b_area_block_6', 149.00, 89, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_f_b_area_block_7', 'br_1788020777098_a34fe512', 'F.B. Area Block 7', 'f_b_area_block_7', 149.00, 90, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_f_b_area_block_8', 'br_1788020777098_a34fe512', 'F.B. Area Block 8', 'f_b_area_block_8', 149.00, 91, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_f_b_area_block_9', 'br_1788020777098_a34fe512', 'F.B. Area Block 9', 'f_b_area_block_9', 149.00, 92, 1, '2026-08-29 23:14:48', '2026-08-29 23:14:48'),
('da_1788020777098_a34fe512_faisal_cantonment', 'br_1788020777098_a34fe512', 'Faisal Cantonment', 'faisal_cantonment', 149.00, 105, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_farooq_e_azam', 'br_1788020777098_a34fe512', 'Farooq-e-Azam', 'farooq_e_azam', 149.00, 106, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_federal_b_area', 'br_1788020777098_a34fe512', 'Federal B Area', 'federal_b_area', 149.00, 107, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_frere_town', 'br_1788020777098_a34fe512', 'Frere Town', 'frere_town', 149.00, 108, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_garden_east', 'br_1788020777098_a34fe512', 'Garden East', 'garden_east', 149.00, 109, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_garden_west', 'br_1788020777098_a34fe512', 'Garden West', 'garden_west', 149.00, 110, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_gharibabad', 'br_1788020777098_a34fe512', 'Gharibabad', 'gharibabad', 149.00, 111, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_gizri', 'br_1788020777098_a34fe512', 'Gizri', 'gizri', 149.00, 112, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_gizri_boulevard', 'br_1788020777098_a34fe512', 'Gizri Boulevard', 'gizri_boulevard', 149.00, 113, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_gulbahar', 'br_1788020777098_a34fe512', 'Gulbahar', 'gulbahar', 149.00, 114, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_gulberg', 'br_1788020777098_a34fe512', 'Gulberg', 'gulberg', 149.00, 115, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_gulistan_e_johar_block_1', 'br_1788020777098_a34fe512', 'Gulistan-e-Johar Block 1', 'gulistan_e_johar_block_1', 149.00, 116, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_gulistan_e_johar_block_10', 'br_1788020777098_a34fe512', 'Gulistan-e-Johar Block 10', 'gulistan_e_johar_block_10', 149.00, 125, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_gulistan_e_johar_block_11', 'br_1788020777098_a34fe512', 'Gulistan-e-Johar Block 11', 'gulistan_e_johar_block_11', 149.00, 126, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_gulistan_e_johar_block_12', 'br_1788020777098_a34fe512', 'Gulistan-e-Johar Block 12', 'gulistan_e_johar_block_12', 149.00, 127, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_gulistan_e_johar_block_13', 'br_1788020777098_a34fe512', 'Gulistan-e-Johar Block 13', 'gulistan_e_johar_block_13', 149.00, 128, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_gulistan_e_johar_block_14', 'br_1788020777098_a34fe512', 'Gulistan-e-Johar Block 14', 'gulistan_e_johar_block_14', 149.00, 129, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_gulistan_e_johar_block_15', 'br_1788020777098_a34fe512', 'Gulistan-e-Johar Block 15', 'gulistan_e_johar_block_15', 149.00, 130, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_gulistan_e_johar_block_16', 'br_1788020777098_a34fe512', 'Gulistan-e-Johar Block 16', 'gulistan_e_johar_block_16', 149.00, 131, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_gulistan_e_johar_block_17', 'br_1788020777098_a34fe512', 'Gulistan-e-Johar Block 17', 'gulistan_e_johar_block_17', 149.00, 132, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_gulistan_e_johar_block_18', 'br_1788020777098_a34fe512', 'Gulistan-e-Johar Block 18', 'gulistan_e_johar_block_18', 149.00, 133, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_gulistan_e_johar_block_19', 'br_1788020777098_a34fe512', 'Gulistan-e-Johar Block 19', 'gulistan_e_johar_block_19', 149.00, 134, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_gulistan_e_johar_block_2', 'br_1788020777098_a34fe512', 'Gulistan-e-Johar Block 2', 'gulistan_e_johar_block_2', 149.00, 117, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_gulistan_e_johar_block_3', 'br_1788020777098_a34fe512', 'Gulistan-e-Johar Block 3', 'gulistan_e_johar_block_3', 149.00, 118, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_gulistan_e_johar_block_4', 'br_1788020777098_a34fe512', 'Gulistan-e-Johar Block 4', 'gulistan_e_johar_block_4', 149.00, 119, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_gulistan_e_johar_block_5', 'br_1788020777098_a34fe512', 'Gulistan-e-Johar Block 5', 'gulistan_e_johar_block_5', 149.00, 120, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_gulistan_e_johar_block_6', 'br_1788020777098_a34fe512', 'Gulistan-e-Johar Block 6', 'gulistan_e_johar_block_6', 149.00, 121, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_gulistan_e_johar_block_7', 'br_1788020777098_a34fe512', 'Gulistan-e-Johar Block 7', 'gulistan_e_johar_block_7', 149.00, 122, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_gulistan_e_johar_block_8', 'br_1788020777098_a34fe512', 'Gulistan-e-Johar Block 8', 'gulistan_e_johar_block_8', 149.00, 123, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_gulistan_e_johar_block_9', 'br_1788020777098_a34fe512', 'Gulistan-e-Johar Block 9', 'gulistan_e_johar_block_9', 149.00, 124, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_gulshan_e_hadeed', 'br_1788020777098_a34fe512', 'Gulshan-e-Hadeed', 'gulshan_e_hadeed', 149.00, 135, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_gulshan_e_iqbal', 'br_1788020777098_a34fe512', 'Gulshan-e-Iqbal', 'gulshan_e_iqbal', 149.00, 136, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_gulshan_e_jamal', 'br_1788020777098_a34fe512', 'Gulshan-e-Jamal', 'gulshan_e_jamal', 149.00, 137, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_gulshan_e_maymar', 'br_1788020777098_a34fe512', 'Gulshan-e-Maymar', 'gulshan_e_maymar', 149.00, 138, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_gulzar_e_hijri', 'br_1788020777098_a34fe512', 'Gulzar-e-Hijri', 'gulzar_e_hijri', 149.00, 139, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_habib_bank_plaza', 'br_1788020777098_a34fe512', 'Habib Bank Plaza', 'habib_bank_plaza', 149.00, 140, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_hajiyani_goth', 'br_1788020777098_a34fe512', 'Hajiyani Goth', 'hajiyani_goth', 149.00, 141, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_harbour_front', 'br_1788020777098_a34fe512', 'Harbour Front', 'harbour_front', 149.00, 142, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_hill_park', 'br_1788020777098_a34fe512', 'Hill Park', 'hill_park', 149.00, 143, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_holy_family', 'br_1788020777098_a34fe512', 'Holy Family', 'holy_family', 149.00, 144, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_hussainabad', 'br_1788020777098_a34fe512', 'Hussainabad', 'hussainabad', 149.00, 145, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_hyderi', 'br_1788020777098_a34fe512', 'Hyderi', 'hyderi', 149.00, 146, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_i_i_chundrigar_road', 'br_1788020777098_a34fe512', 'I.I. Chundrigar Road', 'i_i_chundrigar_road', 149.00, 147, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_ibrahim_hyderi', 'br_1788020777098_a34fe512', 'Ibrahim Hyderi', 'ibrahim_hyderi', 149.00, 148, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_jamshed_quarters', 'br_1788020777098_a34fe512', 'Jamshed Quarters', 'jamshed_quarters', 149.00, 149, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_jauhar_chowrangi', 'br_1788020777098_a34fe512', 'Jauhar Chowrangi', 'jauhar_chowrangi', 149.00, 150, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_jinnah_terminal', 'br_1788020777098_a34fe512', 'Jinnah Terminal', 'jinnah_terminal', 149.00, 151, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_johar_complex', 'br_1788020777098_a34fe512', 'Johar Complex', 'johar_complex', 149.00, 152, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_kda_scheme_1', 'br_1788020777098_a34fe512', 'KDA Scheme 1', 'kda_scheme_1', 149.00, 153, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_kda_scheme_33', 'br_1788020777098_a34fe512', 'KDA Scheme 33', 'kda_scheme_33', 149.00, 154, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_keamari', 'br_1788020777098_a34fe512', 'Keamari', 'keamari', 149.00, 155, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_kehkashan', 'br_1788020777098_a34fe512', 'Kehkashan', 'kehkashan', 149.00, 156, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_khadda_market', 'br_1788020777098_a34fe512', 'Khadda Market', 'khadda_market', 149.00, 157, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_kharadar', 'br_1788020777098_a34fe512', 'Kharadar', 'kharadar', 149.00, 158, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_khudadad_colony', 'br_1788020777098_a34fe512', 'Khudadad Colony', 'khudadad_colony', 149.00, 159, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_korangi', 'br_1788020777098_a34fe512', 'Korangi', 'korangi', 149.00, 160, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_korangi_crossing', 'br_1788020777098_a34fe512', 'Korangi Crossing', 'korangi_crossing', 149.00, 161, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_korangi_industrial_area', 'br_1788020777098_a34fe512', 'Korangi Industrial Area', 'korangi_industrial_area', 149.00, 162, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_korangi_sector_31', 'br_1788020777098_a34fe512', 'Korangi Sector 31', 'korangi_sector_31', 149.00, 163, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_korangi_sector_32', 'br_1788020777098_a34fe512', 'Korangi Sector 32', 'korangi_sector_32', 149.00, 164, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_korangi_sector_33', 'br_1788020777098_a34fe512', 'Korangi Sector 33', 'korangi_sector_33', 149.00, 165, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_korangi_sector_34', 'br_1788020777098_a34fe512', 'Korangi Sector 34', 'korangi_sector_34', 149.00, 166, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_korangi_sector_35', 'br_1788020777098_a34fe512', 'Korangi Sector 35', 'korangi_sector_35', 149.00, 167, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_korangi_sector_36', 'br_1788020777098_a34fe512', 'Korangi Sector 36', 'korangi_sector_36', 149.00, 168, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_landhi', 'br_1788020777098_a34fe512', 'Landhi', 'landhi', 149.00, 169, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_liaquatabad', 'br_1788020777098_a34fe512', 'Liaquatabad', 'liaquatabad', 149.00, 170, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_lines_area', 'br_1788020777098_a34fe512', 'Lines Area', 'lines_area', 149.00, 171, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_lyari', 'br_1788020777098_a34fe512', 'Lyari', 'lyari', 149.00, 172, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_malir', 'br_1788020777098_a34fe512', 'Malir', 'malir', 149.00, 173, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_malir_cantonment', 'br_1788020777098_a34fe512', 'Malir Cantonment', 'malir_cantonment', 149.00, 174, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_malir_halt', 'br_1788020777098_a34fe512', 'Malir Halt', 'malir_halt', 149.00, 175, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_manzoor_colony', 'br_1788020777098_a34fe512', 'Manzoor Colony', 'manzoor_colony', 149.00, 176, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_maripur', 'br_1788020777098_a34fe512', 'Maripur', 'maripur', 149.00, 177, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_mehmoodabad', 'br_1788020777098_a34fe512', 'Mehmoodabad', 'mehmoodabad', 149.00, 178, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_metroville', 'br_1788020777098_a34fe512', 'Metroville', 'metroville', 149.00, 179, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_millat_nagar', 'br_1788020777098_a34fe512', 'Millat Nagar', 'millat_nagar', 149.00, 180, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_model_colony', 'br_1788020777098_a34fe512', 'Model Colony', 'model_colony', 149.00, 181, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_moinabad', 'br_1788020777098_a34fe512', 'Moinabad', 'moinabad', 149.00, 182, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_mujahid_colony', 'br_1788020777098_a34fe512', 'Mujahid Colony', 'mujahid_colony', 149.00, 183, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_muslim_town', 'br_1788020777098_a34fe512', 'Muslim Town', 'muslim_town', 149.00, 185, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_muslimabad', 'br_1788020777098_a34fe512', 'Muslimabad', 'muslimabad', 149.00, 184, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_national_stadium', 'br_1788020777098_a34fe512', 'National Stadium', 'national_stadium', 149.00, 186, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_nazimabad_1', 'br_1788020777098_a34fe512', 'Nazimabad 1', 'nazimabad_1', 149.00, 187, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_nazimabad_2', 'br_1788020777098_a34fe512', 'Nazimabad 2', 'nazimabad_2', 149.00, 188, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_nazimabad_3', 'br_1788020777098_a34fe512', 'Nazimabad 3', 'nazimabad_3', 149.00, 189, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_nazimabad_4', 'br_1788020777098_a34fe512', 'Nazimabad 4', 'nazimabad_4', 149.00, 190, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_nazimabad_5', 'br_1788020777098_a34fe512', 'Nazimabad 5', 'nazimabad_5', 149.00, 191, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_nazimabad_6', 'br_1788020777098_a34fe512', 'Nazimabad 6', 'nazimabad_6', 149.00, 192, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_nazimabad_7', 'br_1788020777098_a34fe512', 'Nazimabad 7', 'nazimabad_7', 149.00, 193, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_new_karachi', 'br_1788020777098_a34fe512', 'New Karachi', 'new_karachi', 149.00, 194, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_new_town', 'br_1788020777098_a34fe512', 'New Town', 'new_town', 149.00, 195, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_nishat_commercial', 'br_1788020777098_a34fe512', 'Nishat Commercial', 'nishat_commercial', 149.00, 196, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_north_karachi', 'br_1788020777098_a34fe512', 'North Karachi', 'north_karachi', 149.00, 197, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_north_nazimabad_block_a', 'br_1788020777098_a34fe512', 'North Nazimabad Block A', 'north_nazimabad_block_a', 149.00, 198, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_north_nazimabad_block_b', 'br_1788020777098_a34fe512', 'North Nazimabad Block B', 'north_nazimabad_block_b', 149.00, 199, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_north_nazimabad_block_c', 'br_1788020777098_a34fe512', 'North Nazimabad Block C', 'north_nazimabad_block_c', 149.00, 200, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_north_nazimabad_block_d', 'br_1788020777098_a34fe512', 'North Nazimabad Block D', 'north_nazimabad_block_d', 149.00, 201, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_north_nazimabad_block_e', 'br_1788020777098_a34fe512', 'North Nazimabad Block E', 'north_nazimabad_block_e', 149.00, 202, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_north_nazimabad_block_f', 'br_1788020777098_a34fe512', 'North Nazimabad Block F', 'north_nazimabad_block_f', 149.00, 203, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_north_nazimabad_block_g', 'br_1788020777098_a34fe512', 'North Nazimabad Block G', 'north_nazimabad_block_g', 149.00, 204, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_north_nazimabad_block_h', 'br_1788020777098_a34fe512', 'North Nazimabad Block H', 'north_nazimabad_block_h', 149.00, 205, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_north_nazimabad_block_i', 'br_1788020777098_a34fe512', 'North Nazimabad Block I', 'north_nazimabad_block_i', 149.00, 206, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_north_nazimabad_block_j', 'br_1788020777098_a34fe512', 'North Nazimabad Block J', 'north_nazimabad_block_j', 149.00, 207, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_north_nazimabad_block_k', 'br_1788020777098_a34fe512', 'North Nazimabad Block K', 'north_nazimabad_block_k', 149.00, 208, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_north_nazimabad_block_l', 'br_1788020777098_a34fe512', 'North Nazimabad Block L', 'north_nazimabad_block_l', 149.00, 209, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_north_nazimabad_block_m', 'br_1788020777098_a34fe512', 'North Nazimabad Block M', 'north_nazimabad_block_m', 149.00, 210, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_north_nazimabad_block_n', 'br_1788020777098_a34fe512', 'North Nazimabad Block N', 'north_nazimabad_block_n', 149.00, 211, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_north_nazimabad_block_o', 'br_1788020777098_a34fe512', 'North Nazimabad Block O', 'north_nazimabad_block_o', 149.00, 212, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_north_nazimabad_block_p', 'br_1788020777098_a34fe512', 'North Nazimabad Block P', 'north_nazimabad_block_p', 149.00, 213, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_north_nazimabad_block_q', 'br_1788020777098_a34fe512', 'North Nazimabad Block Q', 'north_nazimabad_block_q', 149.00, 214, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_north_nazimabad_block_r', 'br_1788020777098_a34fe512', 'North Nazimabad Block R', 'north_nazimabad_block_r', 149.00, 215, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_north_nazimabad_block_s', 'br_1788020777098_a34fe512', 'North Nazimabad Block S', 'north_nazimabad_block_s', 149.00, 216, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_north_nazimabad_block_t', 'br_1788020777098_a34fe512', 'North Nazimabad Block T', 'north_nazimabad_block_t', 149.00, 217, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_old_town', 'br_1788020777098_a34fe512', 'Old Town', 'old_town', 149.00, 218, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_orangi_town', 'br_1788020777098_a34fe512', 'Orangi Town', 'orangi_town', 149.00, 219, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_p_e_c_h_s_block_1', 'br_1788020777098_a34fe512', 'P.E.C.H.S Block 1', 'p_e_c_h_s_block_1', 149.00, 220, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_p_e_c_h_s_block_2', 'br_1788020777098_a34fe512', 'P.E.C.H.S Block 2', 'p_e_c_h_s_block_2', 149.00, 221, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_p_e_c_h_s_block_3', 'br_1788020777098_a34fe512', 'P.E.C.H.S Block 3', 'p_e_c_h_s_block_3', 149.00, 222, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_p_e_c_h_s_block_4', 'br_1788020777098_a34fe512', 'P.E.C.H.S Block 4', 'p_e_c_h_s_block_4', 149.00, 223, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_p_e_c_h_s_block_5', 'br_1788020777098_a34fe512', 'P.E.C.H.S Block 5', 'p_e_c_h_s_block_5', 149.00, 224, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_p_e_c_h_s_block_6', 'br_1788020777098_a34fe512', 'P.E.C.H.S Block 6', 'p_e_c_h_s_block_6', 149.00, 225, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_pakistan_chowk', 'br_1788020777098_a34fe512', 'Pakistan Chowk', 'pakistan_chowk', 149.00, 226, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_paposh_nagar', 'br_1788020777098_a34fe512', 'Paposh Nagar', 'paposh_nagar', 149.00, 227, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_paradise_point', 'br_1788020777098_a34fe512', 'Paradise Point', 'paradise_point', 149.00, 228, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_patel_para', 'br_1788020777098_a34fe512', 'Patel Para', 'patel_para', 149.00, 229, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_pechs', 'br_1788020777098_a34fe512', 'Pechs', 'pechs', 149.00, 230, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_pns_karsaz', 'br_1788020777098_a34fe512', 'PNS Karsaz', 'pns_karsaz', 149.00, 231, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_port_qasim', 'br_1788020777098_a34fe512', 'Port Qasim', 'port_qasim', 149.00, 232, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_qayyumabad', 'br_1788020777098_a34fe512', 'Qayyumabad', 'qayyumabad', 149.00, 233, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_railway_colony', 'br_1788020777098_a34fe512', 'Railway Colony', 'railway_colony', 149.00, 234, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_ranchore_line', 'br_1788020777098_a34fe512', 'Ranchore Line', 'ranchore_line', 149.00, 235, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_rashid_minhas_road', 'br_1788020777098_a34fe512', 'Rashid Minhas Road', 'rashid_minhas_road', 149.00, 236, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_rehmani_goth', 'br_1788020777098_a34fe512', 'Rehmani Goth', 'rehmani_goth', 149.00, 237, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_rizvia_society', 'br_1788020777098_a34fe512', 'Rizvia Society', 'rizvia_society', 149.00, 238, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_saddar', 'br_1788020777098_a34fe512', 'Saddar', 'saddar', 149.00, 239, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_safoora_goth', 'br_1788020777098_a34fe512', 'Safoora Goth', 'safoora_goth', 149.00, 240, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_sakhi_hassan', 'br_1788020777098_a34fe512', 'Sakhi Hassan', 'sakhi_hassan', 149.00, 241, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_shah_faisal_colony', 'br_1788020777098_a34fe512', 'Shah Faisal Colony', 'shah_faisal_colony', 149.00, 242, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_shah_latif_town', 'br_1788020777098_a34fe512', 'Shah Latif Town', 'shah_latif_town', 149.00, 243, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_shahrah_e_faisal', 'br_1788020777098_a34fe512', 'Shahrah-e-Faisal', 'shahrah_e_faisal', 149.00, 244, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_shahrah_e_quaideen', 'br_1788020777098_a34fe512', 'Shahrah-e-Quaideen', 'shahrah_e_quaideen', 149.00, 245, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_sharafi_goth', 'br_1788020777098_a34fe512', 'Sharafi Goth', 'sharafi_goth', 149.00, 246, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_sharfabad', 'br_1788020777098_a34fe512', 'Sharfabad', 'sharfabad', 149.00, 247, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_shepherd_street', 'br_1788020777098_a34fe512', 'Shepherd Street', 'shepherd_street', 149.00, 248, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_shipowner_college', 'br_1788020777098_a34fe512', 'Shipowner College', 'shipowner_college', 149.00, 249, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_sindhi_muslim_society', 'br_1788020777098_a34fe512', 'Sindhi Muslim Society', 'sindhi_muslim_society', 149.00, 250, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_sohrab_goth', 'br_1788020777098_a34fe512', 'Sohrab Goth', 'sohrab_goth', 149.00, 251, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_soldier_bazaar', 'br_1788020777098_a34fe512', 'Soldier Bazaar', 'soldier_bazaar', 149.00, 252, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_star_gate', 'br_1788020777098_a34fe512', 'Star Gate', 'star_gate', 149.00, 253, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_steel_town', 'br_1788020777098_a34fe512', 'Steel Town', 'steel_town', 149.00, 254, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_super_highway', 'br_1788020777098_a34fe512', 'Super Highway', 'super_highway', 149.00, 255, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_surjani_town', 'br_1788020777098_a34fe512', 'Surjani Town', 'surjani_town', 149.00, 256, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_tariq_road', 'br_1788020777098_a34fe512', 'Tariq Road', 'tariq_road', 149.00, 257, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_tipu_sultan_road', 'br_1788020777098_a34fe512', 'Tipu Sultan Road', 'tipu_sultan_road', 149.00, 258, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_university_road', 'br_1788020777098_a34fe512', 'University Road', 'university_road', 149.00, 259, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_water_pump', 'br_1788020777098_a34fe512', 'Water Pump', 'water_pump', 149.00, 260, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_yaseenabad', 'br_1788020777098_a34fe512', 'Yaseenabad', 'yaseenabad', 149.00, 261, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_zamzama', 'br_1788020777098_a34fe512', 'Zamzama', 'zamzama', 149.00, 262, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788020777098_a34fe512_ziauddin_hospital', 'br_1788020777098_a34fe512', 'Ziauddin Hospital', 'ziauddin_hospital', 149.00, 263, 1, '2026-08-29 23:14:49', '2026-08-29 23:14:49'),
('da_1788026544351_51d763a8_abdullah_goth', 'br_1788026544351_51d763a8', 'Abdullah Goth', 'abdullah_goth', 149.00, 1, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_abul_hassan_isphahani_road', 'br_1788026544351_51d763a8', 'Abul Hassan Isphahani Road', 'abul_hassan_isphahani_road', 149.00, 2, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_airport', 'br_1788026544351_51d763a8', 'Airport', 'airport', 149.00, 3, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_akhtar_colony', 'br_1788026544351_51d763a8', 'Akhtar Colony', 'akhtar_colony', 149.00, 4, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_al_falah_society', 'br_1788026544351_51d763a8', 'Al-Falah Society', 'al_falah_society', 149.00, 5, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_al_hilal_society', 'br_1788026544351_51d763a8', 'Al-Hilal Society', 'al_hilal_society', 149.00, 6, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_allah_wala_town', 'br_1788026544351_51d763a8', 'Allah Wala Town', 'allah_wala_town', 149.00, 7, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_ancholi', 'br_1788026544351_51d763a8', 'Ancholi', 'ancholi', 149.00, 8, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_ashraf_nagar', 'br_1788026544351_51d763a8', 'Ashraf Nagar', 'ashraf_nagar', 149.00, 9, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_askari_1', 'br_1788026544351_51d763a8', 'Askari 1', 'askari_1', 149.00, 10, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_askari_2', 'br_1788026544351_51d763a8', 'Askari 2', 'askari_2', 149.00, 11, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_askari_3', 'br_1788026544351_51d763a8', 'Askari 3', 'askari_3', 149.00, 12, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_askari_4', 'br_1788026544351_51d763a8', 'Askari 4', 'askari_4', 149.00, 13, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_askari_5', 'br_1788026544351_51d763a8', 'Askari 5', 'askari_5', 149.00, 14, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_ayesha_manzil', 'br_1788026544351_51d763a8', 'Ayesha Manzil', 'ayesha_manzil', 149.00, 15, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_azam_basti', 'br_1788026544351_51d763a8', 'Azam Basti', 'azam_basti', 149.00, 16, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_azam_town', 'br_1788026544351_51d763a8', 'Azam Town', 'azam_town', 149.00, 17, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_baba_wilayat_shah_colony', 'br_1788026544351_51d763a8', 'Baba Wilayat Shah Colony', 'baba_wilayat_shah_colony', 149.00, 28, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_babar_market', 'br_1788026544351_51d763a8', 'Babar Market', 'babar_market', 149.00, 18, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_bachayo_narain', 'br_1788026544351_51d763a8', 'Bachayo Narain', 'bachayo_narain', 149.00, 19, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_bagh_e_korangi', 'br_1788026544351_51d763a8', 'Bagh e Korangi', 'bagh_e_korangi', 149.00, 20, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_bahadurabad', 'br_1788026544351_51d763a8', 'Bahadurabad', 'bahadurabad', 149.00, 21, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_bahria_town_karachi', 'br_1788026544351_51d763a8', 'Bahria Town Karachi', 'bahria_town_karachi', 149.00, 22, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_baldia_town', 'br_1788026544351_51d763a8', 'Baldia Town', 'baldia_town', 149.00, 23, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_baloch_colony', 'br_1788026544351_51d763a8', 'Baloch Colony', 'baloch_colony', 149.00, 24, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_banaras_colony', 'br_1788026544351_51d763a8', 'Banaras Colony', 'banaras_colony', 149.00, 25, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_bandhani_colony', 'br_1788026544351_51d763a8', 'Bandhani Colony', 'bandhani_colony', 149.00, 26, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_bath_island', 'br_1788026544351_51d763a8', 'Bath Island', 'bath_island', 149.00, 27, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_beacon_house', 'br_1788026544351_51d763a8', 'Beacon House', 'beacon_house', 149.00, 29, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_bhadur_colony', 'br_1788026544351_51d763a8', 'Bhadur Colony', 'bhadur_colony', 149.00, 30, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_bhittaiabad', 'br_1788026544351_51d763a8', 'Bhittaiabad', 'bhittaiabad', 149.00, 31, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_bihar_colony', 'br_1788026544351_51d763a8', 'Bihar Colony', 'bihar_colony', 149.00, 32, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_bizm_e_alam_society', 'br_1788026544351_51d763a8', 'Bizm-e-Alam Society', 'bizm_e_alam_society', 149.00, 33, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_block_1_gulshan_e_iqbal', 'br_1788026544351_51d763a8', 'Block 1 Gulshan-e-Iqbal', 'block_1_gulshan_e_iqbal', 149.00, 34, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_block_10_gulshan_e_iqbal', 'br_1788026544351_51d763a8', 'Block 10 Gulshan-e-Iqbal', 'block_10_gulshan_e_iqbal', 149.00, 43, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_block_11_gulshan_e_iqbal', 'br_1788026544351_51d763a8', 'Block 11 Gulshan-e-Iqbal', 'block_11_gulshan_e_iqbal', 149.00, 44, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_block_12_gulshan_e_iqbal', 'br_1788026544351_51d763a8', 'Block 12 Gulshan-e-Iqbal', 'block_12_gulshan_e_iqbal', 149.00, 45, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_block_13_gulshan_e_iqbal', 'br_1788026544351_51d763a8', 'Block 13 Gulshan-e-Iqbal', 'block_13_gulshan_e_iqbal', 149.00, 46, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_block_14_gulshan_e_iqbal', 'br_1788026544351_51d763a8', 'Block 14 Gulshan-e-Iqbal', 'block_14_gulshan_e_iqbal', 149.00, 47, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_block_15_gulshan_e_iqbal', 'br_1788026544351_51d763a8', 'Block 15 Gulshan-e-Iqbal', 'block_15_gulshan_e_iqbal', 149.00, 48, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_block_16_gulshan_e_iqbal', 'br_1788026544351_51d763a8', 'Block 16 Gulshan-e-Iqbal', 'block_16_gulshan_e_iqbal', 149.00, 49, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_block_17_gulshan_e_iqbal', 'br_1788026544351_51d763a8', 'Block 17 Gulshan-e-Iqbal', 'block_17_gulshan_e_iqbal', 149.00, 50, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_block_18_gulshan_e_iqbal', 'br_1788026544351_51d763a8', 'Block 18 Gulshan-e-Iqbal', 'block_18_gulshan_e_iqbal', 149.00, 51, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03');
INSERT INTO `delivery_areas` (`id`, `branch_id`, `name`, `slug`, `charge`, `sort_order`, `enabled`, `created_at`, `updated_at`) VALUES
('da_1788026544351_51d763a8_block_2_gulshan_e_iqbal', 'br_1788026544351_51d763a8', 'Block 2 Gulshan-e-Iqbal', 'block_2_gulshan_e_iqbal', 149.00, 35, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_block_3_gulshan_e_iqbal', 'br_1788026544351_51d763a8', 'Block 3 Gulshan-e-Iqbal', 'block_3_gulshan_e_iqbal', 149.00, 36, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_block_4_gulshan_e_iqbal', 'br_1788026544351_51d763a8', 'Block 4 Gulshan-e-Iqbal', 'block_4_gulshan_e_iqbal', 149.00, 37, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_block_5_gulshan_e_iqbal', 'br_1788026544351_51d763a8', 'Block 5 Gulshan-e-Iqbal', 'block_5_gulshan_e_iqbal', 149.00, 38, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_block_6_gulshan_e_iqbal', 'br_1788026544351_51d763a8', 'Block 6 Gulshan-e-Iqbal', 'block_6_gulshan_e_iqbal', 149.00, 39, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_block_7_gulshan_e_iqbal', 'br_1788026544351_51d763a8', 'Block 7 Gulshan-e-Iqbal', 'block_7_gulshan_e_iqbal', 149.00, 40, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_block_8_gulshan_e_iqbal', 'br_1788026544351_51d763a8', 'Block 8 Gulshan-e-Iqbal', 'block_8_gulshan_e_iqbal', 149.00, 41, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_block_9_gulshan_e_iqbal', 'br_1788026544351_51d763a8', 'Block 9 Gulshan-e-Iqbal', 'block_9_gulshan_e_iqbal', 149.00, 42, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_bufferzone', 'br_1788026544351_51d763a8', 'Bufferzone', 'bufferzone', 149.00, 52, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_burns_road', 'br_1788026544351_51d763a8', 'Burns Road', 'burns_road', 149.00, 53, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_cantonment', 'br_1788026544351_51d763a8', 'Cantonment', 'cantonment', 149.00, 54, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_chakra_goth', 'br_1788026544351_51d763a8', 'Chakra Goth', 'chakra_goth', 149.00, 55, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_civil_lines', 'br_1788026544351_51d763a8', 'Civil Lines', 'civil_lines', 149.00, 56, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_clifton_block_1', 'br_1788026544351_51d763a8', 'Clifton Block 1', 'clifton_block_1', 149.00, 57, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_clifton_block_2', 'br_1788026544351_51d763a8', 'Clifton Block 2', 'clifton_block_2', 149.00, 58, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_clifton_block_3', 'br_1788026544351_51d763a8', 'Clifton Block 3', 'clifton_block_3', 149.00, 59, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_clifton_block_4', 'br_1788026544351_51d763a8', 'Clifton Block 4', 'clifton_block_4', 149.00, 60, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_clifton_block_5', 'br_1788026544351_51d763a8', 'Clifton Block 5', 'clifton_block_5', 149.00, 61, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_clifton_block_6', 'br_1788026544351_51d763a8', 'Clifton Block 6', 'clifton_block_6', 149.00, 62, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_clifton_block_7', 'br_1788026544351_51d763a8', 'Clifton Block 7', 'clifton_block_7', 149.00, 63, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_clifton_block_8', 'br_1788026544351_51d763a8', 'Clifton Block 8', 'clifton_block_8', 149.00, 64, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_clifton_block_9', 'br_1788026544351_51d763a8', 'Clifton Block 9', 'clifton_block_9', 149.00, 65, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_darakhshan_society', 'br_1788026544351_51d763a8', 'Darakhshan Society', 'darakhshan_society', 149.00, 75, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_darul_aman_society', 'br_1788026544351_51d763a8', 'Darul Aman Society', 'darul_aman_society', 149.00, 76, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_dastagir', 'br_1788026544351_51d763a8', 'Dastagir', 'dastagir', 149.00, 77, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_defence_view', 'br_1788026544351_51d763a8', 'Defence View', 'defence_view', 149.00, 78, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_delhi_colony', 'br_1788026544351_51d763a8', 'Delhi Colony', 'delhi_colony', 149.00, 79, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_dha_phase_1', 'br_1788026544351_51d763a8', 'DHA Phase 1', 'dha_phase_1', 149.00, 66, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_dha_phase_2', 'br_1788026544351_51d763a8', 'DHA Phase 2', 'dha_phase_2', 149.00, 67, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_dha_phase_2_extension', 'br_1788026544351_51d763a8', 'DHA Phase 2 Extension', 'dha_phase_2_extension', 149.00, 68, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_dha_phase_4', 'br_1788026544351_51d763a8', 'DHA Phase 4', 'dha_phase_4', 149.00, 69, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_dha_phase_5', 'br_1788026544351_51d763a8', 'DHA Phase 5', 'dha_phase_5', 149.00, 70, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_dha_phase_5_extension', 'br_1788026544351_51d763a8', 'DHA Phase 5 Extension', 'dha_phase_5_extension', 149.00, 71, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_dha_phase_6', 'br_1788026544351_51d763a8', 'DHA Phase 6', 'dha_phase_6', 149.00, 72, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_dha_phase_7', 'br_1788026544351_51d763a8', 'DHA Phase 7', 'dha_phase_7', 149.00, 73, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_dha_phase_8', 'br_1788026544351_51d763a8', 'DHA Phase 8', 'dha_phase_8', 149.00, 74, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_dhoraji_colony', 'br_1788026544351_51d763a8', 'Dhoraji Colony', 'dhoraji_colony', 149.00, 80, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_do_talwar', 'br_1788026544351_51d763a8', 'Do Talwar', 'do_talwar', 149.00, 81, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_drigh_road', 'br_1788026544351_51d763a8', 'Drigh Road', 'drigh_road', 149.00, 82, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_eid_gah', 'br_1788026544351_51d763a8', 'Eid Gah', 'eid_gah', 149.00, 83, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_f_b_area_block_1', 'br_1788026544351_51d763a8', 'F.B. Area Block 1', 'f_b_area_block_1', 149.00, 84, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_f_b_area_block_10', 'br_1788026544351_51d763a8', 'F.B. Area Block 10', 'f_b_area_block_10', 149.00, 93, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_f_b_area_block_11', 'br_1788026544351_51d763a8', 'F.B. Area Block 11', 'f_b_area_block_11', 149.00, 94, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_f_b_area_block_12', 'br_1788026544351_51d763a8', 'F.B. Area Block 12', 'f_b_area_block_12', 149.00, 95, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_f_b_area_block_13', 'br_1788026544351_51d763a8', 'F.B. Area Block 13', 'f_b_area_block_13', 149.00, 96, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_f_b_area_block_14', 'br_1788026544351_51d763a8', 'F.B. Area Block 14', 'f_b_area_block_14', 149.00, 97, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_f_b_area_block_15', 'br_1788026544351_51d763a8', 'F.B. Area Block 15', 'f_b_area_block_15', 149.00, 98, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_f_b_area_block_16', 'br_1788026544351_51d763a8', 'F.B. Area Block 16', 'f_b_area_block_16', 149.00, 99, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_f_b_area_block_17', 'br_1788026544351_51d763a8', 'F.B. Area Block 17', 'f_b_area_block_17', 149.00, 100, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_f_b_area_block_18', 'br_1788026544351_51d763a8', 'F.B. Area Block 18', 'f_b_area_block_18', 149.00, 101, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_f_b_area_block_19', 'br_1788026544351_51d763a8', 'F.B. Area Block 19', 'f_b_area_block_19', 149.00, 102, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_f_b_area_block_2', 'br_1788026544351_51d763a8', 'F.B. Area Block 2', 'f_b_area_block_2', 149.00, 85, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_f_b_area_block_20', 'br_1788026544351_51d763a8', 'F.B. Area Block 20', 'f_b_area_block_20', 149.00, 103, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_f_b_area_block_21', 'br_1788026544351_51d763a8', 'F.B. Area Block 21', 'f_b_area_block_21', 149.00, 104, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_f_b_area_block_3', 'br_1788026544351_51d763a8', 'F.B. Area Block 3', 'f_b_area_block_3', 149.00, 86, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_f_b_area_block_4', 'br_1788026544351_51d763a8', 'F.B. Area Block 4', 'f_b_area_block_4', 149.00, 87, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_f_b_area_block_5', 'br_1788026544351_51d763a8', 'F.B. Area Block 5', 'f_b_area_block_5', 149.00, 88, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_f_b_area_block_6', 'br_1788026544351_51d763a8', 'F.B. Area Block 6', 'f_b_area_block_6', 149.00, 89, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_f_b_area_block_7', 'br_1788026544351_51d763a8', 'F.B. Area Block 7', 'f_b_area_block_7', 149.00, 90, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_f_b_area_block_8', 'br_1788026544351_51d763a8', 'F.B. Area Block 8', 'f_b_area_block_8', 149.00, 91, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_f_b_area_block_9', 'br_1788026544351_51d763a8', 'F.B. Area Block 9', 'f_b_area_block_9', 149.00, 92, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_faisal_cantonment', 'br_1788026544351_51d763a8', 'Faisal Cantonment', 'faisal_cantonment', 149.00, 105, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_farooq_e_azam', 'br_1788026544351_51d763a8', 'Farooq-e-Azam', 'farooq_e_azam', 149.00, 106, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_federal_b_area', 'br_1788026544351_51d763a8', 'Federal B Area', 'federal_b_area', 149.00, 107, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_frere_town', 'br_1788026544351_51d763a8', 'Frere Town', 'frere_town', 149.00, 108, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_garden_east', 'br_1788026544351_51d763a8', 'Garden East', 'garden_east', 149.00, 109, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_garden_west', 'br_1788026544351_51d763a8', 'Garden West', 'garden_west', 149.00, 110, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_gharibabad', 'br_1788026544351_51d763a8', 'Gharibabad', 'gharibabad', 149.00, 111, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_gizri', 'br_1788026544351_51d763a8', 'Gizri', 'gizri', 149.00, 112, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_gizri_boulevard', 'br_1788026544351_51d763a8', 'Gizri Boulevard', 'gizri_boulevard', 149.00, 113, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_gulbahar', 'br_1788026544351_51d763a8', 'Gulbahar', 'gulbahar', 149.00, 114, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_gulberg', 'br_1788026544351_51d763a8', 'Gulberg', 'gulberg', 149.00, 115, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_gulistan_e_johar_block_1', 'br_1788026544351_51d763a8', 'Gulistan-e-Johar Block 1', 'gulistan_e_johar_block_1', 149.00, 116, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_gulistan_e_johar_block_10', 'br_1788026544351_51d763a8', 'Gulistan-e-Johar Block 10', 'gulistan_e_johar_block_10', 149.00, 125, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_gulistan_e_johar_block_11', 'br_1788026544351_51d763a8', 'Gulistan-e-Johar Block 11', 'gulistan_e_johar_block_11', 149.00, 126, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_gulistan_e_johar_block_12', 'br_1788026544351_51d763a8', 'Gulistan-e-Johar Block 12', 'gulistan_e_johar_block_12', 149.00, 127, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_gulistan_e_johar_block_13', 'br_1788026544351_51d763a8', 'Gulistan-e-Johar Block 13', 'gulistan_e_johar_block_13', 149.00, 128, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_gulistan_e_johar_block_14', 'br_1788026544351_51d763a8', 'Gulistan-e-Johar Block 14', 'gulistan_e_johar_block_14', 149.00, 129, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_gulistan_e_johar_block_15', 'br_1788026544351_51d763a8', 'Gulistan-e-Johar Block 15', 'gulistan_e_johar_block_15', 149.00, 130, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_gulistan_e_johar_block_16', 'br_1788026544351_51d763a8', 'Gulistan-e-Johar Block 16', 'gulistan_e_johar_block_16', 149.00, 131, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_gulistan_e_johar_block_17', 'br_1788026544351_51d763a8', 'Gulistan-e-Johar Block 17', 'gulistan_e_johar_block_17', 149.00, 132, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_gulistan_e_johar_block_18', 'br_1788026544351_51d763a8', 'Gulistan-e-Johar Block 18', 'gulistan_e_johar_block_18', 149.00, 133, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_gulistan_e_johar_block_19', 'br_1788026544351_51d763a8', 'Gulistan-e-Johar Block 19', 'gulistan_e_johar_block_19', 149.00, 134, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_gulistan_e_johar_block_2', 'br_1788026544351_51d763a8', 'Gulistan-e-Johar Block 2', 'gulistan_e_johar_block_2', 149.00, 117, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_gulistan_e_johar_block_3', 'br_1788026544351_51d763a8', 'Gulistan-e-Johar Block 3', 'gulistan_e_johar_block_3', 149.00, 118, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_gulistan_e_johar_block_4', 'br_1788026544351_51d763a8', 'Gulistan-e-Johar Block 4', 'gulistan_e_johar_block_4', 149.00, 119, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_gulistan_e_johar_block_5', 'br_1788026544351_51d763a8', 'Gulistan-e-Johar Block 5', 'gulistan_e_johar_block_5', 149.00, 120, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_gulistan_e_johar_block_6', 'br_1788026544351_51d763a8', 'Gulistan-e-Johar Block 6', 'gulistan_e_johar_block_6', 149.00, 121, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_gulistan_e_johar_block_7', 'br_1788026544351_51d763a8', 'Gulistan-e-Johar Block 7', 'gulistan_e_johar_block_7', 149.00, 122, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_gulistan_e_johar_block_8', 'br_1788026544351_51d763a8', 'Gulistan-e-Johar Block 8', 'gulistan_e_johar_block_8', 149.00, 123, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_gulistan_e_johar_block_9', 'br_1788026544351_51d763a8', 'Gulistan-e-Johar Block 9', 'gulistan_e_johar_block_9', 149.00, 124, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_gulshan_e_hadeed', 'br_1788026544351_51d763a8', 'Gulshan-e-Hadeed', 'gulshan_e_hadeed', 149.00, 135, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_gulshan_e_iqbal', 'br_1788026544351_51d763a8', 'Gulshan-e-Iqbal', 'gulshan_e_iqbal', 149.00, 136, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_gulshan_e_jamal', 'br_1788026544351_51d763a8', 'Gulshan-e-Jamal', 'gulshan_e_jamal', 149.00, 137, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_gulshan_e_maymar', 'br_1788026544351_51d763a8', 'Gulshan-e-Maymar', 'gulshan_e_maymar', 149.00, 138, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_gulzar_e_hijri', 'br_1788026544351_51d763a8', 'Gulzar-e-Hijri', 'gulzar_e_hijri', 149.00, 139, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_habib_bank_plaza', 'br_1788026544351_51d763a8', 'Habib Bank Plaza', 'habib_bank_plaza', 149.00, 140, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_hajiyani_goth', 'br_1788026544351_51d763a8', 'Hajiyani Goth', 'hajiyani_goth', 149.00, 141, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_harbour_front', 'br_1788026544351_51d763a8', 'Harbour Front', 'harbour_front', 149.00, 142, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_hill_park', 'br_1788026544351_51d763a8', 'Hill Park', 'hill_park', 149.00, 143, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_holy_family', 'br_1788026544351_51d763a8', 'Holy Family', 'holy_family', 149.00, 144, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_hussainabad', 'br_1788026544351_51d763a8', 'Hussainabad', 'hussainabad', 149.00, 145, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_hyderi', 'br_1788026544351_51d763a8', 'Hyderi', 'hyderi', 149.00, 146, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_i_i_chundrigar_road', 'br_1788026544351_51d763a8', 'I.I. Chundrigar Road', 'i_i_chundrigar_road', 149.00, 147, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_ibrahim_hyderi', 'br_1788026544351_51d763a8', 'Ibrahim Hyderi', 'ibrahim_hyderi', 149.00, 148, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_jamshed_quarters', 'br_1788026544351_51d763a8', 'Jamshed Quarters', 'jamshed_quarters', 149.00, 149, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_jauhar_chowrangi', 'br_1788026544351_51d763a8', 'Jauhar Chowrangi', 'jauhar_chowrangi', 149.00, 150, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_jinnah_terminal', 'br_1788026544351_51d763a8', 'Jinnah Terminal', 'jinnah_terminal', 149.00, 151, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_johar_complex', 'br_1788026544351_51d763a8', 'Johar Complex', 'johar_complex', 149.00, 152, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_kda_scheme_1', 'br_1788026544351_51d763a8', 'KDA Scheme 1', 'kda_scheme_1', 149.00, 153, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_kda_scheme_33', 'br_1788026544351_51d763a8', 'KDA Scheme 33', 'kda_scheme_33', 149.00, 154, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_keamari', 'br_1788026544351_51d763a8', 'Keamari', 'keamari', 149.00, 155, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_kehkashan', 'br_1788026544351_51d763a8', 'Kehkashan', 'kehkashan', 149.00, 156, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_khadda_market', 'br_1788026544351_51d763a8', 'Khadda Market', 'khadda_market', 149.00, 157, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_kharadar', 'br_1788026544351_51d763a8', 'Kharadar', 'kharadar', 149.00, 158, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_khudadad_colony', 'br_1788026544351_51d763a8', 'Khudadad Colony', 'khudadad_colony', 149.00, 159, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_korangi', 'br_1788026544351_51d763a8', 'Korangi', 'korangi', 149.00, 160, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_korangi_crossing', 'br_1788026544351_51d763a8', 'Korangi Crossing', 'korangi_crossing', 149.00, 161, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_korangi_industrial_area', 'br_1788026544351_51d763a8', 'Korangi Industrial Area', 'korangi_industrial_area', 149.00, 162, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_korangi_sector_31', 'br_1788026544351_51d763a8', 'Korangi Sector 31', 'korangi_sector_31', 149.00, 163, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_korangi_sector_32', 'br_1788026544351_51d763a8', 'Korangi Sector 32', 'korangi_sector_32', 149.00, 164, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_korangi_sector_33', 'br_1788026544351_51d763a8', 'Korangi Sector 33', 'korangi_sector_33', 149.00, 165, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_korangi_sector_34', 'br_1788026544351_51d763a8', 'Korangi Sector 34', 'korangi_sector_34', 149.00, 166, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_korangi_sector_35', 'br_1788026544351_51d763a8', 'Korangi Sector 35', 'korangi_sector_35', 149.00, 167, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_korangi_sector_36', 'br_1788026544351_51d763a8', 'Korangi Sector 36', 'korangi_sector_36', 149.00, 168, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_landhi', 'br_1788026544351_51d763a8', 'Landhi', 'landhi', 149.00, 169, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_liaquatabad', 'br_1788026544351_51d763a8', 'Liaquatabad', 'liaquatabad', 149.00, 170, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_lines_area', 'br_1788026544351_51d763a8', 'Lines Area', 'lines_area', 149.00, 171, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_lyari', 'br_1788026544351_51d763a8', 'Lyari', 'lyari', 149.00, 172, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_malir', 'br_1788026544351_51d763a8', 'Malir', 'malir', 149.00, 173, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_malir_cantonment', 'br_1788026544351_51d763a8', 'Malir Cantonment', 'malir_cantonment', 149.00, 174, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_malir_halt', 'br_1788026544351_51d763a8', 'Malir Halt', 'malir_halt', 149.00, 175, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_manzoor_colony', 'br_1788026544351_51d763a8', 'Manzoor Colony', 'manzoor_colony', 149.00, 176, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_maripur', 'br_1788026544351_51d763a8', 'Maripur', 'maripur', 149.00, 177, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_mehmoodabad', 'br_1788026544351_51d763a8', 'Mehmoodabad', 'mehmoodabad', 149.00, 178, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_metroville', 'br_1788026544351_51d763a8', 'Metroville', 'metroville', 149.00, 179, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_millat_nagar', 'br_1788026544351_51d763a8', 'Millat Nagar', 'millat_nagar', 149.00, 180, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_model_colony', 'br_1788026544351_51d763a8', 'Model Colony', 'model_colony', 149.00, 181, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_moinabad', 'br_1788026544351_51d763a8', 'Moinabad', 'moinabad', 149.00, 182, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_mujahid_colony', 'br_1788026544351_51d763a8', 'Mujahid Colony', 'mujahid_colony', 149.00, 183, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_muslim_town', 'br_1788026544351_51d763a8', 'Muslim Town', 'muslim_town', 149.00, 185, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_muslimabad', 'br_1788026544351_51d763a8', 'Muslimabad', 'muslimabad', 149.00, 184, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_national_stadium', 'br_1788026544351_51d763a8', 'National Stadium', 'national_stadium', 149.00, 186, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_nazimabad_1', 'br_1788026544351_51d763a8', 'Nazimabad 1', 'nazimabad_1', 149.00, 187, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_nazimabad_2', 'br_1788026544351_51d763a8', 'Nazimabad 2', 'nazimabad_2', 149.00, 188, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_nazimabad_3', 'br_1788026544351_51d763a8', 'Nazimabad 3', 'nazimabad_3', 149.00, 189, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_nazimabad_4', 'br_1788026544351_51d763a8', 'Nazimabad 4', 'nazimabad_4', 149.00, 190, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_nazimabad_5', 'br_1788026544351_51d763a8', 'Nazimabad 5', 'nazimabad_5', 149.00, 191, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_nazimabad_6', 'br_1788026544351_51d763a8', 'Nazimabad 6', 'nazimabad_6', 149.00, 192, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_nazimabad_7', 'br_1788026544351_51d763a8', 'Nazimabad 7', 'nazimabad_7', 149.00, 193, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_new_karachi', 'br_1788026544351_51d763a8', 'New Karachi', 'new_karachi', 149.00, 194, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_new_town', 'br_1788026544351_51d763a8', 'New Town', 'new_town', 149.00, 195, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_nishat_commercial', 'br_1788026544351_51d763a8', 'Nishat Commercial', 'nishat_commercial', 149.00, 196, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_north_karachi', 'br_1788026544351_51d763a8', 'North Karachi', 'north_karachi', 149.00, 197, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_north_nazimabad_block_a', 'br_1788026544351_51d763a8', 'North Nazimabad Block A', 'north_nazimabad_block_a', 149.00, 198, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_north_nazimabad_block_b', 'br_1788026544351_51d763a8', 'North Nazimabad Block B', 'north_nazimabad_block_b', 149.00, 199, 1, '2026-08-29 23:18:03', '2026-08-29 23:18:03'),
('da_1788026544351_51d763a8_north_nazimabad_block_c', 'br_1788026544351_51d763a8', 'North Nazimabad Block C', 'north_nazimabad_block_c', 149.00, 200, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_north_nazimabad_block_d', 'br_1788026544351_51d763a8', 'North Nazimabad Block D', 'north_nazimabad_block_d', 149.00, 201, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_north_nazimabad_block_e', 'br_1788026544351_51d763a8', 'North Nazimabad Block E', 'north_nazimabad_block_e', 149.00, 202, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_north_nazimabad_block_f', 'br_1788026544351_51d763a8', 'North Nazimabad Block F', 'north_nazimabad_block_f', 149.00, 203, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_north_nazimabad_block_g', 'br_1788026544351_51d763a8', 'North Nazimabad Block G', 'north_nazimabad_block_g', 149.00, 204, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_north_nazimabad_block_h', 'br_1788026544351_51d763a8', 'North Nazimabad Block H', 'north_nazimabad_block_h', 149.00, 205, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_north_nazimabad_block_i', 'br_1788026544351_51d763a8', 'North Nazimabad Block I', 'north_nazimabad_block_i', 149.00, 206, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_north_nazimabad_block_j', 'br_1788026544351_51d763a8', 'North Nazimabad Block J', 'north_nazimabad_block_j', 149.00, 207, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_north_nazimabad_block_k', 'br_1788026544351_51d763a8', 'North Nazimabad Block K', 'north_nazimabad_block_k', 149.00, 208, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_north_nazimabad_block_l', 'br_1788026544351_51d763a8', 'North Nazimabad Block L', 'north_nazimabad_block_l', 149.00, 209, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_north_nazimabad_block_m', 'br_1788026544351_51d763a8', 'North Nazimabad Block M', 'north_nazimabad_block_m', 149.00, 210, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_north_nazimabad_block_n', 'br_1788026544351_51d763a8', 'North Nazimabad Block N', 'north_nazimabad_block_n', 149.00, 211, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_north_nazimabad_block_o', 'br_1788026544351_51d763a8', 'North Nazimabad Block O', 'north_nazimabad_block_o', 149.00, 212, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_north_nazimabad_block_p', 'br_1788026544351_51d763a8', 'North Nazimabad Block P', 'north_nazimabad_block_p', 149.00, 213, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_north_nazimabad_block_q', 'br_1788026544351_51d763a8', 'North Nazimabad Block Q', 'north_nazimabad_block_q', 149.00, 214, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_north_nazimabad_block_r', 'br_1788026544351_51d763a8', 'North Nazimabad Block R', 'north_nazimabad_block_r', 149.00, 215, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_north_nazimabad_block_s', 'br_1788026544351_51d763a8', 'North Nazimabad Block S', 'north_nazimabad_block_s', 149.00, 216, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_north_nazimabad_block_t', 'br_1788026544351_51d763a8', 'North Nazimabad Block T', 'north_nazimabad_block_t', 149.00, 217, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_old_town', 'br_1788026544351_51d763a8', 'Old Town', 'old_town', 149.00, 218, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_orangi_town', 'br_1788026544351_51d763a8', 'Orangi Town', 'orangi_town', 149.00, 219, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_p_e_c_h_s_block_1', 'br_1788026544351_51d763a8', 'P.E.C.H.S Block 1', 'p_e_c_h_s_block_1', 149.00, 220, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_p_e_c_h_s_block_2', 'br_1788026544351_51d763a8', 'P.E.C.H.S Block 2', 'p_e_c_h_s_block_2', 149.00, 221, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_p_e_c_h_s_block_3', 'br_1788026544351_51d763a8', 'P.E.C.H.S Block 3', 'p_e_c_h_s_block_3', 149.00, 222, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_p_e_c_h_s_block_4', 'br_1788026544351_51d763a8', 'P.E.C.H.S Block 4', 'p_e_c_h_s_block_4', 149.00, 223, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_p_e_c_h_s_block_5', 'br_1788026544351_51d763a8', 'P.E.C.H.S Block 5', 'p_e_c_h_s_block_5', 149.00, 224, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_p_e_c_h_s_block_6', 'br_1788026544351_51d763a8', 'P.E.C.H.S Block 6', 'p_e_c_h_s_block_6', 149.00, 225, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_pakistan_chowk', 'br_1788026544351_51d763a8', 'Pakistan Chowk', 'pakistan_chowk', 149.00, 226, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_paposh_nagar', 'br_1788026544351_51d763a8', 'Paposh Nagar', 'paposh_nagar', 149.00, 227, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_paradise_point', 'br_1788026544351_51d763a8', 'Paradise Point', 'paradise_point', 149.00, 228, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_patel_para', 'br_1788026544351_51d763a8', 'Patel Para', 'patel_para', 149.00, 229, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_pechs', 'br_1788026544351_51d763a8', 'Pechs', 'pechs', 149.00, 230, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_pns_karsaz', 'br_1788026544351_51d763a8', 'PNS Karsaz', 'pns_karsaz', 149.00, 231, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_port_qasim', 'br_1788026544351_51d763a8', 'Port Qasim', 'port_qasim', 149.00, 232, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_qayyumabad', 'br_1788026544351_51d763a8', 'Qayyumabad', 'qayyumabad', 149.00, 233, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_railway_colony', 'br_1788026544351_51d763a8', 'Railway Colony', 'railway_colony', 149.00, 234, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_ranchore_line', 'br_1788026544351_51d763a8', 'Ranchore Line', 'ranchore_line', 149.00, 235, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_rashid_minhas_road', 'br_1788026544351_51d763a8', 'Rashid Minhas Road', 'rashid_minhas_road', 149.00, 236, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_rehmani_goth', 'br_1788026544351_51d763a8', 'Rehmani Goth', 'rehmani_goth', 149.00, 237, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_rizvia_society', 'br_1788026544351_51d763a8', 'Rizvia Society', 'rizvia_society', 149.00, 238, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_saddar', 'br_1788026544351_51d763a8', 'Saddar', 'saddar', 149.00, 239, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_safoora_goth', 'br_1788026544351_51d763a8', 'Safoora Goth', 'safoora_goth', 149.00, 240, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_sakhi_hassan', 'br_1788026544351_51d763a8', 'Sakhi Hassan', 'sakhi_hassan', 149.00, 241, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_shah_faisal_colony', 'br_1788026544351_51d763a8', 'Shah Faisal Colony', 'shah_faisal_colony', 149.00, 242, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_shah_latif_town', 'br_1788026544351_51d763a8', 'Shah Latif Town', 'shah_latif_town', 149.00, 243, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_shahrah_e_faisal', 'br_1788026544351_51d763a8', 'Shahrah-e-Faisal', 'shahrah_e_faisal', 149.00, 244, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_shahrah_e_quaideen', 'br_1788026544351_51d763a8', 'Shahrah-e-Quaideen', 'shahrah_e_quaideen', 149.00, 245, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_sharafi_goth', 'br_1788026544351_51d763a8', 'Sharafi Goth', 'sharafi_goth', 149.00, 246, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_sharfabad', 'br_1788026544351_51d763a8', 'Sharfabad', 'sharfabad', 149.00, 247, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_shepherd_street', 'br_1788026544351_51d763a8', 'Shepherd Street', 'shepherd_street', 149.00, 248, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_shipowner_college', 'br_1788026544351_51d763a8', 'Shipowner College', 'shipowner_college', 149.00, 249, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_sindhi_muslim_society', 'br_1788026544351_51d763a8', 'Sindhi Muslim Society', 'sindhi_muslim_society', 149.00, 250, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_sohrab_goth', 'br_1788026544351_51d763a8', 'Sohrab Goth', 'sohrab_goth', 149.00, 251, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_soldier_bazaar', 'br_1788026544351_51d763a8', 'Soldier Bazaar', 'soldier_bazaar', 149.00, 252, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_star_gate', 'br_1788026544351_51d763a8', 'Star Gate', 'star_gate', 149.00, 253, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_steel_town', 'br_1788026544351_51d763a8', 'Steel Town', 'steel_town', 149.00, 254, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_super_highway', 'br_1788026544351_51d763a8', 'Super Highway', 'super_highway', 149.00, 255, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_surjani_town', 'br_1788026544351_51d763a8', 'Surjani Town', 'surjani_town', 149.00, 256, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_tariq_road', 'br_1788026544351_51d763a8', 'Tariq Road', 'tariq_road', 149.00, 257, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_tipu_sultan_road', 'br_1788026544351_51d763a8', 'Tipu Sultan Road', 'tipu_sultan_road', 149.00, 258, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_university_road', 'br_1788026544351_51d763a8', 'University Road', 'university_road', 149.00, 259, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_water_pump', 'br_1788026544351_51d763a8', 'Water Pump', 'water_pump', 149.00, 260, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_yaseenabad', 'br_1788026544351_51d763a8', 'Yaseenabad', 'yaseenabad', 149.00, 261, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_zamzama', 'br_1788026544351_51d763a8', 'Zamzama', 'zamzama', 149.00, 262, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_1788026544351_51d763a8_ziauddin_hospital', 'br_1788026544351_51d763a8', 'Ziauddin Hospital', 'ziauddin_hospital', 149.00, 263, 1, '2026-08-29 23:18:04', '2026-08-29 23:18:04'),
('da_abdullah_goth', 'br_xyz_karachi', 'Abdullah Goth', 'abdullah_goth', 149.00, 1, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_abul_hassan_isphahani_road', 'br_xyz_karachi', 'Abul Hassan Isphahani Road', 'abul_hassan_isphahani_road', 149.00, 2, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_airport', 'br_xyz_karachi', 'Airport', 'airport', 149.00, 3, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_akhtar_colony', 'br_xyz_karachi', 'Akhtar Colony', 'akhtar_colony', 149.00, 4, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_al_falah_society', 'br_xyz_karachi', 'Al-Falah Society', 'al_falah_society', 149.00, 5, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_al_hilal_society', 'br_xyz_karachi', 'Al-Hilal Society', 'al_hilal_society', 149.00, 6, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_allah_wala_town', 'br_xyz_karachi', 'Allah Wala Town', 'allah_wala_town', 149.00, 7, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_ancholi', 'br_xyz_karachi', 'Ancholi', 'ancholi', 149.00, 8, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_ashraf_nagar', 'br_xyz_karachi', 'Ashraf Nagar', 'ashraf_nagar', 149.00, 9, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_askari_1', 'br_xyz_karachi', 'Askari 1', 'askari_1', 149.00, 10, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_askari_2', 'br_xyz_karachi', 'Askari 2', 'askari_2', 149.00, 11, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_askari_3', 'br_xyz_karachi', 'Askari 3', 'askari_3', 149.00, 12, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_askari_4', 'br_xyz_karachi', 'Askari 4', 'askari_4', 149.00, 13, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_askari_5', 'br_xyz_karachi', 'Askari 5', 'askari_5', 149.00, 14, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_ayesha_manzil', 'br_xyz_karachi', 'Ayesha Manzil', 'ayesha_manzil', 149.00, 15, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_azam_basti', 'br_xyz_karachi', 'Azam Basti', 'azam_basti', 149.00, 16, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_azam_town', 'br_xyz_karachi', 'Azam Town', 'azam_town', 149.00, 17, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_baba_wilayat_shah_colony', 'br_xyz_karachi', 'Baba Wilayat Shah Colony', 'baba_wilayat_shah_colony', 149.00, 28, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_babar_market', 'br_xyz_karachi', 'Babar Market', 'babar_market', 149.00, 18, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_bachayo_narain', 'br_xyz_karachi', 'Bachayo Narain', 'bachayo_narain', 149.00, 19, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_bagh_e_korangi', 'br_xyz_karachi', 'Bagh e Korangi', 'bagh_e_korangi', 149.00, 20, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_bahadurabad', 'br_xyz_karachi', 'Bahadurabad', 'bahadurabad', 149.00, 21, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_bahria_town_karachi', 'br_xyz_karachi', 'Bahria Town Karachi', 'bahria_town_karachi', 149.00, 22, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_baldia_town', 'br_xyz_karachi', 'Baldia Town', 'baldia_town', 149.00, 23, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_baloch_colony', 'br_xyz_karachi', 'Baloch Colony', 'baloch_colony', 149.00, 24, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_banaras_colony', 'br_xyz_karachi', 'Banaras Colony', 'banaras_colony', 149.00, 25, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_bandhani_colony', 'br_xyz_karachi', 'Bandhani Colony', 'bandhani_colony', 149.00, 26, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_bath_island', 'br_xyz_karachi', 'Bath Island', 'bath_island', 149.00, 27, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_beacon_house', 'br_xyz_karachi', 'Beacon House', 'beacon_house', 149.00, 29, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_bhadur_colony', 'br_xyz_karachi', 'Bhadur Colony', 'bhadur_colony', 149.00, 30, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_bhittaiabad', 'br_xyz_karachi', 'Bhittaiabad', 'bhittaiabad', 149.00, 31, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_bihar_colony', 'br_xyz_karachi', 'Bihar Colony', 'bihar_colony', 149.00, 32, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_bizm_e_alam_society', 'br_xyz_karachi', 'Bizm-e-Alam Society', 'bizm_e_alam_society', 149.00, 33, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_block_1_gulshan_e_iqbal', 'br_xyz_karachi', 'Block 1 Gulshan-e-Iqbal', 'block_1_gulshan_e_iqbal', 149.00, 34, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_block_10_gulshan_e_iqbal', 'br_xyz_karachi', 'Block 10 Gulshan-e-Iqbal', 'block_10_gulshan_e_iqbal', 149.00, 43, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_block_11_gulshan_e_iqbal', 'br_xyz_karachi', 'Block 11 Gulshan-e-Iqbal', 'block_11_gulshan_e_iqbal', 149.00, 44, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_block_12_gulshan_e_iqbal', 'br_xyz_karachi', 'Block 12 Gulshan-e-Iqbal', 'block_12_gulshan_e_iqbal', 149.00, 45, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_block_13_gulshan_e_iqbal', 'br_xyz_karachi', 'Block 13 Gulshan-e-Iqbal', 'block_13_gulshan_e_iqbal', 149.00, 46, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_block_14_gulshan_e_iqbal', 'br_xyz_karachi', 'Block 14 Gulshan-e-Iqbal', 'block_14_gulshan_e_iqbal', 149.00, 47, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_block_15_gulshan_e_iqbal', 'br_xyz_karachi', 'Block 15 Gulshan-e-Iqbal', 'block_15_gulshan_e_iqbal', 149.00, 48, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_block_16_gulshan_e_iqbal', 'br_xyz_karachi', 'Block 16 Gulshan-e-Iqbal', 'block_16_gulshan_e_iqbal', 149.00, 49, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_block_17_gulshan_e_iqbal', 'br_xyz_karachi', 'Block 17 Gulshan-e-Iqbal', 'block_17_gulshan_e_iqbal', 149.00, 50, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_block_18_gulshan_e_iqbal', 'br_xyz_karachi', 'Block 18 Gulshan-e-Iqbal', 'block_18_gulshan_e_iqbal', 149.00, 51, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_block_2_gulshan_e_iqbal', 'br_xyz_karachi', 'Block 2 Gulshan-e-Iqbal', 'block_2_gulshan_e_iqbal', 149.00, 35, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_block_3_gulshan_e_iqbal', 'br_xyz_karachi', 'Block 3 Gulshan-e-Iqbal', 'block_3_gulshan_e_iqbal', 149.00, 36, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_block_4_gulshan_e_iqbal', 'br_xyz_karachi', 'Block 4 Gulshan-e-Iqbal', 'block_4_gulshan_e_iqbal', 149.00, 37, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_block_5_gulshan_e_iqbal', 'br_xyz_karachi', 'Block 5 Gulshan-e-Iqbal', 'block_5_gulshan_e_iqbal', 149.00, 38, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_block_6_gulshan_e_iqbal', 'br_xyz_karachi', 'Block 6 Gulshan-e-Iqbal', 'block_6_gulshan_e_iqbal', 149.00, 39, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_block_7_gulshan_e_iqbal', 'br_xyz_karachi', 'Block 7 Gulshan-e-Iqbal', 'block_7_gulshan_e_iqbal', 149.00, 40, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_block_8_gulshan_e_iqbal', 'br_xyz_karachi', 'Block 8 Gulshan-e-Iqbal', 'block_8_gulshan_e_iqbal', 149.00, 41, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_block_9_gulshan_e_iqbal', 'br_xyz_karachi', 'Block 9 Gulshan-e-Iqbal', 'block_9_gulshan_e_iqbal', 149.00, 42, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_bufferzone', 'br_xyz_karachi', 'Bufferzone', 'bufferzone', 149.00, 52, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_burns_road', 'br_xyz_karachi', 'Burns Road', 'burns_road', 149.00, 53, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_cantonment', 'br_xyz_karachi', 'Cantonment', 'cantonment', 149.00, 54, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_chakra_goth', 'br_xyz_karachi', 'Chakra Goth', 'chakra_goth', 149.00, 55, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_civil_lines', 'br_xyz_karachi', 'Civil Lines', 'civil_lines', 149.00, 56, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_clifton_block_1', 'br_xyz_karachi', 'Clifton Block 1', 'clifton_block_1', 149.00, 57, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_clifton_block_2', 'br_xyz_karachi', 'Clifton Block 2', 'clifton_block_2', 149.00, 58, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_clifton_block_3', 'br_xyz_karachi', 'Clifton Block 3', 'clifton_block_3', 149.00, 59, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_clifton_block_4', 'br_xyz_karachi', 'Clifton Block 4', 'clifton_block_4', 149.00, 60, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_clifton_block_5', 'br_xyz_karachi', 'Clifton Block 5', 'clifton_block_5', 149.00, 61, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_clifton_block_6', 'br_xyz_karachi', 'Clifton Block 6', 'clifton_block_6', 149.00, 62, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_clifton_block_7', 'br_xyz_karachi', 'Clifton Block 7', 'clifton_block_7', 149.00, 63, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_clifton_block_8', 'br_xyz_karachi', 'Clifton Block 8', 'clifton_block_8', 149.00, 64, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_clifton_block_9', 'br_xyz_karachi', 'Clifton Block 9', 'clifton_block_9', 149.00, 65, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_darakhshan_society', 'br_xyz_karachi', 'Darakhshan Society', 'darakhshan_society', 149.00, 75, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_darul_aman_society', 'br_xyz_karachi', 'Darul Aman Society', 'darul_aman_society', 149.00, 76, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_dastagir', 'br_xyz_karachi', 'Dastagir', 'dastagir', 149.00, 77, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_defence_view', 'br_xyz_karachi', 'Defence View', 'defence_view', 149.00, 78, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_delhi_colony', 'br_xyz_karachi', 'Delhi Colony', 'delhi_colony', 149.00, 79, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_dha_phase_1', 'br_xyz_karachi', 'DHA Phase 1', 'dha_phase_1', 149.00, 66, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_dha_phase_2', 'br_xyz_karachi', 'DHA Phase 2', 'dha_phase_2', 149.00, 67, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_dha_phase_2_extension', 'br_xyz_karachi', 'DHA Phase 2 Extension', 'dha_phase_2_extension', 149.00, 68, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_dha_phase_4', 'br_xyz_karachi', 'DHA Phase 4', 'dha_phase_4', 149.00, 69, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_dha_phase_5', 'br_xyz_karachi', 'DHA Phase 5', 'dha_phase_5', 149.00, 70, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_dha_phase_5_extension', 'br_xyz_karachi', 'DHA Phase 5 Extension', 'dha_phase_5_extension', 149.00, 71, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_dha_phase_6', 'br_xyz_karachi', 'DHA Phase 6', 'dha_phase_6', 149.00, 72, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_dha_phase_7', 'br_xyz_karachi', 'DHA Phase 7', 'dha_phase_7', 149.00, 73, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_dha_phase_8', 'br_xyz_karachi', 'DHA Phase 8', 'dha_phase_8', 149.00, 74, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_dhoraji_colony', 'br_xyz_karachi', 'Dhoraji Colony', 'dhoraji_colony', 149.00, 80, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_do_talwar', 'br_xyz_karachi', 'Do Talwar', 'do_talwar', 149.00, 81, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03');
INSERT INTO `delivery_areas` (`id`, `branch_id`, `name`, `slug`, `charge`, `sort_order`, `enabled`, `created_at`, `updated_at`) VALUES
('da_drigh_road', 'br_xyz_karachi', 'Drigh Road', 'drigh_road', 149.00, 82, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_eid_gah', 'br_xyz_karachi', 'Eid Gah', 'eid_gah', 149.00, 83, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_f_b_area_block_1', 'br_xyz_karachi', 'F.B. Area Block 1', 'f_b_area_block_1', 149.00, 84, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_f_b_area_block_10', 'br_xyz_karachi', 'F.B. Area Block 10', 'f_b_area_block_10', 149.00, 93, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_f_b_area_block_11', 'br_xyz_karachi', 'F.B. Area Block 11', 'f_b_area_block_11', 149.00, 94, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_f_b_area_block_12', 'br_xyz_karachi', 'F.B. Area Block 12', 'f_b_area_block_12', 149.00, 95, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_f_b_area_block_13', 'br_xyz_karachi', 'F.B. Area Block 13', 'f_b_area_block_13', 149.00, 96, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_f_b_area_block_14', 'br_xyz_karachi', 'F.B. Area Block 14', 'f_b_area_block_14', 149.00, 97, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_f_b_area_block_15', 'br_xyz_karachi', 'F.B. Area Block 15', 'f_b_area_block_15', 149.00, 98, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_f_b_area_block_16', 'br_xyz_karachi', 'F.B. Area Block 16', 'f_b_area_block_16', 149.00, 99, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_f_b_area_block_17', 'br_xyz_karachi', 'F.B. Area Block 17', 'f_b_area_block_17', 149.00, 100, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_f_b_area_block_18', 'br_xyz_karachi', 'F.B. Area Block 18', 'f_b_area_block_18', 149.00, 101, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_f_b_area_block_19', 'br_xyz_karachi', 'F.B. Area Block 19', 'f_b_area_block_19', 149.00, 102, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_f_b_area_block_2', 'br_xyz_karachi', 'F.B. Area Block 2', 'f_b_area_block_2', 149.00, 85, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_f_b_area_block_20', 'br_xyz_karachi', 'F.B. Area Block 20', 'f_b_area_block_20', 149.00, 103, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_f_b_area_block_21', 'br_xyz_karachi', 'F.B. Area Block 21', 'f_b_area_block_21', 149.00, 104, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_f_b_area_block_3', 'br_xyz_karachi', 'F.B. Area Block 3', 'f_b_area_block_3', 149.00, 86, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_f_b_area_block_4', 'br_xyz_karachi', 'F.B. Area Block 4', 'f_b_area_block_4', 149.00, 87, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_f_b_area_block_5', 'br_xyz_karachi', 'F.B. Area Block 5', 'f_b_area_block_5', 149.00, 88, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_f_b_area_block_6', 'br_xyz_karachi', 'F.B. Area Block 6', 'f_b_area_block_6', 149.00, 89, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_f_b_area_block_7', 'br_xyz_karachi', 'F.B. Area Block 7', 'f_b_area_block_7', 149.00, 90, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_f_b_area_block_8', 'br_xyz_karachi', 'F.B. Area Block 8', 'f_b_area_block_8', 149.00, 91, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_f_b_area_block_9', 'br_xyz_karachi', 'F.B. Area Block 9', 'f_b_area_block_9', 149.00, 92, 1, '2026-08-26 17:22:40', '2026-08-26 23:15:03'),
('da_faisal_cantonment', 'br_xyz_karachi', 'Faisal Cantonment', 'faisal_cantonment', 149.00, 105, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_farooq_e_azam', 'br_xyz_karachi', 'Farooq-e-Azam', 'farooq_e_azam', 149.00, 106, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_federal_b_area', 'br_xyz_karachi', 'Federal B Area', 'federal_b_area', 149.00, 107, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_frere_town', 'br_xyz_karachi', 'Frere Town', 'frere_town', 149.00, 108, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_garden_east', 'br_xyz_karachi', 'Garden East', 'garden_east', 149.00, 109, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_garden_west', 'br_xyz_karachi', 'Garden West', 'garden_west', 149.00, 110, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_gharibabad', 'br_xyz_karachi', 'Gharibabad', 'gharibabad', 149.00, 111, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_gizri', 'br_xyz_karachi', 'Gizri', 'gizri', 149.00, 112, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_gizri_boulevard', 'br_xyz_karachi', 'Gizri Boulevard', 'gizri_boulevard', 149.00, 113, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_gulbahar', 'br_xyz_karachi', 'Gulbahar', 'gulbahar', 149.00, 114, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_gulberg', 'br_xyz_karachi', 'Gulberg', 'gulberg', 149.00, 115, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_gulistan_e_johar_block_1', 'br_xyz_karachi', 'Gulistan-e-Johar Block 1', 'gulistan_e_johar_block_1', 149.00, 116, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_gulistan_e_johar_block_10', 'br_xyz_karachi', 'Gulistan-e-Johar Block 10', 'gulistan_e_johar_block_10', 149.00, 125, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_gulistan_e_johar_block_11', 'br_xyz_karachi', 'Gulistan-e-Johar Block 11', 'gulistan_e_johar_block_11', 149.00, 126, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_gulistan_e_johar_block_12', 'br_xyz_karachi', 'Gulistan-e-Johar Block 12', 'gulistan_e_johar_block_12', 149.00, 127, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_gulistan_e_johar_block_13', 'br_xyz_karachi', 'Gulistan-e-Johar Block 13', 'gulistan_e_johar_block_13', 149.00, 128, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_gulistan_e_johar_block_14', 'br_xyz_karachi', 'Gulistan-e-Johar Block 14', 'gulistan_e_johar_block_14', 149.00, 129, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_gulistan_e_johar_block_15', 'br_xyz_karachi', 'Gulistan-e-Johar Block 15', 'gulistan_e_johar_block_15', 149.00, 130, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_gulistan_e_johar_block_16', 'br_xyz_karachi', 'Gulistan-e-Johar Block 16', 'gulistan_e_johar_block_16', 149.00, 131, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_gulistan_e_johar_block_17', 'br_xyz_karachi', 'Gulistan-e-Johar Block 17', 'gulistan_e_johar_block_17', 149.00, 132, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_gulistan_e_johar_block_18', 'br_xyz_karachi', 'Gulistan-e-Johar Block 18', 'gulistan_e_johar_block_18', 149.00, 133, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_gulistan_e_johar_block_19', 'br_xyz_karachi', 'Gulistan-e-Johar Block 19', 'gulistan_e_johar_block_19', 149.00, 134, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_gulistan_e_johar_block_2', 'br_xyz_karachi', 'Gulistan-e-Johar Block 2', 'gulistan_e_johar_block_2', 149.00, 117, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_gulistan_e_johar_block_3', 'br_xyz_karachi', 'Gulistan-e-Johar Block 3', 'gulistan_e_johar_block_3', 149.00, 118, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_gulistan_e_johar_block_4', 'br_xyz_karachi', 'Gulistan-e-Johar Block 4', 'gulistan_e_johar_block_4', 149.00, 119, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_gulistan_e_johar_block_5', 'br_xyz_karachi', 'Gulistan-e-Johar Block 5', 'gulistan_e_johar_block_5', 149.00, 120, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_gulistan_e_johar_block_6', 'br_xyz_karachi', 'Gulistan-e-Johar Block 6', 'gulistan_e_johar_block_6', 149.00, 121, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_gulistan_e_johar_block_7', 'br_xyz_karachi', 'Gulistan-e-Johar Block 7', 'gulistan_e_johar_block_7', 149.00, 122, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_gulistan_e_johar_block_8', 'br_xyz_karachi', 'Gulistan-e-Johar Block 8', 'gulistan_e_johar_block_8', 149.00, 123, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_gulistan_e_johar_block_9', 'br_xyz_karachi', 'Gulistan-e-Johar Block 9', 'gulistan_e_johar_block_9', 149.00, 124, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_gulshan_e_hadeed', 'br_xyz_karachi', 'Gulshan-e-Hadeed', 'gulshan_e_hadeed', 149.00, 135, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_gulshan_e_iqbal', 'br_xyz_karachi', 'Gulshan-e-Iqbal', 'gulshan_e_iqbal', 149.00, 136, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_gulshan_e_jamal', 'br_xyz_karachi', 'Gulshan-e-Jamal', 'gulshan_e_jamal', 149.00, 137, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_gulshan_e_maymar', 'br_xyz_karachi', 'Gulshan-e-Maymar', 'gulshan_e_maymar', 149.00, 138, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_gulzar_e_hijri', 'br_xyz_karachi', 'Gulzar-e-Hijri', 'gulzar_e_hijri', 149.00, 139, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_habib_bank_plaza', 'br_xyz_karachi', 'Habib Bank Plaza', 'habib_bank_plaza', 149.00, 140, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_hajiyani_goth', 'br_xyz_karachi', 'Hajiyani Goth', 'hajiyani_goth', 149.00, 141, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_harbour_front', 'br_xyz_karachi', 'Harbour Front', 'harbour_front', 149.00, 142, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_hill_park', 'br_xyz_karachi', 'Hill Park', 'hill_park', 149.00, 143, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_holy_family', 'br_xyz_karachi', 'Holy Family', 'holy_family', 149.00, 144, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_hussainabad', 'br_xyz_karachi', 'Hussainabad', 'hussainabad', 149.00, 145, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_hyderi', 'br_xyz_karachi', 'Hyderi', 'hyderi', 149.00, 146, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_i_i_chundrigar_road', 'br_xyz_karachi', 'I.I. Chundrigar Road', 'i_i_chundrigar_road', 149.00, 147, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_ibrahim_hyderi', 'br_xyz_karachi', 'Ibrahim Hyderi', 'ibrahim_hyderi', 149.00, 148, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_jamshed_quarters', 'br_xyz_karachi', 'Jamshed Quarters', 'jamshed_quarters', 149.00, 149, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_jauhar_chowrangi', 'br_xyz_karachi', 'Jauhar Chowrangi', 'jauhar_chowrangi', 149.00, 150, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_jinnah_terminal', 'br_xyz_karachi', 'Jinnah Terminal', 'jinnah_terminal', 149.00, 151, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_johar_complex', 'br_xyz_karachi', 'Johar Complex', 'johar_complex', 149.00, 152, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_kda_scheme_1', 'br_xyz_karachi', 'KDA Scheme 1', 'kda_scheme_1', 149.00, 153, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_kda_scheme_33', 'br_xyz_karachi', 'KDA Scheme 33', 'kda_scheme_33', 149.00, 154, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_keamari', 'br_xyz_karachi', 'Keamari', 'keamari', 149.00, 155, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_kehkashan', 'br_xyz_karachi', 'Kehkashan', 'kehkashan', 149.00, 156, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_khadda_market', 'br_xyz_karachi', 'Khadda Market', 'khadda_market', 149.00, 157, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_kharadar', 'br_xyz_karachi', 'Kharadar', 'kharadar', 149.00, 158, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_khudadad_colony', 'br_xyz_karachi', 'Khudadad Colony', 'khudadad_colony', 149.00, 159, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_korangi', 'br_xyz_karachi', 'Korangi', 'korangi', 149.00, 160, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_korangi_crossing', 'br_xyz_karachi', 'Korangi Crossing', 'korangi_crossing', 149.00, 161, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_korangi_industrial_area', 'br_xyz_karachi', 'Korangi Industrial Area', 'korangi_industrial_area', 149.00, 162, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_korangi_sector_31', 'br_xyz_karachi', 'Korangi Sector 31', 'korangi_sector_31', 149.00, 163, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_korangi_sector_32', 'br_xyz_karachi', 'Korangi Sector 32', 'korangi_sector_32', 149.00, 164, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_korangi_sector_33', 'br_xyz_karachi', 'Korangi Sector 33', 'korangi_sector_33', 149.00, 165, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_korangi_sector_34', 'br_xyz_karachi', 'Korangi Sector 34', 'korangi_sector_34', 149.00, 166, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_korangi_sector_35', 'br_xyz_karachi', 'Korangi Sector 35', 'korangi_sector_35', 149.00, 167, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_korangi_sector_36', 'br_xyz_karachi', 'Korangi Sector 36', 'korangi_sector_36', 149.00, 168, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_landhi', 'br_xyz_karachi', 'Landhi', 'landhi', 149.00, 169, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_liaquatabad', 'br_xyz_karachi', 'Liaquatabad', 'liaquatabad', 149.00, 170, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_lines_area', 'br_xyz_karachi', 'Lines Area', 'lines_area', 149.00, 171, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_lyari', 'br_xyz_karachi', 'Lyari', 'lyari', 149.00, 172, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_malir', 'br_xyz_karachi', 'Malir', 'malir', 149.00, 173, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_malir_cantonment', 'br_xyz_karachi', 'Malir Cantonment', 'malir_cantonment', 149.00, 174, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_malir_halt', 'br_xyz_karachi', 'Malir Halt', 'malir_halt', 149.00, 175, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_manzoor_colony', 'br_xyz_karachi', 'Manzoor Colony', 'manzoor_colony', 149.00, 176, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_maripur', 'br_xyz_karachi', 'Maripur', 'maripur', 149.00, 177, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_mehmoodabad', 'br_xyz_karachi', 'Mehmoodabad', 'mehmoodabad', 149.00, 178, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_metroville', 'br_xyz_karachi', 'Metroville', 'metroville', 149.00, 179, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_millat_nagar', 'br_xyz_karachi', 'Millat Nagar', 'millat_nagar', 149.00, 180, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_model_colony', 'br_xyz_karachi', 'Model Colony', 'model_colony', 149.00, 181, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_moinabad', 'br_xyz_karachi', 'Moinabad', 'moinabad', 149.00, 182, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_mujahid_colony', 'br_xyz_karachi', 'Mujahid Colony', 'mujahid_colony', 149.00, 183, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_muslim_town', 'br_xyz_karachi', 'Muslim Town', 'muslim_town', 149.00, 185, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_muslimabad', 'br_xyz_karachi', 'Muslimabad', 'muslimabad', 149.00, 184, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_national_stadium', 'br_xyz_karachi', 'National Stadium', 'national_stadium', 149.00, 186, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_nazimabad_1', 'br_xyz_karachi', 'Nazimabad 1', 'nazimabad_1', 149.00, 187, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_nazimabad_2', 'br_xyz_karachi', 'Nazimabad 2', 'nazimabad_2', 149.00, 188, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_nazimabad_3', 'br_xyz_karachi', 'Nazimabad 3', 'nazimabad_3', 149.00, 189, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_nazimabad_4', 'br_xyz_karachi', 'Nazimabad 4', 'nazimabad_4', 149.00, 190, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_nazimabad_5', 'br_xyz_karachi', 'Nazimabad 5', 'nazimabad_5', 149.00, 191, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_nazimabad_6', 'br_xyz_karachi', 'Nazimabad 6', 'nazimabad_6', 149.00, 192, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_nazimabad_7', 'br_xyz_karachi', 'Nazimabad 7', 'nazimabad_7', 149.00, 193, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_new_karachi', 'br_xyz_karachi', 'New Karachi', 'new_karachi', 149.00, 194, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_new_town', 'br_xyz_karachi', 'New Town', 'new_town', 149.00, 195, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_nishat_commercial', 'br_xyz_karachi', 'Nishat Commercial', 'nishat_commercial', 149.00, 196, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_north_karachi', 'br_xyz_karachi', 'North Karachi', 'north_karachi', 149.00, 197, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_north_nazimabad_block_a', 'br_xyz_karachi', 'North Nazimabad Block A', 'north_nazimabad_block_a', 149.00, 198, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_north_nazimabad_block_b', 'br_xyz_karachi', 'North Nazimabad Block B', 'north_nazimabad_block_b', 149.00, 199, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_north_nazimabad_block_c', 'br_xyz_karachi', 'North Nazimabad Block C', 'north_nazimabad_block_c', 149.00, 200, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_north_nazimabad_block_d', 'br_xyz_karachi', 'North Nazimabad Block D', 'north_nazimabad_block_d', 149.00, 201, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_north_nazimabad_block_e', 'br_xyz_karachi', 'North Nazimabad Block E', 'north_nazimabad_block_e', 149.00, 202, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_north_nazimabad_block_f', 'br_xyz_karachi', 'North Nazimabad Block F', 'north_nazimabad_block_f', 149.00, 203, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_north_nazimabad_block_g', 'br_xyz_karachi', 'North Nazimabad Block G', 'north_nazimabad_block_g', 149.00, 204, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_north_nazimabad_block_h', 'br_xyz_karachi', 'North Nazimabad Block H', 'north_nazimabad_block_h', 149.00, 205, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_north_nazimabad_block_i', 'br_xyz_karachi', 'North Nazimabad Block I', 'north_nazimabad_block_i', 149.00, 206, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_north_nazimabad_block_j', 'br_xyz_karachi', 'North Nazimabad Block J', 'north_nazimabad_block_j', 149.00, 207, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_north_nazimabad_block_k', 'br_xyz_karachi', 'North Nazimabad Block K', 'north_nazimabad_block_k', 149.00, 208, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_north_nazimabad_block_l', 'br_xyz_karachi', 'North Nazimabad Block L', 'north_nazimabad_block_l', 149.00, 209, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_north_nazimabad_block_m', 'br_xyz_karachi', 'North Nazimabad Block M', 'north_nazimabad_block_m', 149.00, 210, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_north_nazimabad_block_n', 'br_xyz_karachi', 'North Nazimabad Block N', 'north_nazimabad_block_n', 149.00, 211, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_north_nazimabad_block_o', 'br_xyz_karachi', 'North Nazimabad Block O', 'north_nazimabad_block_o', 149.00, 212, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_north_nazimabad_block_p', 'br_xyz_karachi', 'North Nazimabad Block P', 'north_nazimabad_block_p', 149.00, 213, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_north_nazimabad_block_q', 'br_xyz_karachi', 'North Nazimabad Block Q', 'north_nazimabad_block_q', 149.00, 214, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_north_nazimabad_block_r', 'br_xyz_karachi', 'North Nazimabad Block R', 'north_nazimabad_block_r', 149.00, 215, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_north_nazimabad_block_s', 'br_xyz_karachi', 'North Nazimabad Block S', 'north_nazimabad_block_s', 149.00, 216, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_north_nazimabad_block_t', 'br_xyz_karachi', 'North Nazimabad Block T', 'north_nazimabad_block_t', 149.00, 217, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_old_town', 'br_xyz_karachi', 'Old Town', 'old_town', 149.00, 218, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_orangi_town', 'br_xyz_karachi', 'Orangi Town', 'orangi_town', 149.00, 219, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_p_e_c_h_s_block_1', 'br_xyz_karachi', 'P.E.C.H.S Block 1', 'p_e_c_h_s_block_1', 149.00, 220, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_p_e_c_h_s_block_2', 'br_xyz_karachi', 'P.E.C.H.S Block 2', 'p_e_c_h_s_block_2', 149.00, 221, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_p_e_c_h_s_block_3', 'br_xyz_karachi', 'P.E.C.H.S Block 3', 'p_e_c_h_s_block_3', 149.00, 222, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_p_e_c_h_s_block_4', 'br_xyz_karachi', 'P.E.C.H.S Block 4', 'p_e_c_h_s_block_4', 149.00, 223, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_p_e_c_h_s_block_5', 'br_xyz_karachi', 'P.E.C.H.S Block 5', 'p_e_c_h_s_block_5', 149.00, 224, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_p_e_c_h_s_block_6', 'br_xyz_karachi', 'P.E.C.H.S Block 6', 'p_e_c_h_s_block_6', 149.00, 225, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_pakistan_chowk', 'br_xyz_karachi', 'Pakistan Chowk', 'pakistan_chowk', 149.00, 226, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_paposh_nagar', 'br_xyz_karachi', 'Paposh Nagar', 'paposh_nagar', 149.00, 227, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_paradise_point', 'br_xyz_karachi', 'Paradise Point', 'paradise_point', 149.00, 228, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_patel_para', 'br_xyz_karachi', 'Patel Para', 'patel_para', 149.00, 229, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_pechs', 'br_xyz_karachi', 'Pechs', 'pechs', 149.00, 230, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_pns_karsaz', 'br_xyz_karachi', 'PNS Karsaz', 'pns_karsaz', 149.00, 231, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_port_qasim', 'br_xyz_karachi', 'Port Qasim', 'port_qasim', 149.00, 232, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_qayyumabad', 'br_xyz_karachi', 'Qayyumabad', 'qayyumabad', 149.00, 233, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_railway_colony', 'br_xyz_karachi', 'Railway Colony', 'railway_colony', 149.00, 234, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_ranchore_line', 'br_xyz_karachi', 'Ranchore Line', 'ranchore_line', 149.00, 235, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_rashid_minhas_road', 'br_xyz_karachi', 'Rashid Minhas Road', 'rashid_minhas_road', 149.00, 236, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_rehmani_goth', 'br_xyz_karachi', 'Rehmani Goth', 'rehmani_goth', 149.00, 237, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_rizvia_society', 'br_xyz_karachi', 'Rizvia Society', 'rizvia_society', 149.00, 238, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_saddar', 'br_xyz_karachi', 'Saddar', 'saddar', 149.00, 239, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_safoora_goth', 'br_xyz_karachi', 'Safoora Goth', 'safoora_goth', 149.00, 240, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_sakhi_hassan', 'br_xyz_karachi', 'Sakhi Hassan', 'sakhi_hassan', 149.00, 241, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_shah_faisal_colony', 'br_xyz_karachi', 'Shah Faisal Colony', 'shah_faisal_colony', 149.00, 242, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_shah_latif_town', 'br_xyz_karachi', 'Shah Latif Town', 'shah_latif_town', 149.00, 243, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_shahrah_e_faisal', 'br_xyz_karachi', 'Shahrah-e-Faisal', 'shahrah_e_faisal', 149.00, 244, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_shahrah_e_quaideen', 'br_xyz_karachi', 'Shahrah-e-Quaideen', 'shahrah_e_quaideen', 149.00, 245, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_sharafi_goth', 'br_xyz_karachi', 'Sharafi Goth', 'sharafi_goth', 149.00, 246, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_sharfabad', 'br_xyz_karachi', 'Sharfabad', 'sharfabad', 149.00, 247, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_shepherd_street', 'br_xyz_karachi', 'Shepherd Street', 'shepherd_street', 149.00, 248, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_shipowner_college', 'br_xyz_karachi', 'Shipowner College', 'shipowner_college', 149.00, 249, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_sindhi_muslim_society', 'br_xyz_karachi', 'Sindhi Muslim Society', 'sindhi_muslim_society', 149.00, 250, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_sohrab_goth', 'br_xyz_karachi', 'Sohrab Goth', 'sohrab_goth', 149.00, 251, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_soldier_bazaar', 'br_xyz_karachi', 'Soldier Bazaar', 'soldier_bazaar', 149.00, 252, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_star_gate', 'br_xyz_karachi', 'Star Gate', 'star_gate', 149.00, 253, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_steel_town', 'br_xyz_karachi', 'Steel Town', 'steel_town', 149.00, 254, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_super_highway', 'br_xyz_karachi', 'Super Highway', 'super_highway', 149.00, 255, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_surjani_town', 'br_xyz_karachi', 'Surjani Town', 'surjani_town', 149.00, 256, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_tariq_road', 'br_xyz_karachi', 'Tariq Road', 'tariq_road', 149.00, 257, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_tipu_sultan_road', 'br_xyz_karachi', 'Tipu Sultan Road', 'tipu_sultan_road', 149.00, 258, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_university_road', 'br_xyz_karachi', 'University Road', 'university_road', 149.00, 259, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_water_pump', 'br_xyz_karachi', 'Water Pump', 'water_pump', 149.00, 260, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_yaseenabad', 'br_xyz_karachi', 'Yaseenabad', 'yaseenabad', 149.00, 261, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_zamzama', 'br_xyz_karachi', 'Zamzama', 'zamzama', 149.00, 262, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03'),
('da_ziauddin_hospital', 'br_xyz_karachi', 'Ziauddin Hospital', 'ziauddin_hospital', 1000.00, 263, 1, '2026-08-26 17:22:41', '2026-08-26 23:15:03');

-- --------------------------------------------------------

--
-- Table structure for table `delivery_charge_settings`
--

CREATE TABLE `delivery_charge_settings` (
  `id` varchar(36) NOT NULL,
  `fuel_surcharge_fixed` decimal(10,2) NOT NULL DEFAULT 0.00,
  `fuel_surcharge_percent` decimal(6,2) NOT NULL DEFAULT 0.00,
  `free_delivery_min_order` decimal(10,2) DEFAULT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `notes` text DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `delivery_charge_settings`
--

INSERT INTO `delivery_charge_settings` (`id`, `fuel_surcharge_fixed`, `fuel_surcharge_percent`, `free_delivery_min_order`, `enabled`, `notes`, `updated_at`) VALUES
('dcs_default', 0.00, 0.00, NULL, 1, 'Adjust fuel surcharge when fuel prices change. Applied on top of each delivery method base price.', '2026-08-21 00:02:26');

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
  `branch_id` varchar(36) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `branch_id` varchar(36) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `drinks`
--

INSERT INTO `drinks` (`id`, `name`, `description`, `price`, `stock`, `image`, `status`, `sort_order`, `branch_id`, `created_at`, `updated_at`) VALUES
('drink_1787775712791_e63c9fd6', 'test-coke', 'test-coke', 150.00, -1, '', 'active', 10, 'br_xyz_karachi', '2026-08-27 01:21:52', '2026-08-27 01:21:52');

-- --------------------------------------------------------

--
-- Table structure for table `offers`
--

CREATE TABLE `offers` (
  `id` varchar(36) NOT NULL,
  `title` varchar(180) NOT NULL,
  `description` text DEFAULT NULL,
  `type` varchar(60) NOT NULL DEFAULT 'bundle',
  `discount_value` decimal(12,2) NOT NULL DEFAULT 0.00,
  `min_order` decimal(12,2) NOT NULL DEFAULT 0.00,
  `max_discount` decimal(12,2) DEFAULT NULL,
  `buy_qty` int(11) NOT NULL DEFAULT 1,
  `get_qty` int(11) NOT NULL DEFAULT 1,
  `apply_scope` enum('all','category','products') NOT NULL DEFAULT 'all',
  `category_id` varchar(36) DEFAULT NULL,
  `product_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`product_ids`)),
  `buy_product_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`buy_product_ids`)),
  `get_product_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`get_product_ids`)),
  `free_product_id` varchar(36) DEFAULT NULL,
  `tax_code_id` varchar(36) DEFAULT NULL,
  `tax_mode` enum('inclusive','exclusive') NOT NULL DEFAULT 'inclusive',
  `conditions` text DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `branch_id` varchar(36) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `offers`
--

INSERT INTO `offers` (`id`, `title`, `description`, `type`, `discount_value`, `min_order`, `max_discount`, `buy_qty`, `get_qty`, `apply_scope`, `category_id`, `product_ids`, `buy_product_ids`, `get_product_ids`, `free_product_id`, `tax_code_id`, `tax_mode`, `conditions`, `active`, `start_date`, `end_date`, `branch_id`, `created_at`, `updated_at`) VALUES
('offer_1787775616837_1a4a7335', 'test Offer', '', 'fixed', 100.00, 2000.00, NULL, 1, 1, 'category', NULL, '[]', '[]', '[]', NULL, 'tax_1787775402786_4774c68c', 'inclusive', '', 1, '2026-08-05 00:00:00', '2026-08-28 00:00:00', 'br_xyz_karachi', '2026-08-27 01:20:16', '2026-08-27 01:20:16');

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
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `offer_discount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `coupon_discount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `coupon_code` varchar(60) DEFAULT NULL,
  `tax_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `source` varchar(50) NOT NULL DEFAULT 'admin',
  `branch_id` varchar(36) DEFAULT NULL,
  `delivery_type` varchar(20) DEFAULT NULL,
  `shipping_fee` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `customer_id`, `customer_name`, `customer_email`, `customer_phone`, `status`, `subtotal`, `offer_discount`, `coupon_discount`, `coupon_code`, `tax_amount`, `total`, `notes`, `rejection_reason`, `source`, `branch_id`, `delivery_type`, `shipping_fee`, `created_at`, `updated_at`) VALUES
('UFU8GX', '16468347-97c1-40d0-92ac-3d188ec2e221', 'Mr. Abdul Moiz', 'digious.moiz@gmail.com', '23142314', 'pending', 500.00, 0.00, 0.00, NULL, 0.00, 649.00, 'Delivery type: delivery\nAddress: Airport\nDelivery area: Airport\nLandmark: asdf\nPayment: CASH\nAlternate phone: 234234231', NULL, 'website', 'br_1788026544351_51d763a8', 'delivery', 149.00, '2026-08-29 23:22:06', '2026-08-29 23:22:06'),
('VAPY9M', '16468347-97c1-40d0-92ac-3d188ec2e221', 'Mr. Abdul Moiz', 'digious.moiz@gmail.com', '23142314', 'delivered', 250.00, 0.00, 0.00, NULL, 42.50, 441.50, 'Delivery type: delivery\nAddress: Akhtar Colony\nDelivery area: Akhtar Colony\nLandmark: asdf\nPayment: CASH\nAlternate phone: asdf', NULL, 'website', 'br_xyz_karachi', 'delivery', 149.00, '2026-08-29 23:22:51', '2026-08-29 23:23:18');

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
('73a26beb-b473-427d-b50c-808ec1deea0f', 'UFU8GX', 'prod_1788027457154_591ea850', 'Cheese Burger', 1, 500.00, '2026-08-29 23:22:06'),
('a6b70ced-96d5-407b-bc8d-b71da9a185cf', 'VAPY9M', 'prod_1788027215721_64a5ba00', 'Zinger Burger', 1, 250.00, '2026-08-29 23:22:51');

-- --------------------------------------------------------

--
-- Table structure for table `order_reviews`
--

CREATE TABLE `order_reviews` (
  `id` varchar(36) NOT NULL,
  `order_id` varchar(36) NOT NULL,
  `customer_name` varchar(120) NOT NULL,
  `overall_rating` tinyint(4) NOT NULL,
  `comment` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `source` enum('tracking','email','whatsapp') NOT NULL DEFAULT 'tracking',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_review_items`
--

CREATE TABLE `order_review_items` (
  `id` varchar(36) NOT NULL,
  `order_review_id` varchar(36) NOT NULL,
  `product_id` varchar(36) DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `rating` tinyint(4) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
('pay_1787775312092_ccbf1e01', 'CASH', 'Cash Payment', '💳', 1, '2026-08-27 01:15:12', '2026-08-27 01:15:22');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` varchar(36) NOT NULL,
  `module` varchar(60) NOT NULL,
  `action` varchar(20) NOT NULL,
  `perm_key` varchar(80) NOT NULL,
  `label` varchar(120) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `module`, `action`, `perm_key`, `label`, `sort_order`) VALUES
('perm_abandoned_carts_manage', 'abandoned_carts', 'manage', 'abandoned_carts.manage', 'Manage abandoned carts', 51),
('perm_abandoned_carts_view', 'abandoned_carts', 'view', 'abandoned_carts.view', 'View abandoned carts', 50),
('perm_branches_manage', 'branches', 'manage', 'branches.manage', 'Manage branches', 101),
('perm_branches_view', 'branches', 'view', 'branches.view', 'View branches', 100),
('perm_customers_manage', 'customers', 'manage', 'customers.manage', 'Manage customers', 31),
('perm_customers_view', 'customers', 'view', 'customers.view', 'View customers', 30),
('perm_dashboard_view', 'dashboard', 'view', 'dashboard.view', 'View dashboard', 10),
('perm_marketing_manage', 'marketing', 'manage', 'marketing.manage', 'Manage marketing', 71),
('perm_marketing_view', 'marketing', 'view', 'marketing.view', 'View marketing', 70),
('perm_orders_manage', 'orders', 'manage', 'orders.manage', 'Manage orders', 21),
('perm_orders_view', 'orders', 'view', 'orders.view', 'View orders', 20),
('perm_products_manage', 'products', 'manage', 'products.manage', 'Manage products & menu', 41),
('perm_products_view', 'products', 'view', 'products.view', 'View products & menu', 40),
('perm_reports_view', 'reports', 'view', 'reports.view', 'View reports', 60),
('perm_roles_manage', 'roles', 'manage', 'roles.manage', 'Manage roles & permissions', 93),
('perm_roles_view', 'roles', 'view', 'roles.view', 'View roles', 92),
('perm_settings_manage', 'settings', 'manage', 'settings.manage', 'Manage settings', 81),
('perm_settings_view', 'settings', 'view', 'settings.view', 'View settings', 80),
('perm_users_manage', 'users', 'manage', 'users.manage', 'Manage users', 91),
('perm_users_view', 'users', 'view', 'users.view', 'View users', 90);

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
  `branch_id` varchar(36) DEFAULT NULL,
  `tax_code_id` varchar(36) DEFAULT NULL,
  `tax_mode` enum('inclusive','exclusive') NOT NULL DEFAULT 'inclusive',
  `addon_mode` enum('none','all','selected') NOT NULL DEFAULT 'selected',
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

INSERT INTO `products` (`id`, `name`, `category_id`, `brand_id`, `price`, `stock`, `status`, `image`, `sales`, `branch_id`, `tax_code_id`, `tax_mode`, `addon_mode`, `created_at`, `updated_at`, `description`, `discounted_price`, `tag`, `rating`, `is_featured`, `sort_order`) VALUES
('prod_1788027215721_64a5ba00', 'Zinger Burger', 'cat_1788026843015_bc30e498', NULL, 250.00, -1, 'active', '/uploads/img_1788027186133_rhxswl.webp', 0, NULL, 'tax_1787775402786_4774c68c', 'exclusive', 'none', '2026-08-29 23:13:35', '2026-08-29 23:13:35', 'Short Desc', NULL, '', 4.5, 1, 0),
('prod_1788027258950_8d44d1bb', 'Cheese Burger', 'cat_1788026843015_bc30e498', NULL, 300.00, -1, 'active', '/uploads/img_1788027244519_lx0gry.png', 0, 'br_1788026544351_51d763a8', 'tax_1787775402786_4774c68c', 'inclusive', 'all', '2026-08-29 23:14:18', '2026-08-29 23:14:18', 'description', NULL, '', 4.5, 1, 0),
('prod_1788027457154_591ea850', 'Cheese Burger', 'cat_1788026843015_bc30e498', NULL, 500.00, -1, 'active', '/uploads/img_1788027442362_uc56kx.png', 0, 'br_1788026544351_51d763a8', NULL, 'inclusive', 'all', '2026-08-29 23:17:37', '2026-08-29 23:17:37', '', NULL, '', 4.5, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `product_addons`
--

CREATE TABLE `product_addons` (
  `product_id` varchar(36) NOT NULL,
  `addon_id` varchar(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `branch_id` varchar(36) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `review_settings`
--

CREATE TABLE `review_settings` (
  `id` varchar(36) NOT NULL,
  `email_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `whatsapp_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `email_subject` varchar(255) DEFAULT NULL,
  `email_body_template` text DEFAULT NULL,
  `whatsapp_template` text DEFAULT NULL,
  `delay_minutes` int(11) NOT NULL DEFAULT 30,
  `invite_on_delivered` tinyint(1) NOT NULL DEFAULT 1,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `review_settings`
--

INSERT INTO `review_settings` (`id`, `email_enabled`, `whatsapp_enabled`, `email_subject`, `email_body_template`, `whatsapp_template`, `delay_minutes`, `invite_on_delivered`, `updated_at`) VALUES
('revset_default', 0, 0, 'How was your order from {{restaurantName}}?', 'Hi {{customerName}},\n\nThanks for ordering with us! We\'d love your feedback on order {{orderId}}.\n\nLeave a review here: {{trackingUrl}}\n\nThank you!', 'Hi {{customerName}}! How was your order {{orderId}}? Share your review: {{trackingUrl}}', 30, 1, '2026-07-31 23:52:29');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` varchar(36) NOT NULL,
  `name` varchar(120) NOT NULL,
  `slug` varchar(80) NOT NULL,
  `description` text DEFAULT NULL,
  `is_system` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `slug`, `description`, `is_system`, `created_at`, `updated_at`) VALUES
('role_admin', 'Administrator', 'admin', 'Full access to all modules (super admin)', 1, '2026-08-19 22:18:10', '2026-08-22 00:12:56'),
('role_manager', 'Manager', 'manager', 'Branch operations, menu, marketing, and reports (no global settings)', 1, '2026-08-19 22:18:11', '2026-08-22 00:12:56'),
('role_staff', 'Staff', 'staff', 'Orders and customer lookup', 1, '2026-08-19 22:18:11', '2026-08-19 22:18:11');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `role_id` varchar(36) NOT NULL,
  `permission_id` varchar(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
('role_admin', 'perm_abandoned_carts_manage'),
('role_admin', 'perm_abandoned_carts_view'),
('role_admin', 'perm_branches_manage'),
('role_admin', 'perm_branches_view'),
('role_admin', 'perm_customers_manage'),
('role_admin', 'perm_customers_view'),
('role_admin', 'perm_dashboard_view'),
('role_admin', 'perm_marketing_manage'),
('role_admin', 'perm_marketing_view'),
('role_admin', 'perm_orders_manage'),
('role_admin', 'perm_orders_view'),
('role_admin', 'perm_products_manage'),
('role_admin', 'perm_products_view'),
('role_admin', 'perm_reports_view'),
('role_admin', 'perm_roles_manage'),
('role_admin', 'perm_roles_view'),
('role_admin', 'perm_settings_manage'),
('role_admin', 'perm_settings_view'),
('role_admin', 'perm_users_manage'),
('role_admin', 'perm_users_view'),
('role_manager', 'perm_abandoned_carts_manage'),
('role_manager', 'perm_abandoned_carts_view'),
('role_manager', 'perm_customers_manage'),
('role_manager', 'perm_customers_view'),
('role_manager', 'perm_dashboard_view'),
('role_manager', 'perm_marketing_manage'),
('role_manager', 'perm_marketing_view'),
('role_manager', 'perm_orders_manage'),
('role_manager', 'perm_orders_view'),
('role_manager', 'perm_products_manage'),
('role_manager', 'perm_products_view'),
('role_manager', 'perm_reports_view'),
('role_staff', 'perm_abandoned_carts_view'),
('role_staff', 'perm_customers_view'),
('role_staff', 'perm_dashboard_view'),
('role_staff', 'perm_orders_manage'),
('role_staff', 'perm_orders_view'),
('role_staff', 'perm_products_view');

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

-- --------------------------------------------------------

--
-- Table structure for table `tax_codes`
--

CREATE TABLE `tax_codes` (
  `id` varchar(36) NOT NULL,
  `name` varchar(120) NOT NULL,
  `code` varchar(40) NOT NULL,
  `rate` decimal(8,4) NOT NULL DEFAULT 0.0000,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tax_codes`
--

INSERT INTO `tax_codes` (`id`, `name`, `code`, `rate`, `active`, `created_at`, `updated_at`) VALUES
('tax_1787775402786_4774c68c', 'GST 17%', 'GST', 17.0000, 1, '2026-08-27 01:16:42', '2026-08-27 01:16:42');

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
  `role` varchar(80) NOT NULL DEFAULT 'staff',
  `role_id` varchar(36) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `role_id`, `status`, `last_login`, `created_at`, `updated_at`) VALUES
('85ddc4f7-c0a5-4edb-b3af-c5d58684a10b', 'Admin User', 'admin@restaurant.com', '$2b$10$E1tqti5fB5xURF2B7QH40eq7leSJwootI0m8qakz92r6c8KQTG56u', 'admin', 'role_admin', 'active', '2026-08-29 21:40:36', '2026-07-03 23:15:19', '2026-08-29 21:40:36');

-- --------------------------------------------------------

--
-- Table structure for table `user_branches`
--

CREATE TABLE `user_branches` (
  `user_id` varchar(36) NOT NULL,
  `branch_id` varchar(36) NOT NULL,
  `assigned_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_branches`
--

INSERT INTO `user_branches` (`user_id`, `branch_id`, `assigned_at`) VALUES
('85ddc4f7-c0a5-4edb-b3af-c5d58684a10b', 'br_xyz_karachi', '2026-08-27 00:33:14');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `abandoned_carts`
--
ALTER TABLE `abandoned_carts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_carts_recovered` (`recovered`),
  ADD KEY `idx_carts_session` (`session_key`),
  ADD KEY `idx_carts_email` (`email`),
  ADD KEY `idx_carts_branch` (`branch_id`);

--
-- Indexes for table `addons`
--
ALTER TABLE `addons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_addons_status` (`status`),
  ADD KEY `idx_addons_name` (`name`),
  ADD KEY `idx_addons_branch` (`branch_id`);

--
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_branches_code` (`code`),
  ADD KEY `idx_branches_status` (`status`);

--
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_brands_name` (`name`),
  ADD KEY `idx_brands_branch` (`branch_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_categories_name` (`name`),
  ADD KEY `idx_categories_branch` (`branch_id`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_coupons_branch` (`branch_id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_customers_email` (`email`),
  ADD KEY `idx_customers_name` (`name`),
  ADD KEY `idx_customers_branch` (`branch_id`);

--
-- Indexes for table `deals`
--
ALTER TABLE `deals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_deals_active_schedule` (`active`,`start_at`,`end_at`),
  ADD KEY `idx_deals_sort` (`sort_order`),
  ADD KEY `fk_deals_tax_code` (`tax_code_id`),
  ADD KEY `idx_deals_branch` (`branch_id`);

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
-- Indexes for table `delivery_areas`
--
ALTER TABLE `delivery_areas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_delivery_areas_branch_slug` (`branch_id`,`slug`),
  ADD KEY `idx_delivery_areas_enabled_sort` (`enabled`,`sort_order`,`name`),
  ADD KEY `idx_delivery_areas_branch` (`branch_id`);

--
-- Indexes for table `delivery_charge_settings`
--
ALTER TABLE `delivery_charge_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `discounts`
--
ALTER TABLE `discounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_discounts_branch` (`branch_id`);

--
-- Indexes for table `drinks`
--
ALTER TABLE `drinks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_drinks_status` (`status`),
  ADD KEY `idx_drinks_sort` (`sort_order`),
  ADD KEY `idx_drinks_name` (`name`),
  ADD KEY `idx_drinks_branch` (`branch_id`);

--
-- Indexes for table `offers`
--
ALTER TABLE `offers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_offers_tax_code` (`tax_code_id`),
  ADD KEY `fk_offers_category` (`category_id`),
  ADD KEY `idx_offers_branch` (`branch_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_orders_status` (`status`),
  ADD KEY `idx_orders_customer` (`customer_id`),
  ADD KEY `idx_orders_created` (`created_at`),
  ADD KEY `idx_orders_branch` (`branch_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_items_order` (`order_id`);

--
-- Indexes for table `order_reviews`
--
ALTER TABLE `order_reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_order_reviews_order` (`order_id`),
  ADD KEY `idx_order_reviews_status` (`status`),
  ADD KEY `idx_order_reviews_source` (`source`);

--
-- Indexes for table `order_review_items`
--
ALTER TABLE `order_review_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_order_review_items_product` (`product_id`),
  ADD KEY `idx_order_review_items_review` (`order_review_id`);

--
-- Indexes for table `payment_gateways`
--
ALTER TABLE `payment_gateways`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_permissions_key` (`perm_key`),
  ADD KEY `idx_permissions_module` (`module`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_products_category` (`category_id`),
  ADD KEY `fk_products_brand` (`brand_id`),
  ADD KEY `idx_products_name` (`name`),
  ADD KEY `idx_products_status` (`status`),
  ADD KEY `fk_products_tax_code` (`tax_code_id`),
  ADD KEY `idx_products_branch` (`branch_id`);

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
  ADD KEY `idx_reviews_status` (`status`),
  ADD KEY `idx_reviews_branch` (`branch_id`);

--
-- Indexes for table `review_settings`
--
ALTER TABLE `review_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_roles_slug` (`slug`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`role_id`,`permission_id`),
  ADD KEY `fk_role_permissions_perm` (`permission_id`);

--
-- Indexes for table `shipping_methods`
--
ALTER TABLE `shipping_methods`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tax_codes`
--
ALTER TABLE `tax_codes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_tax_codes_code` (`code`),
  ADD KEY `idx_tax_codes_active` (`active`);

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
  ADD KEY `idx_users_status` (`status`),
  ADD KEY `idx_users_role_id` (`role_id`);

--
-- Indexes for table `user_branches`
--
ALTER TABLE `user_branches`
  ADD PRIMARY KEY (`user_id`,`branch_id`),
  ADD KEY `fk_user_branches_branch` (`branch_id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `deals`
--
ALTER TABLE `deals`
  ADD CONSTRAINT `fk_deals_tax_code` FOREIGN KEY (`tax_code_id`) REFERENCES `tax_codes` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `deal_items`
--
ALTER TABLE `deal_items`
  ADD CONSTRAINT `fk_deal_items_addon` FOREIGN KEY (`addon_id`) REFERENCES `addons` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_deal_items_deal` FOREIGN KEY (`deal_id`) REFERENCES `deals` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_deal_items_drink` FOREIGN KEY (`drink_id`) REFERENCES `drinks` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_deal_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `offers`
--
ALTER TABLE `offers`
  ADD CONSTRAINT `fk_offers_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_offers_tax_code` FOREIGN KEY (`tax_code_id`) REFERENCES `tax_codes` (`id`) ON DELETE SET NULL;

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
-- Constraints for table `order_reviews`
--
ALTER TABLE `order_reviews`
  ADD CONSTRAINT `fk_order_reviews_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_review_items`
--
ALTER TABLE `order_review_items`
  ADD CONSTRAINT `fk_order_review_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_order_review_items_review` FOREIGN KEY (`order_review_id`) REFERENCES `order_reviews` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_products_tax_code` FOREIGN KEY (`tax_code_id`) REFERENCES `tax_codes` (`id`) ON DELETE SET NULL;

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

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `fk_role_permissions_perm` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_role_permissions_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_branches`
--
ALTER TABLE `user_branches`
  ADD CONSTRAINT `fk_user_branches_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_user_branches_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
