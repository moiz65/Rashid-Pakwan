import pool from '../config/database.js'
import { sanitizeUser } from '../utils/response.js'
import { findUserBranchIds } from './catalog.model.js'

export async function findUserByEmail(email) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = :email LIMIT 1',
    { email: email.toLowerCase() }
  )
  return rows[0] ?? null
}

export async function findUserById(id) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE id = :id LIMIT 1',
    { id }
  )
  return rows[0] ?? null
}

export async function updateLastLogin(userId) {
  await pool.query(
    'UPDATE users SET last_login = NOW() WHERE id = :id',
    { id: userId }
  )
}

export function toPublicUser(user, rbac = null) {
  return sanitizeUser(user, rbac, { branchIds: user?.branchIds || [] })
}

export async function loadUserBranchIds(userId) {
  return findUserBranchIds(userId)
}
