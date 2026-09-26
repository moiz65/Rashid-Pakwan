ALTER TABLE abandoned_carts
  ADD COLUMN phone VARCHAR(40) NULL AFTER email,
  ADD COLUMN address TEXT NULL AFTER phone,
  ADD COLUMN landmark VARCHAR(255) NULL AFTER address,
  ADD COLUMN delivery_type VARCHAR(20) NULL AFTER landmark,
  ADD COLUMN session_key VARCHAR(64) NULL AFTER delivery_type,
  ADD COLUMN details JSON NULL AFTER session_key;

CREATE INDEX idx_carts_session ON abandoned_carts (session_key);
CREATE INDEX idx_carts_email ON abandoned_carts (email);
