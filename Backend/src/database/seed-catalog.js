import pool from '../config/database.js'

const daysFromNow = (d) => new Date(Date.now() + d * 24 * 60 * 60 * 1000)
const daysAgo = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000)
const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000)

const categories = [
  { id: 'cat_featured', name: 'Featured', slug: 'featured', sort_order: 0, is_visible: 1, image: '' },
  { id: 'cat_breakfast', name: 'Breakfast', slug: 'breakfast', sort_order: 1, is_visible: 1, image: '' },
  { id: 'cat_burgers', name: 'Burgers', slug: 'burgers', sort_order: 2, is_visible: 1, image: '' },
  { id: 'cat_deals', name: 'Deals', slug: 'deals', sort_order: 3, is_visible: 1, image: '' },
  { id: 'cat_pizza', name: 'Pizza', slug: 'pizza', sort_order: 4, is_visible: 1, image: '' },
  { id: 'cat_pasta', name: 'Pasta', slug: 'pasta', sort_order: 5, is_visible: 1, image: '' },
  { id: 'cat_beverages', name: 'Beverages', slug: 'beverages', sort_order: 6, is_visible: 1, image: '' },
  { id: 'cat_desserts', name: 'Desserts', slug: 'desserts', sort_order: 7, is_visible: 1, image: '' },
]

const brands = [
  { id: 'brand_1', name: 'House Signature', logo: '🍽️' },
  { id: 'brand_2', name: 'Chef Specials', logo: '👨‍🍳' },
  { id: 'brand_3', name: 'Italian Classics', logo: '🇮🇹' },
  { id: 'brand_4', name: 'Farm Fresh', logo: '🌿' },
  { id: 'brand_5', name: 'Weekend Brunch', logo: '🥞' },
]

const addons = [
  { id: 'addon_1', name: 'Extra Cheese', price: 150, image: '', status: 'active' },
  { id: 'addon_2', name: 'Double Meat', price: 250, image: '', status: 'active' },
  { id: 'addon_3', name: 'Add Fries', price: 200, image: '', status: 'active' },
  { id: 'addon_4', name: 'Extra Sauce', price: 50, image: '', status: 'active' },
  { id: 'addon_5', name: 'Soft Drink', price: 120, image: '', status: 'active' },
]

const products = [
  {
    id: 'prod_1',
    name: 'Zinger Burger',
    category_id: 'cat_burgers',
    brand_id: 'brand_1',
    price: 561,
    discounted_price: 499,
    stock: -1,
    status: 'active',
    image: '',
    description: 'Double patty · Spicy aioli',
    tag: 'Bestseller',
    rating: 4.9,
    is_featured: 1,
    sort_order: 1,
    sales: 145,
  },
  {
    id: 'prod_2',
    name: 'Singaporean Rice',
    category_id: 'cat_deals',
    brand_id: 'brand_2',
    price: 1429,
    discounted_price: 1299,
    stock: -1,
    status: 'active',
    image: '',
    description: 'Wood-fired · Truffle oil',
    tag: "Chef's pick",
    rating: 4.8,
    is_featured: 1,
    sort_order: 2,
    sales: 98,
  },
  {
    id: 'prod_3',
    name: 'Fettuccine Alfredo Pasta',
    category_id: 'cat_pasta',
    brand_id: 'brand_3',
    price: 1100,
    discounted_price: 899,
    stock: -1,
    status: 'active',
    image: '',
    description: 'Creamy alfredo · Parmesan',
    tag: '',
    rating: 4.7,
    is_featured: 1,
    sort_order: 3,
    sales: 112,
  },
  {
    id: 'prod_4',
    name: 'Grilled Chicken Sandwich',
    category_id: 'cat_burgers',
    brand_id: 'brand_1',
    price: 875,
    discounted_price: 799,
    stock: -1,
    status: 'active',
    image: '',
    description: 'Triple stack · Lime crema',
    tag: 'New',
    rating: 4.8,
    is_featured: 1,
    sort_order: 4,
    sales: 87,
  },
  {
    id: 'prod_5',
    name: 'Classic Eggs Benedict',
    category_id: 'cat_breakfast',
    brand_id: 'brand_5',
    price: 650,
    discounted_price: 599,
    stock: -1,
    status: 'active',
    image: '',
    description: 'Poached eggs · Hollandaise',
    tag: 'Morning',
    rating: 4.6,
    is_featured: 0,
    sort_order: 1,
    sales: 54,
  },
  {
    id: 'prod_6',
    name: 'Fluffy Pancake Stack',
    category_id: 'cat_breakfast',
    brand_id: 'brand_5',
    price: 550,
    discounted_price: null,
    stock: -1,
    status: 'active',
    image: '',
    description: 'Maple syrup · Fresh berries',
    tag: '',
    rating: 4.7,
    is_featured: 0,
    sort_order: 2,
    sales: 61,
  },
  {
    id: 'prod_7',
    name: 'Beef Smash Burger',
    category_id: 'cat_burgers',
    brand_id: 'brand_1',
    price: 720,
    discounted_price: 649,
    stock: -1,
    status: 'active',
    image: '',
    description: 'Double smash · Cheddar',
    tag: 'Hot',
    rating: 4.9,
    is_featured: 0,
    sort_order: 2,
    sales: 130,
  },
  {
    id: 'prod_8',
    name: 'Family Feast Deal',
    category_id: 'cat_deals',
    brand_id: 'brand_2',
    price: 2499,
    discounted_price: 1999,
    stock: -1,
    status: 'active',
    image: '',
    description: '2 burgers + fries + 2 drinks',
    tag: 'Value',
    rating: 4.8,
    is_featured: 0,
    sort_order: 1,
    sales: 76,
  },
  {
    id: 'prod_9',
    name: 'Margherita Pizza',
    category_id: 'cat_pizza',
    brand_id: 'brand_3',
    price: 1499,
    discounted_price: 1299,
    stock: -1,
    status: 'active',
    image: '',
    description: 'Fresh mozzarella · Basil',
    tag: '',
    rating: 4.7,
    is_featured: 0,
    sort_order: 1,
    sales: 145,
  },
  {
    id: 'prod_10',
    name: 'Fresh Lemonade',
    category_id: 'cat_beverages',
    brand_id: 'brand_4',
    price: 299,
    discounted_price: null,
    stock: -1,
    status: 'active',
    image: '',
    description: 'Freshly squeezed lemon',
    tag: '',
    rating: 4.5,
    is_featured: 0,
    sort_order: 1,
    sales: 203,
  },
  {
    id: 'prod_11',
    name: 'Tiramisu',
    category_id: 'cat_desserts',
    brand_id: 'brand_3',
    price: 499,
    discounted_price: null,
    stock: -1,
    status: 'active',
    image: '',
    description: 'Classic Italian dessert',
    tag: '',
    rating: 4.8,
    is_featured: 0,
    sort_order: 1,
    sales: 76,
  },
]

const productAddons = [
  { product_id: 'prod_1', addon_id: 'addon_1' },
  { product_id: 'prod_1', addon_id: 'addon_2' },
  { product_id: 'prod_1', addon_id: 'addon_3' },
  { product_id: 'prod_1', addon_id: 'addon_4' },
  { product_id: 'prod_4', addon_id: 'addon_1' },
  { product_id: 'prod_4', addon_id: 'addon_3' },
  { product_id: 'prod_7', addon_id: 'addon_1' },
  { product_id: 'prod_7', addon_id: 'addon_2' },
  { product_id: 'prod_7', addon_id: 'addon_5' },
  { product_id: 'prod_8', addon_id: 'addon_5' },
  { product_id: 'prod_9', addon_id: 'addon_1' },
]

const reviews = [
  { id: 'rev_1', product_id: 'prod_1', customer_name: 'Alice Johnson', rating: 5, comment: 'Best burger in town!', status: 'approved', created_at: daysAgo(2) },
  { id: 'rev_2', product_id: 'prod_7', customer_name: 'Bob Smith', rating: 4, comment: 'Smash burger hits hard.', status: 'approved', created_at: daysAgo(3) },
  { id: 'rev_4', product_id: 'prod_11', customer_name: 'David Brown', rating: 3, comment: 'Good but a bit sweet.', status: 'pending', created_at: daysAgo(1) },
]

const coupons = [
  { id: 'coup_1', code: 'WELCOME10', type: 'percentage', value: 10, min_order: 20, max_uses: 100, used_count: 45, expiry: daysFromNow(30), active: 1 },
  { id: 'coup_2', code: 'FLAT5', type: 'fixed', value: 5, min_order: 15, max_uses: 200, used_count: 89, expiry: daysFromNow(15), active: 1 },
]

const discounts = [
  { id: 'disc_1', name: 'Happy Hour', type: 'percentage', value: 15, category: 'Beverages', active: 1, start_date: daysAgo(30), end_date: daysFromNow(60) },
  { id: 'disc_2', name: 'Weekend Special', type: 'percentage', value: 20, category: 'All', active: 1, start_date: daysAgo(7), end_date: daysFromNow(30) },
]

const offers = [
  { id: 'offer_1', title: 'Buy 1 Get 1 Pizza', type: 'bogo', conditions: 'Buy any large pizza, get one free', active: 1, start_date: daysAgo(7), end_date: daysFromNow(21) },
  { id: 'offer_2', title: 'Family Feast Bundle', type: 'bundle', conditions: '2 pizzas + 2 sides + 4 drinks for Rs 4,999', active: 1, start_date: daysAgo(14), end_date: daysFromNow(45) },
]

const paymentGateways = [
  { id: 'pay_1', name: 'Stripe', description: 'Credit/debit card payments', enabled: 1, icon: '💳' },
  { id: 'pay_2', name: 'PayPal', description: 'PayPal checkout', enabled: 1, icon: '🅿️' },
  { id: 'pay_3', name: 'Cash on Delivery', description: 'Pay when order arrives', enabled: 1, icon: '💵' },
]

const shippingMethods = [
  { id: 'ship_1', name: 'Standard Delivery', description: '30-45 min delivery', price: 4.99, estimated_time: '30-45 min', enabled: 1 },
  { id: 'ship_2', name: 'Express Delivery', description: '15-20 min delivery', price: 8.99, estimated_time: '15-20 min', enabled: 1 },
  { id: 'ship_3', name: 'Pickup', description: 'Customer picks up at restaurant', price: 0, estimated_time: '15 min', enabled: 1 },
]

const carts = [
  {
    id: 'cart_1',
    customer_id: null,
    customer_name: 'David Brown',
    email: 'david@email.com',
    items: JSON.stringify([{ productId: 'prod_1', name: 'Zinger Burger', qty: 1, price: 499 }]),
    value: 499,
    abandoned_at: hoursAgo(2),
    recovered: 0,
  },
  {
    id: 'cart_2',
    customer_id: null,
    customer_name: 'Henry Wilson',
    email: 'henry@email.com',
    items: JSON.stringify([
      { productId: 'prod_8', name: 'Family Feast Deal', qty: 1, price: 1999 },
      { productId: 'prod_10', name: 'Fresh Lemonade', qty: 1, price: 299 },
    ]),
    value: 2298,
    abandoned_at: hoursAgo(5),
    recovered: 0,
  },
]

async function upsert(connection, sql, params) {
  await connection.query(sql, params)
}

async function seed() {
  const connection = await pool.getConnection()
  try {
    // Reset catalog menu tables so slug/id changes apply cleanly
    await connection.query('DELETE FROM product_addons')
    await connection.query('DELETE FROM reviews')
    await connection.query('DELETE FROM products')
    await connection.query('DELETE FROM addons')
    await connection.query('DELETE FROM categories')
    await connection.query('DELETE FROM brands')

    for (const c of categories) {
      await upsert(
        connection,
        `INSERT INTO categories (id, name, slug, image, sort_order, is_visible)
         VALUES (:id, :name, :slug, :image, :sort_order, :is_visible)
         ON DUPLICATE KEY UPDATE name = VALUES(name), slug = VALUES(slug),
           sort_order = VALUES(sort_order), is_visible = VALUES(is_visible)`,
        c
      )
    }
    for (const b of brands) {
      await upsert(
        connection,
        `INSERT INTO brands (id, name, logo) VALUES (:id, :name, :logo)
         ON DUPLICATE KEY UPDATE name = VALUES(name), logo = VALUES(logo)`,
        b
      )
    }
    for (const a of addons) {
      await upsert(
        connection,
        `INSERT INTO addons (id, name, price, image, status) VALUES (:id, :name, :price, :image, :status)
         ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price), image = VALUES(image), status = VALUES(status)`,
        a
      )
    }
    for (const p of products) {
      await upsert(
        connection,
        `INSERT INTO products (
           id, name, category_id, brand_id, price, discounted_price, stock, status,
           image, description, tag, rating, is_featured, sort_order, sales
         ) VALUES (
           :id, :name, :category_id, :brand_id, :price, :discounted_price, :stock, :status,
           :image, :description, :tag, :rating, :is_featured, :sort_order, :sales
         )
         ON DUPLICATE KEY UPDATE
           name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price),
           discounted_price = VALUES(discounted_price), stock = VALUES(stock), status = VALUES(status),
           description = VALUES(description), tag = VALUES(tag), rating = VALUES(rating),
           is_featured = VALUES(is_featured), sort_order = VALUES(sort_order)`,
        p
      )
    }
    await connection.query('DELETE FROM product_addons')
    for (const pa of productAddons) {
      await upsert(
        connection,
        `INSERT INTO product_addons (product_id, addon_id) VALUES (:product_id, :addon_id)
         ON DUPLICATE KEY UPDATE product_id = VALUES(product_id)`,
        pa
      )
    }
    for (const r of reviews) {
      await upsert(
        connection,
        `INSERT INTO reviews (id, product_id, customer_name, rating, comment, status, created_at)
         VALUES (:id, :product_id, :customer_name, :rating, :comment, :status, :created_at)
         ON DUPLICATE KEY UPDATE comment = VALUES(comment), status = VALUES(status)`,
        r
      )
    }
    for (const c of coupons) {
      await upsert(
        connection,
        `INSERT INTO coupons (id, code, type, value, min_order, max_uses, used_count, expiry, active)
         VALUES (:id, :code, :type, :value, :min_order, :max_uses, :used_count, :expiry, :active)
         ON DUPLICATE KEY UPDATE value = VALUES(value), active = VALUES(active)`,
        c
      )
    }
    for (const d of discounts) {
      await upsert(
        connection,
        `INSERT INTO discounts (id, name, type, value, category, active, start_date, end_date)
         VALUES (:id, :name, :type, :value, :category, :active, :start_date, :end_date)
         ON DUPLICATE KEY UPDATE value = VALUES(value), active = VALUES(active)`,
        d
      )
    }
    for (const o of offers) {
      await upsert(
        connection,
        `INSERT INTO offers (id, title, type, conditions, active, start_date, end_date)
         VALUES (:id, :title, :type, :conditions, :active, :start_date, :end_date)
         ON DUPLICATE KEY UPDATE title = VALUES(title), active = VALUES(active)`,
        o
      )
    }
    for (const p of paymentGateways) {
      await upsert(
        connection,
        `INSERT INTO payment_gateways (id, name, description, icon, enabled)
         VALUES (:id, :name, :description, :icon, :enabled)
         ON DUPLICATE KEY UPDATE enabled = VALUES(enabled)`,
        p
      )
    }
    for (const s of shippingMethods) {
      await upsert(
        connection,
        `INSERT INTO shipping_methods (id, name, description, price, estimated_time, enabled)
         VALUES (:id, :name, :description, :price, :estimated_time, :enabled)
         ON DUPLICATE KEY UPDATE price = VALUES(price), enabled = VALUES(enabled)`,
        s
      )
    }
    for (const c of carts) {
      await upsert(
        connection,
        `INSERT INTO abandoned_carts (id, customer_id, customer_name, email, items, value, abandoned_at, recovered)
         VALUES (:id, :customer_id, :customer_name, :email, :items, :value, :abandoned_at, :recovered)
         ON DUPLICATE KEY UPDATE value = VALUES(value), recovered = VALUES(recovered)`,
        c
      )
    }
    console.log('Catalog seed completed.')
  } finally {
    connection.release()
    await pool.end()
  }
}

seed().catch((err) => {
  console.error('Catalog seed failed:', err.message)
  process.exit(1)
})
