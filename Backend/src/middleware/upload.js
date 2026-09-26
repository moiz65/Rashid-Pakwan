import fs from 'fs'
import path from 'path'
import multer from 'multer'
import { fileURLToPath } from 'url'
import { ApiError } from '../utils/response.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const UPLOADS_DIR = path.join(__dirname, '../../uploads')

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

function fileFilter(_req, file, cb) {
  if (!file.mimetype?.startsWith('image/')) {
    cb(new ApiError(400, 'Only image files are allowed'))
    return
  }
  cb(null, true)
}

/** Memory storage — files are uploaded to Cloudinary from the buffer. */
export const uploadImage = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('image')

/** Local disk fallback when Cloudinary is not configured. */
export function saveBufferLocally(buffer, ext = '.jpg') {
  const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)
    ? ext
    : '.jpg'
  const filename = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${safeExt}`
  const filepath = path.join(UPLOADS_DIR, filename)
  fs.writeFileSync(filepath, buffer)
  return `/uploads/${filename}`
}
