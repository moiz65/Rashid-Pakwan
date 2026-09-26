-- BOGO buy/get product targeting
ALTER TABLE offers
  ADD COLUMN buy_product_ids JSON NULL AFTER product_ids,
  ADD COLUMN get_product_ids JSON NULL AFTER buy_product_ids;

-- Branches
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
  user_id    VARCHAR(36) NOT NULL,
  branch_id  VARCHAR(36) NOT NULL,
  assigned_at DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, branch_id),
  CONSTRAINT fk_user_branches_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_branches_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE orders
  ADD COLUMN branch_id VARCHAR(36) NULL AFTER source,
  ADD COLUMN delivery_type VARCHAR(20) NULL AFTER branch_id,
  ADD COLUMN shipping_fee DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER delivery_type;
