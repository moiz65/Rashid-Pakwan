ALTER TABLE deal_items
  ADD COLUMN customer_choice TINYINT(1) NOT NULL DEFAULT 0 AFTER unit_price,
  ADD COLUMN choice_ids JSON NULL AFTER customer_choice;
