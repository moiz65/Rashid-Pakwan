export const settings = {
  paymentGateways: [
    { id: 'pay_1', name: 'Stripe', description: 'Credit/debit card payments', enabled: true, icon: '💳' },
    { id: 'pay_2', name: 'PayPal', description: 'PayPal checkout', enabled: true, icon: '🅿️' },
    { id: 'pay_3', name: 'Cash on Delivery', description: 'Pay when order arrives', enabled: true, icon: '💵' },
    { id: 'pay_4', name: 'Apple Pay', description: 'Apple Pay wallet', enabled: false, icon: '🍎' },
    { id: 'pay_5', name: 'Google Pay', description: 'Google Pay wallet', enabled: false, icon: '🔵' },
  ],
  shippingMethods: [
    { id: 'ship_1', name: 'Standard Delivery', description: '30-45 min delivery', price: 4.99, estimatedTime: '30-45 min', enabled: true },
    { id: 'ship_2', name: 'Express Delivery', description: '15-20 min delivery', price: 8.99, estimatedTime: '15-20 min', enabled: true },
    { id: 'ship_3', name: 'Pickup', description: 'Customer picks up at restaurant', price: 0, estimatedTime: '15 min', enabled: true },
    { id: 'ship_4', name: 'Scheduled Delivery', description: 'Choose delivery time slot', price: 6.99, estimatedTime: 'Custom', enabled: true },
    { id: 'ship_5', name: 'Catering Delivery', description: 'Large order catering service', price: 19.99, estimatedTime: '2-4 hours', enabled: false },
  ],
  users: [
    { id: 'user_1', name: 'Admin User', email: 'admin@restaurant.com', role: 'admin', status: 'active', lastLogin: new Date().toISOString() },
    { id: 'user_2', name: 'Sarah Manager', email: 'sarah@restaurant.com', role: 'manager', status: 'active', lastLogin: new Date(Date.now() - 3600000).toISOString() },
    { id: 'user_3', name: 'Mike Staff', email: 'mike@restaurant.com', role: 'staff', status: 'active', lastLogin: new Date(Date.now() - 7200000).toISOString() },
    { id: 'user_4', name: 'Lisa Staff', email: 'lisa@restaurant.com', role: 'staff', status: 'active', lastLogin: new Date(Date.now() - 86400000).toISOString() },
    { id: 'user_5', name: 'Tom Manager', email: 'tom@restaurant.com', role: 'manager', status: 'inactive', lastLogin: new Date(Date.now() - 604800000).toISOString() },
  ],
}
