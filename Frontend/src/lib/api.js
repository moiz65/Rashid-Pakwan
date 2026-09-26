// Dev defaults to Vite proxy (/api → localhost:5000). Override with VITE_API_URL / VITE_API_ORIGIN.
const PRODUCTION_ORIGIN = 'http://localhost:5000'
const BACKEND_ORIGIN =
  import.meta.env.VITE_API_ORIGIN ||
  (import.meta.env.DEV ? '' : PRODUCTION_ORIGIN)
const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/api' : `${PRODUCTION_ORIGIN}/api`)

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function isUnauthorizedError(err) {
  return err instanceof ApiError && err.status === 401
}

async function parseResponse(response) {
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new ApiError(body.message || 'Request failed', response.status)
  }
  return body.data
}

function buildHeaders(token, extra = {}) {
  const headers = { 'Content-Type': 'application/json', ...extra }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

async function apiRequest(path, { method = 'GET', token, body } = {}) {
  return parseResponse(
    await fetch(`${API_BASE}${path}`, {
      method,
      headers: buildHeaders(token),
      body: body ? JSON.stringify(body) : undefined,
    })
  )
}

export async function loginRequest(email, password) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

export async function fetchProfile(token) {
  return apiRequest('/auth/me', { token })
}

export async function fetchOrders(token, params = {}) {
  const query = new URLSearchParams(params).toString()
  const path = query ? `/orders?${query}` : '/orders'
  const data = await apiRequest(path, { token })
  return data.orders
}

export async function createOrder(token, payload) {
  const data = await apiRequest('/orders', {
    method: 'POST',
    token,
    body: payload,
  })
  return data.order
}

export async function updateOrderStatusRequest(token, id, status, rejectionReason) {
  const body = { status }
  if (rejectionReason) body.rejectionReason = rejectionReason
  const data = await apiRequest(`/orders/${id}/status`, {
    method: 'PATCH',
    token,
    body,
  })
  return data.order
}

export async function fetchCustomers(token, params = {}) {
  const query = new URLSearchParams(params).toString()
  const path = query ? `/customers?${query}` : '/customers'
  const data = await apiRequest(path, { token })
  return data.customers
}

export async function createCustomer(token, payload) {
  const data = await apiRequest('/customers', {
    method: 'POST',
    token,
    body: payload,
  })
  return data.customer
}

export async function deleteCustomerRequest(token, id) {
  return apiRequest(`/customers/${id}`, {
    method: 'DELETE',
    token,
  })
}

export async function fetchTrackingSettings(token) {
  const data = await apiRequest('/settings/tracking', { token })
  return data.settings
}

export async function updateTrackingSettings(token, payload) {
  const data = await apiRequest('/settings/tracking', {
    method: 'PATCH',
    token,
    body: payload,
  })
  return data.settings
}

// Catalog
export async function fetchCatalogProducts(token, params = {}) {
  const query = new URLSearchParams(params).toString()
  const path = query ? `/catalog/products?${query}` : '/catalog/products'
  const data = await apiRequest(path, { token })
  return data.products
}

export async function createProductRequest(token, payload) {
  const data = await apiRequest('/catalog/products', { method: 'POST', token, body: payload })
  return data.product
}

export async function updateProductRequest(token, id, payload) {
  const data = await apiRequest(`/catalog/products/${id}`, { method: 'PATCH', token, body: payload })
  return data.product
}

export async function deleteProductRequest(token, id) {
  return apiRequest(`/catalog/products/${id}`, { method: 'DELETE', token })
}

export async function fetchCatalogCategories(token, params = {}) {
  const query = new URLSearchParams(params).toString()
  const path = query ? `/catalog/categories?${query}` : '/catalog/categories'
  const data = await apiRequest(path, { token })
  return data.categories
}

export async function createCategoryRequest(token, payload) {
  const data = await apiRequest('/catalog/categories', { method: 'POST', token, body: payload })
  return data.category
}

export async function updateCategoryRequest(token, id, payload) {
  const data = await apiRequest(`/catalog/categories/${id}`, { method: 'PATCH', token, body: payload })
  return data.category
}

export async function deleteCategoryRequest(token, id) {
  return apiRequest(`/catalog/categories/${id}`, { method: 'DELETE', token })
}

export async function fetchCatalogBrands(token, params = {}) {
  const query = new URLSearchParams(params).toString()
  const path = query ? `/catalog/brands?${query}` : '/catalog/brands'
  const data = await apiRequest(path, { token })
  return data.brands
}

export async function createBrandRequest(token, payload) {
  const data = await apiRequest('/catalog/brands', { method: 'POST', token, body: payload })
  return data.brand
}

export async function updateBrandRequest(token, id, payload) {
  const data = await apiRequest(`/catalog/brands/${id}`, { method: 'PATCH', token, body: payload })
  return data.brand
}

export async function deleteBrandRequest(token, id) {
  return apiRequest(`/catalog/brands/${id}`, { method: 'DELETE', token })
}

export async function fetchCatalogAddons(token, params = {}) {
  const query = new URLSearchParams(params).toString()
  const path = query ? `/catalog/addons?${query}` : '/catalog/addons'
  const data = await apiRequest(path, { token })
  return data.addons
}

export async function createAddonRequest(token, payload) {
  const data = await apiRequest('/catalog/addons', { method: 'POST', token, body: payload })
  return data.addon
}

export async function updateAddonRequest(token, id, payload) {
  const data = await apiRequest(`/catalog/addons/${id}`, { method: 'PATCH', token, body: payload })
  return data.addon
}

export async function deleteAddonRequest(token, id) {
  return apiRequest(`/catalog/addons/${id}`, { method: 'DELETE', token })
}

export async function fetchCatalogDrinks(token, params = {}) {
  const query = new URLSearchParams(params).toString()
  const path = query ? `/catalog/drinks?${query}` : '/catalog/drinks'
  const data = await apiRequest(path, { token })
  return data.drinks
}

export async function createDrinkRequest(token, payload) {
  const data = await apiRequest('/catalog/drinks', { method: 'POST', token, body: payload })
  return data.drink
}

export async function updateDrinkRequest(token, id, payload) {
  const data = await apiRequest(`/catalog/drinks/${id}`, { method: 'PATCH', token, body: payload })
  return data.drink
}

export async function deleteDrinkRequest(token, id) {
  return apiRequest(`/catalog/drinks/${id}`, { method: 'DELETE', token })
}

export async function fetchCatalogCoupons(token, params = {}) {
  const query = new URLSearchParams(params).toString()
  const path = query ? `/catalog/coupons?${query}` : '/catalog/coupons'
  const data = await apiRequest(path, { token })
  return data.coupons
}

export async function createCouponRequest(token, payload) {
  const data = await apiRequest('/catalog/coupons', { method: 'POST', token, body: payload })
  return data.coupon
}

export async function updateCouponRequest(token, id, payload) {
  const data = await apiRequest(`/catalog/coupons/${id}`, { method: 'PATCH', token, body: payload })
  return data.coupon
}

export async function deleteCouponRequest(token, id) {
  return apiRequest(`/catalog/coupons/${id}`, { method: 'DELETE', token })
}

export async function fetchCatalogDiscounts(token, params = {}) {
  const query = new URLSearchParams(params).toString()
  const path = query ? `/catalog/discounts?${query}` : '/catalog/discounts'
  const data = await apiRequest(path, { token })
  return data.discounts
}

export async function createDiscountRequest(token, payload) {
  const data = await apiRequest('/catalog/discounts', { method: 'POST', token, body: payload })
  return data.discount
}

export async function updateDiscountRequest(token, id, payload) {
  const data = await apiRequest(`/catalog/discounts/${id}`, { method: 'PATCH', token, body: payload })
  return data.discount
}

export async function deleteDiscountRequest(token, id) {
  return apiRequest(`/catalog/discounts/${id}`, { method: 'DELETE', token })
}

export async function fetchCatalogOffers(token, params = {}) {
  const query = new URLSearchParams(params).toString()
  const path = query ? `/catalog/offers?${query}` : '/catalog/offers'
  const data = await apiRequest(path, { token })
  return data.offers
}

export async function createOfferRequest(token, payload) {
  const data = await apiRequest('/catalog/offers', { method: 'POST', token, body: payload })
  return data.offer
}

export async function updateOfferRequest(token, id, payload) {
  const data = await apiRequest(`/catalog/offers/${id}`, { method: 'PATCH', token, body: payload })
  return data.offer
}

export async function deleteOfferRequest(token, id) {
  return apiRequest(`/catalog/offers/${id}`, { method: 'DELETE', token })
}

export async function fetchCatalogDeals(token, params = {}) {
  const query = new URLSearchParams(params).toString()
  const path = query ? `/catalog/deals?${query}` : '/catalog/deals'
  const data = await apiRequest(path, { token })
  return data.deals
}

export async function createDealRequest(token, payload) {
  const data = await apiRequest('/catalog/deals', { method: 'POST', token, body: payload })
  return data.deal
}

export async function updateDealRequest(token, id, payload) {
  const data = await apiRequest(`/catalog/deals/${id}`, { method: 'PATCH', token, body: payload })
  return data.deal
}

export async function deleteDealRequest(token, id) {
  return apiRequest(`/catalog/deals/${id}`, { method: 'DELETE', token })
}

export async function fetchCatalogCarts(token, params = {}) {
  const query = new URLSearchParams(params).toString()
  const path = query ? `/catalog/carts?${query}` : '/catalog/carts'
  const data = await apiRequest(path, { token })
  return data.carts
}

export async function updateCartRequest(token, id, payload) {
  const data = await apiRequest(`/catalog/carts/${id}`, {
    method: 'PATCH',
    token,
    body: payload,
  })
  return data.cart
}

export async function deleteCartRequest(token, id) {
  return apiRequest(`/catalog/carts/${id}`, { method: 'DELETE', token })
}

export async function uploadCatalogImage(token, file) {
  const formData = new FormData()
  formData.append('image', file)
  const response = await fetch(`${API_BASE}/catalog/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message || 'Upload failed')
  return body.data.url
}

export async function generateCatalogImageRequest(token, { title, description, kind }) {
  const data = await apiRequest('/catalog/generate-image', {
    method: 'POST',
    token,
    body: { title, description, kind },
  })
  return data
}

function apiOrigin() {
  return API_BASE.startsWith('http')
    ? API_BASE.replace(/\/api\/?$/, '')
    : BACKEND_ORIGIN
}

export function resolveMediaUrl(path) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path
  }
  if (path.startsWith('/uploads')) return `${apiOrigin()}${path}`
  if (path.length <= 4) return '' // emoji placeholder
  return path.startsWith('/') ? `${apiOrigin()}${path}` : `${apiOrigin()}/${path}`
}

export async function fetchOrderReviews(token, params = {}) {
  const query = new URLSearchParams(params).toString()
  const path = query ? `/reviews?${query}` : '/reviews'
  const data = await apiRequest(path, { token })
  return data.reviews
}

export async function updateOrderReviewRequest(token, id, payload) {
  const data = await apiRequest(`/reviews/${id}`, {
    method: 'PATCH',
    token,
    body: payload,
  })
  return data.review
}

export async function deleteOrderReviewRequest(token, id) {
  return apiRequest(`/reviews/${id}`, {
    method: 'DELETE',
    token,
  })
}

export async function fetchReviewSettings(token) {
  const data = await apiRequest('/settings/reviews', { token })
  return data.settings
}

export async function updateReviewSettings(token, payload) {
  const data = await apiRequest('/settings/reviews', {
    method: 'PATCH',
    token,
    body: payload,
  })
  return data.settings
}

export async function fetchPaymentGateways(token) {
  const data = await apiRequest('/catalog/payment-gateways', { token })
  return data.paymentGateways
}

export async function createPaymentGatewayRequest(token, payload) {
  const data = await apiRequest('/catalog/payment-gateways', {
    method: 'POST',
    token,
    body: payload,
  })
  return data.paymentGateway
}

export async function updatePaymentGatewayRequest(token, id, payload) {
  const data = await apiRequest(`/catalog/payment-gateways/${id}`, {
    method: 'PATCH',
    token,
    body: payload,
  })
  return data.paymentGateway
}

export async function deletePaymentGatewayRequest(token, id) {
  return apiRequest(`/catalog/payment-gateways/${id}`, {
    method: 'DELETE',
    token,
  })
}

export async function fetchShippingMethods(token) {
  const data = await apiRequest('/catalog/shipping-methods', { token })
  return data.shippingMethods
}

export async function createShippingMethodRequest(token, payload) {
  const data = await apiRequest('/catalog/shipping-methods', {
    method: 'POST',
    token,
    body: payload,
  })
  return data.shippingMethod
}

export async function updateShippingMethodRequest(token, id, payload) {
  const data = await apiRequest(`/catalog/shipping-methods/${id}`, {
    method: 'PATCH',
    token,
    body: payload,
  })
  return data.shippingMethod
}

export async function deleteShippingMethodRequest(token, id) {
  return apiRequest(`/catalog/shipping-methods/${id}`, {
    method: 'DELETE',
    token,
  })
}

export async function fetchDeliveryChargeSettings(token) {
  const data = await apiRequest('/settings/delivery-charges', { token })
  return data.settings
}

export async function updateDeliveryChargeSettingsRequest(token, payload) {
  const data = await apiRequest('/settings/delivery-charges', {
    method: 'PATCH',
    token,
    body: payload,
  })
  return data.settings
}

export async function fetchDeliveryAreas(token, params = {}) {
  const query = new URLSearchParams(params).toString()
  const path = query ? `/settings/delivery-areas?${query}` : '/settings/delivery-areas'
  const data = await apiRequest(path, { token })
  return data.areas || []
}

export async function createDeliveryAreaRequest(token, payload) {
  const data = await apiRequest('/settings/delivery-areas', {
    method: 'POST',
    token,
    body: payload,
  })
  return data.area
}

export async function updateDeliveryAreaRequest(token, id, payload) {
  const data = await apiRequest(`/settings/delivery-areas/${id}`, {
    method: 'PATCH',
    token,
    body: payload,
  })
  return data.area
}

export async function deleteDeliveryAreaRequest(token, id) {
  return apiRequest(`/settings/delivery-areas/${id}`, {
    method: 'DELETE',
    token,
  })
}

export async function fetchBranches(token) {
  const data = await apiRequest('/catalog/branches', { token })
  return data.branches
}

export async function createBranchRequest(token, payload) {
  const data = await apiRequest('/catalog/branches', { method: 'POST', token, body: payload })
  return data.branch
}

export async function updateBranchRequest(token, id, payload) {
  const data = await apiRequest(`/catalog/branches/${id}`, { method: 'PATCH', token, body: payload })
  return data.branch
}

export async function deleteBranchRequest(token, id) {
  return apiRequest(`/catalog/branches/${id}`, { method: 'DELETE', token })
}

export async function fetchAdminUsers(token) {
  const data = await apiRequest('/catalog/users', { token })
  return data.users
}

export async function createAdminUserRequest(token, payload) {
  const data = await apiRequest('/catalog/users', { method: 'POST', token, body: payload })
  return data.user
}

export async function updateAdminUserRequest(token, id, payload) {
  const data = await apiRequest(`/catalog/users/${id}`, { method: 'PATCH', token, body: payload })
  return data.user
}

export async function deleteAdminUserRequest(token, id) {
  return apiRequest(`/catalog/users/${id}`, { method: 'DELETE', token })
}

export async function fetchPermissions(token) {
  const data = await apiRequest('/catalog/permissions', { token })
  return data.permissions
}

export async function fetchRoles(token) {
  const data = await apiRequest('/catalog/roles', { token })
  return data.roles
}

export async function createRoleRequest(token, payload) {
  const data = await apiRequest('/catalog/roles', { method: 'POST', token, body: payload })
  return data.role
}

export async function updateRoleRequest(token, id, payload) {
  const data = await apiRequest(`/catalog/roles/${id}`, { method: 'PATCH', token, body: payload })
  return data.role
}

export async function deleteRoleRequest(token, id) {
  return apiRequest(`/catalog/roles/${id}`, { method: 'DELETE', token })
}

export async function fetchTaxCodes(token) {
  const data = await apiRequest('/catalog/tax-codes', { token })
  return data.taxCodes
}

export async function createTaxCodeRequest(token, payload) {
  const data = await apiRequest('/catalog/tax-codes', { method: 'POST', token, body: payload })
  return data.taxCode
}

export async function updateTaxCodeRequest(token, id, payload) {
  const data = await apiRequest(`/catalog/tax-codes/${id}`, { method: 'PATCH', token, body: payload })
  return data.taxCode
}

export async function deleteTaxCodeRequest(token, id) {
  return apiRequest(`/catalog/tax-codes/${id}`, { method: 'DELETE', token })
}

export async function validateCouponRequest(_token, { code, subtotal }) {
  const data = await apiRequest('/public/coupons/validate', {
    method: 'POST',
    body: { code, subtotal },
  })
  return data
}

export async function checkoutQuoteRequest(_token, { items, couponCode }) {
  const data = await apiRequest('/public/checkout/quote', {
    method: 'POST',
    body: { items, couponCode },
  })
  return data.quote
}
