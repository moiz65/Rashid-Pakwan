function toNumber(value) {
  return Number(value ?? 0)
}

export function mapCustomer(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? '',
    totalOrders: row.total_orders,
    spent: toNumber(row.spent),
    joinedAt: row.joined_at,
    branchId: row.branch_id ?? null,
  }
}

export function mapOrderItem(row) {
  return {
    id: row.id,
    productId: row.product_id,
    name: row.name,
    qty: row.qty,
    price: toNumber(row.price),
  }
}

export function mapOrder(row, items = []) {
  if (!row) return null
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    items: items.map(mapOrderItem),
    subtotal: toNumber(row.subtotal ?? row.total),
    offerDiscount: toNumber(row.offer_discount),
    couponDiscount: toNumber(row.coupon_discount),
    couponCode: row.coupon_code ?? null,
    taxAmount: toNumber(row.tax_amount),
    total: toNumber(row.total),
    branchId: row.branch_id ?? null,
    deliveryType: row.delivery_type ?? null,
    shippingFee: toNumber(row.shipping_fee),
    status: row.status,
    notes: row.notes,
    rejectionReason: row.rejection_reason,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
