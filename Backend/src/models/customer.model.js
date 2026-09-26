import pool from '../config/database.js'
import { mapCustomer } from '../utils/mappers.js'

export async function findAllCustomers({ branchId } = {}) {
  let sql = 'SELECT * FROM customers'
  const params = {}
  if (branchId) {
    sql += ' WHERE branch_id = :branchId'
    params.branchId = branchId
  }
  sql += ' ORDER BY joined_at DESC'
  const [rows] = await pool.query(sql, params)
  return rows.map(mapCustomer)
}

export async function findCustomerById(id) {
  const [rows] = await pool.query(
    'SELECT * FROM customers WHERE id = :id LIMIT 1',
    { id }
  )
  return mapCustomer(rows[0])
}

export async function findCustomerByEmail(email) {
  const [rows] = await pool.query(
    'SELECT * FROM customers WHERE email = :email LIMIT 1',
    { email: email.toLowerCase() }
  )
  return mapCustomer(rows[0])
}

export async function insertCustomer(connection, customer) {
  await connection.query(
    `INSERT INTO customers (id, name, email, phone, total_orders, spent, joined_at, branch_id)
     VALUES (:id, :name, :email, :phone, :totalOrders, :spent, :joinedAt, :branchId)`,
    customer
  )
  return findCustomerById(customer.id)
}

export async function updateCustomerRecord(id, data) {
  await pool.query(
    `UPDATE customers
     SET name = :name, email = :email, phone = :phone
     WHERE id = :id`,
    { id, ...data }
  )
  return findCustomerById(id)
}

export async function deleteCustomerRecord(id) {
  const [result] = await pool.query(
    'DELETE FROM customers WHERE id = :id',
    { id }
  )
  return result.affectedRows > 0
}

export async function refreshCustomerStats(connection, customerId) {
  await connection.query(
    `UPDATE customers c
     SET
       total_orders = (
         SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id
       ),
       spent = COALESCE((
         SELECT SUM(total) FROM orders o
         WHERE o.customer_id = c.id AND o.status = 'delivered'
       ), 0)
     WHERE c.id = :customerId`,
    { customerId }
  )
}
