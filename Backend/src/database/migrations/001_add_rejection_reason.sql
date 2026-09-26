-- Add rejection_reason to orders (existing databases)
ALTER TABLE orders
  ADD COLUMN rejection_reason TEXT NULL AFTER notes;
