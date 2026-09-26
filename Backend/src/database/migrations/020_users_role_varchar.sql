-- Custom RBAC roles use free-form slugs (e.g. adminall). The legacy ENUM
-- only allowed admin/manager/staff and truncated on insert.
ALTER TABLE users
  MODIFY COLUMN role VARCHAR(80) NOT NULL DEFAULT 'staff';
