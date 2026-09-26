import { ApiError } from '../utils/response.js'
import { PERMISSION_DEFS, ALL_PERMISSION_KEYS } from '../constants/permissions.js'
import * as rbac from '../models/rbac.model.js'
import pool from '../config/database.js'

function newId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function slugify(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 60)
}

export async function seedPermissionsAndRoles() {
  for (const def of PERMISSION_DEFS) {
    await rbac.upsertPermission({
      id: `perm_${def.key.replace(/\./g, '_')}`,
      ...def,
    })
  }

  const { DEFAULT_ROLE_TEMPLATES } = await import('../constants/permissions.js')
  for (const template of DEFAULT_ROLE_TEMPLATES) {
    await pool.query(
      `INSERT INTO roles (id, name, slug, description, is_system)
       VALUES (:id, :name, :slug, :description, :isSystem)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         description = VALUES(description)`,
      {
        id: template.id,
        name: template.name,
        slug: template.slug,
        description: template.description,
        isSystem: template.isSystem ? 1 : 0,
      }
    )
    await rbac.setRolePermissions(template.id, template.permissions)
  }

  await pool.query(
    `UPDATE users SET role_id = 'role_admin' WHERE role = 'admin' AND (role_id IS NULL OR role_id = '')`
  )
  await pool.query(
    `UPDATE users SET role_id = 'role_manager' WHERE role = 'manager' AND (role_id IS NULL OR role_id = '')`
  )
  await pool.query(
    `UPDATE users SET role_id = 'role_staff' WHERE role = 'staff' AND (role_id IS NULL OR role_id = '')`
  )
}

export async function listPermissions() {
  return rbac.findAllPermissions()
}

export async function listRoles() {
  return rbac.findAllRoles()
}

export async function getRole(id) {
  const role = await rbac.findRoleById(id)
  if (!role) throw new ApiError(404, 'Role not found')
  return role
}

export async function createRole(body) {
  const name = String(body.name || '').trim()
  if (!name) throw new ApiError(400, 'Role name is required')

  let slug = body.slug ? slugify(body.slug) : slugify(name)
  if (!slug) slug = `role_${Date.now()}`

  const existing = await rbac.findRoleBySlug(slug)
  if (existing) throw new ApiError(409, 'A role with this slug already exists')

  const permissionKeys = normalizePermissionKeys(body.permissions)
  return rbac.insertRole(
    {
      id: body.id || newId('role'),
      name,
      slug,
      description: body.description ?? '',
      isSystem: 0,
    },
    permissionKeys
  )
}

export async function updateRole(id, body) {
  const existing = await rbac.findRoleById(id)
  if (!existing) throw new ApiError(404, 'Role not found')

  const name = String(body.name ?? existing.name).trim()
  if (!name) throw new ApiError(400, 'Role name is required')

  let slug = body.slug !== undefined ? slugify(body.slug) : existing.slug
  if (!slug) slug = existing.slug

  if (slug !== existing.slug) {
    const clash = await rbac.findRoleBySlug(slug)
    if (clash && clash.id !== id) throw new ApiError(409, 'A role with this slug already exists')
  }

  const permissionKeys =
    body.permissions !== undefined ? normalizePermissionKeys(body.permissions) : undefined

  return rbac.updateRoleRecord(
    id,
    {
      name,
      slug: existing.isSystem ? existing.slug : slug,
      description: body.description ?? existing.description,
    },
    permissionKeys
  )
}

export async function removeRole(id) {
  const existing = await rbac.findRoleById(id)
  if (!existing) throw new ApiError(404, 'Role not found')
  if (existing.isSystem) throw new ApiError(400, 'System roles cannot be deleted')

  const userCount = await rbac.countUsersWithRole(id)
  if (userCount > 0) {
    throw new ApiError(400, `Cannot delete role assigned to ${userCount} user(s)`)
  }

  if (!(await rbac.deleteRoleRecord(id))) {
    throw new ApiError(404, 'Role not found')
  }
  return { id }
}

export async function resolveUserPermissions(userRow) {
  if (!userRow) return { roleId: null, roleName: null, roleSlug: userRow?.role || null, permissions: [] }

  let roleId = userRow.role_id ?? null
  let role = roleId ? await rbac.findRoleById(roleId) : null

  if (!role && userRow.role) {
    role = await rbac.findRoleBySlug(userRow.role)
    roleId = role?.id ?? null
  }

  if (!role) {
    return {
      roleId: null,
      roleName: null,
      roleSlug: userRow.role || null,
      permissions: [],
    }
  }

  return {
    roleId: role.id,
    roleName: role.name,
    roleSlug: role.slug,
    permissions: role.permissions || [],
  }
}

export async function resolveRoleId(body, existingUser = null) {
  if (body.roleId) {
    const role = await rbac.findRoleById(body.roleId)
    if (!role) throw new ApiError(400, 'Invalid role')
    return { roleId: role.id, roleSlug: role.slug }
  }
  if (body.role) {
    const role = await rbac.findRoleBySlug(body.role)
    if (role) return { roleId: role.id, roleSlug: role.slug }
    if (['admin', 'manager', 'staff'].includes(body.role)) {
      const mapped = await rbac.findRoleBySlug(body.role)
      return { roleId: mapped?.id ?? null, roleSlug: body.role }
    }
  }
  if (existingUser?.role_id) {
    const role = await rbac.findRoleById(existingUser.role_id)
    return { roleId: existingUser.role_id, roleSlug: role?.slug ?? existingUser.role }
  }
  const staff = await rbac.findRoleBySlug('staff')
  return { roleId: staff?.id ?? null, roleSlug: 'staff' }
}

function normalizePermissionKeys(keys) {
  if (!Array.isArray(keys)) return []
  const set = new Set(keys.map(String).filter((k) => ALL_PERMISSION_KEYS.includes(k)))
  return [...set]
}

export function userHasPermission(permissions, key) {
  if (!key) return true
  const list = Array.isArray(permissions) ? permissions : []
  if (list.includes(key)) return true
  const [module] = String(key).split('.')
  if (module && list.includes(`${module}.manage`)) return true
  return false
}
