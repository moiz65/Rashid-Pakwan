ALTER TABLE addons
  ADD COLUMN branch_id VARCHAR(36) NULL AFTER status;

ALTER TABLE brands
  ADD COLUMN branch_id VARCHAR(36) NULL AFTER logo;

ALTER TABLE drinks
  ADD COLUMN branch_id VARCHAR(36) NULL AFTER sort_order;

ALTER TABLE coupons
  ADD COLUMN branch_id VARCHAR(36) NULL AFTER active;

ALTER TABLE discounts
  ADD COLUMN branch_id VARCHAR(36) NULL AFTER end_date;

ALTER TABLE offers
  ADD COLUMN branch_id VARCHAR(36) NULL AFTER end_date;

ALTER TABLE deals
  ADD COLUMN branch_id VARCHAR(36) NULL AFTER addon_ids;

ALTER TABLE reviews
  ADD COLUMN branch_id VARCHAR(36) NULL AFTER status;

UPDATE addons a
  SET a.branch_id = (SELECT b.id FROM branches b WHERE b.is_primary = 1 LIMIT 1)
  WHERE a.branch_id IS NULL;

UPDATE brands b
  SET b.branch_id = (SELECT br.id FROM branches br WHERE br.is_primary = 1 LIMIT 1)
  WHERE b.branch_id IS NULL;

UPDATE drinks d
  SET d.branch_id = (SELECT b.id FROM branches b WHERE b.is_primary = 1 LIMIT 1)
  WHERE d.branch_id IS NULL;

UPDATE coupons c
  SET c.branch_id = (SELECT b.id FROM branches b WHERE b.is_primary = 1 LIMIT 1)
  WHERE c.branch_id IS NULL;

UPDATE discounts d
  SET d.branch_id = (SELECT b.id FROM branches b WHERE b.is_primary = 1 LIMIT 1)
  WHERE d.branch_id IS NULL;

UPDATE offers o
  SET o.branch_id = (SELECT b.id FROM branches b WHERE b.is_primary = 1 LIMIT 1)
  WHERE o.branch_id IS NULL;

UPDATE deals dl
  SET dl.branch_id = (SELECT b.id FROM branches b WHERE b.is_primary = 1 LIMIT 1)
  WHERE dl.branch_id IS NULL;

UPDATE reviews r
  SET r.branch_id = (SELECT b.id FROM branches b WHERE b.is_primary = 1 LIMIT 1)
  WHERE r.branch_id IS NULL;

CREATE INDEX idx_addons_branch ON addons (branch_id);
CREATE INDEX idx_brands_branch ON brands (branch_id);
CREATE INDEX idx_drinks_branch ON drinks (branch_id);
CREATE INDEX idx_coupons_branch ON coupons (branch_id);
CREATE INDEX idx_discounts_branch ON discounts (branch_id);
CREATE INDEX idx_offers_branch ON offers (branch_id);
CREATE INDEX idx_deals_branch ON deals (branch_id);
CREATE INDEX idx_reviews_branch ON reviews (branch_id);
