-- Categories can apply to multiple branches (JSON array of branch ids).
-- NULL / empty = all branches. Legacy branch_id kept in sync for older filters.

ALTER TABLE categories
  ADD COLUMN branch_ids JSON NULL AFTER branch_id;
