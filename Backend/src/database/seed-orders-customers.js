import pool from '../config/database.js'
import { calcTotal, buildOrderItems, insertOrder } from '../models/order.model.js'
import { insertCustomer } from '../models/customer.model.js'

const customers = [
  { id: 'cust_1', name: 'Alice Johnson', email: 'alice@email.com', phone: '+92 300-0101', totalOrders: 12, spent: 486.5, joinedAt: '2024-03-15T10:00:00Z' },
  { id: 'cust_2', name: 'Bob Smith', email: 'bob@email.com', phone: '+92 300-0102', totalOrders: 8, spent: 312.0, joinedAt: '2024-05-20T14:30:00Z' },
  { id: 'cust_3', name: 'Carol Williams', email: 'carol@email.com', phone: '+92 300-0103', totalOrders: 15, spent: 678.25, joinedAt: '2024-01-10T09:00:00Z' },
  { id: 'cust_4', name: 'David Brown', email: 'david@email.com', phone: '+92 300-0104', totalOrders: 3, spent: 89.5, joinedAt: '2025-01-05T16:00:00Z' },
  { id: 'cust_5', name: 'Emma Davis', email: 'emma@email.com', phone: '+92 300-0105', totalOrders: 22, spent: 945.0, joinedAt: '2023-11-22T11:00:00Z' },
  { id: 'cust_6', name: 'Frank Miller', email: 'frank@email.com', phone: '+92 300-0106', totalOrders: 6, spent: 198.75, joinedAt: '2024-08-14T13:00:00Z' },
  { id: 'cust_7', name: 'Grace Lee', email: 'grace@email.com', phone: '+92 300-0107', totalOrders: 18, spent: 756.3, joinedAt: '2024-02-28T10:30:00Z' },
  { id: 'cust_8', name: 'Henry Wilson', email: 'henry@email.com', phone: '+92 300-0108', totalOrders: 4, spent: 124.0, joinedAt: '2025-02-10T15:00:00Z' },
  { id: 'cust_9', name: 'Ivy Martinez', email: 'ivy@email.com', phone: '+92 300-0109', totalOrders: 9, spent: 387.5, joinedAt: '2024-06-18T12:00:00Z' },
  { id: 'cust_10', name: 'Jack Taylor', email: 'jack@email.com', phone: '+92 300-0110', totalOrders: 11, spent: 445.0, joinedAt: '2024-04-05T08:00:00Z' },
]

const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000)
const daysAgo = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000)

const orderItems = [
  [{ productId: 'prod_1', name: 'Margherita Pizza', qty: 2, price: 1499 }],
  [{ productId: 'prod_6', name: 'Chicken Wings', qty: 1, price: 1199 }, { productId: 'prod_8', name: 'Fresh Lemonade', qty: 2, price: 499 }],
  [{ productId: 'prod_4', name: 'Grilled Salmon', qty: 1, price: 2499 }, { productId: 'prod_3', name: 'Caesar Salad', qty: 1, price: 999 }],
  [{ productId: 'prod_10', name: 'Ribeye Steak', qty: 2, price: 3299 }],
  [{ productId: 'prod_5', name: 'Spaghetti Carbonara', qty: 3, price: 1599 }],
]

const orders = [
  { id: 'ord_1', customerId: 'cust_1', customerName: 'Alice Johnson', items: orderItems[0], status: 'pending', createdAt: hoursAgo(1) },
  { id: 'ord_2', customerId: 'cust_2', customerName: 'Bob Smith', items: orderItems[1], status: 'confirmed', createdAt: hoursAgo(2) },
  { id: 'ord_3', customerId: 'cust_3', customerName: 'Carol Williams', items: orderItems[2], status: 'preparing', createdAt: hoursAgo(3) },
  { id: 'ord_4', customerId: 'cust_5', customerName: 'Emma Davis', items: orderItems[3], status: 'confirmed', createdAt: hoursAgo(4) },
  { id: 'ord_5', customerId: 'cust_7', customerName: 'Grace Lee', items: orderItems[4], status: 'pending', createdAt: hoursAgo(5) },
  { id: 'ord_9', customerId: 'cust_4', customerName: 'David Brown', items: orderItems[0], status: 'rejected', createdAt: daysAgo(2) },
  { id: 'ord_10', customerId: 'cust_6', customerName: 'Frank Miller', items: orderItems[1], status: 'cancelled', createdAt: daysAgo(2) },
  { id: 'ord_7', customerId: 'cust_8', customerName: 'Henry Wilson', items: orderItems[2], status: 'delivered', createdAt: daysAgo(1) },
  { id: 'ord_8', customerId: 'cust_9', customerName: 'Ivy Martinez', items: orderItems[3], status: 'delivered', createdAt: daysAgo(1) },
  { id: 'ord_6', customerId: 'cust_10', customerName: 'Jack Taylor', items: orderItems[4], status: 'preparing', createdAt: hoursAgo(6) },
]

async function seed() {
  const connection = await pool.getConnection()
  try {
    for (const customer of customers) {
      await connection.query(
        `INSERT INTO customers (id, name, email, phone, total_orders, spent, joined_at)
         VALUES (:id, :name, :email, :phone, :totalOrders, :spent, :joinedAt)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           phone = VALUES(phone)`,
        {
          ...customer,
          joinedAt: new Date(customer.joinedAt),
        }
      )
    }

    for (const order of orders) {
      const customer = customers.find((c) => c.id === order.customerId)
      const items = buildOrderItems(order.id, order.items)
      const total = calcTotal(items)

      await connection.query(
        `INSERT INTO orders (
          id, customer_id, customer_name, customer_email, customer_phone,
          status, total, source, created_at
        ) VALUES (
          :id, :customerId, :customerName, :customerEmail, :customerPhone,
          :status, :total, 'seed', :createdAt
        )
        ON DUPLICATE KEY UPDATE status = VALUES(status), total = VALUES(total)`,
        {
          id: order.id,
          customerId: order.customerId,
          customerName: order.customerName,
          customerEmail: customer?.email ?? null,
          customerPhone: customer?.phone ?? null,
          status: order.status,
          total,
          createdAt: order.createdAt,
        }
      )

      await connection.query('DELETE FROM order_items WHERE order_id = :orderId', { orderId: order.id })
      for (const item of items) {
        await connection.query(
          `INSERT INTO order_items (id, order_id, product_id, name, qty, price)
           VALUES (:id, :orderId, :productId, :name, :qty, :price)`,
          item
        )
      }
    }

    for (const customer of customers) {
      await connection.query(
        `UPDATE customers c
         SET
           total_orders = (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id),
           spent = COALESCE((SELECT SUM(total) FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered'), 0)
         WHERE c.id = :id`,
        { id: customer.id }
      )
    }

    console.log(`Seeded ${customers.length} customers and ${orders.length} orders.`)
  } finally {
    connection.release()
    await pool.end()
  }
}

seed().catch((err) => {
  console.error('Orders/customers seed failed:', err.message)
  process.exit(1)
})
