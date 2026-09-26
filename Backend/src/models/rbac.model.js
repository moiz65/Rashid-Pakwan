import pool from '../config/database.js'

export function mapPermission(row) {
  if (!row) return null
  return {
    id: row.id,
    module: row.module,
    action: row.action,
    key: row.perm_key,
    label: row.label,
    sortOrder: Number(row.sort_order ?? 0),
  }
}

export function mapRole(row, permissionKeys = []) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? '',
    isSystem: Boolean(row.is_system),
    permissions: permissionKeys,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function findAllPermissions() {
  const [rows] = await pool.query(
    'SELECT * FROM permissions ORDER BY sort_order ASC, module ASC, action ASC'
  )
  return rows.map(mapPermission)
}

export async function findPermissionIdsByKeys(keys) {
  if (!keys?.length) return []
  const [rows] = await pool.query(
    'SELECT id, perm_key FROM permissions WHERE perm_key IN (:keys)',
    { keys }
  )
  return rows
}

export async function findPermissionKeysForRole(roleId) {
  if (!roleId) return []
  const [rows] = await pool.query(
    `SELECT p.perm_key
     FROM role_permissions rp
     JOIN permissions p ON p.id = rp.permission_id
     WHERE rp.role_id = :roleId
     ORDER BY p.sort_order ASC`,
    { roleId }
  )
  return rows.map((r) => r.perm_key)
}

async function attachRolePermissions(roles) {
  if (!roles.length) return []
  const ids = roles.map((r) => r.id)
  const [rows] = await pool.query(
    `SELECT rp.role_id, p.perm_key
     FROM role_permissions rp
     JOIN permissions p ON p.id = rp.permission_id
     WHERE rp.role_id IN (:ids)
     ORDER BY p.sort_order ASC`,
    { ids }
  )
  const byRole = new Map()
  for (const row of rows) {
    if (!byRole.has(row.role_id)) byRole.set(row.role_id, [])
    byRole.get(row.role_id).push(row.perm_key)
  }
  return roles.map((row) => mapRole(row, byRole.get(row.id) || []))
}

export async function findAllRoles() {
  const [rows] = await pool.query('SELECT * FROM roles ORDER BY is_system DESC, name ASC')
  return attachRolePermissions(rows)
}

export async function findRoleById(id) {
  const [rows] = await pool.query('SELECT * FROM roles WHERE id = :id LIMIT 1', { id })
  if (!rows[0]) return null
  const keys = await findPermissionKeysForRole(id)
  return mapRole(rows[0], keys)
}

export async function findRoleBySlug(slug) {
  const [rows] = await pool.query('SELECT * FROM roles WHERE slug = :slug LIMIT 1', { slug })
  if (!rows[0]) return null
  const keys = await findPermissionKeysForRole(rows[0].id)
  return mapRole(rows[0], keys)
}

export async function insertRole(data, permissionKeys = []) {
  await pool.query(
    `INSERT INTO roles (id, name, slug, description, is_system)
     VALUES (:id, :name, :slug, :description, :isSystem)`,
    data
  )
  await setRolePermissions(data.id, permissionKeys)
  return findRoleById(data.id)
}

export async function updateRoleRecord(id, data, permissionKeys) {
  await pool.query(
    `UPDATE roles
     SET name = :name, slug = :slug, description = :description
     WHERE id = :id`,
    { id, ...data }
  )
  if (permissionKeys !== undefined) {
    await setRolePermissions(id, permissionKeys)
  }
  return findRoleById(id)
}

export async function setRolePermissions(roleId, permissionKeys) {
  await pool.query('DELETE FROM role_permissions WHERE role_id = :roleId', { roleId })
  const keys = Array.isArray(permissionKeys) ? permissionKeys.filter(Boolean) : []
  if (!keys.length) return
  const perms = await findPermissionIdsByKeys(keys)
  for (const perm of perms) {
    await pool.query(
      'INSERT INTO role_permissions (role_id, permission_id) VALUES (:roleId, :permissionId)',
      { roleId, permissionId: perm.id }
    )
  }
}

export async function deleteRoleRecord(id) {
  const [result] = await pool.query('DELETE FROM roles WHERE id = :id AND is_system = 0', { id })
  return result.affectedRows > 0
}

export async function countUsersWithRole(roleId) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS cnt FROM users WHERE role_id = :roleId',
    { roleId }
  )
  return Number(rows[0]?.cnt ?? 0)
}

export async function upsertPermission(def) {
  await pool.query(
    `INSERT INTO permissions (id, module, action, perm_key, label, sort_order)
     VALUES (:id, :module, :action, :key, :label, :sortOrder)
     ON DUPLICATE KEY UPDATE
       module = VALUES(module),
       action = VALUES(action),
       label = VALUES(label),
       sort_order = VALUES(sort_order)`,
    {
      id: def.id,
      module: def.module,
      action: def.action,
      key: def.key,
      label: def.label,
      sortOrder: def.sortOrder ?? 0,
    }
  )
}
