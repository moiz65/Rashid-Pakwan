import pool from '../config/database.js'
import { catalogBranchClause, categoryBranchClause } from '../utils/branchQuery.js'

function toNumber(value) {
  return Number(value ?? 0)
}

function parseJson(value, fallback = []) {
  if (value == null) return fallback
  if (typeof value === 'object') return value
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

export function mapCategory(row, productCount = 0) {
  if (!row) return null
  const branchIds = parseJson(row.branch_ids, null)
  const normalizedIds = Array.isArray(branchIds) ? branchIds.filter(Boolean) : []
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    image: row.image ?? '',
    sortOrder: Number(row.sort_order ?? 0),
    isVisible: row.is_visible == null ? true : Boolean(row.is_visible),
    productCount: Number(productCount ?? row.product_count ?? 0),
    branchId: row.branch_id ?? null,
    branchIds: normalizedIds.length ? normalizedIds : null,
  }
}

export function mapBrand(row, productCount = 0) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    logo: row.logo ?? '',
    productCount: Number(productCount ?? row.product_count ?? 0),
    branchId: row.branch_id ?? null,
  }
}

export function mapAddon(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    price: toNumber(row.price),
    originalPrice: row.original_price != null ? toNumber(row.original_price) : null,
    image: row.image ?? '',
    status: row.status ?? 'active',
    branchId: row.branch_id ?? null,
  }
}

export function mapDrink(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    price: toNumber(row.price),
    stock: Number(row.stock ?? -1),
    image: row.image ?? '',
    status: row.status ?? 'active',
    sortOrder: Number(row.sort_order ?? 0),
    branchId: row.branch_id ?? null,
  }
}

export function mapProduct(row, addons = undefined) {
  if (!row) return null
  const product = {
    id: row.id,
    name: row.name,
    categoryId: row.category_id,
    brandId: row.brand_id,
    price: toNumber(row.price),
    discountedPrice: row.discounted_price != null ? toNumber(row.discounted_price) : null,
    stock: Number(row.stock ?? 0),
    status: row.status,
    image: row.image ?? '',
    description: row.description ?? '',
    tag: row.tag ?? '',
    rating: toNumber(row.rating ?? 4.5),
    isFeatured: Boolean(row.is_featured),
    sortOrder: Number(row.sort_order ?? 0),
    sales: Number(row.sales ?? 0),
    taxCodeId: row.tax_code_id ?? null,
    taxMode: row.tax_mode === 'exclusive' ? 'exclusive' : 'inclusive',
    taxCode: row.tax_code ?? null,
    taxName: row.tax_name ?? null,
    taxRate: row.tax_rate != null ? toNumber(row.tax_rate) : null,
    addonMode: ['none', 'all', 'selected'].includes(row.addon_mode) ? row.addon_mode : 'selected',
    variations: normalizeMappedVariations(row.variations),
    categorySlug: row.category_slug ?? undefined,
    branchId: row.branch_id ?? null,
  }
  if (addons !== undefined) product.addons = addons
  return product
}

function normalizeMappedVariations(raw) {
  const list = parseJson(raw, [])
  if (!Array.isArray(list) || !list.length) return null
  return list
    .map((v) => ({
      id: v?.id || null,
      name: String(v?.name || '').trim(),
      price: toNumber(v?.price),
      discountedPrice:
        v?.discountedPrice != null && v.discountedPrice !== ''
          ? toNumber(v.discountedPrice)
          : v?.discounted_price != null && v.discounted_price !== ''
            ? toNumber(v.discounted_price)
            : null,
    }))
    .filter((v) => v.name)
}

export function mapReview(row) {
  if (!row) return null
  return {
    id: row.id,
    productId: row.product_id,
    customerName: row.customer_name,
    rating: Number(row.rating ?? 0),
    comment: row.comment ?? '',
    status: row.status,
    createdAt: row.created_at,
    branchId: row.branch_id ?? null,
  }
}

export function mapCoupon(row) {
  if (!row) return null
  return {
    id: row.id,
    code: row.code,
    type: row.type,
    value: toNumber(row.value),
    minOrder: toNumber(row.min_order),
    maxUses: Number(row.max_uses ?? 0),
    usedCount: Number(row.used_count ?? 0),
    expiry: row.expiry,
    active: Boolean(row.active),
    branchId: row.branch_id ?? null,
  }
}

export function mapDiscount(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    value: toNumber(row.value),
    category: row.category ?? 'All',
    active: Boolean(row.active),
    startDate: row.start_date,
    endDate: row.end_date,
    branchId: row.branch_id ?? null,
  }
}

export function mapOffer(row) {
  if (!row) return null
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? row.conditions ?? '',
    type: row.type,
    conditions: row.conditions ?? '',
    discountValue: toNumber(row.discount_value),
    minOrder: toNumber(row.min_order),
    maxDiscount: row.max_discount != null ? toNumber(row.max_discount) : null,
    buyQty: Number(row.buy_qty ?? 1),
    getQty: Number(row.get_qty ?? 1),
    applyScope: row.apply_scope || 'all',
    categoryId: row.category_id ?? null,
    productIds: parseJson(row.product_ids, []),
    buyProductIds: parseJson(row.buy_product_ids, []),
    getProductIds: parseJson(row.get_product_ids, []),
    freeProductId: row.free_product_id ?? null,
    taxCodeId: row.tax_code_id ?? null,
    taxMode: row.tax_mode === 'exclusive' ? 'exclusive' : 'inclusive',
    taxCode: row.tax_code ?? null,
    taxName: row.tax_name ?? null,
    taxRate: row.tax_rate != null ? toNumber(row.tax_rate) : null,
    active: Boolean(row.active),
    startDate: row.start_date,
    endDate: row.end_date,
    branchId: row.branch_id ?? null,
  }
}

export function mapTaxCode(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    rate: toNumber(row.rate),
    active: Boolean(row.active),
  }
}

export function mapDeal(row) {
  if (!row) return null
  let daysOfWeek = null
  if (row.days_of_week != null) {
    try {
      const parsed =
        typeof row.days_of_week === 'string' ? JSON.parse(row.days_of_week) : row.days_of_week
      daysOfWeek = Array.isArray(parsed) ? parsed.map(Number).filter((n) => n >= 0 && n <= 6) : null
    } catch {
      daysOfWeek = null
    }
  }
  const toTimeStr = (value) => {
    if (value == null || value === '') return null
    if (typeof value === 'string') return value.slice(0, 8)
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      const pad = (n) => String(n).padStart(2, '0')
      return `${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`
    }
    return null
  }
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    badgeText: row.badge_text ?? '',
    image: row.image ?? '',
    price: toNumber(row.price),
    originalPrice: row.original_price != null ? toNumber(row.original_price) : null,
    taxCodeId: row.tax_code_id ?? null,
    taxMode: row.tax_mode === 'exclusive' ? 'exclusive' : 'inclusive',
    taxCode: row.tax_code ?? null,
    taxName: row.tax_name ?? null,
    taxRate: row.tax_rate != null ? toNumber(row.tax_rate) : null,
    startAt: row.start_at,
    endAt: row.end_at,
    daysOfWeek,
    dailyStartTime: toTimeStr(row.daily_start_time),
    dailyEndTime: toTimeStr(row.daily_end_time),
    showCountdown: Boolean(row.show_countdown),
    active: Boolean(row.active),
    sortOrder: Number(row.sort_order ?? 0),
    addonMode: ['none', 'all', 'selected'].includes(row.addon_mode) ? row.addon_mode : 'none',
    addonIds: parseJson(row.addon_ids, []),
    items: row.items || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    branchId: row.branch_id ?? null,
  }
}

export function mapDealItem(row) {
  if (!row) return null
  const itemType = row.item_type || (row.drink_id ? 'drink' : row.addon_id ? 'addon' : 'product')
  return {
    id: row.id,
    dealId: row.deal_id,
    itemType,
    productId: row.product_id ?? null,
    drinkId: row.drink_id ?? null,
    addonId: row.addon_id ?? null,
    name: row.name,
    qty: Number(row.qty ?? 1),
    unitPrice: toNumber(row.unit_price),
    customerChoice: Boolean(row.customer_choice),
    choiceIds: parseJson(row.choice_ids, []),
    sortOrder: Number(row.sort_order ?? 0),
  }
}

const DEAL_SELECT = `
  SELECT d.*,
         t.code AS tax_code,
         t.name AS tax_name,
         t.rate AS tax_rate
  FROM deals d
  LEFT JOIN tax_codes t ON t.id = d.tax_code_id
`

const PRODUCT_SELECT = `
  SELECT p.*,
         c.slug AS category_slug,
         t.code AS tax_code,
         t.name AS tax_name,
         t.rate AS tax_rate
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN tax_codes t ON t.id = p.tax_code_id
`

const OFFER_SELECT = `
  SELECT o.*,
         t.code AS tax_code,
         t.name AS tax_name,
         t.rate AS tax_rate
  FROM offers o
  LEFT JOIN tax_codes t ON t.id = o.tax_code_id
`

export function mapPaymentGateway(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    icon: row.icon ?? '',
    enabled: Boolean(row.enabled),
  }
}

export function mapShippingMethod(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    price: toNumber(row.price),
    estimatedTime: row.estimated_time ?? '',
    enabled: Boolean(row.enabled),
  }
}

export function mapBranch(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    city: row.city ?? '',
    address: row.address ?? '',
    phone: row.phone ?? '',
    manager: row.manager ?? '',
    hours: row.hours ?? '',
    status: row.status ?? 'active',
    isPrimary: Boolean(row.is_primary),
  }
}

export function mapCart(row) {
  if (!row) return null
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    email: row.email ?? '',
    phone: row.phone ?? '',
    address: row.address ?? '',
    landmark: row.landmark ?? '',
    deliveryType: row.delivery_type ?? '',
    sessionKey: row.session_key ?? '',
    details: parseJson(row.details, null),
    items: parseJson(row.items, []),
    value: toNumber(row.value),
    abandonedAt:
      row.abandoned_at instanceof Date
        ? row.abandoned_at.toISOString()
        : row.abandoned_at,
    recovered: Boolean(row.recovered),
    branchId: row.branch_id ?? null,
  }
}

/** MariaDB DATETIME needs 'YYYY-MM-DD HH:MM:SS' (not ISO with T/Z). */
function toMysqlDateTime(value) {
  if (value === undefined || value === null || value === '') return null
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return null
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
}

export function mapAdminUser(row, extra = {}) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: extra.roleSlug || row.role,
    roleId: row.role_id ?? extra.roleId ?? null,
    roleName: extra.roleName ?? null,
    permissions: extra.permissions || [],
    status: row.status,
    lastLogin: row.last_login,
    branchIds: extra.branchIds,
  }
}

// Categories
export async function findAllCategories({ branchId } = {}) {
  const params = {}
  let where = ''
  let productJoinExtra = ''
  if (branchId) {
    const cat = categoryBranchClause('c', branchId, { leading: 'WHERE' })
    const prod = catalogBranchClause('p.branch_id', branchId)
    where = cat.sql
    productJoinExtra = prod.sql
    Object.assign(params, cat.params)
  }
  const [rows] = await pool.query(
    `SELECT c.*, COUNT(p.id) AS product_count
     FROM categories c
     LEFT JOIN products p ON p.category_id = c.id${productJoinExtra}
     ${where}
     GROUP BY c.id
     ORDER BY c.sort_order ASC, c.name ASC`,
    params
  )
  return rows.map((r) => mapCategory(r, r.product_count))
}

export async function findVisibleCategories({ branchId } = {}) {
  const params = {}
  let branchFilter = ''
  let productJoinExtra = ''
  if (branchId) {
    const cat = categoryBranchClause('c', branchId)
    const prod = catalogBranchClause('p.branch_id', branchId)
    branchFilter = cat.sql
    productJoinExtra = prod.sql
    Object.assign(params, cat.params)
  }
  const [rows] = await pool.query(
    `SELECT c.*, COUNT(p.id) AS product_count
     FROM categories c
     LEFT JOIN products p ON p.category_id = c.id AND p.status = 'active'${productJoinExtra}
     WHERE c.is_visible = 1${branchFilter}
     GROUP BY c.id
     ORDER BY c.sort_order ASC, c.name ASC`,
    params
  )
  return rows.map((r) => mapCategory(r, r.product_count))
}

export async function findCategoryById(id) {
  const [rows] = await pool.query('SELECT * FROM categories WHERE id = :id LIMIT 1', { id })
  return mapCategory(rows[0])
}

export async function insertCategory(data) {
  await pool.query(
    `INSERT INTO categories (id, name, slug, image, sort_order, is_visible, branch_id, branch_ids)
     VALUES (:id, :name, :slug, :image, :sortOrder, :isVisible, :branchId, :branchIds)`,
    {
      ...data,
      branchId: data.branchId ?? null,
      branchIds: data.branchIds == null ? null : JSON.stringify(data.branchIds),
    }
  )
  return findCategoryById(data.id)
}

export async function updateCategoryRecord(id, data) {
  await pool.query(
    `UPDATE categories
     SET name = :name, slug = :slug, image = :image,
         sort_order = :sortOrder, is_visible = :isVisible,
         branch_id = :branchId, branch_ids = :branchIds
     WHERE id = :id`,
    {
      id,
      ...data,
      branchId: data.branchId ?? null,
      branchIds: data.branchIds == null ? null : JSON.stringify(data.branchIds),
    }
  )
  return findCategoryById(id)
}

export async function deleteCategoryRecord(id) {
  const [result] = await pool.query('DELETE FROM categories WHERE id = :id', { id })
  return result.affectedRows > 0
}

// Brands
export async function findAllBrands({ branchId } = {}) {
  const params = {}
  let where = ''
  let productJoinExtra = ''
  if (branchId) {
    const brand = catalogBranchClause('b.branch_id', branchId, { leading: 'WHERE' })
    const prod = catalogBranchClause('p.branch_id', branchId)
    where = brand.sql
    productJoinExtra = prod.sql
    Object.assign(params, brand.params)
  }
  const [rows] = await pool.query(
    `SELECT b.*, COUNT(p.id) AS product_count
     FROM brands b
     LEFT JOIN products p ON p.brand_id = b.id${productJoinExtra}
     ${where}
     GROUP BY b.id
     ORDER BY b.name ASC`,
    params
  )
  return rows.map((r) => mapBrand(r, r.product_count))
}

export async function findBrandById(id) {
  const [rows] = await pool.query('SELECT * FROM brands WHERE id = :id LIMIT 1', { id })
  return mapBrand(rows[0])
}

export async function insertBrand(data) {
  await pool.query(
    'INSERT INTO brands (id, name, logo, branch_id) VALUES (:id, :name, :logo, :branchId)',
    { ...data, branchId: data.branchId ?? null }
  )
  return findBrandById(data.id)
}

export async function updateBrandRecord(id, data) {
  await pool.query(
    'UPDATE brands SET name = :name, logo = :logo, branch_id = :branchId WHERE id = :id',
    { id, ...data, branchId: data.branchId ?? null }
  )
  return findBrandById(id)
}

export async function deleteBrandRecord(id) {
  const [result] = await pool.query('DELETE FROM brands WHERE id = :id', { id })
  return result.affectedRows > 0
}

// Addons
export async function findAllAddons({ branchId } = {}) {
  const params = {}
  let sql = 'SELECT * FROM addons'
  if (branchId) {
    const clause = catalogBranchClause('branch_id', branchId, { leading: 'WHERE' })
    sql += clause.sql
    Object.assign(params, clause.params)
  }
  sql += ' ORDER BY name ASC'
  const [rows] = await pool.query(sql, params)
  return rows.map(mapAddon)
}

export async function findActiveAddons({ branchId } = {}) {
  const params = {}
  let sql = `SELECT * FROM addons WHERE status = 'active'`
  if (branchId) {
    const clause = catalogBranchClause('branch_id', branchId)
    sql += clause.sql
    Object.assign(params, clause.params)
  }
  sql += ' ORDER BY name ASC'
  const [rows] = await pool.query(sql, params)
  return rows.map(mapAddon)
}

export async function findAddonById(id) {
  const [rows] = await pool.query('SELECT * FROM addons WHERE id = :id LIMIT 1', { id })
  return mapAddon(rows[0])
}

export async function insertAddon(data) {
  await pool.query(
    `INSERT INTO addons (id, name, price, original_price, image, status, branch_id)
     VALUES (:id, :name, :price, :originalPrice, :image, :status, :branchId)`,
    { ...data, originalPrice: data.originalPrice ?? null, branchId: data.branchId ?? null }
  )
  return findAddonById(data.id)
}

export async function updateAddonRecord(id, data) {
  await pool.query(
    `UPDATE addons
     SET name = :name, price = :price, original_price = :originalPrice,
         image = :image, status = :status, branch_id = :branchId
     WHERE id = :id`,
    {
      id,
      ...data,
      originalPrice: data.originalPrice ?? null,
      branchId: data.branchId ?? null,
    }
  )
  return findAddonById(id)
}

export async function deleteAddonRecord(id) {
  const [result] = await pool.query('DELETE FROM addons WHERE id = :id', { id })
  return result.affectedRows > 0
}

export async function findAddonsByProductIds(productIds) {
  if (!productIds?.length) return new Map()
  const [rows] = await pool.query(
    `SELECT pa.product_id, a.*
     FROM product_addons pa
     INNER JOIN addons a ON a.id = pa.addon_id
     WHERE pa.product_id IN (:productIds) AND a.status = 'active'
     ORDER BY a.name ASC`,
    { productIds }
  )
  const map = new Map()
  for (const row of rows) {
    const list = map.get(row.product_id) || []
    list.push(mapAddon(row))
    map.set(row.product_id, list)
  }
  return map
}

export async function findAddonsForProduct(productId) {
  const map = await findAddonsByProductIds([productId])
  return map.get(productId) || []
}

export async function setProductAddons(productId, addonIds = []) {
  await pool.query('DELETE FROM product_addons WHERE product_id = :productId', { productId })
  const unique = [...new Set((addonIds || []).filter(Boolean))]
  for (const addonId of unique) {
    await pool.query(
      `INSERT INTO product_addons (product_id, addon_id) VALUES (:productId, :addonId)`,
      { productId, addonId }
    )
  }
  return findAddonsForProduct(productId)
}

// Drinks
export async function findAllDrinks({ branchId } = {}) {
  const params = {}
  let sql = 'SELECT * FROM drinks'
  if (branchId) {
    const clause = catalogBranchClause('branch_id', branchId, { leading: 'WHERE' })
    sql += clause.sql
    Object.assign(params, clause.params)
  }
  sql += ' ORDER BY sort_order ASC, name ASC'
  const [rows] = await pool.query(sql, params)
  return rows.map(mapDrink)
}

export async function findActiveDrinksForMenu({ branchId } = {}) {
  const params = {}
  let sql = `SELECT * FROM drinks WHERE status = 'active'`
  if (branchId) {
    const clause = catalogBranchClause('branch_id', branchId)
    sql += clause.sql
    Object.assign(params, clause.params)
  }
  sql += ' ORDER BY sort_order ASC, name ASC'
  const [rows] = await pool.query(sql, params)
  return rows.map(mapDrink)
}

export async function findDrinkById(id) {
  const [rows] = await pool.query('SELECT * FROM drinks WHERE id = :id LIMIT 1', { id })
  return mapDrink(rows[0])
}

export async function insertDrink(data) {
  await pool.query(
    `INSERT INTO drinks (id, name, description, price, stock, image, status, sort_order, branch_id)
     VALUES (:id, :name, :description, :price, :stock, :image, :status, :sortOrder, :branchId)`,
    { ...data, branchId: data.branchId ?? null }
  )
  return findDrinkById(data.id)
}

export async function updateDrinkRecord(id, data) {
  await pool.query(
    `UPDATE drinks
     SET name = :name, description = :description, price = :price, stock = :stock,
         image = :image, status = :status, sort_order = :sortOrder, branch_id = :branchId
     WHERE id = :id`,
    { id, ...data, branchId: data.branchId ?? null }
  )
  return findDrinkById(id)
}

export async function deleteDrinkRecord(id) {
  const [result] = await pool.query('DELETE FROM drinks WHERE id = :id', { id })
  return result.affectedRows > 0
}

// Products
export async function findAllProducts({ branchId } = {}) {
  const params = {}
  let sql = PRODUCT_SELECT
  if (branchId) {
    const clause = catalogBranchClause('p.branch_id', branchId, { leading: 'WHERE' })
    sql += clause.sql
    Object.assign(params, clause.params)
  }
  sql += ' ORDER BY p.sort_order ASC, p.name ASC'
  const [rows] = await pool.query(sql, params)
  const addonMap = await findAddonsByProductIds(rows.map((r) => r.id))
  return rows.map((r) => mapProduct(r, addonMap.get(r.id) || []))
}

export async function findActiveProductsForMenu({ branchId } = {}) {
  const params = {}
  let sql = `${PRODUCT_SELECT} WHERE p.status = 'active'`
  if (branchId) {
    const clause = catalogBranchClause('p.branch_id', branchId)
    sql += clause.sql
    Object.assign(params, clause.params)
  }
  sql += ' ORDER BY p.sort_order ASC, p.name ASC'
  const [rows] = await pool.query(sql, params)
  const addonMap = await findAddonsByProductIds(rows.map((r) => r.id))
  return rows.map((r) => mapProduct(r, addonMap.get(r.id) || []))
}

export async function findProductById(id) {
  const [rows] = await pool.query(`${PRODUCT_SELECT} WHERE p.id = :id LIMIT 1`, { id })
  if (!rows[0]) return null
  const addons = await findAddonsForProduct(id)
  return mapProduct(rows[0], addons)
}

export async function insertProduct(data) {
  const { addonIds, ...row } = data
  await pool.query(
    `INSERT INTO products (
       id, name, category_id, brand_id, price, discounted_price, stock, status,
       image, description, tag, rating, is_featured, sort_order, sales,
       tax_code_id, tax_mode, addon_mode, variations, branch_id
     ) VALUES (
       :id, :name, :categoryId, :brandId, :price, :discountedPrice, :stock, :status,
       :image, :description, :tag, :rating, :isFeatured, :sortOrder, :sales,
       :taxCodeId, :taxMode, :addonMode, :variations, :branchId
     )`,
    {
      ...row,
      addonMode: row.addonMode || 'selected',
      variations: row.variations == null ? null : JSON.stringify(row.variations),
    }
  )
  if (addonIds !== undefined) {
    await setProductAddons(data.id, addonIds)
  }
  return findProductById(data.id)
}

export async function updateProductRecord(id, data) {
  const { addonIds, ...row } = data
  await pool.query(
    `UPDATE products
     SET name = :name, category_id = :categoryId, brand_id = :brandId,
         price = :price, discounted_price = :discountedPrice, stock = :stock,
         status = :status, image = :image, description = :description, tag = :tag,
         rating = :rating, is_featured = :isFeatured, sort_order = :sortOrder, sales = :sales,
         tax_code_id = :taxCodeId, tax_mode = :taxMode, addon_mode = :addonMode,
         variations = :variations, branch_id = :branchId
     WHERE id = :id`,
    {
      id,
      ...row,
      addonMode: row.addonMode || 'selected',
      branchId: row.branchId ?? null,
      variations: row.variations == null ? null : JSON.stringify(row.variations),
    }
  )
  if (addonIds !== undefined) {
    await setProductAddons(id, addonIds)
  }
  return findProductById(id)
}

export async function deleteProductRecord(id) {
  const [result] = await pool.query('DELETE FROM products WHERE id = :id', { id })
  return result.affectedRows > 0
}

// Reviews
export async function findAllReviews({ branchId } = {}) {
  const params = {}
  let sql = 'SELECT * FROM reviews'
  if (branchId) {
    sql += ' WHERE branch_id = :branchId'
    params.branchId = branchId
  }
  sql += ' ORDER BY created_at DESC'
  const [rows] = await pool.query(sql, params)
  return rows.map(mapReview)
}

export async function findReviewById(id) {
  const [rows] = await pool.query('SELECT * FROM reviews WHERE id = :id LIMIT 1', { id })
  return mapReview(rows[0])
}

export async function insertReview(data) {
  await pool.query(
    `INSERT INTO reviews (id, product_id, customer_name, rating, comment, status, created_at, branch_id)
     VALUES (:id, :productId, :customerName, :rating, :comment, :status, :createdAt, :branchId)`,
    { ...data, branchId: data.branchId ?? null }
  )
  return findReviewById(data.id)
}

export async function updateReviewRecord(id, data) {
  await pool.query(
    `UPDATE reviews
     SET product_id = :productId, customer_name = :customerName, rating = :rating,
         comment = :comment, status = :status
     WHERE id = :id`,
    { id, ...data }
  )
  return findReviewById(id)
}

export async function deleteReviewRecord(id) {
  const [result] = await pool.query('DELETE FROM reviews WHERE id = :id', { id })
  return result.affectedRows > 0
}

// Coupons
export async function findAllCoupons({ branchId } = {}) {
  const params = {}
  let sql = 'SELECT * FROM coupons'
  if (branchId) {
    const clause = catalogBranchClause('branch_id', branchId, { leading: 'WHERE' })
    sql += clause.sql
    Object.assign(params, clause.params)
  }
  sql += ' ORDER BY created_at DESC'
  const [rows] = await pool.query(sql, params)
  return rows.map(mapCoupon)
}

export async function findCouponById(id) {
  const [rows] = await pool.query('SELECT * FROM coupons WHERE id = :id LIMIT 1', { id })
  return mapCoupon(rows[0])
}

export async function findCouponByCode(code, { branchId } = {}) {
  const params = { code: String(code || '').trim() }
  let sql = 'SELECT * FROM coupons WHERE UPPER(code) = UPPER(:code)'
  if (branchId) {
    const clause = catalogBranchClause('branch_id', branchId)
    sql += clause.sql
    Object.assign(params, clause.params)
  }
  sql += ' LIMIT 1'
  const [rows] = await pool.query(sql, params)
  return mapCoupon(rows[0])
}

export async function incrementCouponUsedCount(id, connection = null) {
  const db = connection || pool
  await db.query(
    'UPDATE coupons SET used_count = used_count + 1 WHERE id = :id',
    { id }
  )
  if (connection) return { id }
  return findCouponById(id)
}

export async function insertCoupon(data) {
  await pool.query(
    `INSERT INTO coupons (id, code, type, value, min_order, max_uses, used_count, expiry, active, branch_id)
     VALUES (:id, :code, :type, :value, :minOrder, :maxUses, :usedCount, :expiry, :active, :branchId)`,
    { ...data, branchId: data.branchId ?? null }
  )
  return findCouponById(data.id)
}

export async function updateCouponRecord(id, data) {
  await pool.query(
    `UPDATE coupons
     SET code = :code, type = :type, value = :value, min_order = :minOrder,
         max_uses = :maxUses, used_count = :usedCount, expiry = :expiry, active = :active,
         branch_id = :branchId
     WHERE id = :id`,
    { id, ...data, branchId: data.branchId ?? null }
  )
  return findCouponById(id)
}

export async function deleteCouponRecord(id) {
  const [result] = await pool.query('DELETE FROM coupons WHERE id = :id', { id })
  return result.affectedRows > 0
}

// Discounts
export async function findAllDiscounts({ branchId } = {}) {
  const params = {}
  let sql = 'SELECT * FROM discounts'
  if (branchId) {
    const clause = catalogBranchClause('branch_id', branchId, { leading: 'WHERE' })
    sql += clause.sql
    Object.assign(params, clause.params)
  }
  sql += ' ORDER BY created_at DESC'
  const [rows] = await pool.query(sql, params)
  return rows.map(mapDiscount)
}

export async function findDiscountById(id) {
  const [rows] = await pool.query('SELECT * FROM discounts WHERE id = :id LIMIT 1', { id })
  return mapDiscount(rows[0])
}

export async function insertDiscount(data) {
  await pool.query(
    `INSERT INTO discounts (id, name, type, value, category, active, start_date, end_date, branch_id)
     VALUES (:id, :name, :type, :value, :category, :active, :startDate, :endDate, :branchId)`,
    { ...data, branchId: data.branchId ?? null }
  )
  return findDiscountById(data.id)
}

export async function updateDiscountRecord(id, data) {
  await pool.query(
    `UPDATE discounts
     SET name = :name, type = :type, value = :value, category = :category,
         active = :active, start_date = :startDate, end_date = :endDate, branch_id = :branchId
     WHERE id = :id`,
    { id, ...data, branchId: data.branchId ?? null }
  )
  return findDiscountById(id)
}

export async function deleteDiscountRecord(id) {
  const [result] = await pool.query('DELETE FROM discounts WHERE id = :id', { id })
  return result.affectedRows > 0
}

// Offers
export async function findAllOffers({ branchId } = {}) {
  const params = {}
  let sql = OFFER_SELECT
  if (branchId) {
    const clause = catalogBranchClause('o.branch_id', branchId, { leading: 'WHERE' })
    sql += clause.sql
    Object.assign(params, clause.params)
  }
  sql += ' ORDER BY o.created_at DESC'
  const [rows] = await pool.query(sql, params)
  return rows.map(mapOffer)
}

export async function findOfferById(id) {
  const [rows] = await pool.query(`${OFFER_SELECT} WHERE o.id = :id LIMIT 1`, { id })
  return mapOffer(rows[0])
}

export async function findActiveOffers({ branchId } = {}) {
  const params = {}
  let sql = `${OFFER_SELECT}
     WHERE o.active = 1
       AND (o.start_date IS NULL OR o.start_date <= NOW())
       AND (o.end_date IS NULL OR o.end_date >= NOW())`
  if (branchId) {
    const clause = catalogBranchClause('o.branch_id', branchId)
    sql += clause.sql
    Object.assign(params, clause.params)
  }
  sql += ' ORDER BY o.created_at DESC'
  const [rows] = await pool.query(sql, params)
  return rows.map(mapOffer)
}

export async function insertOffer(data) {
  await pool.query(
    `INSERT INTO offers (
       id, title, description, type, conditions, discount_value, min_order, max_discount,
       buy_qty, get_qty, apply_scope, category_id, product_ids, buy_product_ids, get_product_ids,
       free_product_id, tax_code_id, tax_mode, active, start_date, end_date, branch_id
     ) VALUES (
       :id, :title, :description, :type, :conditions, :discountValue, :minOrder, :maxDiscount,
       :buyQty, :getQty, :applyScope, :categoryId, :productIds, :buyProductIds, :getProductIds,
       :freeProductId, :taxCodeId, :taxMode, :active, :startDate, :endDate, :branchId
     )`,
    {
      ...data,
      productIds: JSON.stringify(data.productIds ?? []),
      buyProductIds: JSON.stringify(data.buyProductIds ?? []),
      getProductIds: JSON.stringify(data.getProductIds ?? []),
      branchId: data.branchId ?? null,
    }
  )
  return findOfferById(data.id)
}

export async function updateOfferRecord(id, data) {
  await pool.query(
    `UPDATE offers
     SET title = :title, description = :description, type = :type, conditions = :conditions,
         discount_value = :discountValue, min_order = :minOrder, max_discount = :maxDiscount,
         buy_qty = :buyQty, get_qty = :getQty, apply_scope = :applyScope,
         category_id = :categoryId, product_ids = :productIds,
         buy_product_ids = :buyProductIds, get_product_ids = :getProductIds,
         free_product_id = :freeProductId,
         tax_code_id = :taxCodeId, tax_mode = :taxMode,
         active = :active, start_date = :startDate, end_date = :endDate, branch_id = :branchId
     WHERE id = :id`,
    {
      id,
      ...data,
      productIds: JSON.stringify(data.productIds ?? []),
      buyProductIds: JSON.stringify(data.buyProductIds ?? []),
      getProductIds: JSON.stringify(data.getProductIds ?? []),
      branchId: data.branchId ?? null,
    }
  )
  return findOfferById(id)
}

export async function deleteOfferRecord(id) {
  const [result] = await pool.query('DELETE FROM offers WHERE id = :id', { id })
  return result.affectedRows > 0
}

// Deals
async function attachDealItems(deals) {
  if (!deals.length) return deals
  const ids = deals.map((d) => d.id)
  const [rows] = await pool.query(
    `SELECT * FROM deal_items WHERE deal_id IN (:ids) ORDER BY sort_order ASC, created_at ASC`,
    { ids }
  )
  const byDeal = new Map()
  for (const row of rows) {
    const item = mapDealItem(row)
    if (!byDeal.has(item.dealId)) byDeal.set(item.dealId, [])
    byDeal.get(item.dealId).push(item)
  }
  return deals.map((deal) => ({
    ...deal,
    items: byDeal.get(deal.id) || [],
  }))
}

export async function findAllDeals({ branchId } = {}) {
  const params = {}
  let sql = DEAL_SELECT
  if (branchId) {
    const clause = catalogBranchClause('d.branch_id', branchId, { leading: 'WHERE' })
    sql += clause.sql
    Object.assign(params, clause.params)
  }
  sql += ' ORDER BY d.sort_order ASC, d.created_at DESC'
  const [rows] = await pool.query(sql, params)
  return attachDealItems(rows.map(mapDeal))
}

export async function findDealById(id) {
  const [rows] = await pool.query(`${DEAL_SELECT} WHERE d.id = :id LIMIT 1`, { id })
  if (!rows[0]) return null
  const [deal] = await attachDealItems([mapDeal(rows[0])])
  return deal
}

export async function findActiveScheduledDeals({ branchId } = {}) {
  const params = {}
  let sql = `${DEAL_SELECT}
     WHERE d.active = 1
       AND (d.start_at IS NULL OR d.start_at <= NOW())
       AND (d.end_at IS NULL OR d.end_at >= NOW())`
  if (branchId) {
    const clause = catalogBranchClause('d.branch_id', branchId)
    sql += clause.sql
    Object.assign(params, clause.params)
  }
  sql += ' ORDER BY d.sort_order ASC, d.created_at DESC'
  const [rows] = await pool.query(sql, params)
  return attachDealItems(rows.map(mapDeal))
}

export async function insertDeal(data) {
  await pool.query(
    `INSERT INTO deals (
       id, title, description, badge_text, image, price, original_price,
       tax_code_id, tax_mode,
       start_at, end_at, days_of_week, daily_start_time, daily_end_time,
       show_countdown, active, sort_order, addon_mode, addon_ids, branch_id
     ) VALUES (
       :id, :title, :description, :badgeText, :image, :price, :originalPrice,
       :taxCodeId, :taxMode,
       :startAt, :endAt, :daysOfWeek, :dailyStartTime, :dailyEndTime,
       :showCountdown, :active, :sortOrder, :addonMode, :addonIds, :branchId
     )`,
    {
      ...data,
      daysOfWeek: data.daysOfWeek == null ? null : JSON.stringify(data.daysOfWeek),
      addonMode: data.addonMode || 'none',
      addonIds:
        data.addonIds == null ? null : JSON.stringify(data.addonIds),
      branchId: data.branchId ?? null,
    }
  )
  return findDealById(data.id)
}

export async function updateDealRecord(id, data) {
  await pool.query(
    `UPDATE deals
     SET title = :title, description = :description, badge_text = :badgeText, image = :image,
         price = :price, original_price = :originalPrice,
         tax_code_id = :taxCodeId, tax_mode = :taxMode,
         start_at = :startAt, end_at = :endAt,
         days_of_week = :daysOfWeek,
         daily_start_time = :dailyStartTime, daily_end_time = :dailyEndTime,
         show_countdown = :showCountdown,
         active = :active, sort_order = :sortOrder,
         addon_mode = :addonMode, addon_ids = :addonIds, branch_id = :branchId
     WHERE id = :id`,
    {
      id,
      ...data,
      daysOfWeek: data.daysOfWeek == null ? null : JSON.stringify(data.daysOfWeek),
      addonMode: data.addonMode || 'none',
      addonIds:
        data.addonIds == null ? null : JSON.stringify(data.addonIds),
      branchId: data.branchId ?? null,
    }
  )
  return findDealById(id)
}

export async function replaceDealItems(dealId, items) {
  await pool.query('DELETE FROM deal_items WHERE deal_id = :dealId', { dealId })
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const itemType = item.itemType || 'product'
    const customerChoice = item.customerChoice ? 1 : 0
    await pool.query(
      `INSERT INTO deal_items (
         id, deal_id, item_type, product_id, drink_id, addon_id,
         name, qty, unit_price, customer_choice, choice_ids, sort_order
       ) VALUES (
         :id, :dealId, :itemType, :productId, :drinkId, :addonId,
         :name, :qty, :unitPrice, :customerChoice, :choiceIds, :sortOrder
       )`,
      {
        id: item.id,
        dealId,
        itemType,
        productId: itemType === 'product' ? item.productId || null : null,
        drinkId: itemType === 'drink' && !customerChoice ? item.drinkId || null : null,
        addonId: itemType === 'addon' ? item.addonId || null : null,
        name: item.name,
        qty: item.qty,
        unitPrice: item.unitPrice,
        customerChoice,
        choiceIds:
          customerChoice && Array.isArray(item.choiceIds)
            ? JSON.stringify(item.choiceIds)
            : null,
        sortOrder: item.sortOrder ?? i,
      }
    )
  }
}

export async function deleteDealRecord(id) {
  const [result] = await pool.query('DELETE FROM deals WHERE id = :id', { id })
  return result.affectedRows > 0
}

// Payment
export async function findAllPaymentGateways() {
  const [rows] = await pool.query('SELECT * FROM payment_gateways ORDER BY name ASC')
  return rows.map(mapPaymentGateway)
}

export async function findEnabledPaymentGateways() {
  const [rows] = await pool.query(
    'SELECT * FROM payment_gateways WHERE enabled = 1 ORDER BY name ASC'
  )
  return rows.map(mapPaymentGateway)
}

export async function findPaymentGatewayById(id) {
  const [rows] = await pool.query('SELECT * FROM payment_gateways WHERE id = :id LIMIT 1', { id })
  return mapPaymentGateway(rows[0])
}

export async function insertPaymentGateway(data) {
  await pool.query(
    `INSERT INTO payment_gateways (id, name, description, icon, enabled)
     VALUES (:id, :name, :description, :icon, :enabled)`,
    data
  )
  return findPaymentGatewayById(data.id)
}

export async function updatePaymentGatewayRecord(id, data) {
  await pool.query(
    `UPDATE payment_gateways
     SET name = :name, description = :description, icon = :icon, enabled = :enabled
     WHERE id = :id`,
    { id, ...data }
  )
  return findPaymentGatewayById(id)
}

export async function deletePaymentGatewayRecord(id) {
  const [result] = await pool.query('DELETE FROM payment_gateways WHERE id = :id', { id })
  return result.affectedRows > 0
}

// Shipping
export async function findAllShippingMethods() {
  const [rows] = await pool.query('SELECT * FROM shipping_methods ORDER BY name ASC')
  return rows.map(mapShippingMethod)
}

export async function findShippingMethodById(id) {
  const [rows] = await pool.query('SELECT * FROM shipping_methods WHERE id = :id LIMIT 1', { id })
  return mapShippingMethod(rows[0])
}

export async function insertShippingMethod(data) {
  await pool.query(
    `INSERT INTO shipping_methods (id, name, description, price, estimated_time, enabled)
     VALUES (:id, :name, :description, :price, :estimatedTime, :enabled)`,
    data
  )
  return findShippingMethodById(data.id)
}

export async function updateShippingMethodRecord(id, data) {
  await pool.query(
    `UPDATE shipping_methods
     SET name = :name, description = :description, price = :price,
         estimated_time = :estimatedTime, enabled = :enabled
     WHERE id = :id`,
    { id, ...data }
  )
  return findShippingMethodById(id)
}

export async function deleteShippingMethodRecord(id) {
  const [result] = await pool.query('DELETE FROM shipping_methods WHERE id = :id', { id })
  return result.affectedRows > 0
}

export async function findEnabledShippingMethods() {
  const [rows] = await pool.query(
    'SELECT * FROM shipping_methods WHERE enabled = 1 ORDER BY name ASC'
  )
  return rows.map(mapShippingMethod)
}

// Branches
export async function findAllBranches() {
  const [rows] = await pool.query('SELECT * FROM branches ORDER BY is_primary DESC, name ASC')
  return rows.map(mapBranch)
}

export async function findActiveBranches() {
  const [rows] = await pool.query(
    'SELECT * FROM branches WHERE status = \'active\' ORDER BY is_primary DESC, name ASC'
  )
  return rows.map(mapBranch)
}

export async function findBranchById(id) {
  const [rows] = await pool.query('SELECT * FROM branches WHERE id = :id LIMIT 1', { id })
  return mapBranch(rows[0])
}

export async function insertBranch(data) {
  await pool.query(
    `INSERT INTO branches (
       id, name, code, city, address, phone, manager, hours, status, is_primary
     ) VALUES (
       :id, :name, :code, :city, :address, :phone, :manager, :hours, :status, :isPrimary
     )`,
    data
  )
  return findBranchById(data.id)
}

export async function updateBranchRecord(id, data) {
  await pool.query(
    `UPDATE branches
     SET name = :name, code = :code, city = :city, address = :address,
         phone = :phone, manager = :manager, hours = :hours,
         status = :status, is_primary = :isPrimary
     WHERE id = :id`,
    { id, ...data }
  )
  return findBranchById(id)
}

export async function deleteBranchRecord(id) {
  const [result] = await pool.query('DELETE FROM branches WHERE id = :id', { id })
  return result.affectedRows > 0
}

export async function findUserBranchIds(userId) {
  const [rows] = await pool.query(
    'SELECT branch_id FROM user_branches WHERE user_id = :userId',
    { userId }
  )
  return rows.map((r) => r.branch_id)
}

export async function setUserBranches(userId, branchIds, connection = pool) {
  await connection.query('DELETE FROM user_branches WHERE user_id = :userId', { userId })
  const ids = Array.isArray(branchIds) ? branchIds.filter(Boolean) : []
  for (const branchId of ids) {
    await connection.query(
      'INSERT INTO user_branches (user_id, branch_id) VALUES (:userId, :branchId)',
      { userId, branchId }
    )
  }
}

// Carts
export async function findAllCarts({ branchId } = {}) {
  const params = {}
  let sql = `SELECT * FROM abandoned_carts WHERE recovered = 0`
  if (branchId) {
    sql += ' AND branch_id = :branchId'
    params.branchId = branchId
  }
  sql += ' ORDER BY abandoned_at DESC'
  const [rows] = await pool.query(sql, params)
  return rows.map(mapCart)
}

export async function findAllCartsIncludingRecovered() {
  const [rows] = await pool.query('SELECT * FROM abandoned_carts ORDER BY abandoned_at DESC')
  return rows.map(mapCart)
}

export async function findCartById(id) {
  const [rows] = await pool.query('SELECT * FROM abandoned_carts WHERE id = :id LIMIT 1', { id })
  return mapCart(rows[0])
}

export async function findCartBySessionKey(sessionKey) {
  if (!sessionKey) return null
  const [rows] = await pool.query(
    `SELECT * FROM abandoned_carts
     WHERE session_key = :sessionKey AND recovered = 0
     ORDER BY abandoned_at DESC
     LIMIT 1`,
    { sessionKey }
  )
  return mapCart(rows[0])
}

export async function findOpenCartByEmail(email) {
  if (!email) return null
  const [rows] = await pool.query(
    `SELECT * FROM abandoned_carts
     WHERE email = :email AND recovered = 0
     ORDER BY abandoned_at DESC
     LIMIT 1`,
    { email }
  )
  return mapCart(rows[0])
}

export async function insertCart(data) {
  await pool.query(
    `INSERT INTO abandoned_carts (
       id, customer_id, customer_name, email, phone, address, landmark,
       delivery_type, session_key, details, items, value, abandoned_at, recovered, branch_id
     ) VALUES (
       :id, :customerId, :customerName, :email, :phone, :address, :landmark,
       :deliveryType, :sessionKey, :details, :items, :value, :abandonedAt, :recovered, :branchId
     )`,
    {
      ...data,
      phone: data.phone ?? null,
      address: data.address ?? null,
      landmark: data.landmark ?? null,
      deliveryType: data.deliveryType ?? null,
      sessionKey: data.sessionKey ?? null,
      branchId: data.branchId ?? null,
      details: data.details != null ? JSON.stringify(data.details) : null,
      items: JSON.stringify(data.items ?? []),
      abandonedAt: toMysqlDateTime(data.abandonedAt) || toMysqlDateTime(new Date()),
    }
  )
  return findCartById(data.id)
}

export async function updateCartRecord(id, data) {
  await pool.query(
    `UPDATE abandoned_carts
     SET customer_id = :customerId, customer_name = :customerName, email = :email,
         phone = :phone, address = :address, landmark = :landmark,
         delivery_type = :deliveryType, session_key = :sessionKey, details = :details,
         items = :items, value = :value, abandoned_at = :abandonedAt, recovered = :recovered,
         branch_id = COALESCE(:branchId, branch_id)
     WHERE id = :id`,
    {
      id,
      ...data,
      phone: data.phone ?? null,
      address: data.address ?? null,
      landmark: data.landmark ?? null,
      deliveryType: data.deliveryType ?? null,
      sessionKey: data.sessionKey ?? null,
      details: data.details != null ? JSON.stringify(data.details) : null,
      items: JSON.stringify(data.items ?? []),
      abandonedAt: toMysqlDateTime(data.abandonedAt) || toMysqlDateTime(new Date()),
      branchId: data.branchId ?? null,
    }
  )
  return findCartById(id)
}

export async function deleteCartRecord(id) {
  const [result] = await pool.query('DELETE FROM abandoned_carts WHERE id = :id', { id })
  return result.affectedRows > 0
}

// Tax codes
export async function findAllTaxCodes() {
  const [rows] = await pool.query('SELECT * FROM tax_codes ORDER BY name ASC')
  return rows.map(mapTaxCode)
}

export async function findTaxCodeById(id) {
  const [rows] = await pool.query('SELECT * FROM tax_codes WHERE id = :id LIMIT 1', { id })
  return mapTaxCode(rows[0])
}

export async function insertTaxCode(data) {
  await pool.query(
    `INSERT INTO tax_codes (id, name, code, rate, active)
     VALUES (:id, :name, :code, :rate, :active)`,
    data
  )
  return findTaxCodeById(data.id)
}

export async function updateTaxCodeRecord(id, data) {
  await pool.query(
    `UPDATE tax_codes
     SET name = :name, code = :code, rate = :rate, active = :active
     WHERE id = :id`,
    { id, ...data }
  )
  return findTaxCodeById(id)
}

export async function deleteTaxCodeRecord(id) {
  const [result] = await pool.query('DELETE FROM tax_codes WHERE id = :id', { id })
  return result.affectedRows > 0
}

// Users (admin)
export async function findAllUsers() {
  const [rows] = await pool.query(
    'SELECT id, name, email, role, role_id, status, last_login FROM users ORDER BY name ASC'
  )
  const users = rows.map((row) => mapAdminUser(row))
  for (const user of users) {
    user.branchIds = await findUserBranchIds(user.id)
  }
  return users
}

export async function findAdminUserById(id) {
  const [rows] = await pool.query(
    'SELECT id, name, email, role, role_id, status, last_login, password_hash FROM users WHERE id = :id LIMIT 1',
    { id }
  )
  return rows[0] ?? null
}

export async function insertUser(data) {
  await pool.query(
    `INSERT INTO users (id, name, email, password_hash, role, role_id, status)
     VALUES (:id, :name, :email, :passwordHash, :role, :roleId, :status)`,
    data
  )
  return findAdminUserById(data.id)
}

export async function updateUserRecord(id, data) {
  const fields = ['name = :name', 'email = :email', 'role = :role', 'status = :status']
  const params = {
    id,
    name: data.name,
    email: data.email,
    role: data.role,
    status: data.status,
  }
  if (data.roleId !== undefined) {
    fields.push('role_id = :roleId')
    params.roleId = data.roleId
  }
  if (data.passwordHash) {
    fields.push('password_hash = :passwordHash')
    params.passwordHash = data.passwordHash
  }
  await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = :id`, params)
  return findAdminUserById(id)
}

export async function deleteUserRecord(id) {
  const [result] = await pool.query('DELETE FROM users WHERE id = :id', { id })
  return result.affectedRows > 0
}
