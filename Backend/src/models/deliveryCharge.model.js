import pool from '../config/database.js'

const DEFAULT_ID = 'dcs_default'

export function mapDeliveryChargeSettings(row) {
  if (!row) return null
  return {
    id: row.id,
    fuelSurchargeFixed: Number(row.fuel_surcharge_fixed ?? 0),
    fuelSurchargePercent: Number(row.fuel_surcharge_percent ?? 0),
    freeDeliveryMinOrder:
      row.free_delivery_min_order == null || row.free_delivery_min_order === ''
        ? null
        : Number(row.free_delivery_min_order),
    enabled: row.enabled !== 0 && row.enabled !== false,
    notes: row.notes ?? '',
    updatedAt: row.updated_at,
  }
}

export async function findDeliveryChargeSettings() {
  const [rows] = await pool.query(
    'SELECT * FROM delivery_charge_settings ORDER BY updated_at DESC LIMIT 1'
  )
  if (rows[0]) return mapDeliveryChargeSettings(rows[0])
  return mapDeliveryChargeSettings({
    id: DEFAULT_ID,
    fuel_surcharge_fixed: 0,
    fuel_surcharge_percent: 0,
    free_delivery_min_order: null,
    enabled: 1,
    notes: '',
  })
}

export async function upsertDeliveryChargeSettings(data) {
  const existing = await findDeliveryChargeSettings()
  const id = existing?.id || DEFAULT_ID
  await pool.query(
    `INSERT INTO delivery_charge_settings (
       id, fuel_surcharge_fixed, fuel_surcharge_percent, free_delivery_min_order, enabled, notes
     ) VALUES (
       :id, :fuelSurchargeFixed, :fuelSurchargePercent, :freeDeliveryMinOrder, :enabled, :notes
     )
     ON DUPLICATE KEY UPDATE
       fuel_surcharge_fixed = VALUES(fuel_surcharge_fixed),
       fuel_surcharge_percent = VALUES(fuel_surcharge_percent),
       free_delivery_min_order = VALUES(free_delivery_min_order),
       enabled = VALUES(enabled),
       notes = VALUES(notes)`,
    {
      id,
      fuelSurchargeFixed: Number(data.fuelSurchargeFixed ?? 0),
      fuelSurchargePercent: Number(data.fuelSurchargePercent ?? 0),
      freeDeliveryMinOrder:
        data.freeDeliveryMinOrder == null || data.freeDeliveryMinOrder === ''
          ? null
          : Number(data.freeDeliveryMinOrder),
      enabled: data.enabled === false ? 0 : 1,
      notes: data.notes ?? '',
    }
  )
  return findDeliveryChargeSettings()
}
