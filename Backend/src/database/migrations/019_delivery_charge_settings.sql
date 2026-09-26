CREATE TABLE IF NOT EXISTS delivery_charge_settings (
  id                      VARCHAR(36)    NOT NULL PRIMARY KEY,
  fuel_surcharge_fixed    DECIMAL(10, 2) NOT NULL DEFAULT 0,
  fuel_surcharge_percent  DECIMAL(6, 2)  NOT NULL DEFAULT 0,
  free_delivery_min_order DECIMAL(10, 2) NULL,
  enabled                 TINYINT(1)     NOT NULL DEFAULT 1,
  notes                   TEXT           NULL,
  updated_at              DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO delivery_charge_settings (
  id, fuel_surcharge_fixed, fuel_surcharge_percent, free_delivery_min_order, enabled, notes
) VALUES (
  'dcs_default',
  0,
  0,
  NULL,
  1,
  'Adjust fuel surcharge when fuel prices change. Applied on top of each delivery method base price.'
) ON DUPLICATE KEY UPDATE id = id;
