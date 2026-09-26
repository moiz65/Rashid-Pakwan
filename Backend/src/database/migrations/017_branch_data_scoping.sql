ALTER TABLE customers
  ADD COLUMN branch_id VARCHAR(36) NULL AFTER joined_at;

ALTER TABLE products
  ADD COLUMN branch_id VARCHAR(36) NULL AFTER sales;

ALTER TABLE categories
  ADD COLUMN branch_id VARCHAR(36) NULL AFTER is_visible;

ALTER TABLE abandoned_carts
  ADD COLUMN branch_id VARCHAR(36) NULL AFTER recovered;

UPDATE customers c
  SET c.branch_id = (SELECT b.id FROM branches b WHERE b.is_primary = 1 LIMIT 1)
  WHERE c.branch_id IS NULL;

UPDATE products p
  SET p.branch_id = (SELECT b.id FROM branches b WHERE b.is_primary = 1 LIMIT 1)
  WHERE p.branch_id IS NULL;

UPDATE categories c
  SET c.branch_id = (SELECT b.id FROM branches b WHERE b.is_primary = 1 LIMIT 1)
  WHERE c.branch_id IS NULL;

UPDATE abandoned_carts ac
  SET ac.branch_id = (SELECT b.id FROM branches b WHERE b.is_primary = 1 LIMIT 1)
  WHERE ac.branch_id IS NULL;

UPDATE orders o
  SET o.branch_id = (SELECT b.id FROM branches b WHERE b.is_primary = 1 LIMIT 1)
  WHERE o.branch_id IS NULL;

CREATE INDEX idx_customers_branch ON customers (branch_id);
CREATE INDEX idx_products_branch ON products (branch_id);
CREATE INDEX idx_categories_branch ON categories (branch_id);
CREATE INDEX idx_carts_branch ON abandoned_carts (branch_id);
CREATE INDEX idx_orders_branch ON orders (branch_id);
