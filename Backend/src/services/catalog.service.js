import bcrypt from 'bcryptjs'
import * as catalog from '../models/catalog.model.js'
import { ApiError } from '../utils/response.js'
import { newId } from '../utils/ids.js'
import { resolveRoleId } from './rbac.service.js'
import * as rbacService from './rbac.service.js'
import { parseBranchId, parseBranchScope } from '../utils/branchQuery.js'

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function requireString(value, field) {
  if (!value || !String(value).trim()) {
    throw new ApiError(400, `${field} is required`)
  }
  return String(value).trim()
}

/** Create: null = all branches. Update: keep existing when omitted. */
function resolveBranchId(body, existing = null) {
  if (body.branchId !== undefined) return parseBranchScope(body.branchId)
  if (existing) return existing.branchId ?? null
  return null
}

function normalizeNullableId(value) {
  if (value === undefined || value === null || value === '' || value === '__none__') return null
  return String(value)
}

function normalizeTaxMode(value, fallback = 'inclusive') {
  return value === 'exclusive' ? 'exclusive' : value === 'inclusive' ? 'inclusive' : fallback
}

async function resolveTaxFields(body, existing = null) {
  const taxCodeId =
    body.taxCodeId !== undefined
      ? normalizeNullableId(body.taxCodeId)
      : existing
        ? existing.taxCodeId
        : null
  if (taxCodeId && !(await catalog.findTaxCodeById(taxCodeId))) {
    throw new ApiError(400, 'Tax code not found')
  }
  const taxMode = normalizeTaxMode(
    body.taxMode !== undefined ? body.taxMode : existing?.taxMode,
    existing?.taxMode || 'inclusive'
  )
  return { taxCodeId, taxMode }
}

// Categories
export async function listCategories(query = {}) {
  return catalog.findAllCategories({ branchId: parseBranchId(query) })
}

/** Normalize branchIds + keep legacy branch_id in sync. */
function resolveCategoryBranches(body, existing = null) {
  if (body.branchIds !== undefined) {
    const ids = Array.isArray(body.branchIds) ? body.branchIds.filter(Boolean).map(String) : []
    if (!ids.length) return { branchId: null, branchIds: null }
    if (ids.length === 1) return { branchId: ids[0], branchIds: ids }
    return { branchId: null, branchIds: ids }
  }
  if (body.branchId !== undefined) {
    const branchId = resolveBranchId(body, existing)
    return { branchId, branchIds: branchId ? [branchId] : null }
  }
  if (existing) {
    return {
      branchId: existing.branchId ?? null,
      branchIds: Array.isArray(existing.branchIds) && existing.branchIds.length
        ? existing.branchIds
        : existing.branchId
          ? [existing.branchId]
          : null,
    }
  }
  return { branchId: null, branchIds: null }
}

export async function createCategory(body) {
  const name = requireString(body.name, 'name')
  const slug = body.slug?.trim() || slugify(name)
  const branches = resolveCategoryBranches(body)
  return catalog.insertCategory({
    id: body.id || newId('cat'),
    name,
    slug,
    image: body.image ?? '',
    sortOrder: Number(body.sortOrder ?? 0),
    isVisible: body.isVisible === false ? 0 : 1,
    branchId: branches.branchId,
    branchIds: branches.branchIds,
  })
}

export async function updateCategory(id, body) {
  const existing = await catalog.findCategoryById(id)
  if (!existing) throw new ApiError(404, 'Category not found')
  const name = requireString(body.name ?? existing.name, 'name')
  const slug = body.slug?.trim() || slugify(name)
  const branches = resolveCategoryBranches(body, existing)
  return catalog.updateCategoryRecord(id, {
    name,
    slug,
    image: body.image !== undefined ? body.image : existing.image,
    sortOrder: Number(body.sortOrder ?? existing.sortOrder ?? 0),
    isVisible: body.isVisible === false ? 0 : body.isVisible === true ? 1 : existing.isVisible ? 1 : 0,
    branchId: branches.branchId,
    branchIds: branches.branchIds,
  })
}

export async function removeCategory(id) {
  if (!(await catalog.deleteCategoryRecord(id))) throw new ApiError(404, 'Category not found')
  return { id }
}

// Brands
export async function listBrands(query = {}) {
  return catalog.findAllBrands({ branchId: parseBranchId(query) })
}

export async function createBrand(body) {
  const name = requireString(body.name, 'name')
  return catalog.insertBrand({
    id: body.id || newId('brand'),
    name,
    logo: body.logo ?? '',
    branchId: resolveBranchId(body),
  })
}

export async function updateBrand(id, body) {
  const existing = await catalog.findBrandById(id)
  if (!existing) throw new ApiError(404, 'Brand not found')
  return catalog.updateBrandRecord(id, {
    name: requireString(body.name ?? existing.name, 'name'),
    logo: body.logo ?? existing.logo,
    branchId: resolveBranchId(body, existing),
  })
}

export async function removeBrand(id) {
  if (!(await catalog.deleteBrandRecord(id))) throw new ApiError(404, 'Brand not found')
  return { id }
}

// Addons
export async function listAddons(query = {}) {
  return catalog.findAllAddons({ branchId: parseBranchId(query) })
}

export async function createAddon(body) {
  const originalPrice =
    body.originalPrice === null || body.originalPrice === ''
      ? null
      : body.originalPrice !== undefined
        ? Number(body.originalPrice)
        : null
  return catalog.insertAddon({
    id: body.id || newId('addon'),
    name: requireString(body.name, 'name'),
    price: Number(body.price ?? 0),
    originalPrice: Number.isFinite(originalPrice) ? originalPrice : null,
    image: body.image ?? '',
    status: body.status === 'inactive' ? 'inactive' : 'active',
    branchId: resolveBranchId(body),
  })
}

export async function updateAddon(id, body) {
  const existing = await catalog.findAddonById(id)
  if (!existing) throw new ApiError(404, 'Addon not found')
  let originalPrice = existing.originalPrice
  if (body.originalPrice !== undefined) {
    originalPrice =
      body.originalPrice === null || body.originalPrice === ''
        ? null
        : Number(body.originalPrice)
  }
  return catalog.updateAddonRecord(id, {
    name: requireString(body.name ?? existing.name, 'name'),
    price: Number(body.price ?? existing.price),
    originalPrice:
      originalPrice != null && Number.isFinite(Number(originalPrice))
        ? Number(originalPrice)
        : null,
    image: body.image !== undefined ? body.image : existing.image,
    status: body.status ?? existing.status,
    branchId: resolveBranchId(body, existing),
  })
}

export async function removeAddon(id) {
  if (!(await catalog.deleteAddonRecord(id))) throw new ApiError(404, 'Addon not found')
  return { id }
}

// Drinks
export async function listDrinks(query = {}) {
  return catalog.findAllDrinks({ branchId: parseBranchId(query) })
}

export async function createDrink(body) {
  const stockRaw = body.stock
  const stock =
    stockRaw === '' || stockRaw === null || stockRaw === undefined
      ? -1
      : Number(stockRaw)
  return catalog.insertDrink({
    id: body.id || newId('drink'),
    name: requireString(body.name, 'name'),
    description: body.description ?? '',
    price: Number(body.price ?? 0),
    stock: Number.isFinite(stock) ? stock : -1,
    image: body.image ?? '',
    status: ['inactive', 'out_of_stock'].includes(body.status) ? body.status : 'active',
    sortOrder: Number(body.sortOrder ?? 0),
    branchId: resolveBranchId(body),
  })
}

export async function updateDrink(id, body) {
  const existing = await catalog.findDrinkById(id)
  if (!existing) throw new ApiError(404, 'Drink not found')
  const stock =
    body.stock !== undefined
      ? body.stock === '' || body.stock === null
        ? -1
        : Number(body.stock)
      : existing.stock
  return catalog.updateDrinkRecord(id, {
    name: requireString(body.name ?? existing.name, 'name'),
    description: body.description !== undefined ? body.description : existing.description,
    price: Number(body.price ?? existing.price),
    stock: Number.isFinite(stock) ? stock : -1,
    image: body.image !== undefined ? body.image : existing.image,
    status: body.status ?? existing.status,
    sortOrder: Number(body.sortOrder ?? existing.sortOrder),
    branchId: resolveBranchId(body, existing),
  })
}

export async function removeDrink(id) {
  if (!(await catalog.deleteDrinkRecord(id))) throw new ApiError(404, 'Drink not found')
  return { id }
}

// Products
export async function listProducts(query = {}) {
  return catalog.findAllProducts({ branchId: parseBranchId(query) })
}

function normalizeAddonIds(body) {
  if (body.addonIds !== undefined) {
    return Array.isArray(body.addonIds) ? body.addonIds : []
  }
  if (Array.isArray(body.addons)) {
    return body.addons.map((a) => (typeof a === 'string' ? a : a?.id)).filter(Boolean)
  }
  return undefined
}

/** stock = -1 means unlimited (no stock tracking) */
function normalizeStock(value, fallback = 0) {
  if (value === 'unlimited' || value === Infinity) return -1
  const n = Number(value ?? fallback)
  if (!Number.isFinite(n)) return fallback
  return n < 0 ? -1 : Math.floor(n)
}

function normalizeVariations(value, existing = undefined) {
  if (value === undefined) return existing === undefined ? null : existing
  if (value == null || value === '') return null
  if (!Array.isArray(value)) return null
  const list = value
    .map((v) => {
      const name = String(v?.name || '').trim()
      if (!name) return null
      const price = Number(v?.price ?? 0)
      const discountedRaw = v?.discountedPrice ?? v?.discounted_price
      const discountedPrice =
        discountedRaw == null || discountedRaw === ''
          ? null
          : Number(discountedRaw)
      return {
        id: v?.id || newId('var'),
        name,
        price: Number.isFinite(price) ? price : 0,
        discountedPrice:
          discountedPrice != null && Number.isFinite(discountedPrice) ? discountedPrice : null,
      }
    })
    .filter(Boolean)
  return list.length ? list : null
}

export async function createProduct(body) {
  const name = requireString(body.name, 'name')
  const price = Number(body.price ?? 0)
  const stock = normalizeStock(body.stock, 0)
  let status = body.status || 'active'
  // Only force out_of_stock when tracking stock and count is zero (not unlimited -1)
  if (stock === 0 && status === 'active') status = 'out_of_stock'
  const discountedPrice =
    body.discountedPrice == null || body.discountedPrice === ''
      ? null
      : Number(body.discountedPrice)
  const tax = await resolveTaxFields(body)
  const variations = normalizeVariations(body.variations)
  return catalog.insertProduct({
    id: body.id || newId('prod'),
    name,
    categoryId: body.categoryId || null,
    brandId: body.brandId || null,
    price,
    discountedPrice,
    stock,
    status,
    image: body.image ?? '',
    description: body.description ?? '',
    tag: body.tag ?? '',
    rating: Number(body.rating ?? 4.5),
    isFeatured: body.isFeatured ? 1 : 0,
    sortOrder: Number(body.sortOrder ?? 0),
    sales: Number(body.sales ?? 0),
    taxCodeId: tax.taxCodeId,
    taxMode: tax.taxMode,
    addonMode: ['none', 'all', 'selected'].includes(body.addonMode)
      ? body.addonMode
      : 'selected',
    variations,
    branchId: resolveBranchId(body),
    addonIds: normalizeAddonIds(body) ?? [],
  })
}

export async function updateProduct(id, body) {
  const existing = await catalog.findProductById(id)
  if (!existing) throw new ApiError(404, 'Product not found')
  const stock = body.stock !== undefined ? normalizeStock(body.stock, existing.stock) : existing.stock
  let status = body.status ?? existing.status
  if (stock === 0 && status === 'active') status = 'out_of_stock'
  const discountedPrice =
    body.discountedPrice !== undefined
      ? body.discountedPrice == null || body.discountedPrice === ''
        ? null
        : Number(body.discountedPrice)
      : existing.discountedPrice
  const tax = await resolveTaxFields(body, existing)
  const payload = {
    name: requireString(body.name ?? existing.name, 'name'),
    categoryId: body.categoryId !== undefined ? body.categoryId : existing.categoryId,
    brandId: body.brandId !== undefined ? body.brandId : existing.brandId,
    price: Number(body.price ?? existing.price),
    discountedPrice,
    stock,
    status,
    image: body.image !== undefined ? body.image : existing.image,
    description: body.description !== undefined ? body.description : existing.description,
    tag: body.tag !== undefined ? body.tag : existing.tag,
    rating: Number(body.rating ?? existing.rating ?? 4.5),
    isFeatured: body.isFeatured !== undefined ? (body.isFeatured ? 1 : 0) : existing.isFeatured ? 1 : 0,
    sortOrder: Number(body.sortOrder ?? existing.sortOrder ?? 0),
    sales: Number(body.sales ?? existing.sales),
    taxCodeId: tax.taxCodeId,
    taxMode: tax.taxMode,
    addonMode:
      body.addonMode !== undefined
        ? ['none', 'all', 'selected'].includes(body.addonMode)
          ? body.addonMode
          : existing.addonMode || 'selected'
        : existing.addonMode || 'selected',
    variations: normalizeVariations(body.variations, existing.variations ?? null),
    branchId: resolveBranchId(body, existing),
  }
  const addonIds = normalizeAddonIds(body)
  if (addonIds !== undefined) payload.addonIds = addonIds
  return catalog.updateProductRecord(id, payload)
}

export async function removeProduct(id) {
  if (!(await catalog.deleteProductRecord(id))) throw new ApiError(404, 'Product not found')
  return { id }
}

export async function getPublicMenu(query = {}) {
  const branchId = parseBranchId(query)
  if (!branchId) {
    const taxCodes = await catalog.findAllTaxCodes()
    return {
      categories: [],
      products: [],
      addons: [],
      drinks: [],
      taxCodes: taxCodes.filter((t) => t.active),
    }
  }
  const [categories, products, addons, drinks, taxCodes] = await Promise.all([
    catalog.findVisibleCategories({ branchId }),
    catalog.findActiveProductsForMenu({ branchId }),
    catalog.findActiveAddons({ branchId }),
    catalog.findActiveDrinksForMenu({ branchId }),
    catalog.findAllTaxCodes(),
  ])
  const resolvedProducts = products.map((p) => {
    const mode = p.addonMode || 'selected'
    if (mode === 'none') return { ...p, addons: [] }
    if (mode === 'all') return { ...p, addons: addons }
    return p
  })
  return {
    categories,
    products: resolvedProducts,
    addons,
    drinks,
    taxCodes: taxCodes.filter((t) => t.active),
  }
}

// Reviews
export async function listReviews(query = {}) {
  return catalog.findAllReviews({ branchId: parseBranchId(query) })
}

export async function createReview(body) {
  return catalog.insertReview({
    id: body.id || newId('rev'),
    productId: body.productId || null,
    customerName: requireString(body.customerName, 'customerName'),
    rating: Math.min(5, Math.max(1, Number(body.rating ?? 5))),
    comment: body.comment ?? '',
    status: body.status || 'pending',
    createdAt: body.createdAt || new Date(),
    branchId: body.branchId || null,
  })
}

export async function updateReview(id, body) {
  const existing = await catalog.findReviewById(id)
  if (!existing) throw new ApiError(404, 'Review not found')
  return catalog.updateReviewRecord(id, {
    productId: body.productId !== undefined ? body.productId : existing.productId,
    customerName: requireString(body.customerName ?? existing.customerName, 'customerName'),
    rating: Number(body.rating ?? existing.rating),
    comment: body.comment ?? existing.comment,
    status: body.status ?? existing.status,
  })
}

export async function removeReview(id) {
  if (!(await catalog.deleteReviewRecord(id))) throw new ApiError(404, 'Review not found')
  return { id }
}

// Coupons
export async function listCoupons(query = {}) {
  return catalog.findAllCoupons({ branchId: parseBranchId(query) })
}

export async function createCoupon(body) {
  return catalog.insertCoupon({
    id: body.id || newId('coup'),
    code: requireString(body.code, 'code').toUpperCase(),
    type: body.type === 'fixed' ? 'fixed' : 'percentage',
    value: Number(body.value ?? 0),
    minOrder: Number(body.minOrder ?? 0),
    maxUses: Number(body.maxUses ?? 0),
    usedCount: Number(body.usedCount ?? 0),
    expiry: normalizeDateTime(body.expiry),
    active: body.active === false ? 0 : 1,
    branchId: resolveBranchId(body),
  })
}

export async function updateCoupon(id, body) {
  const existing = await catalog.findCouponById(id)
  if (!existing) throw new ApiError(404, 'Coupon not found')
  return catalog.updateCouponRecord(id, {
    code: requireString(body.code ?? existing.code, 'code').toUpperCase(),
    type: body.type ?? existing.type,
    value: Number(body.value ?? existing.value),
    minOrder: Number(body.minOrder ?? existing.minOrder),
    maxUses: Number(body.maxUses ?? existing.maxUses),
    usedCount: Number(body.usedCount ?? existing.usedCount),
    expiry: body.expiry !== undefined ? normalizeDateTime(body.expiry) : existing.expiry,
    active: body.active === false ? 0 : body.active === true ? 1 : existing.active ? 1 : 0,
    branchId: resolveBranchId(body, existing),
  })
}

export async function removeCoupon(id) {
  if (!(await catalog.deleteCouponRecord(id))) throw new ApiError(404, 'Coupon not found')
  return { id }
}

// Discounts
export async function listDiscounts(query = {}) {
  return catalog.findAllDiscounts({ branchId: parseBranchId(query) })
}

export async function createDiscount(body) {
  return catalog.insertDiscount({
    id: body.id || newId('disc'),
    name: requireString(body.name, 'name'),
    type: body.type === 'fixed' ? 'fixed' : 'percentage',
    value: Number(body.value ?? 0),
    category: body.category || 'All',
    active: body.active === false ? 0 : 1,
    startDate: normalizeDateTime(body.startDate),
    endDate: normalizeDateTime(body.endDate),
    branchId: resolveBranchId(body),
  })
}

export async function updateDiscount(id, body) {
  const existing = await catalog.findDiscountById(id)
  if (!existing) throw new ApiError(404, 'Discount not found')
  return catalog.updateDiscountRecord(id, {
    name: requireString(body.name ?? existing.name, 'name'),
    type: body.type ?? existing.type,
    value: Number(body.value ?? existing.value),
    category: body.category ?? existing.category,
    active: body.active === false ? 0 : body.active === true ? 1 : existing.active ? 1 : 0,
    startDate: body.startDate !== undefined ? normalizeDateTime(body.startDate) : existing.startDate,
    endDate: body.endDate !== undefined ? normalizeDateTime(body.endDate) : existing.endDate,
    branchId: resolveBranchId(body, existing),
  })
}

export async function removeDiscount(id) {
  if (!(await catalog.deleteDiscountRecord(id))) throw new ApiError(404, 'Discount not found')
  return { id }
}

// Offers
export async function listOffers(query = {}) {
  return catalog.findAllOffers({ branchId: parseBranchId(query) })
}

export async function createOffer(body) {
  const type = ['percentage', 'fixed', 'bogo', 'freebie', 'free_delivery'].includes(body.type)
    ? body.type
    : 'percentage'
  const applyScope = ['all', 'category', 'products'].includes(body.applyScope)
    ? body.applyScope
    : 'all'
  const tax = await resolveTaxFields(body)
  const productIds = Array.isArray(body.productIds)
    ? body.productIds.map(String).filter(Boolean)
    : []
  const buyProductIds = Array.isArray(body.buyProductIds)
    ? body.buyProductIds.map(String).filter(Boolean)
    : []
  const getProductIds = Array.isArray(body.getProductIds)
    ? body.getProductIds.map(String).filter(Boolean)
    : []

  if (type === 'bogo' && buyProductIds.length === 0) {
    throw new ApiError(400, 'BOGO offers require at least one buy product')
  }
  if (type === 'bogo' && getProductIds.length === 0) {
    throw new ApiError(400, 'BOGO offers require at least one get (free) product')
  }
  if (type === 'free_delivery' && Number(body.minOrder ?? 0) <= 0) {
    throw new ApiError(400, 'Free delivery offers require a minimum order amount')
  }

  return catalog.insertOffer({
    id: body.id || newId('offer'),
    title: requireString(body.title, 'title'),
    description: body.description ?? body.conditions ?? '',
    type,
    conditions: body.conditions ?? body.description ?? '',
    discountValue: Number(body.discountValue ?? 0),
    minOrder: Number(body.minOrder ?? 0),
    maxDiscount:
      body.maxDiscount == null || body.maxDiscount === '' ? null : Number(body.maxDiscount),
    buyQty: Math.max(1, Number(body.buyQty ?? 1)),
    getQty: Math.max(1, Number(body.getQty ?? 1)),
    applyScope,
    categoryId: applyScope === 'category' ? normalizeNullableId(body.categoryId) : null,
    productIds: applyScope === 'products' ? productIds : [],
    buyProductIds: type === 'bogo' ? buyProductIds : [],
    getProductIds: type === 'bogo' ? getProductIds : [],
    freeProductId: type === 'freebie' ? normalizeNullableId(body.freeProductId) : null,
    taxCodeId: tax.taxCodeId,
    taxMode: tax.taxMode,
    active: body.active === false ? 0 : 1,
    startDate: normalizeDateTime(body.startDate),
    endDate: normalizeDateTime(body.endDate),
    branchId: resolveBranchId(body),
  })
}

export async function updateOffer(id, body) {
  const existing = await catalog.findOfferById(id)
  if (!existing) throw new ApiError(404, 'Offer not found')
  const type = body.type !== undefined
    ? ['percentage', 'fixed', 'bogo', 'freebie', 'free_delivery'].includes(body.type)
      ? body.type
      : existing.type
    : existing.type
  const applyScope = body.applyScope !== undefined
    ? ['all', 'category', 'products'].includes(body.applyScope)
      ? body.applyScope
      : existing.applyScope
    : existing.applyScope
  const tax = await resolveTaxFields(body, existing)
  const productIds =
    body.productIds !== undefined
      ? Array.isArray(body.productIds)
        ? body.productIds.map(String).filter(Boolean)
        : []
      : existing.productIds || []
  const buyProductIds =
    body.buyProductIds !== undefined
      ? Array.isArray(body.buyProductIds)
        ? body.buyProductIds.map(String).filter(Boolean)
        : []
      : existing.buyProductIds || []
  const getProductIds =
    body.getProductIds !== undefined
      ? Array.isArray(body.getProductIds)
        ? body.getProductIds.map(String).filter(Boolean)
        : []
      : existing.getProductIds || []

  if (type === 'bogo' && buyProductIds.length === 0) {
    throw new ApiError(400, 'BOGO offers require at least one buy product')
  }
  if (type === 'bogo' && getProductIds.length === 0) {
    throw new ApiError(400, 'BOGO offers require at least one get (free) product')
  }

  return catalog.updateOfferRecord(id, {
    title: requireString(body.title ?? existing.title, 'title'),
    description:
      body.description !== undefined
        ? body.description
        : existing.description || existing.conditions || '',
    type,
    conditions:
      body.conditions !== undefined
        ? body.conditions
        : existing.conditions || existing.description || '',
    discountValue: Number(body.discountValue ?? existing.discountValue ?? 0),
    minOrder: Number(body.minOrder ?? existing.minOrder ?? 0),
    maxDiscount:
      body.maxDiscount !== undefined
        ? body.maxDiscount == null || body.maxDiscount === ''
          ? null
          : Number(body.maxDiscount)
        : existing.maxDiscount,
    buyQty: Math.max(1, Number(body.buyQty ?? existing.buyQty ?? 1)),
    getQty: Math.max(1, Number(body.getQty ?? existing.getQty ?? 1)),
    applyScope,
    categoryId:
      applyScope === 'category'
        ? body.categoryId !== undefined
          ? normalizeNullableId(body.categoryId)
          : existing.categoryId
        : null,
    productIds: applyScope === 'products' ? productIds : [],
    buyProductIds: type === 'bogo' ? buyProductIds : [],
    getProductIds: type === 'bogo' ? getProductIds : [],
    freeProductId:
      type === 'freebie'
        ? body.freeProductId !== undefined
          ? normalizeNullableId(body.freeProductId)
          : existing.freeProductId
        : null,
    taxCodeId: tax.taxCodeId,
    taxMode: tax.taxMode,
    active: body.active === false ? 0 : body.active === true ? 1 : existing.active ? 1 : 0,
    startDate: body.startDate !== undefined ? normalizeDateTime(body.startDate) : existing.startDate,
    endDate: body.endDate !== undefined ? normalizeDateTime(body.endDate) : existing.endDate,
    branchId: resolveBranchId(body, existing),
  })
}

export async function removeOffer(id) {
  if (!(await catalog.deleteOfferRecord(id))) throw new ApiError(404, 'Offer not found')
  return { id }
}

function resolveOfferProducts(offer, products) {
  const list = Array.isArray(products) ? products : []
  if (offer.type === 'bogo') {
    const buyIds = new Set(Array.isArray(offer.buyProductIds) ? offer.buyProductIds : [])
    const getIds = new Set(Array.isArray(offer.getProductIds) ? offer.getProductIds : [])
    const ids = new Set([...buyIds, ...getIds])
    if (ids.size) return list.filter((p) => ids.has(p.id))
  }
  if (offer.applyScope === 'products') {
    const ids = new Set(Array.isArray(offer.productIds) ? offer.productIds : [])
    return list.filter((p) => ids.has(p.id))
  }
  if (offer.applyScope === 'category' && offer.categoryId) {
    return list.filter((p) => p.categoryId === offer.categoryId)
  }
  if (offer.type === 'freebie' && offer.freeProductId) {
    return list.filter((p) => p.id === offer.freeProductId)
  }
  return []
}

function mapPublicProduct(p, tag) {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? '',
    price: p.price,
    discountedPrice: p.discountedPrice,
    image: p.image ?? '',
    categoryId: p.categoryId,
    tag: tag || p.tag || '',
  }
}

function offerBadgeLabel(offer) {
  if (offer.type === 'percentage') return `${Number(offer.discountValue || 0)}% OFF`
  if (offer.type === 'fixed') return `Rs ${Number(offer.discountValue || 0)} OFF`
  if (offer.type === 'bogo') return `Buy ${offer.buyQty || 1} Get ${offer.getQty || 1}`
  if (offer.type === 'freebie') return 'Free item'
  if (offer.type === 'free_delivery') return 'Free delivery'
  return 'Offer'
}

const PUBLIC_OFFER_TYPES = new Set(['percentage', 'fixed', 'bogo', 'freebie', 'free_delivery', 'bundle'])

export async function getPublicOffers(query = {}) {
  const branchId = parseBranchId(query)
  if (!branchId) return []
  const [offers, menu] = await Promise.all([
    catalog.findActiveOffers({ branchId }),
    getPublicMenu(query),
  ])
  const productList = menu.products || []
  return offers
    .filter((offer) => PUBLIC_OFFER_TYPES.has(offer.type))
    .map((offer) => {
      const badge = offerBadgeLabel(offer)
      const buyIds = new Set(offer.buyProductIds || [])
      const getIds = new Set(offer.getProductIds || [])
      const buyProducts = productList
        .filter((p) => buyIds.has(p.id))
        .map((p) => mapPublicProduct(p, `Buy ${offer.buyQty || 1}`))
      const getProducts = productList
        .filter((p) => getIds.has(p.id))
        .map((p) => mapPublicProduct(p, 'FREE'))
      const products = resolveOfferProducts(offer, productList).map((p) => ({
        ...mapPublicProduct(p, badge),
      }))
      return {
        ...offer,
        badgeText: badge,
        products,
        buyProducts,
        getProducts,
        drinks: menu.drinks || [],
      }
    })
}

function normalizeDateTime(value) {
  if (value === undefined || value === null || value === '') return null
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return null
  // MariaDB DATETIME expects 'YYYY-MM-DD HH:MM:SS' (not ISO with T/Z)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
}

// Deals
export async function listDeals(query = {}) {
  return catalog.findAllDeals({ branchId: parseBranchId(query) })
}

export async function getPublicDeals(query = {}) {
  const branchId = parseBranchId(query)
  if (!branchId) return []
  const [deals, addons] = await Promise.all([
    catalog.findActiveScheduledDeals({ branchId }),
    catalog.findActiveAddons({ branchId }),
  ])
  const now = new Date()
  return deals
    .filter((deal) => isDealVisibleNow(deal, now))
    .map((deal) => ({
      ...deal,
      addons: resolveEntityAddons(deal.addonMode || 'none', deal.addonIds || [], addons),
    }))
}

function resolveEntityAddons(mode, selectedIds, allAddons) {
  if (mode === 'none') return []
  if (mode === 'all') return allAddons
  const ids = new Set(Array.isArray(selectedIds) ? selectedIds : [])
  return allAddons.filter((a) => ids.has(a.id))
}

function normalizeAddonMode(value, fallback = 'none') {
  return ['none', 'all', 'selected'].includes(value) ? value : fallback
}

function padTime(n) {
  return String(n).padStart(2, '0')
}

function currentTimeOfDay(date) {
  return `${padTime(date.getHours())}:${padTime(date.getMinutes())}:${padTime(date.getSeconds())}`
}

function normalizeTimeValue(value) {
  if (value == null || value === '') return null
  const str = String(value).trim()
  if (/^\d{2}:\d{2}$/.test(str)) return `${str}:00`
  if (/^\d{2}:\d{2}:\d{2}/.test(str)) return str.slice(0, 8)
  return null
}

export function isDealVisibleNow(deal, now = new Date()) {
  const days = deal.daysOfWeek
  if (Array.isArray(days) && days.length > 0 && !days.map(Number).includes(now.getDay())) {
    return false
  }
  const t = currentTimeOfDay(now)
  const start = normalizeTimeValue(deal.dailyStartTime)
  const end = normalizeTimeValue(deal.dailyEndTime)
  if (start && end) {
    if (start <= end) {
      if (t < start || t > end) return false
    } else {
      // overnight window e.g. 22:00–02:00
      if (t < start && t > end) return false
    }
  } else if (start && t < start) {
    return false
  } else if (end && t > end) {
    return false
  }
  return true
}

function normalizeDaysOfWeek(value) {
  if (value == null || value === '') return null
  if (!Array.isArray(value)) return null
  const days = [...new Set(value.map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n <= 6))]
  if (!days.length || days.length === 7) return null // null = every day
  return days.sort((a, b) => a - b)
}

function normalizeDailyTime(value) {
  return normalizeTimeValue(value)
}

function normalizeDealItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Add at least one item to the deal')
  }
  return items.map((item, index) => {
    const itemType = ['drink', 'addon'].includes(item.itemType) ? item.itemType : 'product'
    const customerChoice = Boolean(item.customerChoice) && itemType === 'drink'
    const name = customerChoice
      ? String(item.name || 'Choose your drink').trim() || 'Choose your drink'
      : requireString(item.name, `items[${index}].name`)
    const qty = Math.max(1, Number(item.qty ?? 1))
    const unitPrice = Number(item.unitPrice ?? item.price ?? 0)
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new ApiError(400, `Invalid price for item: ${name}`)
    }
    if (itemType === 'drink' && !customerChoice && !normalizeNullableId(item.drinkId)) {
      throw new ApiError(400, `Select a drink for item: ${name}`)
    }
    const choiceIds = customerChoice
      ? (Array.isArray(item.choiceIds) ? item.choiceIds.filter(Boolean) : [])
      : []
    return {
      id: item.id || newId('di'),
      itemType,
      productId: itemType === 'product' ? normalizeNullableId(item.productId) : null,
      drinkId: itemType === 'drink' && !customerChoice ? normalizeNullableId(item.drinkId) : null,
      addonId: itemType === 'addon' ? normalizeNullableId(item.addonId) : null,
      name,
      qty,
      unitPrice,
      customerChoice,
      choiceIds,
      sortOrder: Number(item.sortOrder ?? index),
    }
  })
}

async function validatePromoLinks({ couponId, discountId, offerId }) {
  if (couponId && !(await catalog.findCouponById(couponId))) {
    throw new ApiError(400, 'Coupon not found')
  }
  if (discountId && !(await catalog.findDiscountById(discountId))) {
    throw new ApiError(400, 'Discount not found')
  }
  if (offerId && !(await catalog.findOfferById(offerId))) {
    throw new ApiError(400, 'Offer not found')
  }
}

export async function createDeal(body) {
  const title = requireString(body.title, 'title')
  const items = normalizeDealItems(body.items)
  const startAt = normalizeDateTime(body.startAt)
  const endAt = normalizeDateTime(body.endAt)
  if (startAt && endAt && new Date(endAt) < new Date(startAt)) {
    throw new ApiError(400, 'End time must be after start time')
  }
  const tax = await resolveTaxFields(body)

  const itemsTotal = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0)
  const price = Number(body.price ?? itemsTotal)
  const originalPrice =
    body.originalPrice === null || body.originalPrice === ''
      ? itemsTotal
      : body.originalPrice !== undefined
        ? Number(body.originalPrice)
        : itemsTotal

  const id = body.id || newId('deal')
  await catalog.insertDeal({
    id,
    title,
    description: body.description ?? '',
    badgeText: body.badgeText ?? '',
    image: body.image ?? '',
    price: Number.isFinite(price) ? price : 0,
    originalPrice: Number.isFinite(originalPrice) ? originalPrice : null,
    taxCodeId: tax.taxCodeId,
    taxMode: tax.taxMode,
    startAt,
    endAt,
    daysOfWeek: normalizeDaysOfWeek(body.daysOfWeek),
    dailyStartTime: normalizeDailyTime(body.dailyStartTime),
    dailyEndTime: normalizeDailyTime(body.dailyEndTime),
    showCountdown: body.showCountdown === false ? 0 : 1,
    active: body.active === false ? 0 : 1,
    sortOrder: Number(body.sortOrder ?? 0),
    addonMode: normalizeAddonMode(body.addonMode, 'all'),
    addonIds:
      normalizeAddonMode(body.addonMode, 'all') === 'selected'
        ? normalizeAddonIds(body) ?? []
        : null,
    branchId: resolveBranchId(body),
  })
  await catalog.replaceDealItems(id, items)
  return catalog.findDealById(id)
}

export async function updateDeal(id, body) {
  const existing = await catalog.findDealById(id)
  if (!existing) throw new ApiError(404, 'Deal not found')

  const startAt = body.startAt !== undefined ? normalizeDateTime(body.startAt) : existing.startAt
  const endAt = body.endAt !== undefined ? normalizeDateTime(body.endAt) : existing.endAt
  if (startAt && endAt && new Date(endAt) < new Date(startAt)) {
    throw new ApiError(400, 'End time must be after start time')
  }
  const tax = await resolveTaxFields(body, existing)

  const items = body.items !== undefined ? normalizeDealItems(body.items) : existing.items
  const itemsTotal = items.reduce((sum, i) => sum + Number(i.unitPrice) * Number(i.qty), 0)
  const price = body.price !== undefined ? Number(body.price) : Number(existing.price ?? itemsTotal)
  let originalPrice = existing.originalPrice
  if (body.originalPrice !== undefined) {
    originalPrice =
      body.originalPrice === null || body.originalPrice === ''
        ? itemsTotal
        : Number(body.originalPrice)
  }

  await catalog.updateDealRecord(id, {
    title: requireString(body.title ?? existing.title, 'title'),
    description: body.description !== undefined ? body.description : existing.description,
    badgeText: body.badgeText !== undefined ? body.badgeText : existing.badgeText,
    image: body.image !== undefined ? body.image : existing.image,
    price: Number.isFinite(price) ? price : 0,
    originalPrice: originalPrice != null && Number.isFinite(Number(originalPrice))
      ? Number(originalPrice)
      : null,
    taxCodeId: tax.taxCodeId,
    taxMode: tax.taxMode,
    startAt,
    endAt,
    daysOfWeek:
      body.daysOfWeek !== undefined
        ? normalizeDaysOfWeek(body.daysOfWeek)
        : existing.daysOfWeek,
    dailyStartTime:
      body.dailyStartTime !== undefined
        ? normalizeDailyTime(body.dailyStartTime)
        : existing.dailyStartTime,
    dailyEndTime:
      body.dailyEndTime !== undefined
        ? normalizeDailyTime(body.dailyEndTime)
        : existing.dailyEndTime,
    showCountdown:
      body.showCountdown === false
        ? 0
        : body.showCountdown === true
          ? 1
          : existing.showCountdown
            ? 1
            : 0,
    active: body.active === false ? 0 : body.active === true ? 1 : existing.active ? 1 : 0,
    sortOrder: Number(body.sortOrder ?? existing.sortOrder),
    addonMode:
      body.addonMode !== undefined
        ? normalizeAddonMode(body.addonMode, existing.addonMode || 'all')
        : existing.addonMode || 'all',
    addonIds:
      body.addonMode !== undefined || body.addonIds !== undefined
        ? normalizeAddonMode(
            body.addonMode !== undefined ? body.addonMode : existing.addonMode,
            'all',
          ) === 'selected'
          ? normalizeAddonIds({
              addonIds:
                body.addonIds !== undefined ? body.addonIds : existing.addonIds,
            }) ?? []
          : null
        : existing.addonIds ?? null,
    branchId: resolveBranchId(body, existing),
  })
  if (body.items !== undefined) {
    await catalog.replaceDealItems(id, items)
  }
  return catalog.findDealById(id)
}

export async function removeDeal(id) {
  if (!(await catalog.deleteDealRecord(id))) throw new ApiError(404, 'Deal not found')
  return { id }
}

// Payment
export async function listPaymentGateways() {
  return catalog.findAllPaymentGateways()
}

export async function getPublicPaymentGateways() {
  return catalog.findEnabledPaymentGateways()
}

export async function createPaymentGateway(body) {
  return catalog.insertPaymentGateway({
    id: body.id || newId('pay'),
    name: requireString(body.name, 'name'),
    description: body.description ?? '',
    icon: body.icon ?? '',
    enabled: body.enabled === false ? 0 : 1,
  })
}

export async function updatePaymentGateway(id, body) {
  const existing = await catalog.findPaymentGatewayById(id)
  if (!existing) throw new ApiError(404, 'Payment gateway not found')
  return catalog.updatePaymentGatewayRecord(id, {
    name: requireString(body.name ?? existing.name, 'name'),
    description: body.description ?? existing.description,
    icon: body.icon ?? existing.icon,
    enabled: body.enabled === false ? 0 : body.enabled === true ? 1 : existing.enabled ? 1 : 0,
  })
}

export async function removePaymentGateway(id) {
  if (!(await catalog.deletePaymentGatewayRecord(id))) {
    throw new ApiError(404, 'Payment gateway not found')
  }
  return { id }
}

// Shipping
export async function listShippingMethods() {
  return catalog.findAllShippingMethods()
}

export async function createShippingMethod(body) {
  return catalog.insertShippingMethod({
    id: body.id || newId('ship'),
    name: requireString(body.name, 'name'),
    description: body.description ?? '',
    price: Number(body.price ?? 0),
    estimatedTime: body.estimatedTime ?? '',
    enabled: body.enabled === false ? 0 : 1,
  })
}

export async function updateShippingMethod(id, body) {
  const existing = await catalog.findShippingMethodById(id)
  if (!existing) throw new ApiError(404, 'Shipping method not found')
  return catalog.updateShippingMethodRecord(id, {
    name: requireString(body.name ?? existing.name, 'name'),
    description: body.description ?? existing.description,
    price: Number(body.price ?? existing.price),
    estimatedTime: body.estimatedTime ?? existing.estimatedTime,
    enabled: body.enabled === false ? 0 : body.enabled === true ? 1 : existing.enabled ? 1 : 0,
  })
}

export async function removeShippingMethod(id) {
  if (!(await catalog.deleteShippingMethodRecord(id))) {
    throw new ApiError(404, 'Shipping method not found')
  }
  return { id }
}

export async function getPublicShippingMethods() {
  return catalog.findEnabledShippingMethods()
}

// Branches
export async function listBranches(actor = null) {
  const branches = await catalog.findAllBranches()
  const assigned = Array.isArray(actor?.branchIds) ? actor.branchIds.filter(Boolean) : []
  const isHqUser = actor?.role === 'admin' || assigned.length === 0
  if (!actor || isHqUser) return branches
  return branches.filter((b) => assigned.includes(b.id))
}

function assertBranchAccess(actor, branchId, { write = false } = {}) {
  const assigned = Array.isArray(actor?.branchIds) ? actor.branchIds.filter(Boolean) : []
  const isHqUser = actor?.role === 'admin' || assigned.length === 0
  if (!actor || isHqUser) return
  if (!assigned.includes(branchId)) {
    throw new ApiError(403, write ? 'You can only manage your assigned branch(es)' : 'Branch not found')
  }
}

function assertCanCreateBranch(actor) {
  const assigned = Array.isArray(actor?.branchIds) ? actor.branchIds.filter(Boolean) : []
  const isHqUser = actor?.role === 'admin' || assigned.length === 0
  if (!isHqUser) {
    throw new ApiError(403, 'Only headquarters users can create new branches')
  }
}

export async function getPublicBranches() {
  return catalog.findActiveBranches()
}

export async function createBranch(body, actor = null) {
  assertCanCreateBranch(actor)
  const name = requireString(body.name, 'name')
  const code = (body.code || name.slice(0, 3)).trim().toUpperCase()
  return catalog.insertBranch({
    id: body.id || newId('br'),
    name,
    code,
    city: body.city ?? '',
    address: body.address ?? '',
    phone: body.phone ?? '',
    manager: body.manager ?? '',
    hours: body.hours ?? '',
    status: body.status === 'inactive' ? 'inactive' : 'active',
    isPrimary: body.isPrimary ? 1 : 0,
  })
}

export async function updateBranch(id, body, actor = null) {
  const existing = await catalog.findBranchById(id)
  if (!existing) throw new ApiError(404, 'Branch not found')
  assertBranchAccess(actor, id, { write: true })
  return catalog.updateBranchRecord(id, {
    name: requireString(body.name ?? existing.name, 'name'),
    code: (body.code ?? existing.code).trim().toUpperCase(),
    city: body.city ?? existing.city,
    address: body.address ?? existing.address,
    phone: body.phone ?? existing.phone,
    manager: body.manager ?? existing.manager,
    hours: body.hours ?? existing.hours,
    status: body.status ?? existing.status,
    isPrimary:
      body.isPrimary !== undefined ? (body.isPrimary ? 1 : 0) : existing.isPrimary ? 1 : 0,
  })
}

export async function removeBranch(id, actor = null) {
  const existing = await catalog.findBranchById(id)
  if (!existing) throw new ApiError(404, 'Branch not found')
  assertCanCreateBranch(actor)
  if (existing.isPrimary) {
    throw new ApiError(400, 'Cannot delete the primary branch')
  }
  if (!(await catalog.deleteBranchRecord(id))) {
    throw new ApiError(404, 'Branch not found')
  }
  return { id }
}

// Tax codes
export async function listTaxCodes() {
  return catalog.findAllTaxCodes()
}

export async function createTaxCode(body) {
  const name = requireString(body.name, 'name')
  const code = requireString(body.code, 'code').toUpperCase()
  return catalog.insertTaxCode({
    id: body.id || newId('tax'),
    name,
    code,
    rate: Number(body.rate ?? 0),
    active: body.active === false ? 0 : 1,
  })
}

export async function updateTaxCode(id, body) {
  const existing = await catalog.findTaxCodeById(id)
  if (!existing) throw new ApiError(404, 'Tax code not found')
  return catalog.updateTaxCodeRecord(id, {
    name: requireString(body.name ?? existing.name, 'name'),
    code: requireString(body.code ?? existing.code, 'code').toUpperCase(),
    rate: Number(body.rate ?? existing.rate),
    active: body.active === false ? 0 : body.active === true ? 1 : existing.active ? 1 : 0,
  })
}

export async function removeTaxCode(id) {
  if (!(await catalog.deleteTaxCodeRecord(id))) throw new ApiError(404, 'Tax code not found')
  return { id }
}

// Carts
export async function listCarts(query = {}) {
  return catalog.findAllCarts({ branchId: parseBranchId(query) })
}

export async function createCart(body) {
  const items = Array.isArray(body.items) ? body.items : []
  const value =
    body.value != null
      ? Number(body.value)
      : items.reduce((sum, item) => sum + Number(item.qty || 1) * Number(item.price || 0), 0)
  return catalog.insertCart({
    id: body.id || newId('cart'),
    customerId: body.customerId || null,
    customerName: requireString(body.customerName, 'customerName'),
    email: body.email ?? '',
    phone: body.phone ?? '',
    address: body.address ?? '',
    landmark: body.landmark ?? '',
    deliveryType: body.deliveryType ?? '',
    sessionKey: body.sessionKey ?? null,
    details: body.details ?? null,
    items,
    value,
    abandonedAt: body.abandonedAt || new Date(),
    recovered: body.recovered ? 1 : 0,
  })
}

export async function updateCart(id, body) {
  const existing = await catalog.findCartById(id)
  if (!existing) throw new ApiError(404, 'Cart not found')

  // Dismiss / successful checkout → remove from abandoned list
  if (body.recovered === true) {
    await catalog.deleteCartRecord(id)
    return { id, deleted: true }
  }

  const items = body.items !== undefined ? body.items : existing.items
  const value =
    body.value != null
      ? Number(body.value)
      : items.reduce((sum, item) => sum + Number(item.qty || 1) * Number(item.price || 0), 0)
  return catalog.updateCartRecord(id, {
    customerId: body.customerId !== undefined ? body.customerId : existing.customerId,
    customerName: requireString(body.customerName ?? existing.customerName, 'customerName'),
    email: body.email !== undefined ? body.email : existing.email,
    phone: body.phone !== undefined ? body.phone : existing.phone,
    address: body.address !== undefined ? body.address : existing.address,
    landmark: body.landmark !== undefined ? body.landmark : existing.landmark,
    deliveryType: body.deliveryType !== undefined ? body.deliveryType : existing.deliveryType,
    sessionKey: body.sessionKey !== undefined ? body.sessionKey : existing.sessionKey,
    details: body.details !== undefined ? body.details : existing.details,
    items,
    value,
    abandonedAt: body.abandonedAt || existing.abandonedAt,
    recovered: 0,
  })
}

/** Public checkout: upsert abandoned cart by session key once essential details exist. */
export async function upsertPublicAbandonedCart(body) {
  const sessionKey = String(body.sessionKey || '').trim()
  if (!sessionKey) throw new ApiError(400, 'sessionKey is required')

  const customerName = String(body.customerName || '').trim()
  const email = String(body.email || '').trim()
  const phone = String(body.phone || '').trim()
  if (!customerName && !email && !phone) {
    throw new ApiError(400, 'At least name, email, or phone is required')
  }

  const items = Array.isArray(body.items) ? body.items : []
  const value =
    body.value != null
      ? Number(body.value)
      : items.reduce((sum, item) => sum + Number(item.qty || 1) * Number(item.price || 0), 0)

  const payload = {
    customerId: body.customerId || null,
    customerName: customerName || email || phone || 'Guest',
    email,
    phone,
    address: body.address ?? '',
    landmark: body.landmark ?? '',
    deliveryType: body.deliveryType ?? '',
    sessionKey,
    details: body.details ?? null,
    items,
    value,
    abandonedAt: new Date(),
    recovered: 0,
    branchId: body.branchId || null,
  }

  const existing = await catalog.findCartBySessionKey(sessionKey)
  if (existing) {
    return catalog.updateCartRecord(existing.id, {
      ...payload,
      recovered: existing.recovered ? 1 : 0,
    })
  }
  return catalog.insertCart({
    id: newId('cart'),
    ...payload,
  })
}

export async function recoverPublicAbandonedCart({ sessionKey, email } = {}) {
  let cart = null
  if (sessionKey) cart = await catalog.findCartBySessionKey(sessionKey)
  if (!cart && email) cart = await catalog.findOpenCartByEmail(String(email).trim())
  if (!cart) return null
  // Successful checkout → remove from abandoned-carts (do not keep as "recovered")
  await catalog.deleteCartRecord(cart.id)
  return { id: cart.id, deleted: true }
}

export async function removeCart(id) {
  if (!(await catalog.deleteCartRecord(id))) throw new ApiError(404, 'Cart not found')
  return { id }
}

// Users
export async function listUsers(actor = null) {
  const users = await catalog.findAllUsers()
  const actorBranches = Array.isArray(actor?.branchIds) ? actor.branchIds.filter(Boolean) : []
  const isActorAdmin = actor?.role === 'admin' || actorBranches.length === 0

  if (!isActorAdmin && actorBranches.length > 0) {
    return users.filter((u) => {
      const uBranches = Array.isArray(u.branchIds) ? u.branchIds : []
      return uBranches.some((b) => actorBranches.includes(b))
    })
  }
  return users
}

export async function createUser(body, actor = null) {
  const name = requireString(body.name, 'name')
  const email = requireString(body.email, 'email').toLowerCase()
  const password = requireString(body.password, 'password')
  const passwordHash = await bcrypt.hash(password, 10)
  const { roleId, roleSlug } = await resolveRoleId(body)

  const actorBranches = Array.isArray(actor?.branchIds) ? actor.branchIds.filter(Boolean) : []
  const isActorAdmin = actor?.role === 'admin' || actorBranches.length === 0

  // Branch-scoped managers cannot create/assign Administrator accounts
  if (!isActorAdmin && (roleSlug === 'admin' || roleId === 'role_admin')) {
    throw new ApiError(403, 'You cannot assign the Administrator role')
  }

  let targetBranchIds = []
  if (Array.isArray(body.branchIds) && body.branchIds.length > 0) {
    targetBranchIds = body.branchIds.filter(Boolean)
  }

  if (!isActorAdmin && actorBranches.length > 0) {
    if (targetBranchIds.length === 0) {
      targetBranchIds = [...actorBranches]
    } else {
      const unauthorized = targetBranchIds.filter((b) => !actorBranches.includes(b))
      if (unauthorized.length > 0) {
        throw new ApiError(403, 'You can only allocate users to branches you have access to')
      }
    }
  }

  const row = await catalog.insertUser({
    id: body.id || newId('user'),
    name,
    email,
    passwordHash,
    role: roleSlug || 'staff',
    roleId: roleId || null,
    status: body.status === 'inactive' ? 'inactive' : 'active',
  })
  const user = catalog.mapAdminUser(row, { roleSlug, roleId })
  if (targetBranchIds.length > 0) {
    await catalog.setUserBranches(user.id, targetBranchIds)
    user.branchIds = targetBranchIds
  } else {
    user.branchIds = []
  }
  return user
}

export async function updateUser(id, body, actor = null) {
  const existing = await catalog.findAdminUserById(id)
  if (!existing) throw new ApiError(404, 'User not found')

  const actorBranches = Array.isArray(actor?.branchIds) ? actor.branchIds.filter(Boolean) : []
  const isActorAdmin = actor?.role === 'admin' || actorBranches.length === 0

  if (!isActorAdmin && actorBranches.length > 0) {
    const existingBranchIds = await catalog.findUserBranchIds(id)
    const hasOverlap = existingBranchIds.some((b) => actorBranches.includes(b))
    if (!hasOverlap && existingBranchIds.length > 0) {
      throw new ApiError(403, 'You can only edit users within your assigned branch(es)')
    }
    if (body.branchIds !== undefined) {
      const newBranches = Array.isArray(body.branchIds) ? body.branchIds.filter(Boolean) : []
      if (newBranches.length === 0) {
        throw new ApiError(403, 'You cannot set user to All Branches because you are restricted to specific branch(es)')
      }
      const unauthorized = newBranches.filter((b) => !actorBranches.includes(b))
      if (unauthorized.length > 0) {
        throw new ApiError(403, 'You can only allocate users to branches you have access to')
      }
    }
  }

  const { roleId, roleSlug } = await resolveRoleId(body, existing)
  if (!isActorAdmin && (roleSlug === 'admin' || roleId === 'role_admin')) {
    throw new ApiError(403, 'You cannot assign the Administrator role')
  }

  const data = {
    name: requireString(body.name ?? existing.name, 'name'),
    email: requireString(body.email ?? existing.email, 'email').toLowerCase(),
    role: roleSlug ?? existing.role,
    roleId: roleId ?? existing.role_id ?? null,
    status: body.status ?? existing.status,
  }
  if (body.password?.trim()) {
    data.passwordHash = await bcrypt.hash(body.password.trim(), 10)
  }
  const row = await catalog.updateUserRecord(id, data)
  const user = catalog.mapAdminUser(row, { roleSlug: data.role, roleId: data.roleId })
  if (body.branchIds !== undefined) {
    await catalog.setUserBranches(id, body.branchIds)
    user.branchIds = Array.isArray(body.branchIds) ? body.branchIds : []
  } else {
    user.branchIds = await catalog.findUserBranchIds(id)
  }
  return user
}

export async function removeUser(id, actor = null) {
  const actorBranches = Array.isArray(actor?.branchIds) ? actor.branchIds.filter(Boolean) : []
  const isActorAdmin = actor?.role === 'admin' || actorBranches.length === 0
  if (!isActorAdmin && actorBranches.length > 0) {
    const existingBranchIds = await catalog.findUserBranchIds(id)
    const hasOverlap = existingBranchIds.some((b) => actorBranches.includes(b))
    if (!hasOverlap && existingBranchIds.length > 0) {
      throw new ApiError(403, 'You can only delete users within your assigned branch(es)')
    }
  }
  if (!(await catalog.deleteUserRecord(id))) throw new ApiError(404, 'User not found')
  return { id }
}

// RBAC roles
export const listPermissions = rbacService.listPermissions
export const listRoles = rbacService.listRoles
export const getRole = rbacService.getRole
export const createRole = rbacService.createRole
export const updateRole = rbacService.updateRole
export const removeRole = rbacService.removeRole
