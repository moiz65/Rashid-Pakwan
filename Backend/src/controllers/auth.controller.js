import * as authService from '../services/auth.service.js'
import { sendSuccess } from '../utils/response.js'

export async function login(req, res, next) {
  try {
    const { email, password } = req.body
    const result = await authService.login(email, password)
    sendSuccess(res, result)
  } catch (err) {
    next(err)
  }
}

export async function me(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.id)
    sendSuccess(res, { user })
  } catch (err) {
    next(err)
  }
}

export async function logout(_req, res) {
  sendSuccess(res, { message: 'Logged out successfully' })
}
