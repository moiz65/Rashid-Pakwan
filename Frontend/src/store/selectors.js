import { createSelector } from '@reduxjs/toolkit'
import { parseISO, isToday, subDays, format, startOfDay } from 'date-fns'
import {
  ALL_BRANCHES,
  filterByBranch,
  getPrimaryBranchId,
  isAllBranches,
  mergeLiveWithDemo,
} from '@/lib/branches'

export const selectProducts = (state) => state.products.items
export const selectCategories = (state) => state.categories.items
export const selectBrands = (state) => state.brands.items
export const selectAddons = (state) => state.addons.items
export const selectDrinks = (state) => state.drinks?.items || []
export const selectCoupons = (state) => state.marketing.coupons || []
export const selectDiscounts = (state) => state.marketing.discounts || []
export const selectOffers = (state) => state.marketing.offers || []
export const selectDeals = (state) => state.marketing.deals || []
export const selectAuth = (state) => state.auth
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectCurrentUser = (state) => state.auth.user

export const selectBranches = (state) => state.branches?.items || []
export const selectSelectedBranchId = (state) => state.branches?.selectedBranchId || ALL_BRANCHES
export const selectIsAllBranches = (state) => isAllBranches(selectSelectedBranchId(state))

/** Branches the current user is allowed to see (HQ = all, branch user = assigned only). */
export const selectAccessibleBranches = createSelector(
  [selectBranches, selectCurrentUser],
  (branches, user) => {
    const assigned = Array.isArray(user?.branchIds) ? user.branchIds.filter(Boolean) : []
    const isHqUser = user?.role === 'admin' || assigned.length === 0
    if (isHqUser) return branches
    return branches.filter((b) => assigned.includes(b.id))
  },
)

export const selectActiveBranches = createSelector([selectBranches], (branches) =>
  branches.filter((b) => b.status !== 'inactive')
)

export const selectAccessibleActiveBranches = createSelector(
  [selectAccessibleBranches],
  (branches) => branches.filter((b) => b.status !== 'inactive'),
)

export const selectCurrentBranch = createSelector(
  [selectBranches, selectSelectedBranchId],
  (branches, id) => branches.find((b) => b.id === id) || null
)

export const selectBranchNameById = createSelector([selectBranches], (branches) =>
  Object.fromEntries(branches.map((b) => [b.id, b.name]))
)

export const selectWriteBranchId = createSelector(
  [selectSelectedBranchId, selectBranches],
  (selected, branches) => (isAllBranches(selected) ? getPrimaryBranchId(branches) : selected)
)

const selectLiveOrders = (state) => state.orders.items
const selectLiveCustomers = (state) => state.customers.items
const selectLiveCarts = (state) => state.carts.items
const selectDemoOrders = (state) => state.branches?.demoOrders || []
const selectDemoCustomers = (state) => state.branches?.demoCustomers || []
const selectDemoCarts = (state) => state.branches?.demoCarts || []

/** All locations combined — ignores the branch switcher. */
export const selectHqOrders = createSelector(
  [selectLiveOrders, selectDemoOrders, selectBranches],
  (live, demo, branches) => mergeLiveWithDemo(live, demo, getPrimaryBranchId(branches))
)

export const selectHqCustomers = createSelector(
  [selectLiveCustomers, selectDemoCustomers, selectBranches],
  (live, demo, branches) => mergeLiveWithDemo(live, demo, getPrimaryBranchId(branches))
)

export const selectHqCarts = createSelector(
  [selectLiveCarts, selectDemoCarts, selectBranches],
  (live, demo, branches) => mergeLiveWithDemo(live, demo, getPrimaryBranchId(branches))
)

export const selectOrders = createSelector(
  [selectHqOrders, selectSelectedBranchId],
  (orders, branchId) => filterByBranch(orders, branchId)
)

export const selectCustomers = createSelector(
  [selectHqCustomers, selectSelectedBranchId],
  (customers, branchId) => filterByBranch(customers, branchId)
)

export const selectCarts = createSelector(
  [selectHqCarts, selectSelectedBranchId],
  (carts, branchId) => filterByBranch(carts, branchId).filter((c) => !c.recovered)
)

export const selectUpcomingOrders = createSelector([selectOrders], (orders) =>
  orders.filter((o) => ['pending', 'confirmed', 'preparing'].includes(o.status))
)

/** Orders placed but not yet received/confirmed by admin */
export const selectPendingOrders = createSelector([selectOrders], (orders) =>
  orders.filter((o) => o.status === 'pending')
)

export const selectRejectedOrders = createSelector([selectOrders], (orders) =>
  orders.filter((o) => ['rejected', 'cancelled'].includes(o.status))
)

export const selectDeliveredOrders = createSelector([selectOrders], (orders) =>
  orders.filter((o) => o.status === 'delivered')
)

export const selectSalesOrders = selectDeliveredOrders

export const selectSalesMetrics = createSelector([selectDeliveredOrders], (deliveredOrders) => {
  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)
  const deliveredCount = deliveredOrders.length
  const avgOrderValue = deliveredCount > 0 ? totalRevenue / deliveredCount : 0

  const todayOrders = deliveredOrders.filter((o) => o.createdAt && isToday(parseISO(o.createdAt)))
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)

  // Payment breakdown heuristics
  let cash = 0
  let card = 0
  let online = 0
  deliveredOrders.forEach((o) => {
    const text = (o.notes || '').toLowerCase()
    const amt = Number(o.total) || 0
    if (text.includes('card') || text.includes('pos')) {
      card += amt
    } else if (text.includes('online') || text.includes('stripe') || text.includes('bank')) {
      online += amt
    } else {
      cash += amt
    }
  })

  return {
    totalRevenue,
    deliveredCount,
    avgOrderValue,
    todayRevenue,
    todayCount: todayOrders.length,
    paymentBreakdown: { cash, card, online },
  }
})

function buildDashboardStats(orders, customers) {
  const todayOrders = orders.filter((o) => o.createdAt && isToday(parseISO(o.createdAt)))
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)
  const deliveredOrders = orders.filter((o) => o.status === 'delivered')
  const avgOrderValue = deliveredOrders.length
    ? deliveredOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0) / deliveredOrders.length
    : 0

  return {
    todayRevenue,
    todayOrders: todayOrders.length,
    totalCustomers: customers.length,
    avgOrderValue,
    totalOrders: orders.length,
    delivered: deliveredOrders.length,
    totalRevenue: deliveredOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0),
    pending: orders.filter((o) => o.status === 'pending').length,
  }
}

export const selectDashboardStats = createSelector(
  [selectOrders, selectCustomers],
  buildDashboardStats
)

export const selectHqDashboardStats = createSelector(
  [selectHqOrders, selectHqCustomers],
  buildDashboardStats
)

function buildRevenueChart(orders) {
  const days = 7
  const data = []
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i)
    const dayStart = startOfDay(date)
    const dayEnd = new Date(dayStart)
    dayEnd.setHours(23, 59, 59, 999)
    const dayOrders = orders.filter((o) => {
      if (!o.createdAt) return false
      const d = parseISO(o.createdAt)
      return d >= dayStart && d <= dayEnd
    })
    data.push({
      date: format(date, 'MMM d'),
      revenue: dayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0),
      orders: dayOrders.length,
    })
  }
  return data
}

export const selectRevenueChartData = createSelector([selectOrders], buildRevenueChart)
export const selectHqRevenueChartData = createSelector([selectHqOrders], buildRevenueChart)

export const selectOrdersByStatus = createSelector([selectOrders], (orders) => {
  const statuses = ['pending', 'confirmed', 'preparing', 'delivered', 'rejected', 'cancelled']
  return statuses.map((status) => ({
    status,
    count: orders.filter((o) => o.status === status).length,
  })).filter((s) => s.count > 0)
})

export const selectRecentOrders = createSelector([selectOrders], (orders) =>
  [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10)
)

const branchCatalogOpts = { includeAllScoped: true }

export const selectBranchProducts = createSelector(
  [selectProducts, selectSelectedBranchId],
  (products, branchId) => filterByBranch(products, branchId, branchCatalogOpts),
)

export const selectBranchDrinks = createSelector(
  [selectDrinks, selectSelectedBranchId],
  (drinks, branchId) => filterByBranch(drinks, branchId, branchCatalogOpts),
)

export const selectBranchAddons = createSelector(
  [selectAddons, selectSelectedBranchId],
  (addons, branchId) => filterByBranch(addons, branchId, branchCatalogOpts),
)

export const selectBranchCategories = createSelector(
  [selectCategories, selectSelectedBranchId],
  (categories, branchId) => filterByBranch(categories, branchId, branchCatalogOpts),
)

export const selectBranchBrands = createSelector(
  [selectBrands, selectSelectedBranchId],
  (brands, branchId) => filterByBranch(brands, branchId, branchCatalogOpts),
)

export const selectBranchCoupons = createSelector(
  [selectCoupons, selectSelectedBranchId],
  (coupons, branchId) => filterByBranch(coupons, branchId, branchCatalogOpts),
)

export const selectBranchDiscounts = createSelector(
  [selectDiscounts, selectSelectedBranchId],
  (discounts, branchId) => filterByBranch(discounts, branchId, branchCatalogOpts),
)

export const selectBranchOffers = createSelector(
  [selectOffers, selectSelectedBranchId],
  (offers, branchId) => filterByBranch(offers, branchId, branchCatalogOpts),
)

export const selectBranchDeals = createSelector(
  [selectDeals, selectSelectedBranchId],
  (deals, branchId) => filterByBranch(deals, branchId, branchCatalogOpts),
)

export const selectTopProducts = createSelector(
  [selectBranchProducts, selectOrders],
  (products, orders) => {
    const salesByProduct = new Map()
    for (const order of orders) {
      if (order.status !== 'delivered') continue
      for (const item of order.items || []) {
        const key = item.productId || item.name
        salesByProduct.set(key, (salesByProduct.get(key) || 0) + Number(item.qty || 1))
      }
    }
    return [...products]
      .map((p) => ({
        ...p,
        sales: salesByProduct.get(p.id) ?? salesByProduct.get(p.name) ?? p.sales ?? 0,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)
  },
)

export const selectSalesByCategory = createSelector(
  [selectBranchProducts, selectBranchCategories, selectOrders],
  (products, categories, orders) => {
    const revenueByProduct = new Map()
    for (const order of orders) {
      if (order.status !== 'delivered') continue
      for (const item of order.items || []) {
        const key = item.productId || item.name
        revenueByProduct.set(
          key,
          (revenueByProduct.get(key) || 0) + Number(item.qty || 1) * Number(item.price || 0),
        )
      }
    }
    return categories
      .map((cat) => ({
        name: cat.name,
        value: products
          .filter((p) => p.categoryId === cat.id)
          .reduce((sum, p) => sum + (revenueByProduct.get(p.id) ?? revenueByProduct.get(p.name) ?? 0), 0),
      }))
      .filter((c) => c.value > 0)
  },
)

export const selectCombinedBranchStats = createSelector(
  [selectHqOrders, selectHqCustomers, selectActiveBranches],
  (orders, customers, branches) => {
    const grandDelivered = orders.filter((o) => o.status === 'delivered')
    const grandRevenue = grandDelivered.reduce((sum, o) => sum + (Number(o.total) || 0), 0)

    return branches.map((branch) => {
      const branchOrders = orders.filter((o) => o.branchId === branch.id)
      const delivered = branchOrders.filter((o) => o.status === 'delivered')
      const revenue = delivered.reduce((sum, o) => sum + (Number(o.total) || 0), 0)
      const todayOrders = branchOrders.filter((o) => o.createdAt && isToday(parseISO(o.createdAt)))
      return {
        id: branch.id,
        name: branch.name,
        code: branch.code,
        city: branch.city,
        orders: branchOrders.length,
        pending: branchOrders.filter((o) => o.status === 'pending').length,
        delivered: delivered.length,
        customers: customers.filter((c) => c.branchId === branch.id).length,
        todayOrders: todayOrders.length,
        todayRevenue: todayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0),
        revenue,
        avgOrderValue: delivered.length ? revenue / delivered.length : 0,
        share: grandRevenue ? (revenue / grandRevenue) * 100 : 0,
      }
    })
  }
)
