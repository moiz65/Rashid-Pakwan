-- Fresh testing wipe for Resturant_Ordering_Management
-- KEEPS: delivery_areas (Karachi), branches, system RBAC, single admin user, core settings
-- CLEARS: catalog, orders, customers, marketing, carts, extra users/roles

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_SAFE_UPDATES = 0;

-- Transactional / catalog / marketing
TRUNCATE TABLE order_review_items;
TRUNCATE TABLE order_reviews;
TRUNCATE TABLE reviews;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE abandoned_carts;
TRUNCATE TABLE customers;
TRUNCATE TABLE product_addons;
TRUNCATE TABLE products;
TRUNCATE TABLE categories;
TRUNCATE TABLE brands;
TRUNCATE TABLE addons;
TRUNCATE TABLE drinks;
TRUNCATE TABLE deal_items;
TRUNCATE TABLE deals;
TRUNCATE TABLE offers;
TRUNCATE TABLE coupons;
TRUNCATE TABLE discounts;
TRUNCATE TABLE tax_codes;
TRUNCATE TABLE payment_gateways;
TRUNCATE TABLE shipping_methods;
TRUNCATE TABLE refresh_tokens;

-- Keep delivery_areas, delivery_charge_settings, tracking_settings, review_settings, branches

-- Remove non-admin users (keep admin@restaurant.com)
DELETE FROM user_branches
WHERE user_id NOT IN (
  SELECT id FROM (
    SELECT id FROM users WHERE email = 'admin@restaurant.com' LIMIT 1
  ) keep_admin
);

DELETE FROM users
WHERE email <> 'admin@restaurant.com';

-- Ensure remaining admin is active Administrator
UPDATE users
SET role = 'admin',
    role_id = 'role_admin',
    status = 'active',
    name = COALESCE(NULLIF(TRIM(name), ''), 'Admin User')
WHERE email = 'admin@restaurant.com';

-- Drop custom roles; keep system templates
DELETE FROM role_permissions
WHERE role_id NOT IN ('role_admin', 'role_manager', 'role_staff');

DELETE FROM roles
WHERE id NOT IN ('role_admin', 'role_manager', 'role_staff')
  AND is_system = 0;

-- Ensure admin is linked to all active branches (so they can manage every branch)
DELETE FROM user_branches
WHERE user_id = (SELECT id FROM (SELECT id FROM users WHERE email = 'admin@restaurant.com' LIMIT 1) u);

INSERT INTO user_branches (user_id, branch_id)
SELECT u.id, b.id
FROM users u
CROSS JOIN branches b
WHERE u.email = 'admin@restaurant.com'
  AND b.status = 'active';

SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;

-- Summary
SELECT 'users' AS entity, COUNT(*) AS cnt FROM users
UNION ALL SELECT 'branches', COUNT(*) FROM branches
UNION ALL SELECT 'delivery_areas', COUNT(*) FROM delivery_areas
UNION ALL SELECT 'roles', COUNT(*) FROM roles
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'customers', COUNT(*) FROM customers;
