CREATE TABLE IF NOT EXISTS tracking_settings (
  id                    VARCHAR(36)   NOT NULL PRIMARY KEY,
  restaurant_name       VARCHAR(120)  NOT NULL,
  phone                 VARCHAR(30)   NULL,
  support_email         VARCHAR(255)  NULL,
  address               TEXT          NULL,
  logo_url              VARCHAR(500)  NULL,
  help_text             TEXT          NULL,
  poll_interval_seconds INT           NOT NULL DEFAULT 20,
  show_rejection_reason TINYINT(1)    NOT NULL DEFAULT 1,
  status_messages       JSON          NOT NULL,
  updated_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
