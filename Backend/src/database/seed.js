import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import pool from '../config/database.js'

const demoUsers = [
  { name: 'Admin User', email: 'admin@restaurant.com', password: 'admin123', role: 'admin' },
  { name: 'Sarah Manager', email: 'sarah@restaurant.com', password: 'manager123', role: 'manager' },
  { name: 'Mike Staff', email: 'mike@restaurant.com', password: 'staff123', role: 'staff' },
  { name: 'Lisa Staff', email: 'lisa@restaurant.com', password: 'staff123', role: 'staff' },
  { name: 'Tom Manager', email: 'tom@restaurant.com', password: 'manager123', role: 'manager', status: 'inactive' },
]

const XYZ_BRANCH = {
  id: 'br_xyz_karachi',
  name: 'XYZ Kitchen',
  code: 'XYZ',
  city: 'Karachi',
  address: '12 Saddar Bazaar, Karachi',
  phone: '+92 21 111 2000',
  manager: 'Ahmed Khan',
  hours: '11:00 AM – 11:00 PM',
  status: 'active',
  isPrimary: 1,
}

const branchManager = {
  name: 'Branch Manager XYZ',
  email: 'branch.xyz@restaurant.com',
  password: 'branch123',
  role: 'manager',
}

async function seed() {
  const connection = await pool.getConnection()
  try {
    for (const user of demoUsers) {
      const id = crypto.randomUUID()
      const passwordHash = await bcrypt.hash(user.password, 10)
      const status = user.status || 'active'

      await connection.query(
        `INSERT INTO users (id, name, email, password_hash, role, status)
         VALUES (:id, :name, :email, :passwordHash, :role, :status)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           password_hash = VALUES(password_hash),
           role = VALUES(role),
           status = VALUES(status)`,
        {
          id,
          name: user.name,
          email: user.email,
          passwordHash,
          role: user.role,
          status,
        }
      )
    }
    console.log(`Seeded ${demoUsers.length} users.`)

    await connection.query(
      `INSERT INTO branches (
         id, name, code, city, address, phone, manager, hours, status, is_primary
       ) VALUES (
         :id, :name, :code, :city, :address, :phone, :manager, :hours, :status, :isPrimary
       )
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         code = VALUES(code),
         city = VALUES(city),
         address = VALUES(address),
         phone = VALUES(phone),
         manager = VALUES(manager),
         hours = VALUES(hours),
         status = VALUES(status),
         is_primary = VALUES(is_primary)`,
      {
        id: XYZ_BRANCH.id,
        name: XYZ_BRANCH.name,
        code: XYZ_BRANCH.code,
        city: XYZ_BRANCH.city,
        address: XYZ_BRANCH.address,
        phone: XYZ_BRANCH.phone,
        manager: XYZ_BRANCH.manager,
        hours: XYZ_BRANCH.hours,
        status: XYZ_BRANCH.status,
        isPrimary: XYZ_BRANCH.isPrimary,
      }
    )
    console.log(`Seeded branch: ${XYZ_BRANCH.name} (${XYZ_BRANCH.code})`)

    const managerId = crypto.randomUUID()
    const managerHash = await bcrypt.hash(branchManager.password, 10)
    await connection.query(
      `INSERT INTO users (id, name, email, password_hash, role, status)
       VALUES (:id, :name, :email, :passwordHash, :role, 'active')
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         password_hash = VALUES(password_hash),
         role = VALUES(role),
         status = 'active'`,
      {
        id: managerId,
        name: branchManager.name,
        email: branchManager.email,
        passwordHash: managerHash,
        role: branchManager.role,
      }
    )

    const [managerRows] = await connection.query(
      'SELECT id FROM users WHERE email = :email LIMIT 1',
      { email: branchManager.email }
    )
    const resolvedManagerId = managerRows[0]?.id
    if (resolvedManagerId) {
      await connection.query(
        'DELETE FROM user_branches WHERE user_id = :userId',
        { userId: resolvedManagerId }
      )
      await connection.query(
        'INSERT INTO user_branches (user_id, branch_id) VALUES (:userId, :branchId)',
        { userId: resolvedManagerId, branchId: XYZ_BRANCH.id }
      )
      console.log(`Assigned ${branchManager.email} to ${XYZ_BRANCH.name}`)
    }
  } finally {
    connection.release()
    await pool.end()
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
