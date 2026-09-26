import { categories } from './categories'
import { brands } from './brands'
import { customers } from './customers'
import { products, reviews } from './products'
import { orders } from './orders'
import { abandonedCarts } from './carts'
import { coupons, discounts, offers } from './marketing'
import { settings } from './settings'
import { demoBranches } from './branches'

export const mockData = {
  categories,
  brands,
  customers,
  products,
  reviews,
  orders,
  carts: abandonedCarts,
  coupons,
  discounts,
  offers,
  settings,
  branches: demoBranches,
}
