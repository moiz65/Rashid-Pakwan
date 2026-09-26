CREATE TABLE IF NOT EXISTS categories (
  id            VARCHAR(36)  NOT NULL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  slug          VARCHAR(160) NOT NULL UNIQUE,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS brands (
  id            VARCHAR(36)  NOT NULL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  logo          VARCHAR(32)  NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_brands_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id            VARCHAR(36)   NOT NULL PRIMARY KEY,
  name          VARCHAR(255)  NOT NULL,
  category_id   VARCHAR(36)   NULL,
  brand_id      VARCHAR(36)   NULL,
  price         DECIMAL(12,2) NOT NULL DEFAULT 0,
  stock         INT           NOT NULL DEFAULT 0,
  status        ENUM('active', 'inactive', 'out_of_stock') NOT NULL DEFAULT 'active',
  image         VARCHAR(32)   NULL,
  sales         INT           NOT NULL DEFAULT 0,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_products_brand FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL,
  INDEX idx_products_name (name),
  INDEX idx_products_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reviews (
  id             VARCHAR(36)  NOT NULL PRIMARY KEY,
  product_id     VARCHAR(36)  NULL,
  customer_name  VARCHAR(120) NOT NULL,
  rating         TINYINT      NOT NULL DEFAULT 5,
  comment        TEXT         NULL,
  status         ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_reviews_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS coupons (
  id          VARCHAR(36)   NOT NULL PRIMARY KEY,
  code        VARCHAR(60)   NOT NULL UNIQUE,
  type        ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
  value       DECIMAL(12,2) NOT NULL DEFAULT 0,
  min_order   DECIMAL(12,2) NOT NULL DEFAULT 0,
  max_uses    INT           NOT NULL DEFAULT 0,
  used_count  INT           NOT NULL DEFAULT 0,
  expiry      DATETIME      NULL,
  active      TINYINT(1)    NOT NULL DEFAULT 1,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS discounts (
  id          VARCHAR(36)   NOT NULL PRIMARY KEY,
  name        VARCHAR(120)  NOT NULL,
  type        ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
  value       DECIMAL(12,2) NOT NULL DEFAULT 0,
  category    VARCHAR(120)  NULL,
  active      TINYINT(1)    NOT NULL DEFAULT 1,
  start_date  DATETIME      NULL,
  end_date    DATETIME      NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS offers (
  id          VARCHAR(36)  NOT NULL PRIMARY KEY,
  title       VARCHAR(180) NOT NULL,
  type        VARCHAR(60)  NOT NULL DEFAULT 'bundle',
  conditions  TEXT         NULL,
  active      TINYINT(1)   NOT NULL DEFAULT 1,
  start_date  DATETIME     NULL,
  end_date    DATETIME     NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payment_gateways (
  id          VARCHAR(36)  NOT NULL PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  description TEXT         NULL,
  icon        VARCHAR(32)  NULL,
  enabled     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS shipping_methods (
  id             VARCHAR(36)   NOT NULL PRIMARY KEY,
  name           VARCHAR(120)  NOT NULL,
  description    TEXT          NULL,
  price          DECIMAL(12,2) NOT NULL DEFAULT 0,
  estimated_time VARCHAR(60)   NULL,
  enabled        TINYINT(1)    NOT NULL DEFAULT 1,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS abandoned_carts (
  id             VARCHAR(36)   NOT NULL PRIMARY KEY,
  customer_id    VARCHAR(36)   NULL,
  customer_name  VARCHAR(120)  NOT NULL,
  email          VARCHAR(255)  NULL,
  items          JSON          NOT NULL,
  value          DECIMAL(12,2) NOT NULL DEFAULT 0,
  abandoned_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  recovered      TINYINT(1)    NOT NULL DEFAULT 0,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_carts_recovered (recovered)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
