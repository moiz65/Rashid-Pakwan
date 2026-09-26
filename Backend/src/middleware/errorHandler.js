import { ApiError, sendError } from '../utils/response.js'

export function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    return sendError(res, err.statusCode, err.message)
  }

  if (err?.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, 400, 'Image must be 5MB or smaller')
  }

  if (err?.statusCode) {
    return sendError(res, err.statusCode, err.message || 'Request failed')
  }

  console.error(err)
  return sendError(res, 500, 'Internal server error')
}

export function notFoundHandler(_req, res) {
  sendError(res, 404, 'Route not found')
}
