import { findOrderById } from '../models/order.model.js'
import {
  findAllOrderReviews,
  findOrderReviewById,
  findOrderReviewByOrderId,
  insertOrderReview,
  updateOrderReviewStatus,
  deleteOrderReviewRecord,
  findReviewSettings,
  updateReviewSettingsRecord,
  findApprovedPublicReviews,
  findPublicReviewStats,
} from '../models/review.model.js'
import { REVIEW_STATUSES } from '../constants/reviewDefaults.js'
import { normalizePhone } from '../utils/orderNotes.js'
import { newId } from '../utils/ids.js'
import { ApiError } from '../utils/response.js'
import { parseBranchId } from '../utils/branchQuery.js'

function clampRating(value, field = 'rating') {
  const n = Number(value)
  if (!Number.isFinite(n) || n < 1 || n > 5) {
    throw new ApiError(400, `${field} must be between 1 and 5`)
  }
  return Math.round(n)
}

function assertOrderAccess(order, phoneQuery) {
  if (!order) throw new ApiError(404, 'Order not found')
  if (phoneQuery?.trim()) {
    const queryPhone = normalizePhone(phoneQuery)
    const orderPhone = normalizePhone(order.customerPhone)
    if (!orderPhone || queryPhone !== orderPhone) {
      throw new ApiError(404, 'Order not found')
    }
  }
}

function toReviewSummary(review) {
  if (!review) return null
  return {
    id: review.id,
    overallRating: review.overallRating,
    status: review.status,
    source: review.source,
    createdAt: review.createdAt,
  }
}

export async function getPublicReviewEligibility(orderId, phoneQuery) {
  const order = await findOrderById(orderId)
  assertOrderAccess(order, phoneQuery)

  const existing = await findOrderReviewByOrderId(orderId)
  const delivered = order.status === 'delivered'
  const hasReview = Boolean(existing)

  return {
    canReview: delivered && !hasReview,
    hasReview,
    reviewSummary: toReviewSummary(existing),
    items: (order.items || []).map((item) => ({
      productId: item.productId || null,
      name: item.name,
    })),
  }
}

export async function submitPublicReview(orderId, phoneQuery, body) {
  const order = await findOrderById(orderId)
  assertOrderAccess(order, phoneQuery)

  if (order.status !== 'delivered') {
    throw new ApiError(400, 'Reviews can only be submitted after delivery')
  }

  const existing = await findOrderReviewByOrderId(orderId)
  if (existing) {
    throw new ApiError(409, 'A review already exists for this order')
  }

  const overallRating = clampRating(body.overallRating, 'overallRating')
  const comment = typeof body.comment === 'string' ? body.comment.trim() : ''

  const rawItems = Array.isArray(body.items) ? body.items : []
  const ratedByKey = new Map()
  for (const item of rawItems) {
    if (!item || item.rating == null || item.rating === '') continue
    const name =
      (typeof item.productName === 'string' && item.productName.trim()) ||
      (typeof item.name === 'string' && item.name.trim()) ||
      ''
    const key = `${item.productId || ''}|${name}`
    ratedByKey.set(key, {
      productId: item.productId || null,
      productName: name,
      rating: clampRating(item.rating, 'item.rating'),
      comment: typeof item.comment === 'string' ? item.comment.trim() : '',
    })
  }

  // Always persist order line items so admin can see what was reviewed.
  // Use per-item stars when provided; otherwise inherit overall rating.
  const orderLines = Array.isArray(order.items) ? order.items : []
  const items = orderLines.map((line) => {
    const name = String(line.name || '').trim() || 'Item'
    const key = `${line.productId || ''}|${name}`
    const rated = ratedByKey.get(key)
    return {
      id: newId('orvi'),
      productId: line.productId || rated?.productId || null,
      productName: rated?.productName || name,
      rating: rated?.rating ?? overallRating,
      comment: rated?.comment || '',
    }
  })

  // If body sent extra rated items not in order lines, keep those too
  for (const [key, rated] of ratedByKey) {
    if (!rated.productName) continue
    const already = items.some(
      (i) => `${i.productId || ''}|${i.productName}` === key
    )
    if (!already) {
      items.push({
        id: newId('orvi'),
        productId: rated.productId,
        productName: rated.productName,
        rating: rated.rating,
        comment: rated.comment,
      })
    }
  }

  try {
    const review = await insertOrderReview(
      {
        id: newId('orev'),
        orderId: order.id,
        customerName: order.customerName,
        overallRating,
        comment,
        status: 'pending',
        source: 'tracking',
        createdAt: new Date(),
      },
      items
    )
    return review
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw new ApiError(409, 'A review already exists for this order')
    }
    throw err
  }
}

export async function listOrderReviews(query = {}) {
  return findAllOrderReviews({ branchId: parseBranchId(query) })
}

export async function getPublicReviews(query = {}) {
  const branchId = parseBranchId(query)
  const limit = Number(query.limit) || 12
  const [reviews, stats] = await Promise.all([
    findApprovedPublicReviews({ branchId, limit }),
    findPublicReviewStats({ branchId }),
  ])
  return { reviews, stats }
}

export async function updateOrderReview(id, body) {
  const existing = await findOrderReviewById(id)
  if (!existing) throw new ApiError(404, 'Review not found')

  if (body.status !== undefined) {
    if (!REVIEW_STATUSES.includes(body.status)) {
      throw new ApiError(400, 'Invalid review status')
    }
    return updateOrderReviewStatus(id, body.status)
  }

  throw new ApiError(400, 'No valid fields to update')
}

export async function removeOrderReview(id) {
  if (!(await deleteOrderReviewRecord(id))) {
    throw new ApiError(404, 'Review not found')
  }
  return { id }
}

export async function getReviewSettings() {
  return findReviewSettings()
}

export async function updateReviewSettings(payload) {
  const existing = await findReviewSettings()
  const delay =
    payload.delayMinutes !== undefined ? Number(payload.delayMinutes) : existing.delayMinutes
  if (!Number.isFinite(delay) || delay < 0 || delay > 10080) {
    throw new ApiError(400, 'delayMinutes must be between 0 and 10080')
  }

  return updateReviewSettingsRecord({
    emailEnabled:
      payload.emailEnabled !== undefined ? Boolean(payload.emailEnabled) : existing.emailEnabled,
    whatsappEnabled:
      payload.whatsappEnabled !== undefined
        ? Boolean(payload.whatsappEnabled)
        : existing.whatsappEnabled,
    emailSubject:
      typeof payload.emailSubject === 'string'
        ? payload.emailSubject.trim()
        : existing.emailSubject,
    emailBodyTemplate:
      typeof payload.emailBodyTemplate === 'string'
        ? payload.emailBodyTemplate
        : existing.emailBodyTemplate,
    whatsappTemplate:
      typeof payload.whatsappTemplate === 'string'
        ? payload.whatsappTemplate
        : existing.whatsappTemplate,
    delayMinutes: delay,
    inviteOnDelivered:
      payload.inviteOnDelivered !== undefined
        ? payload.inviteOnDelivered !== false
        : existing.inviteOnDelivered,
  })
}
