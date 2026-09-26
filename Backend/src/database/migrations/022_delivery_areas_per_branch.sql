-- Per-branch delivery areas: each branch has its own area list & charges.

ALTER TABLE delivery_areas
  ADD COLUMN branch_id VARCHAR(36) NULL AFTER id;

-- Allow same area name on multiple branches
ALTER TABLE delivery_areas DROP INDEX uq_delivery_areas_slug;

ALTER TABLE delivery_areas
  ADD UNIQUE KEY uq_delivery_areas_branch_slug (branch_id, slug);

ALTER TABLE delivery_areas
  ADD KEY idx_delivery_areas_branch (branch_id);

-- Attach any existing global areas to the primary branch
UPDATE delivery_areas da
LEFT JOIN branches b ON b.is_primary = 1
SET da.branch_id = COALESCE(b.id, (SELECT id FROM branches ORDER BY created_at ASC LIMIT 1))
WHERE da.branch_id IS NULL;
