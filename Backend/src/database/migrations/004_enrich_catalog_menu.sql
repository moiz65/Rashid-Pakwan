ALTER TABLE categories
  ADD COLUMN image VARCHAR(500) NULL,
  ADD COLUMN sort_order INT NOT NULL DEFAULT 0,
  ADD COLUMN is_visible TINYINT(1) NOT NULL DEFAULT 1;

ALTER TABLE products
  ADD COLUMN description TEXT NULL,
  ADD COLUMN discounted_price DECIMAL(12,2) NULL,
  ADD COLUMN tag VARCHAR(60) NULL,
  ADD COLUMN rating DECIMAL(2,1) NOT NULL DEFAULT 4.5,
  ADD COLUMN is_featured TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN sort_order INT NOT NULL DEFAULT 0,
  MODIFY COLUMN image VARCHAR(500) NULL;

CREATE TABLE IF NOT EXISTS addons (
  id            VARCHAR(36)   NOT NULL PRIMARY KEY,
  name          VARCHAR(120)  NOT NULL,
  price         DECIMAL(12,2) NOT NULL DEFAULT 0,
  status        ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_addons_status (status),
  INDEX idx_addons_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_addons (
  product_id    VARCHAR(36) NOT NULL,
  addon_id      VARCHAR(36) NOT NULL,
  PRIMARY KEY (product_id, addon_id),
  CONSTRAINT fk_product_addons_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_product_addons_addon FOREIGN KEY (addon_id) REFERENCES addons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
