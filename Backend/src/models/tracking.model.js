import pool from '../config/database.js'
import { DEFAULT_TRACKING_SETTINGS } from '../constants/trackingDefaults.js'

function parseStatusMessages(raw) {
  if (!raw) return DEFAULT_TRACKING_SETTINGS.statusMessages
  if (typeof raw === 'object') return raw
  try {
    return JSON.parse(raw)
  } catch {
    return DEFAULT_TRACKING_SETTINGS.statusMessages
  }
}

export function mapTrackingSettings(row) {
  if (!row) return { ...DEFAULT_TRACKING_SETTINGS }
  return {
    id: row.id,
    restaurantName: row.restaurant_name,
    phone: row.phone ?? '',
    supportEmail: row.support_email ?? '',
    address: row.address ?? '',
    logoUrl: row.logo_url ?? null,
    helpText: row.help_text ?? '',
    pollIntervalSeconds: row.poll_interval_seconds ?? 20,
    showRejectionReason: Boolean(row.show_rejection_reason),
    statusMessages: parseStatusMessages(row.status_messages),
    updatedAt: row.updated_at,
  }
}

export async function findTrackingSettings() {
  const [rows] = await pool.query(
    'SELECT * FROM tracking_settings ORDER BY updated_at DESC LIMIT 1'
  )
  return mapTrackingSettings(rows[0])
}

export async function updateTrackingSettingsRecord(payload) {
  const existing = await findTrackingSettings()
  const id = existing.id || DEFAULT_TRACKING_SETTINGS.id

  await pool.query(
    `INSERT INTO tracking_settings (
      id, restaurant_name, phone, support_email, address, logo_url,
      help_text, poll_interval_seconds, show_rejection_reason, status_messages
    ) VALUES (
      :id, :restaurantName, :phone, :supportEmail, :address, :logoUrl,
      :helpText, :pollIntervalSeconds, :showRejectionReason, :statusMessages
    )
    ON DUPLICATE KEY UPDATE
      restaurant_name = VALUES(restaurant_name),
      phone = VALUES(phone),
      support_email = VALUES(support_email),
      address = VALUES(address),
      logo_url = VALUES(logo_url),
      help_text = VALUES(help_text),
      poll_interval_seconds = VALUES(poll_interval_seconds),
      show_rejection_reason = VALUES(show_rejection_reason),
      status_messages = VALUES(status_messages)`,
    {
      id,
      restaurantName: payload.restaurantName,
      phone: payload.phone || null,
      supportEmail: payload.supportEmail || null,
      address: payload.address || null,
      logoUrl: payload.logoUrl || null,
      helpText: payload.helpText || null,
      pollIntervalSeconds: payload.pollIntervalSeconds ?? 20,
      showRejectionReason: payload.showRejectionReason ? 1 : 0,
      statusMessages: JSON.stringify(payload.statusMessages || DEFAULT_TRACKING_SETTINGS.statusMessages),
    }
  )

  return findTrackingSettings()
}
