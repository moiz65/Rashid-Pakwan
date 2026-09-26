import { ApiError } from '../utils/response.js'
import { userHasPermission } from '../services/rbac.service.js'

export function requirePermission(...keys) {
  return (req, _res, next) => {
    if (req.authType === 'api_key') return next()

    const perms = req.user?.permissions || []
    const allowed = keys.some((key) => userHasPermission(perms, key))
    if (!allowed) {
      return next(new ApiError(403, 'You do not have permission for this action'))
    }
    return next()
  }
}

export function requireAnyPermission(...keys) {
  return requirePermission(...keys)
}
