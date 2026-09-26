import { Readable } from 'stream'
import { v2 as cloudinary } from 'cloudinary'
import config from '../config/index.js'
import { ApiError } from '../utils/response.js'

let configured = false

function ensureConfigured() {
  const { cloudName, apiKey, apiSecret } = config.cloudinary
  if (!cloudName || !apiKey || !apiSecret) {
    return false
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    })
    configured = true
  }
  return true
}

export function isCloudinaryConfigured() {
  const { cloudName, apiKey, apiSecret } = config.cloudinary
  return Boolean(cloudName && apiKey && apiSecret)
}

/**
 * Upload an image buffer to Cloudinary. Returns the secure HTTPS URL.
 */
export async function uploadImageBuffer(buffer, options = {}) {
  if (!ensureConfigured()) {
    throw new ApiError(503, 'Cloudinary is not configured on the server')
  }
  if (!buffer?.length) {
    throw new ApiError(400, 'Image data is empty')
  }

  const folder = options.folder || 'restaurant-admin/catalog'
  const publicId =
    options.publicId ||
    `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'image',
        overwrite: false,
        unique_filename: true,
      },
      (err, result) => {
        if (err) {
          reject(
            new ApiError(502, err.message || 'Cloudinary upload failed')
          )
          return
        }
        if (!result?.secure_url) {
          reject(new ApiError(502, 'Cloudinary returned no image URL'))
          return
        }
        resolve(result.secure_url)
      }
    )
    Readable.from(buffer).pipe(stream)
  })
}
