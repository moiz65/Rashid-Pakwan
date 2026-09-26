import express from 'express'
import cors from 'cors'
import config from './config/index.js'
import routes from './routes/index.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { UPLOADS_DIR } from './middleware/upload.js'

const app = express()

const corsOptions = {
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  optionsSuccessStatus: 204,
}

app.use(cors(corsOptions))
// Express 5: named wildcard required for OPTIONS preflight
app.options('/{*splat}', cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/uploads', express.static(UPLOADS_DIR))
app.use('/api', routes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app

