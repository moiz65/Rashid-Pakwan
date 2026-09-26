/** Active catalog add-ons only. */
export function activeCatalogAddons(addons = []) {
  return (addons || []).filter((a) => a.status === 'active' || !a.status)
}

/**
 * Add-ons available for a menu line item.
 * - Products: respect addonMode / linked addons
 * - Drinks / custom / unknown: all active catalog add-ons
 */
export function resolveOrderAddons(catalogAddons = [], product = null) {
  const active = activeCatalogAddons(catalogAddons)
  if (!product || product.kind === 'drink' || product.itemType === 'drink') {
    return active
  }

  const mode =
    product.addonMode ||
    (Array.isArray(product.addons) && product.addons.length ? 'selected' : 'all')

  if (mode === 'none') return []

  if (mode === 'selected') {
    const ids = new Set(
      [
        ...(Array.isArray(product.addonIds) ? product.addonIds : []),
        ...(Array.isArray(product.addons) ? product.addons.map((a) => a.id) : []),
      ].filter(Boolean),
    )
    return active.filter((a) => ids.has(a.id))
  }

  return active
}

export function getAddonById(addons, id) {
  return (addons || []).find((addon) => addon.id === id)
}

export function calcAddonsTotal(addons, addonIds = []) {
  return (addonIds || []).reduce((sum, id) => {
    const addon = getAddonById(addons, id)
    return sum + (Number(addon?.price) || 0)
  }, 0)
}

export function getAddonNames(addons, addonIds = []) {
  return (addonIds || [])
    .map((id) => getAddonById(addons, id)?.name)
    .filter(Boolean)
}

/** Merge products + drinks into one picker list (drinks tagged as kind: 'drink'). */
export function menuItemsForPicker(products = [], drinks = []) {
  const productItems = (products || []).map((p) => ({
    ...p,
    kind: 'product',
    price: p.discountedPrice != null ? p.discountedPrice : p.price,
  }))
  const drinkItems = (drinks || []).map((d) => ({
    ...d,
    kind: 'drink',
    itemType: 'drink',
  }))
  return [...productItems, ...drinkItems]
}
