/** Map admin routes to required view permission */
export const ROUTE_PERMISSIONS = {
  '/': 'dashboard.view',
  '/orders/upcoming': 'orders.view',
  '/orders/sales': 'orders.view',
  '/orders/rejected': 'orders.view',
  '/customers': 'customers.view',
  '/products': 'products.view',
  '/products/categories': 'products.view',
  '/products/drinks': 'products.view',
  '/products/addons': 'products.view',
  '/products/brands': 'products.view',
  '/products/reviews': 'products.view',
  '/abandoned-carts': 'abandoned_carts.view',
  '/reports': 'reports.view',
  '/reports/combined': 'reports.view',
  '/marketing/deals': 'marketing.view',
  '/marketing/coupons': 'marketing.view',
  '/marketing/discounts': 'marketing.view',
  '/marketing/offers': 'marketing.view',
  '/settings/payment': 'settings.view',
  '/settings/shipping': 'settings.view',
  '/settings/tax-codes': 'settings.view',
  '/settings/tracking': 'settings.view',
  '/settings/reviews': 'settings.view',
  '/settings/users': 'users.view',
  '/settings/roles': 'roles.view',
  '/settings/branches': 'branches.view',
}

/** Sidebar nav item permission — parent needs any child or its own permission */
export const NAV_PERMISSIONS = {
  Dashboard: 'dashboard.view',
  Orders: 'orders.view',
  Customers: 'customers.view',
  Products: 'products.view',
  'Abandoned Carts': 'abandoned_carts.view',
  Reports: 'reports.view',
  'Marketing & Promotions': 'marketing.view',
  Settings: 'settings.view',
}

export const NAV_CHILD_PERMISSIONS = {
  'Incoming Orders': 'orders.view',
  'Sales & Delivered': 'orders.view',
  'Rejected Orders': 'orders.view',
  'All Products': 'products.view',
  Categories: 'products.view',
  Drinks: 'products.view',
  Addons: 'products.view',
  'Brands/Collections': 'products.view',
  'Order Reviews': 'products.view',
  'Branch reports': 'reports.view',
  'Combined report': 'reports.view',
  Deals: 'marketing.view',
  Coupons: 'marketing.view',
  Discounts: 'marketing.view',
  Offers: 'marketing.view',
  'Payment Gateways': 'settings.view',
  'Delivery Charges': 'settings.view',
  'Tax Codes': 'settings.view',
  'Order Tracking': 'settings.view',
  'Review Invites': 'settings.view',
  'Users & Roles': 'users.view',
  Roles: 'roles.view',
  Branches: 'branches.view',
}

export function isSuperAdmin(user) {
  if (!user) return false
  if (user.role === 'admin') return true
  // Custom full-access roles (e.g. adminall) expose users + roles manage
  const perms = user.permissions || []
  return perms.includes('users.manage') && perms.includes('roles.manage')
}

export function hasPermission(permissions, key) {
  if (!key) return true
  const list = Array.isArray(permissions) ? permissions : []
  if (list.includes(key)) return true
  const [module] = String(key).split('.')
  if (module && list.includes(`${module}.manage`)) return true
  return false
}

export function canManage(permissions, module) {
  return hasPermission(permissions, `${module}.manage`)
}

export function groupPermissionsByModule(permissions) {
  const groups = new Map()
  for (const p of permissions || []) {
    if (!groups.has(p.module)) groups.set(p.module, [])
    groups.get(p.module).push(p)
  }
  const order = new Map(MODULE_TAB_ORDER.map((m, i) => [m, i]))
  return [...groups.entries()]
    .map(([module, items]) => ({
      module,
      label: moduleLabel(module),
      permissions: items.sort((a, b) => a.sortOrder - b.sortOrder),
    }))
    .sort((a, b) => (order.get(a.module) ?? 999) - (order.get(b.module) ?? 999))
}

export const MODULE_LABELS = {
  dashboard: 'Dashboard',
  orders: 'Orders',
  customers: 'Customers',
  products: 'Products & Menu',
  abandoned_carts: 'Abandoned Carts',
  reports: 'Reports',
  marketing: 'Marketing & Promotions',
  settings: 'Settings',
  users: 'Users',
  roles: 'Roles & Permissions',
  branches: 'Branches',
}

/** Tab order for role permission picker */
export const MODULE_TAB_ORDER = [
  'dashboard',
  'orders',
  'customers',
  'products',
  'abandoned_carts',
  'reports',
  'marketing',
  'settings',
  'users',
  'roles',
  'branches',
]

export const PERMISSION_ACTION_META = {
  view: {
    title: 'Can view',
    description: 'Open this section and see information',
  },
  manage: {
    title: 'Can make changes',
    description: 'Create, edit, and delete items in this section',
  },
}

export function moduleLabel(module) {
  return MODULE_LABELS[module] || module
}

export function permissionActionMeta(action) {
  return PERMISSION_ACTION_META[action] || {
    title: action,
    description: 'Access for this section',
  }
}
