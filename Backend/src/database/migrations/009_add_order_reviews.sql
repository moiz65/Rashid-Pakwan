CREATE TABLE IF NOT EXISTS order_reviews (
  id              VARCHAR(36)  NOT NULL PRIMARY KEY,
  order_id        VARCHAR(36)  NOT NULL,
  customer_name   VARCHAR(120) NOT NULL,
  overall_rating  TINYINT      NOT NULL,
  comment         TEXT         NULL,
  status          ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  source          ENUM('tracking', 'email', 'whatsapp') NOT NULL DEFAULT 'tracking',
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_reviews_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  UNIQUE KEY uq_order_reviews_order (order_id),
  INDEX idx_order_reviews_status (status),
  INDEX idx_order_reviews_source (source)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_review_items (
  id               VARCHAR(36)  NOT NULL PRIMARY KEY,
  order_review_id  VARCHAR(36)  NOT NULL,
  product_id       VARCHAR(36)  NULL,
  product_name     VARCHAR(255) NOT NULL,
  rating           TINYINT      NOT NULL,
  comment          TEXT         NULL,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_review_items_review FOREIGN KEY (order_review_id) REFERENCES order_reviews(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_review_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_order_review_items_review (order_review_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS review_settings (
  id                   VARCHAR(36)  NOT NULL PRIMARY KEY,
  email_enabled        TINYINT(1)   NOT NULL DEFAULT 0,
  whatsapp_enabled     TINYINT(1)   NOT NULL DEFAULT 0,
  email_subject        VARCHAR(255) NULL,
  email_body_template  TEXT         NULL,
  whatsapp_template    TEXT         NULL,
  delay_minutes        INT          NOT NULL DEFAULT 30,
  invite_on_delivered  TINYINT(1)   NOT NULL DEFAULT 1,
  updated_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO review_settings (
  id, email_enabled, whatsapp_enabled, email_subject, email_body_template,
  whatsapp_template, delay_minutes, invite_on_delivered
) VALUES (
  'revset_default',
  0,
  0,
  'How was your order from {{restaurantName}}?',
  'Hi {{customerName}},\n\nThanks for ordering with us! We''d love your feedback on order {{orderId}}.\n\nLeave a review here: {{trackingUrl}}\n\nThank you!',
  'Hi {{customerName}}! How was your order {{orderId}}? Share your review: {{trackingUrl}}',
  30,
  1
) ON DUPLICATE KEY UPDATE id = id;
