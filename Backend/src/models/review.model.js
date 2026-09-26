import pool from '../config/database.js'
import { DEFAULT_REVIEW_SETTINGS } from '../constants/reviewDefaults.js'

export function mapOrderReviewItem(row) {
  if (!row) return null
  return {
    id: row.id,
    orderReviewId: row.order_review_id,
    productId: row.product_id ?? null,
    productName: row.product_name,
    rating: Number(row.rating ?? 0),
    comment: row.comment ?? '',
    createdAt: row.created_at,
  }
}

export function mapOrderReview(row, items = []) {
  if (!row) return null
  return {
    id: row.id,
    orderId: row.order_id,
    customerName: row.customer_name,
    overallRating: Number(row.overall_rating ?? 0),
    comment: row.comment ?? '',
    status: row.status,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: items.map(mapOrderReviewItem),
  }
}

export function mapReviewSettings(row) {
  if (!row) return { ...DEFAULT_REVIEW_SETTINGS }
  return {
    id: row.id,
    emailEnabled: Boolean(row.email_enabled),
    whatsappEnabled: Boolean(row.whatsapp_enabled),
    emailSubject: row.email_subject ?? DEFAULT_REVIEW_SETTINGS.emailSubject,
    emailBodyTemplate: row.email_body_template ?? DEFAULT_REVIEW_SETTINGS.emailBodyTemplate,
    whatsappTemplate: row.whatsapp_template ?? DEFAULT_REVIEW_SETTINGS.whatsappTemplate,
    delayMinutes: Number(row.delay_minutes ?? DEFAULT_REVIEW_SETTINGS.delayMinutes),
    inviteOnDelivered: Boolean(row.invite_on_delivered),
    updatedAt: row.updated_at,
  }
}

async function attachItems(reviews) {
  if (!reviews.length) return []
  const ids = reviews.map((r) => r.id)
  const orderIds = [...new Set(reviews.map((r) => r.order_id).filter(Boolean))]

  const [itemRows] = await pool.query(
    `SELECT * FROM order_review_items
     WHERE order_review_id IN (:ids)
     ORDER BY created_at ASC`,
    { ids }
  )
  const byReview = new Map()
  for (const row of itemRows) {
    const list = byReview.get(row.order_review_id) || []
    list.push(row)
    byReview.set(row.order_review_id, list)
  }

  // Fallback: show order line items when the customer didn't rate products individually
  let orderItemsByOrder = new Map()
  if (orderIds.length) {
    const [orderItemRows] = await pool.query(
      `SELECT order_id, product_id, name, qty
       FROM order_items
       WHERE order_id IN (:orderIds)
       ORDER BY id ASC`,
      { orderIds }
    )
    for (const row of orderItemRows) {
      const list = orderItemsByOrder.get(row.order_id) || []
      list.push(row)
      orderItemsByOrder.set(row.order_id, list)
    }
  }

  return reviews.map((row) => {
    const rated = byReview.get(row.id) || []
    if (rated.length) return mapOrderReview(row, rated)

    const fallback = (orderItemsByOrder.get(row.order_id) || []).map((oi, index) => ({
      id: `orderitem_${row.id}_${index}`,
      order_review_id: row.id,
      product_id: oi.product_id,
      product_name: oi.qty > 1 ? `${oi.name} (×${oi.qty})` : oi.name,
      rating: row.overall_rating,
      comment: null,
      created_at: row.created_at,
    }))
    return mapOrderReview(row, fallback)
  })
}

export async function findAllOrderReviews({ branchId } = {}) {
  const params = {}
  let sql = `SELECT r.* FROM order_reviews r`
  if (branchId) {
    sql += ` INNER JOIN orders o ON o.id = r.order_id WHERE o.branch_id = :branchId`
    params.branchId = branchId
  }
  sql += ' ORDER BY r.created_at DESC'
  const [rows] = await pool.query(sql, params)
  return attachItems(rows)
}

/** Approved reviews for the public website (optionally branch-scoped). */
export async function findApprovedPublicReviews({ branchId, limit = 12 } = {}) {
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 12))
  const params = {}
  let sql = `
    SELECT r.id, r.customer_name, r.overall_rating, r.comment, r.created_at, o.branch_id
    FROM order_reviews r
    INNER JOIN orders o ON o.id = r.order_id
    WHERE r.status = 'approved'
      AND TRIM(COALESCE(r.comment, '')) <> ''
  `
  if (branchId) {
    sql += ' AND o.branch_id = :branchId'
    params.branchId = branchId
  }
  sql += ` ORDER BY r.created_at DESC LIMIT ${safeLimit}`
  const [rows] = await pool.query(sql, params)
  return rows.map((row) => ({
    id: row.id,
    customerName: row.customer_name || 'Guest',
    overallRating: Number(row.overall_rating ?? 5),
    comment: row.comment || '',
    createdAt: row.created_at,
    branchId: row.branch_id ?? null,
  }))
}

export async function findPublicReviewStats({ branchId } = {}) {
  const params = {}
  let sql = `
    SELECT
      COUNT(*) AS review_count,
      AVG(r.overall_rating) AS avg_rating
    FROM order_reviews r
    INNER JOIN orders o ON o.id = r.order_id
    WHERE r.status = 'approved'
  `
  if (branchId) {
    sql += ' AND o.branch_id = :branchId'
    params.branchId = branchId
  }
  const [rows] = await pool.query(sql, params)
  const row = rows[0] || {}
  return {
    reviewCount: Number(row.review_count || 0),
    avgRating: row.avg_rating != null ? Math.round(Number(row.avg_rating) * 10) / 10 : null,
  }
}

export async function findOrderReviewById(id) {
  const [rows] = await pool.query(
    'SELECT * FROM order_reviews WHERE id = :id LIMIT 1',
    { id }
  )
  if (!rows[0]) return null
  const [attached] = await attachItems(rows)
  return attached
}

export async function findOrderReviewByOrderId(orderId) {
  const [rows] = await pool.query(
    'SELECT * FROM order_reviews WHERE order_id = :orderId LIMIT 1',
    { orderId }
  )
  if (!rows[0]) return null
  const [attached] = await attachItems(rows)
  return attached
}

export async function insertOrderReview(data, items = []) {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    await connection.query(
      `INSERT INTO order_reviews (
        id, order_id, customer_name, overall_rating, comment, status, source, created_at
      ) VALUES (
        :id, :orderId, :customerName, :overallRating, :comment, :status, :source, :createdAt
      )`,
      {
        id: data.id,
        orderId: data.orderId,
        customerName: data.customerName,
        overallRating: data.overallRating,
        comment: data.comment || null,
        status: data.status || 'pending',
        source: data.source || 'tracking',
        createdAt: data.createdAt || new Date(),
      }
    )

    for (const item of items) {
      await connection.query(
        `INSERT INTO order_review_items (
          id, order_review_id, product_id, product_name, rating, comment
        ) VALUES (
          :id, :orderReviewId, :productId, :productName, :rating, :comment
        )`,
        {
          id: item.id,
          orderReviewId: data.id,
          productId: item.productId || null,
          productName: item.productName,
          rating: item.rating,
          comment: item.comment || null,
        }
      )
    }

    await connection.commit()
  } catch (err) {
    await connection.rollback()
    throw err
  } finally {
    connection.release()
  }

  return findOrderReviewById(data.id)
}

export async function updateOrderReviewStatus(id, status) {
  await pool.query(
    'UPDATE order_reviews SET status = :status WHERE id = :id',
    { id, status }
  )
  return findOrderReviewById(id)
}

export async function deleteOrderReviewRecord(id) {
  const [result] = await pool.query('DELETE FROM order_reviews WHERE id = :id', { id })
  return result.affectedRows > 0
}

export async function findReviewSettings() {
  const [rows] = await pool.query(
    'SELECT * FROM review_settings ORDER BY updated_at DESC LIMIT 1'
  )
  return mapReviewSettings(rows[0])
}

export async function updateReviewSettingsRecord(payload) {
  const existing = await findReviewSettings()
  const id = existing.id || DEFAULT_REVIEW_SETTINGS.id

  await pool.query(
    `INSERT INTO review_settings (
      id, email_enabled, whatsapp_enabled, email_subject, email_body_template,
      whatsapp_template, delay_minutes, invite_on_delivered
    ) VALUES (
      :id, :emailEnabled, :whatsappEnabled, :emailSubject, :emailBodyTemplate,
      :whatsappTemplate, :delayMinutes, :inviteOnDelivered
    )
    ON DUPLICATE KEY UPDATE
      email_enabled = VALUES(email_enabled),
      whatsapp_enabled = VALUES(whatsapp_enabled),
      email_subject = VALUES(email_subject),
      email_body_template = VALUES(email_body_template),
      whatsapp_template = VALUES(whatsapp_template),
      delay_minutes = VALUES(delay_minutes),
      invite_on_delivered = VALUES(invite_on_delivered)`,
    {
      id,
      emailEnabled: payload.emailEnabled ? 1 : 0,
      whatsappEnabled: payload.whatsappEnabled ? 1 : 0,
      emailSubject: payload.emailSubject || null,
      emailBodyTemplate: payload.emailBodyTemplate || null,
      whatsappTemplate: payload.whatsappTemplate || null,
      delayMinutes: payload.delayMinutes ?? 30,
      inviteOnDelivered: payload.inviteOnDelivered !== false ? 1 : 0,
    }
  )

  return findReviewSettings()
}
