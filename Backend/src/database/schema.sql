-- Restaurant Ordering Management — core schema

CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(36)  NOT NULL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(80)  NOT NULL DEFAULT 'staff',
  role_id       VARCHAR(36)  NULL,
  status        ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  last_login    DATETIME     NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role),
  INDEX idx_users_role_id (role_id),
  INDEX idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS roles (
  id          VARCHAR(36)  NOT NULL PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  slug        VARCHAR(80)  NOT NULL,
  description TEXT         NULL,
  is_system   TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_roles_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS permissions (
  id         VARCHAR(36)  NOT NULL PRIMARY KEY,
  module     VARCHAR(60)  NOT NULL,
  action     VARCHAR(20)  NOT NULL,
  perm_key   VARCHAR(80)  NOT NULL,
  label      VARCHAR(120) NOT NULL,
  sort_order INT          NOT NULL DEFAULT 0,
  UNIQUE KEY uk_permissions_key (perm_key),
  INDEX idx_permissions_module (module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       VARCHAR(36) NOT NULL,
  permission_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_role_permissions_perm FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         VARCHAR(36)  NOT NULL PRIMARY KEY,
  user_id    VARCHAR(36)  NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME     NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_refresh_tokens_user (user_id),
  INDEX idx_refresh_tokens_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customers (
  id            VARCHAR(36)   NOT NULL PRIMARY KEY,
  name          VARCHAR(120)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  phone         VARCHAR(30)   NULL,
  total_orders  INT           NOT NULL DEFAULT 0,
  spent         DECIMAL(12,2) NOT NULL DEFAULT 0,
  joined_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customers_email (email),
  INDEX idx_customers_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id             VARCHAR(36)   NOT NULL PRIMARY KEY,
  customer_id    VARCHAR(36)   NULL,
  customer_name  VARCHAR(120)  NOT NULL,
  customer_email VARCHAR(255)  NULL,
  customer_phone VARCHAR(30)   NULL,
  status         ENUM('pending', 'confirmed', 'preparing', 'delivered', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
  subtotal       DECIMAL(12,2) NOT NULL DEFAULT 0,
  offer_discount DECIMAL(12,2) NOT NULL DEFAULT 0,
  coupon_discount DECIMAL(12,2) NOT NULL DEFAULT 0,
  coupon_code    VARCHAR(60)   NULL,
  tax_amount     DECIMAL(12,2) NOT NULL DEFAULT 0,
  total          DECIMAL(12,2) NOT NULL DEFAULT 0,
  notes          TEXT          NULL,
  rejection_reason TEXT        NULL,
  source         VARCHAR(50)   NOT NULL DEFAULT 'admin',
  branch_id      VARCHAR(36)   NULL,
  delivery_type  VARCHAR(20)   NULL,
  shipping_fee   DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  INDEX idx_orders_status (status),
  INDEX idx_orders_customer (customer_id),
  INDEX idx_orders_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id         VARCHAR(36)   NOT NULL PRIMARY KEY,
  order_id   VARCHAR(36)   NOT NULL,
  product_id VARCHAR(36)   NULL,
  name       VARCHAR(255)  NOT NULL,
  qty        INT           NOT NULL DEFAULT 1,
  price      DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order_items_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tracking_settings (
  id                    VARCHAR(36)   NOT NULL PRIMARY KEY,
  restaurant_name       VARCHAR(120)  NOT NULL,
  phone                 VARCHAR(30)   NULL,
  support_email         VARCHAR(255)  NULL,
  address               TEXT          NULL,
  logo_url              VARCHAR(500)  NULL,
  help_text             TEXT          NULL,
  poll_interval_seconds INT           NOT NULL DEFAULT 20,
  show_rejection_reason TINYINT(1)    NOT NULL DEFAULT 1,
  status_messages       JSON          NOT NULL,
  updated_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories (
  id            VARCHAR(36)  NOT NULL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  slug          VARCHAR(160) NOT NULL UNIQUE,
  image         VARCHAR(500) NULL,
  sort_order    INT          NOT NULL DEFAULT 0,
  is_visible    TINYINT(1)   NOT NULL DEFAULT 1,
  branch_id     VARCHAR(36)  NULL,
  branch_ids    JSON         NULL,
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

CREATE TABLE IF NOT EXISTS products (
  id                VARCHAR(36)   NOT NULL PRIMARY KEY,
  name              VARCHAR(255)  NOT NULL,
  category_id       VARCHAR(36)   NULL,
  brand_id          VARCHAR(36)   NULL,
  price             DECIMAL(12,2) NOT NULL DEFAULT 0,
  discounted_price  DECIMAL(12,2) NULL,
  stock             INT           NOT NULL DEFAULT 0,
  status            ENUM('active', 'inactive', 'out_of_stock') NOT NULL DEFAULT 'active',
  image             VARCHAR(500)  NULL,
  description       TEXT          NULL,
  tag               VARCHAR(60)   NULL,
  rating            DECIMAL(2,1)  NOT NULL DEFAULT 4.5,
  is_featured       TINYINT(1)    NOT NULL DEFAULT 0,
  sort_order        INT           NOT NULL DEFAULT 0,
  sales             INT           NOT NULL DEFAULT 0,
  tax_code_id       VARCHAR(36)   NULL,
  tax_mode          ENUM('inclusive', 'exclusive') NOT NULL DEFAULT 'inclusive',
  addon_mode        ENUM('none', 'all', 'selected') NOT NULL DEFAULT 'selected',
  variations        JSON          NULL,
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_products_brand FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL,
  INDEX idx_products_name (name),
  INDEX idx_products_status (status),
  INDEX idx_products_featured (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS addons (
  id              VARCHAR(36)   NOT NULL PRIMARY KEY,
  name            VARCHAR(120)  NOT NULL,
  price           DECIMAL(12,2) NOT NULL DEFAULT 0,
  original_price  DECIMAL(10,2) NULL,
  image           VARCHAR(500)  NULL,
  status          ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_addons_status (status),
  INDEX idx_addons_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE TABLE IF NOT EXISTS product_addons (
  product_id    VARCHAR(36) NOT NULL,
  addon_id      VARCHAR(36) NOT NULL,
  PRIMARY KEY (product_id, addon_id),
  CONSTRAINT fk_product_addons_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_product_addons_addon FOREIGN KEY (addon_id) REFERENCES addons(id) ON DELETE CASCADE
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

CREATE TABLE IF NOT EXISTS order_reviews (
  id              VARCHAR(36)  NOT NULL PRIMARY KEY,
  order_id        VARCHAR(36)  NOT NULL,
  customer_name   VARCHAR(120) NOT NULL,
  overall_rating  TINYINT      NOT NULL,
  comment         TEXT         NULL,
  status          ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  source          ENUM('tracking', 'email', 'whatsapp') NOT NULL DEFAULT 'tracking',
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_reviews_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  UNIQUE KEY uq_order_reviews_order (order_id),
  INDEX idx_order_reviews_status (status),
  INDEX idx_order_reviews_source (source)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_review_items (
  id               VARCHAR(36)  NOT NULL PRIMARY KEY,
  order_review_id  VARCHAR(36)  NOT NULL,
  product_id       VARCHAR(36)  NULL,
  product_name     VARCHAR(255) NOT NULL,
  rating           TINYINT      NOT NULL,
  comment          TEXT         NULL,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_review_items_review FOREIGN KEY (order_review_id) REFERENCES order_reviews(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_review_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_order_review_items_review (order_review_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS review_settings (
  id                   VARCHAR(36)  NOT NULL PRIMARY KEY,
  email_enabled        TINYINT(1)   NOT NULL DEFAULT 0,
  whatsapp_enabled     TINYINT(1)   NOT NULL DEFAULT 0,
  email_subject        VARCHAR(255) NULL,
  email_body_template  TEXT         NULL,
  whatsapp_template    TEXT         NULL,
  delay_minutes        INT          NOT NULL DEFAULT 30,
  invite_on_delivered  TINYINT(1)   NOT NULL DEFAULT 1,
  updated_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
  id               VARCHAR(36)  NOT NULL PRIMARY KEY,
  title            VARCHAR(180) NOT NULL,
  description      TEXT         NULL,
  type             VARCHAR(60)  NOT NULL DEFAULT 'percentage',
  conditions       TEXT         NULL,
  discount_value   DECIMAL(12,2) NOT NULL DEFAULT 0,
  min_order        DECIMAL(12,2) NOT NULL DEFAULT 0,
  max_discount     DECIMAL(12,2) NULL,
  buy_qty          INT          NOT NULL DEFAULT 1,
  get_qty          INT          NOT NULL DEFAULT 1,
  apply_scope      ENUM('all', 'category', 'products') NOT NULL DEFAULT 'all',
  category_id      VARCHAR(36)  NULL,
  product_ids      JSON         NULL,
  buy_product_ids  JSON         NULL,
  get_product_ids  JSON         NULL,
  free_product_id  VARCHAR(36)  NULL,
  tax_code_id      VARCHAR(36)  NULL,
  tax_mode         ENUM('inclusive', 'exclusive') NOT NULL DEFAULT 'inclusive',
  active           TINYINT(1)   NOT NULL DEFAULT 1,
  start_date       DATETIME     NULL,
  end_date         DATETIME     NULL,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS deals (
  id              VARCHAR(36)  NOT NULL PRIMARY KEY,
  title           VARCHAR(180) NOT NULL,
  description     TEXT         NULL,
  badge_text      VARCHAR(80)  NULL,
  image           VARCHAR(255) NULL,
  price           DECIMAL(12,2) NOT NULL DEFAULT 0,
  original_price  DECIMAL(12,2) NULL,
  tax_code_id     VARCHAR(36)  NULL,
  tax_mode        ENUM('inclusive', 'exclusive') NOT NULL DEFAULT 'inclusive',
  start_at        DATETIME     NULL,
  end_at          DATETIME     NULL,
  days_of_week    JSON         NULL,
  daily_start_time TIME        NULL,
  daily_end_time   TIME        NULL,
  show_countdown  TINYINT(1)   NOT NULL DEFAULT 1,
  active          TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order      INT          NOT NULL DEFAULT 0,
  addon_mode      ENUM('none', 'all', 'selected') NOT NULL DEFAULT 'none',
  addon_ids       JSON         NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_deals_active_schedule (active, start_at, end_at),
  INDEX idx_deals_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS deal_items (
  id          VARCHAR(36)   NOT NULL PRIMARY KEY,
  deal_id     VARCHAR(36)   NOT NULL,
  item_type   ENUM('product', 'drink', 'addon') NOT NULL DEFAULT 'product',
  product_id  VARCHAR(36)   NULL,
  drink_id    VARCHAR(36)   NULL,
  addon_id    VARCHAR(36)   NULL,
  name        VARCHAR(255)  NOT NULL,
  qty         INT           NOT NULL DEFAULT 1,
  unit_price  DECIMAL(12,2) NOT NULL DEFAULT 0,
  customer_choice TINYINT(1) NOT NULL DEFAULT 0,
  choice_ids  JSON          NULL,
  sort_order  INT           NOT NULL DEFAULT 0,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_deal_items_deal FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
  CONSTRAINT fk_deal_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  CONSTRAINT fk_deal_items_drink FOREIGN KEY (drink_id) REFERENCES drinks(id) ON DELETE SET NULL,
  CONSTRAINT fk_deal_items_addon FOREIGN KEY (addon_id) REFERENCES addons(id) ON DELETE SET NULL,
  INDEX idx_deal_items_deal (deal_id)
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

CREATE TABLE IF NOT EXISTS delivery_charge_settings (
  id                      VARCHAR(36)    NOT NULL PRIMARY KEY,
  fuel_surcharge_fixed    DECIMAL(10, 2) NOT NULL DEFAULT 0,
  fuel_surcharge_percent  DECIMAL(6, 2)  NOT NULL DEFAULT 0,
  free_delivery_min_order DECIMAL(10, 2) NULL,
  enabled                 TINYINT(1)     NOT NULL DEFAULT 1,
  notes                   TEXT           NULL,
  updated_at              DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS delivery_areas (
  id          VARCHAR(64)    NOT NULL PRIMARY KEY,
  branch_id   VARCHAR(36)    NULL,
  name        VARCHAR(160)   NOT NULL,
  slug        VARCHAR(160)   NOT NULL,
  charge      DECIMAL(10, 2) NOT NULL DEFAULT 0,
  sort_order  INT            NOT NULL DEFAULT 0,
  enabled     TINYINT(1)     NOT NULL DEFAULT 1,
  created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_delivery_areas_branch_slug (branch_id, slug),
  KEY idx_delivery_areas_branch (branch_id),
  KEY idx_delivery_areas_enabled_sort (enabled, sort_order, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS branches (
  id          VARCHAR(36)  NOT NULL PRIMARY KEY,
  name        VARCHAR(180) NOT NULL,
  code        VARCHAR(20)  NOT NULL,
  city        VARCHAR(120) NULL,
  address     TEXT         NULL,
  phone       VARCHAR(30)  NULL,
  manager     VARCHAR(120) NULL,
  hours       VARCHAR(120) NULL,
  status      ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  is_primary  TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_branches_code (code),
  INDEX idx_branches_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_branches (
  user_id     VARCHAR(36) NOT NULL,
  branch_id   VARCHAR(36) NOT NULL,
  assigned_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, branch_id),
  CONSTRAINT fk_user_branches_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_branches_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS abandoned_carts (
  id             VARCHAR(36)   NOT NULL PRIMARY KEY,
  customer_id    VARCHAR(36)   NULL,
  customer_name  VARCHAR(120)  NOT NULL,
  email          VARCHAR(255)  NULL,
  phone          VARCHAR(40)   NULL,
  address        TEXT          NULL,
  landmark       VARCHAR(255)  NULL,
  delivery_type  VARCHAR(20)   NULL,
  session_key    VARCHAR(64)   NULL,
  details        JSON          NULL,
  items          JSON          NOT NULL,
  value          DECIMAL(12,2) NOT NULL DEFAULT 0,
  abandoned_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  recovered      TINYINT(1)    NOT NULL DEFAULT 0,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_carts_recovered (recovered),
  INDEX idx_carts_session (session_key),
  INDEX idx_carts_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
