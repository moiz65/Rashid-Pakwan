import pool from '../config/database.js'

export function mapDeliveryArea(row) {
  if (!row) return null
  return {
    id: row.id,
    branchId: row.branch_id ?? null,
    name: row.name,
    slug: row.slug,
    charge: Number(row.charge ?? 0),
    sortOrder: Number(row.sort_order ?? 0),
    enabled: row.enabled !== 0 && row.enabled !== false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function countDeliveryAreas(branchId = null) {
  if (branchId) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS c FROM delivery_areas WHERE branch_id = :branchId',
      { branchId }
    )
    return Number(rows[0]?.c || 0)
  }
  const [rows] = await pool.query('SELECT COUNT(*) AS c FROM delivery_areas')
  return Number(rows[0]?.c || 0)
}

export async function findAllDeliveryAreas({
  enabledOnly = false,
  branchId = null,
} = {}) {
  const clauses = []
  const params = {}
  if (branchId) {
    clauses.push('branch_id = :branchId')
    params.branchId = branchId
  }
  if (enabledOnly) clauses.push('enabled = 1')
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
  const [rows] = await pool.query(
    `SELECT * FROM delivery_areas ${where} ORDER BY sort_order ASC, name ASC`,
    params
  )
  return rows.map(mapDeliveryArea)
}

export async function findDeliveryAreaById(id) {
  if (!id) return null
  const [rows] = await pool.query('SELECT * FROM delivery_areas WHERE id = :id LIMIT 1', { id })
  return mapDeliveryArea(rows[0])
}

export async function insertDeliveryAreas(areas) {
  if (!areas?.length) return
  const connection = await pool.getConnection()
  try {
    for (const area of areas) {
      await connection.query(
        `INSERT INTO delivery_areas (id, branch_id, name, slug, charge, sort_order, enabled)
         VALUES (:id, :branchId, :name, :slug, :charge, :sortOrder, :enabled)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           charge = VALUES(charge)`,
        {
          id: area.id,
          branchId: area.branchId ?? null,
          name: area.name,
          slug: area.slug,
          charge: Number(area.charge ?? 0),
          sortOrder: Number(area.sortOrder ?? 0),
          enabled: area.enabled === false ? 0 : 1,
        }
      )
    }
  } finally {
    connection.release()
  }
}

export async function updateDeliveryArea(id, data) {
  const existing = await findDeliveryAreaById(id)
  if (!existing) return null
  await pool.query(
    `UPDATE delivery_areas SET
       name = :name,
       charge = :charge,
       sort_order = :sortOrder,
       enabled = :enabled
     WHERE id = :id`,
    {
      id,
      name: data.name != null ? String(data.name).trim() : existing.name,
      charge: data.charge != null ? Number(data.charge) : existing.charge,
      sortOrder: data.sortOrder != null ? Number(data.sortOrder) : existing.sortOrder,
      enabled: data.enabled === false ? 0 : data.enabled === true ? 1 : existing.enabled ? 1 : 0,
    }
  )
  return findDeliveryAreaById(id)
}

export async function createDeliveryArea(data) {
  await pool.query(
    `INSERT INTO delivery_areas (id, branch_id, name, slug, charge, sort_order, enabled)
     VALUES (:id, :branchId, :name, :slug, :charge, :sortOrder, :enabled)`,
    {
      id: data.id,
      branchId: data.branchId ?? null,
      name: data.name,
      slug: data.slug,
      charge: Number(data.charge ?? 0),
      sortOrder: Number(data.sortOrder ?? 0),
      enabled: data.enabled === false ? 0 : 1,
    }
  )
  return findDeliveryAreaById(data.id)
}

export async function deleteDeliveryArea(id) {
  await pool.query('DELETE FROM delivery_areas WHERE id = :id', { id })
}
