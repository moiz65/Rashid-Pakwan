export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode
  }
}

export function sendSuccess(res, data, statusCode = 200) {
  res.status(statusCode).json({ success: true, data })
}

export function sendError(res, statusCode, message) {
  res.status(statusCode).json({ success: false, message })
}

export function sanitizeUser(user, rbac = null, extra = {}) {
  if (!user) return null
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: rbac?.roleSlug || user.role,
    roleId: rbac?.roleId || user.role_id || null,
    roleName: rbac?.roleName || null,
    permissions: rbac?.permissions || [],
    branchIds: extra.branchIds || user.branchIds || [],
    status: user.status,
    lastLogin: user.last_login ?? user.lastLogin ?? null,
  }
}
