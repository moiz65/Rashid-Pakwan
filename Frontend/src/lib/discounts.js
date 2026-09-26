/**
 * Apply a marketing discount to a list price.
 * @returns {number|null} sale price, or null when no discount
 */
export function applyDiscountToPrice(listPrice, discount) {
  if (!discount) return null
  const price = Number(listPrice)
  if (!Number.isFinite(price) || price < 0) return null
  const value = Number(discount.value) || 0
  let sale
  if (discount.type === 'percentage') {
    sale = price * (1 - value / 100)
  } else {
    sale = price - value
  }
  sale = Math.max(0, Math.round(sale * 100) / 100)
  if (sale >= price) return null
  return sale
}

export function formatDiscountLabel(discount) {
  if (!discount) return ''
  const value =
    discount.type === 'percentage'
      ? `${discount.value}% off`
      : `Rs ${Number(discount.value || 0).toFixed(0)} off`
  return `${discount.name} (${value})`
}

/** Parse stored VARCHAR category into a list of names (or ['All']). */
export function parseDiscountCategories(category) {
  const raw = String(category ?? '').trim()
  if (!raw || raw.toLowerCase() === 'all') return ['All']
  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (!parts.length || parts.some((p) => p.toLowerCase() === 'all')) return ['All']
  return parts
}

/** Serialize selected category names for the discounts.category VARCHAR field. */
export function serializeDiscountCategories(selected = []) {
  const list = (selected || []).map((s) => String(s).trim()).filter(Boolean)
  if (!list.length || list.some((p) => p.toLowerCase() === 'all')) return 'All'
  return list.join(', ')
}

/** True when discount applies to the given product category name. */
export function discountAppliesToCategory(discount, categoryName) {
  const cats = parseDiscountCategories(discount?.category)
  if (cats.includes('All')) return true
  if (!categoryName) return false
  const target = String(categoryName).trim().toLowerCase()
  return cats.some((c) => c.toLowerCase() === target)
}

/** Display string for table / labels. */
export function formatDiscountCategories(discount) {
  return parseDiscountCategories(discount?.category).join(', ')
}

/** Best-effort reverse match when editing a product that already has a sale price */
export function findMatchingDiscount(listPrice, salePrice, discounts = []) {
  if (salePrice == null || salePrice === '') return ''
  const sale = Number(salePrice)
  const price = Number(listPrice)
  if (!Number.isFinite(sale) || !Number.isFinite(price)) return ''
  const active = discounts.filter((d) => d.active !== false)
  for (const d of active) {
    const computed = applyDiscountToPrice(price, d)
    if (computed != null && Math.abs(computed - sale) < 0.02) return d.id
  }
  return ''
}
