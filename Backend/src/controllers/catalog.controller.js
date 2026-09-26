import path from 'path'
import * as catalogService from '../services/catalog.service.js'
import * as aiImageService from '../services/aiImage.service.js'
import { sendSuccess } from '../utils/response.js'

function wrap(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res)
    } catch (err) {
      next(err)
    }
  }
}

export const listCategories = wrap(async (req, res) => {
  sendSuccess(res, { categories: await catalogService.listCategories(req.query) })
})
export const createCategory = wrap(async (req, res) => {
  sendSuccess(res, { category: await catalogService.createCategory(req.body) }, 201)
})
export const updateCategory = wrap(async (req, res) => {
  sendSuccess(res, { category: await catalogService.updateCategory(req.params.id, req.body) })
})
export const removeCategory = wrap(async (req, res) => {
  sendSuccess(res, await catalogService.removeCategory(req.params.id))
})

export const listBrands = wrap(async (req, res) => {
  sendSuccess(res, { brands: await catalogService.listBrands(req.query) })
})
export const createBrand = wrap(async (req, res) => {
  sendSuccess(res, { brand: await catalogService.createBrand(req.body) }, 201)
})
export const updateBrand = wrap(async (req, res) => {
  sendSuccess(res, { brand: await catalogService.updateBrand(req.params.id, req.body) })
})
export const removeBrand = wrap(async (req, res) => {
  sendSuccess(res, await catalogService.removeBrand(req.params.id))
})

export const listAddons = wrap(async (req, res) => {
  sendSuccess(res, { addons: await catalogService.listAddons(req.query) })
})
export const createAddon = wrap(async (req, res) => {
  sendSuccess(res, { addon: await catalogService.createAddon(req.body) }, 201)
})
export const updateAddon = wrap(async (req, res) => {
  sendSuccess(res, { addon: await catalogService.updateAddon(req.params.id, req.body) })
})
export const removeAddon = wrap(async (req, res) => {
  sendSuccess(res, await catalogService.removeAddon(req.params.id))
})

export const listDrinks = wrap(async (req, res) => {
  sendSuccess(res, { drinks: await catalogService.listDrinks(req.query) })
})
export const createDrink = wrap(async (req, res) => {
  sendSuccess(res, { drink: await catalogService.createDrink(req.body) }, 201)
})
export const updateDrink = wrap(async (req, res) => {
  sendSuccess(res, { drink: await catalogService.updateDrink(req.params.id, req.body) })
})
export const removeDrink = wrap(async (req, res) => {
  sendSuccess(res, await catalogService.removeDrink(req.params.id))
})

export const listProducts = wrap(async (req, res) => {
  sendSuccess(res, { products: await catalogService.listProducts(req.query) })
})
export const createProduct = wrap(async (req, res) => {
  sendSuccess(res, { product: await catalogService.createProduct(req.body) }, 201)
})
export const updateProduct = wrap(async (req, res) => {
  sendSuccess(res, { product: await catalogService.updateProduct(req.params.id, req.body) })
})
export const removeProduct = wrap(async (req, res) => {
  sendSuccess(res, await catalogService.removeProduct(req.params.id))
})

export const uploadCatalogImage = wrap(async (req, res) => {
  if (!req.file) {
    const err = new Error('Image file is required')
    err.statusCode = 400
    throw err
  }

  const { isCloudinaryConfigured, uploadImageBuffer } = await import(
    '../services/cloudinary.service.js'
  )
  const { saveBufferLocally } = await import('../middleware/upload.js')

  let url
  if (isCloudinaryConfigured()) {
    url = await uploadImageBuffer(req.file.buffer, {
      folder: 'restaurant-admin/catalog',
    })
  } else {
    const ext = path.extname(req.file.originalname || '').toLowerCase() || '.jpg'
    url = saveBufferLocally(req.file.buffer, ext)
  }

  sendSuccess(res, { url }, 201)
})

export const generateCatalogImage = wrap(async (req, res) => {
  const result = await aiImageService.generateCatalogImage({
    title: req.body?.title,
    description: req.body?.description,
    kind: req.body?.kind,
  })
  sendSuccess(res, result, 201)
})

export const listReviews = wrap(async (req, res) => {
  sendSuccess(res, { reviews: await catalogService.listReviews(req.query) })
})
export const createReview = wrap(async (req, res) => {
  sendSuccess(res, { review: await catalogService.createReview(req.body) }, 201)
})
export const updateReview = wrap(async (req, res) => {
  sendSuccess(res, { review: await catalogService.updateReview(req.params.id, req.body) })
})
export const removeReview = wrap(async (req, res) => {
  sendSuccess(res, await catalogService.removeReview(req.params.id))
})

export const listCoupons = wrap(async (req, res) => {
  sendSuccess(res, { coupons: await catalogService.listCoupons(req.query) })
})
export const createCoupon = wrap(async (req, res) => {
  sendSuccess(res, { coupon: await catalogService.createCoupon(req.body) }, 201)
})
export const updateCoupon = wrap(async (req, res) => {
  sendSuccess(res, { coupon: await catalogService.updateCoupon(req.params.id, req.body) })
})
export const removeCoupon = wrap(async (req, res) => {
  sendSuccess(res, await catalogService.removeCoupon(req.params.id))
})

export const listDiscounts = wrap(async (req, res) => {
  sendSuccess(res, { discounts: await catalogService.listDiscounts(req.query) })
})
export const createDiscount = wrap(async (req, res) => {
  sendSuccess(res, { discount: await catalogService.createDiscount(req.body) }, 201)
})
export const updateDiscount = wrap(async (req, res) => {
  sendSuccess(res, { discount: await catalogService.updateDiscount(req.params.id, req.body) })
})
export const removeDiscount = wrap(async (req, res) => {
  sendSuccess(res, await catalogService.removeDiscount(req.params.id))
})

export const listOffers = wrap(async (req, res) => {
  sendSuccess(res, { offers: await catalogService.listOffers(req.query) })
})
export const createOffer = wrap(async (req, res) => {
  sendSuccess(res, { offer: await catalogService.createOffer(req.body) }, 201)
})
export const updateOffer = wrap(async (req, res) => {
  sendSuccess(res, { offer: await catalogService.updateOffer(req.params.id, req.body) })
})
export const removeOffer = wrap(async (req, res) => {
  sendSuccess(res, await catalogService.removeOffer(req.params.id))
})

export const listDeals = wrap(async (req, res) => {
  sendSuccess(res, { deals: await catalogService.listDeals(req.query) })
})
export const createDeal = wrap(async (req, res) => {
  sendSuccess(res, { deal: await catalogService.createDeal(req.body) }, 201)
})
export const updateDeal = wrap(async (req, res) => {
  sendSuccess(res, { deal: await catalogService.updateDeal(req.params.id, req.body) })
})
export const removeDeal = wrap(async (req, res) => {
  sendSuccess(res, await catalogService.removeDeal(req.params.id))
})

export const listPaymentGateways = wrap(async (_req, res) => {
  sendSuccess(res, { paymentGateways: await catalogService.listPaymentGateways() })
})
export const createPaymentGateway = wrap(async (req, res) => {
  sendSuccess(res, { paymentGateway: await catalogService.createPaymentGateway(req.body) }, 201)
})
export const updatePaymentGateway = wrap(async (req, res) => {
  sendSuccess(res, {
    paymentGateway: await catalogService.updatePaymentGateway(req.params.id, req.body),
  })
})
export const removePaymentGateway = wrap(async (req, res) => {
  sendSuccess(res, await catalogService.removePaymentGateway(req.params.id))
})

export const listShippingMethods = wrap(async (_req, res) => {
  sendSuccess(res, { shippingMethods: await catalogService.listShippingMethods() })
})
export const createShippingMethod = wrap(async (req, res) => {
  sendSuccess(res, { shippingMethod: await catalogService.createShippingMethod(req.body) }, 201)
})
export const updateShippingMethod = wrap(async (req, res) => {
  sendSuccess(res, {
    shippingMethod: await catalogService.updateShippingMethod(req.params.id, req.body),
  })
})
export const removeShippingMethod = wrap(async (req, res) => {
  sendSuccess(res, await catalogService.removeShippingMethod(req.params.id))
})

export const listBranches = wrap(async (req, res) => {
  sendSuccess(res, { branches: await catalogService.listBranches(req.user) })
})
export const createBranch = wrap(async (req, res) => {
  sendSuccess(res, { branch: await catalogService.createBranch(req.body, req.user) }, 201)
})
export const updateBranch = wrap(async (req, res) => {
  sendSuccess(res, { branch: await catalogService.updateBranch(req.params.id, req.body, req.user) })
})
export const removeBranch = wrap(async (req, res) => {
  sendSuccess(res, await catalogService.removeBranch(req.params.id, req.user))
})

export const listCarts = wrap(async (req, res) => {
  sendSuccess(res, { carts: await catalogService.listCarts(req.query) })
})
export const createCart = wrap(async (req, res) => {
  sendSuccess(res, { cart: await catalogService.createCart(req.body) }, 201)
})
export const updateCart = wrap(async (req, res) => {
  sendSuccess(res, { cart: await catalogService.updateCart(req.params.id, req.body) })
})
export const removeCart = wrap(async (req, res) => {
  sendSuccess(res, await catalogService.removeCart(req.params.id))
})

export const listTaxCodes = wrap(async (_req, res) => {
  sendSuccess(res, { taxCodes: await catalogService.listTaxCodes() })
})
export const createTaxCode = wrap(async (req, res) => {
  sendSuccess(res, { taxCode: await catalogService.createTaxCode(req.body) }, 201)
})
export const updateTaxCode = wrap(async (req, res) => {
  sendSuccess(res, { taxCode: await catalogService.updateTaxCode(req.params.id, req.body) })
})
export const removeTaxCode = wrap(async (req, res) => {
  sendSuccess(res, await catalogService.removeTaxCode(req.params.id))
})

export const listUsers = wrap(async (req, res) => {
  sendSuccess(res, { users: await catalogService.listUsers(req.user) })
})
export const createUser = wrap(async (req, res) => {
  sendSuccess(res, { user: await catalogService.createUser(req.body, req.user) }, 201)
})
export const updateUser = wrap(async (req, res) => {
  sendSuccess(res, { user: await catalogService.updateUser(req.params.id, req.body, req.user) })
})
export const removeUser = wrap(async (req, res) => {
  sendSuccess(res, await catalogService.removeUser(req.params.id, req.user))
})

export const listPermissions = wrap(async (_req, res) => {
  sendSuccess(res, { permissions: await catalogService.listPermissions() })
})
export const listRoles = wrap(async (_req, res) => {
  sendSuccess(res, { roles: await catalogService.listRoles() })
})
export const createRole = wrap(async (req, res) => {
  sendSuccess(res, { role: await catalogService.createRole(req.body) }, 201)
})
export const updateRole = wrap(async (req, res) => {
  sendSuccess(res, { role: await catalogService.updateRole(req.params.id, req.body) })
})
export const removeRole = wrap(async (req, res) => {
  sendSuccess(res, await catalogService.removeRole(req.params.id))
})
