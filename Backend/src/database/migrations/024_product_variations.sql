-- Product size / portion variations (Half, Full, Quarter, etc.)
-- Array of objects: id, name, price, optional discountedPrice

ALTER TABLE products
  ADD COLUMN variations JSON NULL AFTER addon_mode;
