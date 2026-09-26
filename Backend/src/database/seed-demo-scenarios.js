/**
 * Idempotent demo records — one item per branch-scoping scenario for walkthroughs.
 * Safe to re-run: uses fixed demo_scn_* IDs and ON DUPLICATE KEY UPDATE.
 *
 * Usage: npm run db:seed:demo
 */
import pool from '../config/database.js'

const P = 'demo_scn_'
const daysFromNow = (d) => new Date(Date.now() + d * 24 * 60 * 60 * 1000)
const daysAgo = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000)

async function upsert(connection, sql, params) {
  await connection.query(sql, params)
}

async function resolveBranches(connection) {
  const [rows] = await connection.query(
    `SELECT id, name, code, is_primary AS isPrimary
     FROM branches
     WHERE status = 'active' OR status IS NULL
     ORDER BY is_primary DESC, created_at ASC`,
  )
  if (!rows.length) {
    throw new Error('No branches found. Run npm run db:seed first.')
  }
  const primary = rows.find((b) => b.isPrimary) || rows[0]
  const secondary = rows.find((b) => b.id !== primary.id) || primary
  return { primary, secondary, all: rows }
}

async function seed() {
  const connection = await pool.getConnection()
  try {
    const { primary: xyz, secondary: sss } = await resolveBranches(connection)
    console.log(`Demo branches: primary=${xyz.name} (${xyz.id}), secondary=${sss.name} (${sss.id})`)

    const categories = [
      { id: `${P}cat_all`, name: 'Demo — All Branches Category', slug: 'demo-all-cat', branch_id: null },
      { id: `${P}cat_xyz`, name: 'Demo — XYZ Category', slug: 'demo-xyz-cat', branch_id: xyz.id },
      { id: `${P}cat_sss`, name: 'Demo — SSS Category', slug: 'demo-sss-cat', branch_id: sss.id },
    ]

    for (const c of categories) {
      await upsert(
        connection,
        `INSERT INTO categories (id, name, slug, image, sort_order, is_visible, branch_id)
         VALUES (:id, :name, :slug, '', 90, 1, :branch_id)
         ON DUPLICATE KEY UPDATE name = VALUES(name), slug = VALUES(slug), branch_id = VALUES(branch_id)`,
        c,
      )
    }

    const brands = [
      { id: `${P}brand_all`, name: 'Demo Global Brand', logo: '🌍', branch_id: null },
      { id: `${P}brand_xyz`, name: 'Demo XYZ Brand', logo: '📍', branch_id: xyz.id },
    ]

    for (const b of brands) {
      await upsert(
        connection,
        `INSERT INTO brands (id, name, logo, branch_id)
         VALUES (:id, :name, :logo, :branch_id)
         ON DUPLICATE KEY UPDATE name = VALUES(name), logo = VALUES(logo), branch_id = VALUES(branch_id)`,
        b,
      )
    }

    const addons = [
      { id: `${P}addon_all`, name: 'Demo Extra Dip (All)', price: 99, branch_id: null },
      { id: `${P}addon_xyz`, name: 'Demo XYZ Cheese', price: 149, branch_id: xyz.id },
      { id: `${P}addon_sss`, name: 'Demo SSS Topping', price: 199, branch_id: sss.id },
    ]

    for (const a of addons) {
      await upsert(
        connection,
        `INSERT INTO addons (id, name, price, image, status, branch_id)
         VALUES (:id, :name, :price, '', 'active', :branch_id)
         ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price), branch_id = VALUES(branch_id)`,
        a,
      )
    }

    const drinks = [
      { id: `${P}drink_all`, name: 'Demo Water (All)', price: 79, branch_id: null },
      { id: `${P}drink_xyz`, name: 'Demo XYZ Cola', price: 149, branch_id: xyz.id },
      { id: `${P}drink_sss`, name: 'Demo SSS Juice', price: 179, branch_id: sss.id },
    ]

    for (const d of drinks) {
      await upsert(
        connection,
        `INSERT INTO drinks (id, name, description, price, stock, image, status, sort_order, branch_id)
         VALUES (:id, :name, :description, :price, -1, '', 'active', 90, :branch_id)
         ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price), branch_id = VALUES(branch_id)`,
        { ...d, description: 'Demo drink for branch walkthrough' },
      )
    }

    const products = [
      {
        id: `${P}prod_all`,
        name: 'Demo Global Fries (All)',
        category_id: `${P}cat_all`,
        brand_id: `${P}brand_all`,
        price: 299,
        branch_id: null,
      },
      {
        id: `${P}prod_xyz`,
        name: 'Demo XYZ Burger',
        category_id: `${P}cat_xyz`,
        brand_id: `${P}brand_xyz`,
        price: 599,
        branch_id: xyz.id,
      },
      {
        id: `${P}prod_sss`,
        name: 'Demo SSS Pizza',
        category_id: `${P}cat_sss`,
        brand_id: `${P}brand_all`,
        price: 1299,
        branch_id: sss.id,
      },
    ]

    for (const p of products) {
      await upsert(
        connection,
        `INSERT INTO products (
           id, name, category_id, brand_id, price, discounted_price, stock, status,
           image, description, tag, rating, is_featured, sort_order, sales, branch_id
         ) VALUES (
           :id, :name, :category_id, :brand_id, :price, NULL, -1, 'active',
           '', 'Demo product for branch walkthrough', 'Demo', 5, 0, 90, 0, :branch_id
         )
         ON DUPLICATE KEY UPDATE
           name = VALUES(name), category_id = VALUES(category_id), brand_id = VALUES(brand_id),
           price = VALUES(price), branch_id = VALUES(branch_id)`,
        p,
      )
    }

    await connection.query(
      `INSERT INTO product_addons (product_id, addon_id) VALUES (:product_id, :addon_id)
       ON DUPLICATE KEY UPDATE product_id = VALUES(product_id)`,
      { product_id: `${P}prod_xyz`, addon_id: `${P}addon_xyz` },
    )

    const coupons = [
      {
        id: `${P}coup_all`,
        code: 'DEMOALL10',
        type: 'percentage',
        value: 10,
        min_order: 100,
        branch_id: null,
      },
      {
        id: `${P}coup_xyz`,
        code: 'DEMOXYZ50',
        type: 'fixed',
        value: 50,
        min_order: 200,
        branch_id: xyz.id,
      },
    ]

    for (const c of coupons) {
      await upsert(
        connection,
        `INSERT INTO coupons (id, code, type, value, min_order, max_uses, used_count, expiry, active, branch_id)
         VALUES (:id, :code, :type, :value, :min_order, 500, 0, :expiry, 1, :branch_id)
         ON DUPLICATE KEY UPDATE code = VALUES(code), value = VALUES(value), branch_id = VALUES(branch_id)`,
        { ...c, expiry: daysFromNow(90) },
      )
    }

    const discounts = [
      {
        id: `${P}disc_all`,
        name: 'Demo All-Branches 15% Off',
        type: 'percentage',
        value: 15,
        category: 'All',
        branch_id: null,
      },
      {
        id: `${P}disc_xyz`,
        name: 'Demo XYZ 10% Off',
        type: 'percentage',
        value: 10,
        category: 'All',
        branch_id: xyz.id,
      },
    ]

    for (const d of discounts) {
      await upsert(
        connection,
        `INSERT INTO discounts (id, name, type, value, category, active, start_date, end_date, branch_id)
         VALUES (:id, :name, :type, :value, :category, 1, :start, :end, :branch_id)
         ON DUPLICATE KEY UPDATE name = VALUES(name), value = VALUES(value), branch_id = VALUES(branch_id)`,
        { ...d, start: daysAgo(7), end: daysFromNow(60) },
      )
    }

    const offers = [
      {
        id: `${P}offer_all`,
        title: 'Demo All-Branches Offer',
        description: '10% off demo menu items at every location',
        type: 'percentage',
        discount_value: 10,
        apply_scope: 'products',
        product_ids: JSON.stringify([`${P}prod_xyz`, `${P}prod_sss`, `${P}prod_all`]),
        branch_id: null,
      },
      {
        id: `${P}offer_xyz`,
        title: 'Demo XYZ-Only Offer',
        description: 'Fixed Rs 100 off XYZ demo burger',
        type: 'fixed',
        discount_value: 100,
        apply_scope: 'products',
        product_ids: JSON.stringify([`${P}prod_xyz`]),
        branch_id: xyz.id,
      },
    ]

    for (const o of offers) {
      await upsert(
        connection,
        `INSERT INTO offers (
           id, title, description, type, conditions, discount_value, min_order, max_discount,
           buy_qty, get_qty, apply_scope, category_id, product_ids, buy_product_ids, get_product_ids,
           free_product_id, tax_code_id, tax_mode, active, start_date, end_date, branch_id
         ) VALUES (
           :id, :title, :description, :type, '', :discount_value, 0, NULL,
           1, 1, :apply_scope, NULL, :product_ids, NULL, NULL,
           NULL, NULL, 'inclusive', 1, :start, :end, :branch_id
         )
         ON DUPLICATE KEY UPDATE title = VALUES(title), product_ids = VALUES(product_ids), branch_id = VALUES(branch_id)`,
        { ...o, start: daysAgo(3), end: daysFromNow(45) },
      )
    }

    const deals = [
      {
        id: `${P}deal_all`,
        title: 'Demo All-Branches Combo',
        description: 'Includes XYZ burger + SSS pizza — deal visible everywhere',
        badge_text: 'DEMO ALL',
        price: 1599,
        original_price: 1898,
        branch_id: null,
        items: [
          {
            id: `${P}deal_all_i1`,
            item_type: 'product',
            product_id: `${P}prod_xyz`,
            name: 'Demo XYZ Burger',
            qty: 1,
            unit_price: 599,
          },
          {
            id: `${P}deal_all_i2`,
            item_type: 'product',
            product_id: `${P}prod_sss`,
            name: 'Demo SSS Pizza',
            qty: 1,
            unit_price: 1299,
          },
        ],
      },
      {
        id: `${P}deal_xyz`,
        title: 'Demo XYZ Lunch Deal',
        description: 'Burger + cola at XYZ Kitchen only',
        badge_text: 'DEMO XYZ',
        price: 699,
        original_price: 748,
        branch_id: xyz.id,
        items: [
          {
            id: `${P}deal_xyz_i1`,
            item_type: 'product',
            product_id: `${P}prod_xyz`,
            name: 'Demo XYZ Burger',
            qty: 1,
            unit_price: 599,
          },
          {
            id: `${P}deal_xyz_i2`,
            item_type: 'drink',
            drink_id: `${P}drink_xyz`,
            name: 'Demo XYZ Cola',
            qty: 1,
            unit_price: 149,
          },
        ],
      },
    ]

    for (const deal of deals) {
      await upsert(
        connection,
        `INSERT INTO deals (
           id, title, description, badge_text, image, price, original_price,
           tax_code_id, tax_mode, start_at, end_at, days_of_week,
           daily_start_time, daily_end_time, show_countdown, active, sort_order,
           addon_mode, addon_ids, branch_id
         ) VALUES (
           :id, :title, :description, :badge_text, '', :price, :original_price,
           NULL, 'inclusive', :start_at, :end_at, :days_of_week,
           NULL, NULL, 1, 1, 95,
           'all', NULL, :branch_id
         )
         ON DUPLICATE KEY UPDATE
           title = VALUES(title), description = VALUES(description),
           price = VALUES(price), original_price = VALUES(original_price),
           branch_id = VALUES(branch_id)`,
        {
          id: deal.id,
          title: deal.title,
          description: deal.description,
          badge_text: deal.badge_text,
          price: deal.price,
          original_price: deal.original_price,
          branch_id: deal.branch_id,
          start_at: daysAgo(1),
          end_at: daysFromNow(90),
          days_of_week: JSON.stringify([0, 1, 2, 3, 4, 5, 6]),
        },
      )

      await connection.query('DELETE FROM deal_items WHERE deal_id = :dealId', { dealId: deal.id })
      for (let i = 0; i < deal.items.length; i++) {
        const item = deal.items[i]
        await upsert(
          connection,
          `INSERT INTO deal_items (
             id, deal_id, item_type, product_id, drink_id, addon_id,
             name, qty, unit_price, customer_choice, choice_ids, sort_order
           ) VALUES (
             :id, :deal_id, :item_type, :product_id, :drink_id, NULL,
             :name, :qty, :unit_price, 0, NULL, :sort_order
           )`,
          {
            id: item.id,
            deal_id: deal.id,
            item_type: item.item_type,
            product_id: item.product_id || null,
            drink_id: item.drink_id || null,
            name: item.name,
            qty: item.qty,
            unit_price: item.unit_price,
            sort_order: i,
          },
        )
      }
    }

    console.log('\nDemo scenario seed completed. Look for names starting with "Demo".')
    console.log('Branches used:')
    console.log(`  • ${xyz.name} — XYZ-only + primary items`)
    console.log(`  • ${sss.name} — secondary-branch-only items`)
    console.log('  • NULL branch_id — all-branches items')
    console.log('\nCoupon codes: DEMOALL10 (all), DEMOXYZ50 (XYZ only)')
  } finally {
    connection.release()
    await pool.end()
  }
}

seed().catch((err) => {
  console.error('Demo scenario seed failed:', err.message)
  process.exit(1)
})
