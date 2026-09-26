import crypto from 'crypto'
import pool from '../config/database.js'
import { ApiError } from '../utils/response.js'
import {
  findAllCustomers,
  findCustomerById,
  findCustomerByEmail,
  insertCustomer,
  updateCustomerRecord,
  deleteCustomerRecord,
} from '../models/customer.model.js'

import { parseBranchId } from '../utils/branchQuery.js'

export async function listCustomers(query = {}) {
  return findAllCustomers({ branchId: parseBranchId(query) })
}

export async function getCustomer(id) {
  const customer = await findCustomerById(id)
  if (!customer) throw new ApiError(404, 'Customer not found')
  return customer
}

export async function createCustomer(payload) {
  const { name, email, phone } = payload
  if (!name?.trim() || !email?.trim()) {
    throw new ApiError(400, 'Name and email are required')
  }

  const existing = await findCustomerByEmail(email.trim())
  if (existing) throw new ApiError(409, 'Customer with this email already exists')

  const id = payload.id || crypto.randomUUID()
  const customer = {
    id,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || null,
    totalOrders: 0,
    spent: 0,
    joinedAt: new Date(),
    branchId: payload.branchId || null,
  }

  const connection = await pool.getConnection()
  try {
    await insertCustomer(connection, customer)
  } finally {
    connection.release()
  }

  return findCustomerById(id)
}

export async function updateCustomer(id, payload) {
  const existing = await findCustomerById(id)
  if (!existing) throw new ApiError(404, 'Customer not found')

  const email = payload.email?.trim().toLowerCase() || existing.email
  if (email !== existing.email) {
    const duplicate = await findCustomerByEmail(email)
    if (duplicate) throw new ApiError(409, 'Customer with this email already exists')
  }

  return updateCustomerRecord(id, {
    name: payload.name?.trim() || existing.name,
    email,
    phone: payload.phone?.trim() ?? existing.phone,
  })
}

export async function removeCustomer(id) {
  const existing = await findCustomerById(id)
  if (!existing) throw new ApiError(404, 'Customer not found')
  await deleteCustomerRecord(id)
  return { id }
}
