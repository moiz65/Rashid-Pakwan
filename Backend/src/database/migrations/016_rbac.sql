-- Dynamic RBAC: roles, permissions, role_permissions

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

ALTER TABLE users
  ADD COLUMN role_id VARCHAR(36) NULL AFTER role,
  ADD INDEX idx_users_role_id (role_id);
