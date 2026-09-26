import jwt from 'jsonwebtoken'
import config from '../config/index.js'

export function signAccessToken(payload) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  })
}

export function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.secret)
}
