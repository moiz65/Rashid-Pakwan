import app from './app.js'
import config from './config/index.js'
import pool from './config/database.js'

const port = Number(process.env.PORT) || config.port
const host = process.env.HOST || '0.0.0.0'

function checkDatabaseConnection() {
  pool.query('SELECT 1')
    .then(() => {
      console.log('Database connected.')
    })
    .catch((err) => {
      console.error('Database connection failed:', err.message)
      console.error('Tip: check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME.')
    })
}

const server = app.listen(port, host, () => {
  console.log(`Server listening on ${host}:${port}`)
  checkDatabaseConnection()
})

server.on('error', (err) => {
  console.error(`Unable to bind server to ${host}:${port}:`, err.message)
  process.exitCode = 1
})

function shutdown(signal) {
  console.log(`${signal} received. Shutting down.`)
  server.close(() => {
    pool.end().finally(() => process.exit(0))
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
