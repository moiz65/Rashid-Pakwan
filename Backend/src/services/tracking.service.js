import { findOrderById } from '../models/order.model.js'
import {
  findTrackingSettings,
  updateTrackingSettingsRecord,
} from '../models/tracking.model.js'
import { DEFAULT_TRACKING_SETTINGS, TRACKING_STEPS } from '../constants/trackingDefaults.js'
import { parseOrderNotes, normalizePhone } from '../utils/orderNotes.js'
import { ApiError } from '../utils/response.js'

export async function getTrackingSettings() {
  return findTrackingSettings()
}

export async function updateTrackingSettings(payload) {
  if (!payload.restaurantName?.trim()) {
    throw new ApiError(400, 'Restaurant name is required')
  }

  const poll = Number(payload.pollIntervalSeconds)
  if (poll && (poll < 5 || poll > 120)) {
    throw new ApiError(400, 'Poll interval must be between 5 and 120 seconds')
  }

  return updateTrackingSettingsRecord({
    restaurantName: payload.restaurantName.trim(),
    phone: payload.phone?.trim() || '',
    supportEmail: payload.supportEmail?.trim() || '',
    address: payload.address?.trim() || '',
    logoUrl: payload.logoUrl?.trim() || null,
    helpText: payload.helpText?.trim() || '',
    pollIntervalSeconds: poll || 20,
    showRejectionReason: payload.showRejectionReason !== false,
    statusMessages: payload.statusMessages || DEFAULT_TRACKING_SETTINGS.statusMessages,
  })
}

function getStatusMeta(settings, status) {
  const defaults = DEFAULT_TRACKING_SETTINGS.statusMessages || {}
  const stored = (settings.statusMessages || {})[status] || {}
  const fallback = defaults[status] || {}
  // Prefer defaults when DB still has the old "Order Received" pending copy
  const stalePending =
    status === 'pending' && String(stored.label || '') === 'Order Received'
  const meta = stalePending ? { ...fallback } : { ...fallback, ...stored }
  return {
    statusLabel: meta.label || status,
    statusMessage: meta.message || '',
    eta: meta.eta || null,
  }
}

export async function getPublicOrder(id, phoneQuery) {
  const order = await findOrderById(id)
  if (!order) throw new ApiError(404, 'Order not found')

  if (phoneQuery?.trim()) {
    const queryPhone = normalizePhone(phoneQuery)
    const orderPhone = normalizePhone(order.customerPhone)
    if (!orderPhone || queryPhone !== orderPhone) {
      throw new ApiError(404, 'Order not found')
    }
  }

  const settings = await findTrackingSettings()
  const parsed = parseOrderNotes(order.notes)
  const statusMeta = getStatusMeta(settings, order.status)

  const publicOrder = {
    id: order.id,
    status: order.status,
    statusLabel: statusMeta.statusLabel,
    statusMessage: statusMeta.statusMessage,
    eta: statusMeta.eta,
    items: order.items.map((item) => ({
      productId: item.productId || null,
      name: item.name,
      qty: item.qty,
      price: item.price,
    })),
    total: order.total,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    deliveryType: parsed.deliveryType,
    address: parsed.address,
    branch: parsed.branch,
    landmark: parsed.landmark,
    payment: parsed.payment,
    instructions: parsed.instructions,
    trackingSteps: TRACKING_STEPS,
    restaurant: {
      name: settings.restaurantName,
      phone: settings.phone,
      supportEmail: settings.supportEmail,
      address: settings.address,
      logoUrl: settings.logoUrl,
      helpText: settings.helpText,
    },
    pollIntervalSeconds: settings.pollIntervalSeconds,
  }

  if (
    settings.showRejectionReason &&
    ['rejected', 'cancelled'].includes(order.status) &&
    order.rejectionReason
  ) {
    publicOrder.rejectionReason = order.rejectionReason
  }

  return publicOrder
}

export async function getPublicTrackingSettings() {
  const settings = await findTrackingSettings()
  return {
    restaurantName: settings.restaurantName,
    phone: settings.phone,
    supportEmail: settings.supportEmail,
    address: settings.address,
    logoUrl: settings.logoUrl,
    helpText: settings.helpText,
    pollIntervalSeconds: settings.pollIntervalSeconds,
    showRejectionReason: settings.showRejectionReason,
    statusMessages: settings.statusMessages,
    trackingSteps: TRACKING_STEPS,
  }
}
