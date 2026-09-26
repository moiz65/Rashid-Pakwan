import dotenv from 'dotenv'

dotenv.config()

const config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'Resturant_Ordering_Management',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  corsOrigin: (() => {
    const raw = process.env.CORS_ORIGIN || process.env.CORS_ORIGINS || 'http://localhost:5173, http://localhost:3000, http://localhost:8080, http://localhost:5174, https://restaurant-admin-panel-gilt.vercel.app, https://restaurant-admin-panel-1klw.vercel.app, https://rashid-pakwan-admin.vercel.app, https://rashid-pakwan.vercel.app'
    if (raw === '*') return true
    const list = raw.split(',')
      .map((s) => s.trim().replace(/\/$/, ''))
      .filter(Boolean)
    const isDev = (process.env.NODE_ENV || 'development') !== 'production'
    // Allow any localhost / 127.0.0.1 port in development (Vite may pick 5173, 5174, …)
    if (isDev) {
      return (origin, callback) => {
        if (!origin) return callback(null, true)
        const allowed =
          list.includes(origin) ||
          /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
        return callback(null, allowed ? origin : false)
      }
    }
    return list.length <= 1 ? list[0] : list
  })(),
  apiKey: process.env.API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiImageModel: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
}

export default config
