CREATE TABLE IF NOT EXISTS delivery_areas (
  id          VARCHAR(64)    NOT NULL PRIMARY KEY,
  name        VARCHAR(160)   NOT NULL,
  slug        VARCHAR(160)   NOT NULL,
  charge      DECIMAL(10, 2) NOT NULL DEFAULT 0,
  sort_order  INT            NOT NULL DEFAULT 0,
  enabled     TINYINT(1)     NOT NULL DEFAULT 1,
  created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_delivery_areas_slug (slug),
  KEY idx_delivery_areas_enabled_sort (enabled, sort_order, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
