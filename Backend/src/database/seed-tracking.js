import pool from '../config/database.js'
import { DEFAULT_TRACKING_SETTINGS } from '../constants/trackingDefaults.js'

async function seed() {
  const connection = await pool.getConnection()
  try {
    const [rows] = await connection.query(
      'SELECT id FROM tracking_settings WHERE id = :id LIMIT 1',
      { id: DEFAULT_TRACKING_SETTINGS.id }
    )
    if (rows.length) {
      console.log('Tracking settings already seeded.')
      return
    }

    await connection.query(
      `INSERT INTO tracking_settings (
        id, restaurant_name, phone, support_email, address, logo_url,
        help_text, poll_interval_seconds, show_rejection_reason, status_messages
      ) VALUES (
        :id, :restaurantName, :phone, :supportEmail, :address, :logoUrl,
        :helpText, :pollIntervalSeconds, :showRejectionReason, :statusMessages
      )`,
      {
        id: DEFAULT_TRACKING_SETTINGS.id,
        restaurantName: DEFAULT_TRACKING_SETTINGS.restaurantName,
        phone: DEFAULT_TRACKING_SETTINGS.phone,
        supportEmail: DEFAULT_TRACKING_SETTINGS.supportEmail,
        address: DEFAULT_TRACKING_SETTINGS.address,
        logoUrl: DEFAULT_TRACKING_SETTINGS.logoUrl,
        helpText: DEFAULT_TRACKING_SETTINGS.helpText,
        pollIntervalSeconds: DEFAULT_TRACKING_SETTINGS.pollIntervalSeconds,
        showRejectionReason: DEFAULT_TRACKING_SETTINGS.showRejectionReason ? 1 : 0,
        statusMessages: JSON.stringify(DEFAULT_TRACKING_SETTINGS.statusMessages),
      }
    )
    console.log('Seeded default tracking settings.')
  } finally {
    connection.release()
    await pool.end()
  }
}

seed().catch((err) => {
  console.error('Tracking settings seed failed:', err.message)
  process.exit(1)
})
