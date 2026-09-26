/** Canonical permission definitions — seeded into DB on migrate/seed. */
export const PERMISSION_DEFS = [
  { key: 'dashboard.view', module: 'dashboard', action: 'view', label: 'View dashboard', sortOrder: 10 },
  { key: 'orders.view', module: 'orders', action: 'view', label: 'View orders', sortOrder: 20 },
  { key: 'orders.manage', module: 'orders', action: 'manage', label: 'Manage orders', sortOrder: 21 },
  { key: 'customers.view', module: 'customers', action: 'view', label: 'View customers', sortOrder: 30 },
  { key: 'customers.manage', module: 'customers', action: 'manage', label: 'Manage customers', sortOrder: 31 },
  { key: 'products.view', module: 'products', action: 'view', label: 'View products & menu', sortOrder: 40 },
  { key: 'products.manage', module: 'products', action: 'manage', label: 'Manage products & menu', sortOrder: 41 },
  { key: 'abandoned_carts.view', module: 'abandoned_carts', action: 'view', label: 'View abandoned carts', sortOrder: 50 },
  { key: 'abandoned_carts.manage', module: 'abandoned_carts', action: 'manage', label: 'Manage abandoned carts', sortOrder: 51 },
  { key: 'reports.view', module: 'reports', action: 'view', label: 'View reports', sortOrder: 60 },
  { key: 'marketing.view', module: 'marketing', action: 'view', label: 'View marketing', sortOrder: 70 },
  { key: 'marketing.manage', module: 'marketing', action: 'manage', label: 'Manage marketing', sortOrder: 71 },
  { key: 'settings.view', module: 'settings', action: 'view', label: 'View settings', sortOrder: 80 },
  { key: 'settings.manage', module: 'settings', action: 'manage', label: 'Manage settings', sortOrder: 81 },
  { key: 'users.view', module: 'users', action: 'view', label: 'View users', sortOrder: 90 },
  { key: 'users.manage', module: 'users', action: 'manage', label: 'Manage users', sortOrder: 91 },
  { key: 'roles.view', module: 'roles', action: 'view', label: 'View roles', sortOrder: 92 },
  { key: 'roles.manage', module: 'roles', action: 'manage', label: 'Manage roles & permissions', sortOrder: 93 },
  { key: 'branches.view', module: 'branches', action: 'view', label: 'View branches', sortOrder: 100 },
  { key: 'branches.manage', module: 'branches', action: 'manage', label: 'Manage branches', sortOrder: 101 },
]

export const ALL_PERMISSION_KEYS = PERMISSION_DEFS.map((p) => p.key)

export const DEFAULT_ROLE_TEMPLATES = [
  {
    id: 'role_admin',
    name: 'Administrator',
    slug: 'admin',
    description: 'Full access to all modules (super admin)',
    isSystem: true,
    permissions: ALL_PERMISSION_KEYS,
  },
  {
    id: 'role_manager',
    name: 'Manager',
    slug: 'manager',
    description: 'Branch operations, menu, marketing, and reports (no global settings)',
    isSystem: true,
    permissions: ALL_PERMISSION_KEYS.filter(
      (k) =>
        ![
          'settings.view',
          'settings.manage',
          'users.view',
          'users.manage',
          'roles.view',
          'roles.manage',
          'branches.view',
          'branches.manage',
        ].includes(k)
    ),
  },
  {
    id: 'role_staff',
    name: 'Staff',
    slug: 'staff',
    description: 'Orders and customer lookup',
    isSystem: true,
    permissions: [
      'dashboard.view',
      'orders.view',
      'orders.manage',
      'customers.view',
      'products.view',
      'abandoned_carts.view',
    ],
  },
]
