const daysFromNow = (d) => new Date(Date.now() + d * 24 * 60 * 60 * 1000).toISOString()
const daysAgo = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString()

export const coupons = [
  { id: 'coup_1', code: 'WELCOME10', type: 'percentage', value: 10, minOrder: 20, maxUses: 100, usedCount: 45, expiry: daysFromNow(30), active: true },
  { id: 'coup_2', code: 'SUMMER25', type: 'percentage', value: 25, minOrder: 50, maxUses: 50, usedCount: 12, expiry: daysFromNow(60), active: true },
  { id: 'coup_3', code: 'FLAT5', type: 'fixed', value: 5, minOrder: 15, maxUses: 200, usedCount: 89, expiry: daysFromNow(15), active: true },
  { id: 'coup_4', code: 'VIP20', type: 'percentage', value: 20, minOrder: 40, maxUses: 30, usedCount: 30, expiry: daysAgo(5), active: false },
  { id: 'coup_5', code: 'PIZZA15', type: 'percentage', value: 15, minOrder: 25, maxUses: 75, usedCount: 23, expiry: daysFromNow(45), active: true },
  { id: 'coup_6', code: 'FREESHIP', type: 'fixed', value: 8, minOrder: 30, maxUses: 150, usedCount: 67, expiry: daysFromNow(90), active: true },
  { id: 'coup_7', code: 'HOLIDAY30', type: 'percentage', value: 30, minOrder: 60, maxUses: 20, usedCount: 8, expiry: daysFromNow(120), active: true },
  { id: 'coup_8', code: 'LUNCH10', type: 'percentage', value: 10, minOrder: 10, maxUses: 500, usedCount: 234, expiry: daysFromNow(7), active: true },
]

export const discounts = [
  { id: 'disc_1', name: 'Happy Hour', type: 'percentage', value: 15, category: 'Beverages', active: true, startDate: daysAgo(30), endDate: daysFromNow(60) },
  { id: 'disc_2', name: 'Weekend Special', type: 'percentage', value: 20, category: 'All', active: true, startDate: daysAgo(7), endDate: daysFromNow(30) },
  { id: 'disc_3', name: 'Student Discount', type: 'percentage', value: 10, category: 'All', active: true, startDate: daysAgo(90), endDate: daysFromNow(180) },
  { id: 'disc_4', name: 'Senior Citizen', type: 'fixed', value: 5, category: 'All', active: true, startDate: daysAgo(60), endDate: daysFromNow(300) },
  { id: 'disc_5', name: 'Loyalty Reward', type: 'percentage', value: 12, category: 'All', active: false, startDate: daysAgo(120), endDate: daysAgo(10) },
  { id: 'disc_6', name: 'Pizza Tuesday', type: 'percentage', value: 25, category: 'Pizza', active: true, startDate: daysAgo(14), endDate: daysFromNow(90) },
]

export const offers = [
  { id: 'offer_1', title: 'Buy 1 Get 1 Pizza', type: 'bogo', conditions: 'Buy any large pizza, get one free', active: true, startDate: daysAgo(7), endDate: daysFromNow(21) },
  { id: 'offer_2', title: 'Family Feast Bundle', type: 'bundle', conditions: '2 pizzas + 2 sides + 4 drinks for Rs 4,999', active: true, startDate: daysAgo(14), endDate: daysFromNow(45) },
  { id: 'offer_3', title: 'Free Dessert', type: 'freebie', conditions: 'Free dessert on orders over Rs 4,000', active: true, startDate: daysAgo(3), endDate: daysFromNow(30) },
  { id: 'offer_4', title: 'Lunch Combo', type: 'bundle', conditions: 'Main + drink + side for Rs 1,499', active: true, startDate: daysAgo(30), endDate: daysFromNow(60) },
  { id: 'offer_5', title: 'Birthday Special', type: 'percentage', conditions: '25% off on your birthday month', active: false, startDate: daysAgo(90), endDate: daysAgo(5) },
]
