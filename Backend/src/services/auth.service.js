import bcrypt from 'bcryptjs'
import { ApiError } from '../utils/response.js'
import { signAccessToken } from '../utils/jwt.js'
import {
  findUserByEmail,
  findUserById,
  updateLastLogin,
  toPublicUser,
  loadUserBranchIds,
} from '../models/user.model.js'
import { resolveUserPermissions } from './rbac.service.js'

export async function login(email, password) {
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required')
  }

  const user = await findUserByEmail(email.trim())
  if (!user) {
    throw new ApiError(401, 'Invalid email or password')
  }

  if (user.status !== 'active') {
    throw new ApiError(403, 'Account is inactive')
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    throw new ApiError(401, 'Invalid email or password')
  }

  await updateLastLogin(user.id)
  const refreshed = await findUserById(user.id)
  const branchIds = await loadUserBranchIds(refreshed.id)
  refreshed.branchIds = branchIds
  const rbac = await resolveUserPermissions(refreshed)

  const token = signAccessToken({
    sub: refreshed.id,
    email: refreshed.email,
    role: rbac.roleSlug || refreshed.role,
    roleId: rbac.roleId,
  })

  return {
    token,
    user: toPublicUser(refreshed, rbac),
  }
}

export async function getProfile(userId) {
  const user = await findUserById(userId)
  if (!user) {
    throw new ApiError(404, 'User not found')
  }
  user.branchIds = await loadUserBranchIds(userId)
  const rbac = await resolveUserPermissions(user)
  return toPublicUser(user, rbac)
}
