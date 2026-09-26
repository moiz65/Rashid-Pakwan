ALTER TABLE deals
  ADD COLUMN addon_mode ENUM('none', 'all', 'selected') NOT NULL DEFAULT 'none' AFTER sort_order,
  ADD COLUMN addon_ids JSON NULL AFTER addon_mode;

ALTER TABLE products
  ADD COLUMN addon_mode ENUM('none', 'all', 'selected') NOT NULL DEFAULT 'selected' AFTER tax_mode;
