import * as catalog from '../models/catalog.model.js'
import { ApiError } from '../utils/response.js'
import {
  applyDeliveryChargeRules,
  getDeliveryChargeSettings,
} from './deliveryCharge.service.js'
import * as deliveryAreaService from './deliveryArea.service.js'

function roundMoney(n) {
  return Math.round((Number(n) || 0) * 100) / 100
}

function lineGross(qty, unitPrice) {
  return roundMoney(Number(qty) * Number(unitPrice))
}

function computeLineTax(amount, rate, mode) {
  const r = Number(rate) || 0
  if (!r || !amount) return { net: amount, tax: 0, gross: amount }
  if (mode === 'exclusive') {
    const tax = roundMoney(amount * (r / 100))
    return { net: amount, tax, gross: roundMoney(amount + tax) }
  }
  const tax = roundMoney(amount * (r / (100 + r)))
  return { net: roundMoney(amount - tax), tax, gross: amount }
}

function offerAppliesToLine(offer, line) {
  if (line.kind === 'deal') return false
  if (offer.type === 'bogo') {
    const buyIds = Array.isArray(offer.buyProductIds) ? offer.buyProductIds : []
    const getIds = Array.isArray(offer.getProductIds) ? offer.getProductIds : []
    if (buyIds.length || getIds.length) {
      const all = new Set([...buyIds, ...getIds])
      return all.has(line.productId)
    }
  }
  if (offer.applyScope === 'all') return true
  if (offer.applyScope === 'category') {
    return offer.categoryId && line.categoryId === offer.categoryId
  }
  if (offer.applyScope === 'products') {
    const ids = Array.isArray(offer.productIds) ? offer.productIds : []
    return ids.includes(line.productId)
  }
  return false
}

function cartHasEligibleScope(offer, lines, subtotal) {
  if (Number(offer.minOrder || 0) > subtotal) return false
  if (offer.applyScope === 'all') return true
  if (offer.applyScope === 'category' && offer.categoryId) {
    return lines.some((l) => l.kind === 'product' && l.categoryId === offer.categoryId)
  }
  if (offer.applyScope === 'products') {
    const ids = new Set(Array.isArray(offer.productIds) ? offer.productIds : [])
    return lines.some((l) => l.kind === 'product' && ids.has(l.productId))
  }
  return true
}

function calcBogoDiscount(offer, lines) {
  const buy = Math.max(1, Number(offer.buyQty) || 1)
  const get = Math.max(1, Number(offer.getQty) || 1)
  const buyIds = Array.isArray(offer.buyProductIds) ? offer.buyProductIds : []
  const getIds = Array.isArray(offer.getProductIds) ? offer.getProductIds : []

  let amount = 0

  if (buyIds.length && getIds.length) {
    const buyLines = lines.filter(
      (l) => l.kind === 'product' && buyIds.includes(l.productId)
    )
    const getLines = [...lines]
      .filter((l) => l.kind === 'product' && getIds.includes(l.productId))
      .sort((a, b) => a.unitPrice - b.unitPrice)

    const buyQtyTotal = buyLines.reduce((s, l) => s + l.qty, 0)
    const freeSets = Math.floor(buyQtyTotal / buy)
    let freeUnits = freeSets * get

    let remaining = freeUnits
    for (const line of getLines) {
      if (remaining <= 0) break
      const take = Math.min(line.qty, remaining)
      amount = roundMoney(amount + take * line.unitPrice)
      remaining -= take
    }
    return amount
  }

  if (buyIds.length && !getIds.length) {
    const pool = [...lines]
      .filter((l) => l.kind === 'product' && buyIds.includes(l.productId))
      .sort((a, b) => a.unitPrice - b.unitPrice)
    let freeUnits = 0
    const totalQty = pool.reduce((s, l) => s + l.qty, 0)
    const sets = Math.floor(totalQty / (buy + get))
    freeUnits = sets * get
    const rem = totalQty % (buy + get)
    if (rem >= buy + get) freeUnits += get
    else if (rem > buy) freeUnits += rem - buy

    let remaining = freeUnits
    for (const line of pool) {
      if (remaining <= 0) break
      const take = Math.min(line.qty, remaining)
      amount = roundMoney(amount + take * line.unitPrice)
      remaining -= take
    }
    return amount
  }

  const eligible = lines.filter((l) => offerAppliesToLine(offer, l))
  const pool = [...eligible].sort((a, b) => a.unitPrice - b.unitPrice)
  let freeUnits = 0
  const totalQty = pool.reduce((s, l) => s + l.qty, 0)
  const sets = Math.floor(totalQty / (buy + get))
  freeUnits = sets * get
  const rem = totalQty % (buy + get)
  if (rem >= buy + get) freeUnits += get
  else if (rem > buy) freeUnits += rem - buy

  let remaining = freeUnits
  for (const line of pool) {
    if (remaining <= 0) break
    const take = Math.min(line.qty, remaining)
    amount = roundMoney(amount + take * line.unitPrice)
    remaining -= take
  }
  return amount
}

function calcOfferDiscount(offer, lines, subtotal) {
  if (!offer) return { amount: 0, offer: null }
  if (offer.type === 'free_delivery') return { amount: 0, offer: null }
  if (Number(offer.minOrder || 0) > subtotal) return { amount: 0, offer: null }

  const eligible = lines.filter((l) => offerAppliesToLine(offer, l))
  const eligibleSub = roundMoney(eligible.reduce((s, l) => s + l.lineTotal, 0))

  let amount = 0
  if (offer.type === 'percentage') {
    const base = offer.applyScope === 'all' ? subtotal : eligibleSub
    amount = roundMoney(base * (Number(offer.discountValue) / 100))
    if (offer.maxDiscount != null) amount = Math.min(amount, Number(offer.maxDiscount))
  } else if (offer.type === 'fixed') {
    const base = offer.applyScope === 'all' ? subtotal : eligibleSub
    amount = Math.min(Number(offer.discountValue) || 0, base)
  } else if (offer.type === 'bogo') {
    amount = calcBogoDiscount(offer, lines)
  } else if (offer.type === 'freebie') {
    amount = 0
    if (offer.freeProductId) {
      amount = roundMoney(Number(offer._freeProductPrice) || 0)
    }
  }

  amount = Math.max(0, Math.min(amount, subtotal))
  return { amount, offer: amount > 0 ? offer : null }
}

function pickBestOffer(offers, lines, subtotal) {
  const itemOffers = offers.filter((o) => o.type !== 'free_delivery')
  let best = { amount: 0, offer: null }
  for (const offer of itemOffers) {
    const result = calcOfferDiscount(offer, lines, subtotal)
    if (result.amount > best.amount) best = result
  }
  return best
}

function pickFreeDeliveryOffer(offers, lines, subtotal, deliveryType) {
  if (deliveryType !== 'delivery') return null
  for (const offer of offers) {
    if (offer.type !== 'free_delivery') continue
    if (!cartHasEligibleScope(offer, lines, subtotal)) continue
    return offer
  }
  return null
}

export function calcCouponDiscount(coupon, subtotalAfterOffer) {
  if (!coupon) return 0
  if (!coupon.active) return 0
  if (coupon.expiry && new Date(coupon.expiry) < new Date()) return 0
  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) return 0
  if (Number(coupon.minOrder || 0) > subtotalAfterOffer) return 0
  let amount = 0
  if (coupon.type === 'percentage') {
    amount = roundMoney(subtotalAfterOffer * (Number(coupon.value) / 100))
  } else {
    amount = Number(coupon.value) || 0
  }
  return Math.max(0, Math.min(amount, subtotalAfterOffer))
}

export async function validateCouponCode(code, subtotal = 0) {
  const trimmed = String(code || '').trim()
  if (!trimmed) {
    return { valid: false, discount: 0, message: 'Coupon code is required', coupon: null }
  }
  const coupon = await catalog.findCouponByCode(trimmed)
  if (!coupon) {
    return { valid: false, discount: 0, message: 'Invalid coupon code', coupon: null }
  }
  if (!coupon.active) {
    return { valid: false, discount: 0, message: 'Coupon is inactive', coupon: null }
  }
  if (coupon.expiry && new Date(coupon.expiry) < new Date()) {
    return { valid: false, discount: 0, message: 'Coupon has expired', coupon: null }
  }
  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, discount: 0, message: 'Coupon usage limit reached', coupon: null }
  }
  if (Number(coupon.minOrder || 0) > Number(subtotal || 0)) {
    return {
      valid: false,
      discount: 0,
      message: `Minimum order is ${coupon.minOrder}`,
      coupon,
    }
  }
  const discount = calcCouponDiscount(coupon, Number(subtotal) || 0)
  return {
    valid: true,
    discount,
    message: 'Coupon applied',
    coupon,
  }
}

async function resolveShippingFee({
  deliveryType,
  shippingMethodId,
  shippingMethods,
  deliverySettings,
  subtotal = 0,
  deliveryAreaId = null,
}) {
  if (deliveryType === 'pickup') {
    return { fee: 0, method: null, breakdown: null, area: null }
  }
  const methods = Array.isArray(shippingMethods) ? shippingMethods : []
  let method = shippingMethodId
    ? methods.find((m) => m.id === shippingMethodId)
    : methods.find((m) => !/pickup/i.test(m.name)) || methods[0]
  if (!method) {
    method = methods[0] || null
  }

  let area = null
  let base = method ? Number(method.price) || 0 : 0
  if (deliveryAreaId) {
    try {
      area = await deliveryAreaService.getDeliveryArea(deliveryAreaId)
      if (area && area.enabled !== false) {
        base = Number(area.charge) || 0
      }
    } catch {
      area = null
    }
  }

  const breakdown = applyDeliveryChargeRules(base, deliverySettings, { subtotal })
  return {
    fee: roundMoney(breakdown.fee),
    method,
    breakdown,
    area,
  }
}

function buildAppliedOfferSummary(offer, productMap) {
  if (!offer) return null
  const base = {
    id: offer.id,
    title: offer.title,
    type: offer.type,
  }
  if (offer.type === 'bogo') {
    const buyProducts = (offer.buyProductIds || [])
      .map((id) => productMap.get(id))
      .filter(Boolean)
      .map((p) => ({ id: p.id, name: p.name }))
    const getProducts = (offer.getProductIds || [])
      .map((id) => productMap.get(id))
      .filter(Boolean)
      .map((p) => ({ id: p.id, name: p.name }))
    return { ...base, buyQty: offer.buyQty, getQty: offer.getQty, buyProducts, getProducts }
  }
  return base
}

/**
 * Build priced cart from client items.
 */
export async function quoteCart({
  items = [],
  couponCode = null,
  trustClientPrices = false,
  deliveryType = 'delivery',
  shippingMethodId = null,
  deliveryAreaId = null,
} = {}) {
  const rawItems = Array.isArray(items) ? items : []
  if (!rawItems.length) throw new ApiError(400, 'At least one item is required')

  const [activeOffers, products, deals, shippingMethods, deliverySettings] = await Promise.all([
    catalog.findActiveOffers(),
    catalog.findAllProducts(),
    catalog.findAllDeals(),
    catalog.findEnabledShippingMethods(),
    getDeliveryChargeSettings(),
  ])
  const productMap = new Map(products.map((p) => [p.id, p]))
  const dealMap = new Map(deals.map((d) => [d.id, d]))

  for (const offer of activeOffers) {
    if (offer.type === 'freebie' && offer.freeProductId) {
      const p = productMap.get(offer.freeProductId)
      offer._freeProductPrice = p ? Number(p.discountedPrice ?? p.price ?? 0) : 0
    }
  }

  const lines = []
  for (const item of rawItems) {
    const qty = Math.max(1, Number(item.qty) || 1)
    let dealId = item.dealId || null
    let productId = item.productId || null
    if (typeof productId === 'string' && productId.startsWith('deal:')) {
      dealId = productId.slice(5)
      productId = null
    }

    if (dealId) {
      const deal = dealMap.get(dealId)
      if (!deal && !trustClientPrices) throw new ApiError(400, `Deal not found: ${dealId}`)
      const basePrice = deal ? Number(deal.price) : Number(item.price) || 0
      const addonExtra = Array.isArray(item.selectedAddons)
        ? item.selectedAddons.reduce((s, a) => s + Number(a?.price || 0), 0)
        : Number(item.addonTotal) || 0
      const unitPrice = roundMoney(basePrice + addonExtra)
      const lineTotal = lineGross(qty, unitPrice)
      lines.push({
        kind: 'deal',
        dealId,
        productId: dealId ? `deal:${dealId}` : null,
        name: deal?.title || item.name || 'Deal',
        qty,
        unitPrice,
        lineTotal,
        categoryId: null,
        taxCodeId: deal?.taxCodeId ?? null,
        taxMode: deal?.taxMode || 'inclusive',
        taxRate: deal?.taxCodeId ? (deal?.taxRate ?? 0) : 0,
      })
      continue
    }

    const product = productId ? productMap.get(productId) : null
    if (!product && !trustClientPrices && productId) {
      throw new ApiError(400, `Product not found: ${productId}`)
    }
    const basePrice = product
      ? Number(product.discountedPrice ?? product.price ?? 0)
      : Number(item.price) || 0
    const addonExtra = Array.isArray(item.selectedAddons)
      ? item.selectedAddons.reduce((s, a) => s + Number(a?.price || 0), 0)
      : Number(item.addonTotal) || 0
    const unitPrice = roundMoney(basePrice + addonExtra)
    const lineTotal = lineGross(qty, unitPrice)
    lines.push({
      kind: 'product',
      productId: productId || null,
      dealId: null,
      name: product?.name || item.name || 'Item',
      qty,
      unitPrice,
      lineTotal,
      categoryId: product?.categoryId ?? null,
      taxCodeId: product?.taxCodeId ?? null,
      taxMode: product?.taxMode || 'inclusive',
      taxRate: product?.taxCodeId ? (product?.taxRate ?? 0) : 0,
    })
  }

  const subtotal = roundMoney(lines.reduce((s, l) => s + l.lineTotal, 0))

  let appliedCoupon = null
  let couponDiscount = 0
  const code = couponCode ? String(couponCode).trim() : ''
  if (code) {
    const validation = await validateCouponCode(code, subtotal)
    if (!validation.valid) {
      throw new ApiError(400, validation.message || 'Invalid coupon')
    }
    appliedCoupon = validation.coupon
    couponDiscount = calcCouponDiscount(appliedCoupon, subtotal)
  }

  let offerDiscount = 0
  let appliedOffer = null
  if (!appliedCoupon) {
    const best = pickBestOffer(activeOffers, lines, subtotal)
    offerDiscount = best.amount
    appliedOffer = best.offer
  }

  const afterCoupon = roundMoney(Math.max(0, subtotal - offerDiscount - couponDiscount))
  const coversFullSubtotal =
    Boolean(appliedCoupon) && couponDiscount >= Math.max(0, subtotal - 0.001)

  const discountTotal = roundMoney(offerDiscount + couponDiscount)
  let allocated = 0
  let taxAmount = 0
  let exclusiveExtra = 0
  const pricedLines = lines.map((line, index) => {
    let share = 0
    if (discountTotal > 0 && subtotal > 0) {
      if (index === lines.length - 1) {
        share = roundMoney(discountTotal - allocated)
      } else {
        share = roundMoney(discountTotal * (line.lineTotal / subtotal))
        allocated = roundMoney(allocated + share)
      }
    }
    const taxableBase = Math.max(0, roundMoney(line.lineTotal - share))
    const { tax } = computeLineTax(taxableBase, line.taxRate, line.taxMode)
    taxAmount = roundMoney(taxAmount + tax)
    if (line.taxMode === 'exclusive') {
      exclusiveExtra = roundMoney(exclusiveExtra + tax)
    }
    return {
      productId: line.productId,
      name: line.name,
      qty: line.qty,
      price: line.unitPrice,
      lineTotal: line.lineTotal,
      tax,
      taxMode: line.taxMode,
    }
  })

  if (coversFullSubtotal) {
    exclusiveExtra = 0
    taxAmount = roundMoney(taxAmount)
  }

  const normalizedDelivery = deliveryType === 'pickup' ? 'pickup' : 'delivery'
  const {
    fee: baseShippingFee,
    method: shippingMethod,
    breakdown,
    area: deliveryArea,
  } = await resolveShippingFee({
    deliveryType: normalizedDelivery,
    shippingMethodId,
    shippingMethods,
    deliverySettings,
    subtotal,
    deliveryAreaId,
  })

  let shippingFee = baseShippingFee
  let freeDeliveryApplied = Boolean(breakdown?.freeDeliveryApplied)
  let freeDeliveryMessage = breakdown?.freeDeliveryReason || null
  let freeDeliveryOffer = null

  const fdOffer = pickFreeDeliveryOffer(activeOffers, lines, subtotal, normalizedDelivery)
  if (fdOffer && shippingFee > 0) {
    shippingFee = 0
    freeDeliveryApplied = true
    freeDeliveryOffer = fdOffer
    freeDeliveryMessage = `Free delivery — ${fdOffer.title}`
  }

  const itemTotal = roundMoney(afterCoupon + exclusiveExtra)
  const total = coversFullSubtotal
    ? roundMoney(shippingFee)
    : roundMoney(itemTotal + shippingFee)

  const displayOffer = appliedOffer || freeDeliveryOffer

  return {
    lines: pricedLines,
    subtotal,
    offerDiscount,
    couponDiscount,
    couponCode: appliedCoupon?.code || null,
    coversFullSubtotal,
    taxAmount: coversFullSubtotal ? 0 : taxAmount,
    taxExclusive: exclusiveExtra,
    taxInclusive: coversFullSubtotal ? 0 : roundMoney(taxAmount - exclusiveExtra),
    shippingFee,
    shippingMethod: shippingMethod
      ? {
          id: shippingMethod.id,
          name: shippingMethod.name,
          price: shippingMethod.price,
          effectivePrice: shippingFee,
        }
      : null,
    deliveryArea: deliveryArea
      ? {
          id: deliveryArea.id,
          name: deliveryArea.name,
          charge: deliveryArea.charge,
        }
      : null,
    shippingBreakdown: breakdown
      ? {
          base: breakdown.base,
          fuelFixed: breakdown.fuelFixed,
          fuelPercent: breakdown.fuelPercent,
          fuelAmount: breakdown.fuelAmount,
          fee: shippingFee,
        }
      : null,
    deliveryChargeSettings: deliverySettings
      ? {
          fuelSurchargeFixed: deliverySettings.fuelSurchargeFixed,
          fuelSurchargePercent: deliverySettings.fuelSurchargePercent,
          freeDeliveryMinOrder: deliverySettings.freeDeliveryMinOrder,
          enabled: deliverySettings.enabled,
        }
      : null,
    freeDeliveryApplied,
    freeDeliveryMessage,
    total,
    appliedOffer: displayOffer
      ? buildAppliedOfferSummary(displayOffer, productMap)
      : null,
    appliedCoupon: appliedCoupon
      ? {
          id: appliedCoupon.id,
          code: appliedCoupon.code,
          type: appliedCoupon.type,
          value: appliedCoupon.value,
        }
      : null,
  }
}
