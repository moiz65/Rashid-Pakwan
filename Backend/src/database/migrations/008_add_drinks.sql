CREATE TABLE IF NOT EXISTS drinks (
  id            VARCHAR(36)   NOT NULL PRIMARY KEY,
  name          VARCHAR(120)  NOT NULL,
  description   TEXT          NULL,
  price         DECIMAL(12,2) NOT NULL DEFAULT 0,
  stock         INT           NOT NULL DEFAULT -1,
  image         VARCHAR(255)  NULL,
  status        ENUM('active', 'inactive', 'out_of_stock') NOT NULL DEFAULT 'active',
  sort_order    INT           NOT NULL DEFAULT 0,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_drinks_status (status),
  INDEX idx_drinks_sort (sort_order),
  INDEX idx_drinks_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE deal_items
  ADD COLUMN item_type ENUM('product', 'drink', 'addon') NOT NULL DEFAULT 'product' AFTER deal_id,
  ADD COLUMN drink_id VARCHAR(36) NULL AFTER product_id,
  ADD COLUMN addon_id VARCHAR(36) NULL AFTER drink_id;

ALTER TABLE deal_items
  ADD CONSTRAINT fk_deal_items_drink FOREIGN KEY (drink_id) REFERENCES drinks(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_deal_items_addon FOREIGN KEY (addon_id) REFERENCES addons(id) ON DELETE SET NULL;
