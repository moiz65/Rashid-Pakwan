-- Optional compare-at / original price for add-on price comparison UI.

ALTER TABLE addons
  ADD COLUMN original_price DECIMAL(10,2) NULL AFTER price;
