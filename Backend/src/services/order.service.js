import crypto from 'crypto'
import pool from '../config/database.js'
import { ApiError } from '../utils/response.js'
import {
  findAllOrders,
  findOrderById,
  insertOrder,
  updateOrderStatusRecord,
  deleteOrderRecord,
  buildOrderItems,
} from '../models/order.model.js'
import {
  findCustomerById,
  findCustomerByEmail,
  insertCustomer,
  refreshCustomerStats,
} from '../models/customer.model.js'
import * as catalog from '../models/catalog.model.js'
import { quoteCart } from './pricing.service.js'
import { newOrderTrackId } from '../utils/ids.js'

const VALID_STATUSES = ['pending', 'confirmed', 'preparing', 'delivered', 'rejected', 'cancelled']

async function allocateOrderId(preferred) {
  if (preferred?.trim()) {
    const id = preferred.trim()
    const existing = await findOrderById(id)
    if (existing) throw new ApiError(409, 'Order id already exists')
    return id
  }
  for (let attempt = 0; attempt < 8; attempt++) {
    const id = newOrderTrackId(6)
    const existing = await findOrderById(id)
    if (!existing) return id
  }
  return newOrderTrackId(8)
}

export async function listOrders(query = {}) {
  return findAllOrders({
    status: query.status,
    group: query.group,
    branchId: query.branchId || null,
  })
}

export async function getOrder(id) {
  const order = await findOrderById(id)
  if (!order) throw new ApiError(404, 'Order not found')
  return order
}

async function resolveCustomer(connection, payload) {
  if (payload.customerId) {
    const customer = await findCustomerById(payload.customerId)
    if (!customer) throw new ApiError(404, 'Customer not found')
    return customer
  }

  const email = payload.customerEmail?.trim().toLowerCase()
  if (email) {
    const existing = await findCustomerByEmail(email)
    if (existing) return existing
  }

  if (!payload.customerName?.trim()) {
    throw new ApiError(400, 'Customer name is required')
  }

  const id = crypto.randomUUID()
  const customer = {
    id,
    name: payload.customerName.trim(),
    email: email || `${id.slice(0, 8)}@guest.local`,
    phone: payload.customerPhone?.trim() || null,
    totalOrders: 0,
    spent: 0,
    joinedAt: new Date(),
    branchId: payload.branchId || null,
  }

  await insertCustomer(connection, customer)
  return customer
}

function appendPromoNote(notes, couponCode) {
  const base = notes?.trim() || ''
  if (!couponCode) return base || null
  if (base.includes(`Promo code: ${couponCode}`)) return base
  return base ? `${base}\nPromo code: ${couponCode}` : `Promo code: ${couponCode}`
}

export async function createOrder(payload) {
  const items = Array.isArray(payload.items) ? payload.items : []
  if (!items.length) throw new ApiError(400, 'At least one order item is required')

  for (const item of items) {
    if (!item.name?.trim() && !item.productId && !item.dealId) {
      throw new ApiError(400, 'Each item must have a name or product/deal id')
    }
  }

  const source = payload.source || 'admin'
  // Website orders always start unreceived; admin must receive/confirm them.
  const status = source === 'website' ? 'pending' : payload.status || 'pending'
  if (!VALID_STATUSES.includes(status)) {
    throw new ApiError(400, 'Invalid order status')
  }

  const trustClientPrices = source === 'admin'
  const quote = await quoteCart({
    items,
    couponCode: payload.couponCode || null,
    trustClientPrices,
    deliveryType: payload.deliveryType || 'delivery',
    shippingMethodId: payload.shippingMethodId || null,
    deliveryAreaId: payload.deliveryAreaId || null,
  })

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const customer = await resolveCustomer(connection, payload)
    const orderId = await allocateOrderId(payload.id)
    const normalizedItems = buildOrderItems(
      orderId,
      quote.lines.map((l) => ({
        productId: l.productId,
        name: l.name,
        qty: l.qty,
        price: l.price,
      }))
    )

    await insertOrder(
      connection,
      {
        id: orderId,
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        status,
        subtotal: quote.subtotal,
        offerDiscount: quote.offerDiscount,
        couponDiscount: quote.couponDiscount,
        couponCode: quote.couponCode,
        taxAmount: quote.taxAmount,
        total: quote.total,
        notes: appendPromoNote(payload.notes, quote.couponCode),
        source,
        branchId: payload.branchId || null,
        deliveryType: payload.deliveryType || null,
        shippingFee: quote.shippingFee || 0,
        createdAt: payload.createdAt || new Date(),
      },
      normalizedItems
    )

    if (quote.appliedCoupon?.id) {
      // Same DB transaction as the order — only sticks if checkout commits successfully
      await catalog.incrementCouponUsedCount(quote.appliedCoupon.id, connection)
    }

    await refreshCustomerStats(connection, customer.id)
    await connection.commit()

    return findOrderById(orderId)
  } catch (err) {
    await connection.rollback()
    throw err
  } finally {
    connection.release()
  }
}

export async function updateOrderStatus(id, status, rejectionReason) {
  if (!VALID_STATUSES.includes(status)) {
    throw new ApiError(400, 'Invalid order status')
  }

  if (['rejected', 'cancelled'].includes(status) && !rejectionReason?.trim()) {
    throw new ApiError(400, 'Rejection reason is required')
  }

  const existing = await findOrderById(id)
  if (!existing) throw new ApiError(404, 'Order not found')

  const order = await updateOrderStatusRecord(id, status, rejectionReason)

  if (existing.customerId) {
    const connection = await pool.getConnection()
    try {
      await refreshCustomerStats(connection, existing.customerId)
    } finally {
      connection.release()
    }
  }

  return order
}

export async function removeOrder(id) {
  const existing = await findOrderById(id)
  if (!existing) throw new ApiError(404, 'Order not found')

  const customerId = existing.customerId
  await deleteOrderRecord(id)

  if (customerId) {
    const connection = await pool.getConnection()
    try {
      await refreshCustomerStats(connection, customerId)
    } finally {
      connection.release()
    }
  }

  return { id }
}
