-- Deal selling price + compare-at (original) price
ALTER TABLE deals
  ADD COLUMN price DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER image,
  ADD COLUMN original_price DECIMAL(12,2) NULL AFTER price;

CREATE TABLE IF NOT EXISTS deal_items (
  id          VARCHAR(36)   NOT NULL PRIMARY KEY,
  deal_id     VARCHAR(36)   NOT NULL,
  product_id  VARCHAR(36)   NULL,
  name        VARCHAR(255)  NOT NULL,
  qty         INT           NOT NULL DEFAULT 1,
  unit_price  DECIMAL(12,2) NOT NULL DEFAULT 0,
  sort_order  INT           NOT NULL DEFAULT 0,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_deal_items_deal FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
  CONSTRAINT fk_deal_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_deal_items_deal (deal_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
