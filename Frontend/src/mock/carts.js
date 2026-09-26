const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString()

export const abandonedCarts = [
  { id: 'cart_1', customerId: 'cust_4', customerName: 'David Brown', email: 'david@email.com', items: [{ productId: 'prod_1', name: 'Margherita Pizza', qty: 1, price: 14.99 }], value: 14.99, abandonedAt: hoursAgo(2), recovered: false },
  { id: 'cart_2', customerId: 'cust_8', customerName: 'Henry Wilson', email: 'henry@email.com', items: [{ productId: 'prod_10', name: 'Ribeye Steak', qty: 1, price: 32.99 }, { productId: 'prod_35', name: 'House Red Wine', qty: 1, price: 9.99 }], value: 42.98, abandonedAt: hoursAgo(5), recovered: false },
  { id: 'cart_3', customerId: 'cust_13', customerName: 'Mia Garcia', email: 'mia@email.com', items: [{ productId: 'prod_6', name: 'Chicken Wings', qty: 2, price: 11.99 }], value: 23.98, abandonedAt: hoursAgo(8), recovered: false },
  { id: 'cart_4', customerId: 'cust_16', customerName: 'Paul Lewis', email: 'paul@email.com', items: [{ productId: 'prod_31', name: 'Beef Burger', qty: 2, price: 13.99 }, { productId: 'prod_8', name: 'Fresh Lemonade', qty: 2, price: 4.99 }], value: 37.96, abandonedAt: hoursAgo(12), recovered: false },
  { id: 'cart_5', customerId: 'cust_21', customerName: 'Uma Scott', email: 'uma@email.com', items: [{ productId: 'prod_5', name: 'Spaghetti Carbonara', qty: 1, price: 15.99 }], value: 15.99, abandonedAt: hoursAgo(18), recovered: false },
  { id: 'cart_6', customerId: 'cust_2', customerName: 'Bob Smith', email: 'bob@email.com', items: [{ productId: 'prod_2', name: 'Pepperoni Pizza', qty: 1, price: 16.99 }, { productId: 'prod_16', name: 'Garlic Bread', qty: 1, price: 5.99 }], value: 22.98, abandonedAt: hoursAgo(24), recovered: true },
  { id: 'cart_7', customerId: 'cust_6', customerName: 'Frank Miller', email: 'frank@email.com', items: [{ productId: 'prod_4', name: 'Grilled Salmon', qty: 1, price: 24.99 }], value: 24.99, abandonedAt: hoursAgo(30), recovered: false },
  { id: 'cart_8', customerId: 'cust_11', customerName: 'Karen Anderson', email: 'karen@email.com', items: [{ productId: 'prod_7', name: 'Tiramisu', qty: 3, price: 7.99 }], value: 23.97, abandonedAt: hoursAgo(36), recovered: false },
  { id: 'cart_9', customerId: 'cust_19', customerName: 'Sam Young', email: 'sam@email.com', items: [{ productId: 'prod_18', name: 'BBQ Chicken Pizza', qty: 1, price: 18.99 }, { productId: 'prod_3', name: 'Caesar Salad', qty: 1, price: 9.99 }], value: 28.98, abandonedAt: hoursAgo(48), recovered: false },
  { id: 'cart_10', customerId: 'cust_25', customerName: 'Yara Nelson', email: 'yara@email.com', items: [{ productId: 'prod_40', name: 'Chef Tasting Menu', qty: 1, price: 59.99 }], value: 59.99, abandonedAt: hoursAgo(72), recovered: false },
]
