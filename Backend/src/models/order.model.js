import crypto from 'crypto'
import pool from '../config/database.js'
import { mapOrder, mapOrderItem } from '../utils/mappers.js'

const UPCOMING_STATUSES = ['pending', 'confirmed', 'preparing']
const REJECTED_STATUSES = ['rejected', 'cancelled']
const DELIVERED_STATUSES = ['delivered']

export async function findOrderItems(orderIds) {
  if (!orderIds.length) return new Map()
  const [rows] = await pool.query(
    'SELECT * FROM order_items WHERE order_id IN (:orderIds) ORDER BY created_at ASC',
    { orderIds }
  )
  const map = new Map()
  for (const row of rows) {
    if (!map.has(row.order_id)) map.set(row.order_id, [])
    map.get(row.order_id).push(mapOrderItem(row))
  }
  return map
}

async function attachItems(orders) {
  const itemsMap = await findOrderItems(orders.map((o) => o.id))
  return orders.map((row) => mapOrder(row, itemsMap.get(row.id) ?? []))
}

function buildStatusFilter(status, group) {
  if (status) {
    const list = String(status).split(',').map((s) => s.trim()).filter(Boolean)
    if (list.length) return { clause: 'status IN (:statuses)', params: { statuses: list } }
  }
  if (group === 'upcoming') {
    return { clause: 'status IN (:statuses)', params: { statuses: UPCOMING_STATUSES } }
  }
  if (group === 'rejected') {
    return { clause: 'status IN (:statuses)', params: { statuses: REJECTED_STATUSES } }
  }
  if (group === 'sales' || group === 'delivered') {
    return { clause: 'status IN (:statuses)', params: { statuses: DELIVERED_STATUSES } }
  }
  return { clause: '1=1', params: {} }
}

export async function findAllOrders(filters = {}) {
  const { clause, params } = buildStatusFilter(filters.status, filters.group)
  let sql = `SELECT * FROM orders WHERE ${clause}`
  const queryParams = { ...params }
  if (filters.branchId) {
    sql += ' AND branch_id = :branchId'
    queryParams.branchId = filters.branchId
  }
  sql += ' ORDER BY created_at DESC'
  const [rows] = await pool.query(sql, queryParams)
  return attachItems(rows)
}

export async function findOrderById(id) {
  const key = String(id || '')
    .trim()
    .replace(/^#/, '')
  if (!key) return null
  const [rows] = await pool.query(
    `SELECT * FROM orders
     WHERE id = :id
        OR UPPER(id) = UPPER(:id)
        OR UPPER(id) LIKE CONCAT('%_', UPPER(:id))
     LIMIT 1`,
    { id: key }
  )
  if (!rows[0]) return null
  const itemsMap = await findOrderItems([rows[0].id])
  return mapOrder(rows[0], itemsMap.get(rows[0].id) ?? [])
}

export async function insertOrder(connection, order, items) {
  await connection.query(
    `INSERT INTO orders (
      id, customer_id, customer_name, customer_email, customer_phone,
      status, subtotal, offer_discount, coupon_discount, coupon_code, tax_amount, total,
      notes, source, branch_id, delivery_type, shipping_fee, created_at
    ) VALUES (
      :id, :customerId, :customerName, :customerEmail, :customerPhone,
      :status, :subtotal, :offerDiscount, :couponDiscount, :couponCode, :taxAmount, :total,
      :notes, :source, :branchId, :deliveryType, :shippingFee, :createdAt
    )`,
    order
  )

  for (const item of items) {
    await connection.query(
      `INSERT INTO order_items (id, order_id, product_id, name, qty, price)
       VALUES (:id, :orderId, :productId, :name, :qty, :price)`,
      item
    )
  }
}

export async function updateOrderStatusRecord(id, status, rejectionReason = null) {
  const storeReason = ['rejected', 'cancelled'].includes(status)
  await pool.query(
    `UPDATE orders
     SET status = :status, rejection_reason = :rejectionReason
     WHERE id = :id`,
    {
      id,
      status,
      rejectionReason: storeReason ? rejectionReason?.trim() || null : null,
    }
  )
  return findOrderById(id)
}

export async function deleteOrderRecord(id) {
  const [result] = await pool.query('DELETE FROM orders WHERE id = :id', { id })
  return result.affectedRows > 0
}

export function calcTotal(items) {
  return items.reduce((sum, item) => sum + item.qty * item.price, 0)
}

export function buildOrderItems(orderId, items) {
  return items.map((item) => ({
    id: crypto.randomUUID(),
    orderId,
    productId: item.productId ?? null,
    name: item.name,
    qty: Number(item.qty) || 1,
    price: Number(item.price) || 0,
  }))
}

export { UPCOMING_STATUSES, REJECTED_STATUSES }
