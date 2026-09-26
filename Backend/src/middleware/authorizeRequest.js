import config from '../config/index.js'
import { verifyAccessToken } from '../utils/jwt.js'
import { findUserById, loadUserBranchIds } from '../models/user.model.js'
import { resolveUserPermissions } from '../services/rbac.service.js'
import { ApiError } from '../utils/response.js'

export async function authorizeRequest(req, _res, next) {
  try {
    const apiKey = req.headers['x-api-key']
    if (config.apiKey && apiKey === config.apiKey) {
      req.authType = 'api_key'
      return next()
    }

    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication required')
    }

    const token = header.slice(7)
    let decoded
    try {
      decoded = verifyAccessToken(token)
    } catch {
      throw new ApiError(401, 'Invalid or expired token')
    }

    const user = await findUserById(decoded.sub)
    if (!user || user.status !== 'active') {
      throw new ApiError(401, 'Invalid or inactive user')
    }

    const rbac = await resolveUserPermissions(user)
    const branchIds = await loadUserBranchIds(user.id)

    req.user = {
      id: user.id,
      email: user.email,
      role: rbac.roleSlug || user.role,
      roleId: rbac.roleId,
      roleName: rbac.roleName,
      permissions: rbac.permissions,
      branchIds: branchIds || [],
    }
    req.authType = 'jwt'
    next()
  } catch (err) {
    next(err)
  }
}
