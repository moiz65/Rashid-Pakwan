import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pool from '../config/database.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function migrate() {
  const schemaPath = path.join(__dirname, 'schema.sql')
  const sql = fs.readFileSync(schemaPath, 'utf8')
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)

  const connection = await pool.getConnection()
  try {
    for (const statement of statements) {
      await connection.query(statement)
    }

    const migrationsDir = path.join(__dirname, 'migrations')
    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort()
      for (const file of files) {
        const migrationSql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
        const migrationStatements = migrationSql
          .split(';')
          .map((s) => s.trim())
          .filter(Boolean)
        for (const statement of migrationStatements) {
          try {
            await connection.query(statement)
          } catch (err) {
            if (
              err.code === 'ER_DUP_FIELDNAME' ||
              err.code === 'ER_TABLE_EXISTS_ERROR' ||
              err.code === 'ER_DUP_KEYNAME' ||
              err.code === 'ER_FK_DUP_NAME' ||
              err.code === 'ER_DUP_ENTRY' ||
              err.code === 'ER_CANT_DROP_FIELD_OR_KEY' ||
              err.code === 'ER_BAD_FIELD_ERROR' ||
              err.errno === 121 ||
              err.errno === 1091 ||
              String(err.message || '').includes('Duplicate key') ||
              String(err.message || '').includes('check that it exists')
            ) {
              console.log(`Skipped (already applied): ${file} (${err.code || err.errno})`)
              continue
            }
            throw err
          }
        }
        console.log(`Applied migration: ${file}`)
      }
    }

    console.log('Database migration completed.')

    const { seedPermissionsAndRoles } = await import('../services/rbac.service.js')
    await seedPermissionsAndRoles()
    console.log('RBAC permissions and default roles seeded.')

    const { ensureKarachiAreasSeeded } = await import('../services/deliveryArea.service.js')
    const areaCount = await ensureKarachiAreasSeeded()
    console.log(`Delivery areas ready (${areaCount} Karachi areas).`)
  } finally {
    connection.release()
    await pool.end()
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
