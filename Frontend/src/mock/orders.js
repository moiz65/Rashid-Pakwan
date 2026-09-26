const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString()
const daysAgo = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString()

const orderItems = [
  [{ productId: 'prod_1', name: 'Margherita Pizza', qty: 2, price: 14.99 }],
  [{ productId: 'prod_6', name: 'Chicken Wings', qty: 1, price: 11.99 }, { productId: 'prod_8', name: 'Fresh Lemonade', qty: 2, price: 4.99 }],
  [{ productId: 'prod_4', name: 'Grilled Salmon', qty: 1, price: 24.99 }, { productId: 'prod_3', name: 'Caesar Salad', qty: 1, price: 9.99 }],
  [{ productId: 'prod_10', name: 'Ribeye Steak', qty: 2, price: 32.99 }],
  [{ productId: 'prod_5', name: 'Spaghetti Carbonara', qty: 3, price: 15.99 }],
  [{ productId: 'prod_31', name: 'Beef Burger', qty: 2, price: 13.99 }, { productId: 'prod_16', name: 'Garlic Bread', qty: 1, price: 5.99 }],
  [{ productId: 'prod_2', name: 'Pepperoni Pizza', qty: 1, price: 16.99 }],
  [{ productId: 'prod_7', name: 'Tiramisu', qty: 4, price: 7.99 }],
  [{ productId: 'prod_18', name: 'BBQ Chicken Pizza', qty: 2, price: 18.99 }],
  [{ productId: 'prod_14', name: 'Chocolate Lava Cake', qty: 2, price: 8.99 }],
]

const calcTotal = (items) => items.reduce((sum, i) => sum + i.qty * i.price, 0)

export const orders = [
  { id: 'ord_1', customerId: 'cust_1', customerName: 'Alice Johnson', items: orderItems[0], total: calcTotal(orderItems[0]), status: 'pending', createdAt: hoursAgo(1) },
  { id: 'ord_2', customerId: 'cust_2', customerName: 'Bob Smith', items: orderItems[1], total: calcTotal(orderItems[1]), status: 'confirmed', createdAt: hoursAgo(2) },
  { id: 'ord_3', customerId: 'cust_3', customerName: 'Carol Williams', items: orderItems[2], total: calcTotal(orderItems[2]), status: 'preparing', createdAt: hoursAgo(3) },
  { id: 'ord_4', customerId: 'cust_5', customerName: 'Emma Davis', items: orderItems[3], total: calcTotal(orderItems[3]), status: 'confirmed', createdAt: hoursAgo(4) },
  { id: 'ord_5', customerId: 'cust_7', customerName: 'Grace Lee', items: orderItems[4], total: calcTotal(orderItems[4]), status: 'pending', createdAt: hoursAgo(5) },
  { id: 'ord_6', customerId: 'cust_10', customerName: 'Jack Taylor', items: orderItems[5], total: calcTotal(orderItems[5]), status: 'preparing', createdAt: hoursAgo(6) },
  { id: 'ord_7', customerId: 'cust_12', customerName: 'Leo Thomas', items: orderItems[6], total: calcTotal(orderItems[6]), status: 'delivered', createdAt: daysAgo(1) },
  { id: 'ord_8', customerId: 'cust_14', customerName: 'Noah Rodriguez', items: orderItems[7], total: calcTotal(orderItems[7]), status: 'delivered', createdAt: daysAgo(1) },
  { id: 'ord_9', customerId: 'cust_15', customerName: 'Olivia Clark', items: orderItems[8], total: calcTotal(orderItems[8]), status: 'rejected', createdAt: daysAgo(2) },
  { id: 'ord_10', customerId: 'cust_18', customerName: 'Rachel Hall', items: orderItems[9], total: calcTotal(orderItems[9]), status: 'cancelled', createdAt: daysAgo(2) },
  { id: 'ord_11', customerId: 'cust_4', customerName: 'David Brown', items: orderItems[0], total: calcTotal(orderItems[0]), status: 'pending', createdAt: hoursAgo(8) },
  { id: 'ord_12', customerId: 'cust_6', customerName: 'Frank Miller', items: orderItems[1], total: calcTotal(orderItems[1]), status: 'confirmed', createdAt: daysAgo(3) },
  { id: 'ord_13', customerId: 'cust_8', customerName: 'Henry Wilson', items: orderItems[2], total: calcTotal(orderItems[2]), status: 'delivered', createdAt: daysAgo(3) },
  { id: 'ord_14', customerId: 'cust_9', customerName: 'Ivy Martinez', items: orderItems[3], total: calcTotal(orderItems[3]), status: 'rejected', createdAt: daysAgo(4) },
  { id: 'ord_15', customerId: 'cust_11', customerName: 'Karen Anderson', items: orderItems[4], total: calcTotal(orderItems[4]), status: 'delivered', createdAt: daysAgo(4) },
  { id: 'ord_16', customerId: 'cust_13', customerName: 'Mia Garcia', items: orderItems[5], total: calcTotal(orderItems[5]), status: 'cancelled', createdAt: daysAgo(5) },
  { id: 'ord_17', customerId: 'cust_16', customerName: 'Paul Lewis', items: orderItems[6], total: calcTotal(orderItems[6]), status: 'delivered', createdAt: daysAgo(5) },
  { id: 'ord_18', customerId: 'cust_17', customerName: 'Quinn Walker', items: orderItems[7], total: calcTotal(orderItems[7]), status: 'delivered', createdAt: daysAgo(6) },
  { id: 'ord_19', customerId: 'cust_19', customerName: 'Sam Young', items: orderItems[8], total: calcTotal(orderItems[8]), status: 'delivered', createdAt: daysAgo(6) },
  { id: 'ord_20', customerId: 'cust_20', customerName: 'Tina King', items: orderItems[9], total: calcTotal(orderItems[9]), status: 'delivered', createdAt: daysAgo(7) },
  { id: 'ord_21', customerId: 'cust_21', customerName: 'Uma Scott', items: orderItems[0], total: calcTotal(orderItems[0]), status: 'delivered', createdAt: daysAgo(7) },
  { id: 'ord_22', customerId: 'cust_22', customerName: 'Victor Green', items: orderItems[1], total: calcTotal(orderItems[1]), status: 'delivered', createdAt: daysAgo(8) },
  { id: 'ord_23', customerId: 'cust_23', customerName: 'Wendy Adams', items: orderItems[2], total: calcTotal(orderItems[2]), status: 'delivered', createdAt: daysAgo(8) },
  { id: 'ord_24', customerId: 'cust_24', customerName: 'Xavier Baker', items: orderItems[3], total: calcTotal(orderItems[3]), status: 'delivered', createdAt: daysAgo(9) },
  { id: 'ord_25', customerId: 'cust_25', customerName: 'Yara Nelson', items: orderItems[4], total: calcTotal(orderItems[4]), status: 'delivered', createdAt: daysAgo(10) },
  { id: 'ord_26', customerId: 'cust_1', customerName: 'Alice Johnson', items: orderItems[5], total: calcTotal(orderItems[5]), status: 'delivered', createdAt: daysAgo(11) },
  { id: 'ord_27', customerId: 'cust_3', customerName: 'Carol Williams', items: orderItems[6], total: calcTotal(orderItems[6]), status: 'delivered', createdAt: daysAgo(12) },
  { id: 'ord_28', customerId: 'cust_5', customerName: 'Emma Davis', items: orderItems[7], total: calcTotal(orderItems[7]), status: 'delivered', createdAt: daysAgo(13) },
  { id: 'ord_29', customerId: 'cust_7', customerName: 'Grace Lee', items: orderItems[8], total: calcTotal(orderItems[8]), status: 'delivered', createdAt: daysAgo(14) },
  { id: 'ord_30', customerId: 'cust_10', customerName: 'Jack Taylor', items: orderItems[9], total: calcTotal(orderItems[9]), status: 'delivered', createdAt: daysAgo(15) },
]
