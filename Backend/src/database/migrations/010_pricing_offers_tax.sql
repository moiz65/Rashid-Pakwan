-- Tax codes module
CREATE TABLE IF NOT EXISTS tax_codes (
  id          VARCHAR(36)   NOT NULL PRIMARY KEY,
  name        VARCHAR(120)  NOT NULL,
  code        VARCHAR(40)   NOT NULL,
  rate        DECIMAL(8,4)  NOT NULL DEFAULT 0,
  active      TINYINT(1)    NOT NULL DEFAULT 1,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_tax_codes_code (code),
  INDEX idx_tax_codes_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO tax_codes (id, name, code, rate, active)
VALUES ('tax_gst17', 'GST 17%', 'GST', 17.0000, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name), rate = VALUES(rate);

-- Products: tax attachment
ALTER TABLE products
  ADD COLUMN tax_code_id VARCHAR(36) NULL AFTER sales;
ALTER TABLE products
  ADD COLUMN tax_mode ENUM('inclusive', 'exclusive') NOT NULL DEFAULT 'inclusive' AFTER tax_code_id;
ALTER TABLE products
  ADD CONSTRAINT fk_products_tax_code FOREIGN KEY (tax_code_id) REFERENCES tax_codes(id) ON DELETE SET NULL;

-- Deals: tax attachment + remove promo links
ALTER TABLE deals DROP FOREIGN KEY fk_deals_coupon;
ALTER TABLE deals DROP FOREIGN KEY fk_deals_discount;
ALTER TABLE deals DROP FOREIGN KEY fk_deals_offer;
ALTER TABLE deals DROP COLUMN coupon_id;
ALTER TABLE deals DROP COLUMN discount_id;
ALTER TABLE deals DROP COLUMN offer_id;
ALTER TABLE deals
  ADD COLUMN tax_code_id VARCHAR(36) NULL AFTER original_price;
ALTER TABLE deals
  ADD COLUMN tax_mode ENUM('inclusive', 'exclusive') NOT NULL DEFAULT 'inclusive' AFTER tax_code_id;
ALTER TABLE deals
  ADD CONSTRAINT fk_deals_tax_code FOREIGN KEY (tax_code_id) REFERENCES tax_codes(id) ON DELETE SET NULL;

-- Offers: structured rule engine fields
ALTER TABLE offers
  ADD COLUMN description TEXT NULL AFTER title;
ALTER TABLE offers
  ADD COLUMN discount_value DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER type;
ALTER TABLE offers
  ADD COLUMN min_order DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER discount_value;
ALTER TABLE offers
  ADD COLUMN max_discount DECIMAL(12,2) NULL AFTER min_order;
ALTER TABLE offers
  ADD COLUMN buy_qty INT NOT NULL DEFAULT 1 AFTER max_discount;
ALTER TABLE offers
  ADD COLUMN get_qty INT NOT NULL DEFAULT 1 AFTER buy_qty;
ALTER TABLE offers
  ADD COLUMN apply_scope ENUM('all', 'category', 'products') NOT NULL DEFAULT 'all' AFTER get_qty;
ALTER TABLE offers
  ADD COLUMN category_id VARCHAR(36) NULL AFTER apply_scope;
ALTER TABLE offers
  ADD COLUMN product_ids JSON NULL AFTER category_id;
ALTER TABLE offers
  ADD COLUMN free_product_id VARCHAR(36) NULL AFTER product_ids;
ALTER TABLE offers
  ADD COLUMN tax_code_id VARCHAR(36) NULL AFTER free_product_id;
ALTER TABLE offers
  ADD COLUMN tax_mode ENUM('inclusive', 'exclusive') NOT NULL DEFAULT 'inclusive' AFTER tax_code_id;
ALTER TABLE offers
  ADD CONSTRAINT fk_offers_tax_code FOREIGN KEY (tax_code_id) REFERENCES tax_codes(id) ON DELETE SET NULL;
ALTER TABLE offers
  ADD CONSTRAINT fk_offers_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

-- Orders: money breakdown
ALTER TABLE orders
  ADD COLUMN subtotal DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER status;
ALTER TABLE orders
  ADD COLUMN offer_discount DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER subtotal;
ALTER TABLE orders
  ADD COLUMN coupon_discount DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER offer_discount;
ALTER TABLE orders
  ADD COLUMN coupon_code VARCHAR(60) NULL AFTER coupon_discount;
ALTER TABLE orders
  ADD COLUMN tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER coupon_code;
