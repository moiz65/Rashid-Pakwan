import { Router } from 'express'
import { authorizeRequest } from '../middleware/authorizeRequest.js'
import { requirePermission } from '../middleware/requirePermission.js'
import { uploadImage } from '../middleware/upload.js'
import * as catalog from '../controllers/catalog.controller.js'

const router = Router()

router.use(authorizeRequest)

router.post(
  '/upload',
  requirePermission('products.manage', 'marketing.manage', 'settings.manage', 'branches.manage'),
  (req, res, next) => {
    uploadImage(req, res, (err) => {
      if (err) return next(err)
      return catalog.uploadCatalogImage(req, res, next)
    })
  }
)

router.post(
  '/generate-image',
  requirePermission('products.manage', 'marketing.manage'),
  catalog.generateCatalogImage
)

router.get('/categories', requirePermission('products.view'), catalog.listCategories)
router.post('/categories', requirePermission('products.manage'), catalog.createCategory)
router.patch('/categories/:id', requirePermission('products.manage'), catalog.updateCategory)
router.delete('/categories/:id', requirePermission('products.manage'), catalog.removeCategory)

router.get('/brands', requirePermission('products.view'), catalog.listBrands)
router.post('/brands', requirePermission('products.manage'), catalog.createBrand)
router.patch('/brands/:id', requirePermission('products.manage'), catalog.updateBrand)
router.delete('/brands/:id', requirePermission('products.manage'), catalog.removeBrand)

router.get('/addons', requirePermission('products.view'), catalog.listAddons)
router.post('/addons', requirePermission('products.manage'), catalog.createAddon)
router.patch('/addons/:id', requirePermission('products.manage'), catalog.updateAddon)
router.delete('/addons/:id', requirePermission('products.manage'), catalog.removeAddon)

router.get('/drinks', requirePermission('products.view'), catalog.listDrinks)
router.post('/drinks', requirePermission('products.manage'), catalog.createDrink)
router.patch('/drinks/:id', requirePermission('products.manage'), catalog.updateDrink)
router.delete('/drinks/:id', requirePermission('products.manage'), catalog.removeDrink)

router.get('/products', requirePermission('products.view'), catalog.listProducts)
router.post('/products', requirePermission('products.manage'), catalog.createProduct)
router.patch('/products/:id', requirePermission('products.manage'), catalog.updateProduct)
router.delete('/products/:id', requirePermission('products.manage'), catalog.removeProduct)

router.get('/reviews', requirePermission('products.view'), catalog.listReviews)
router.post('/reviews', requirePermission('products.manage'), catalog.createReview)
router.patch('/reviews/:id', requirePermission('products.manage'), catalog.updateReview)
router.delete('/reviews/:id', requirePermission('products.manage'), catalog.removeReview)

router.get('/coupons', requirePermission('marketing.view'), catalog.listCoupons)
router.post('/coupons', requirePermission('marketing.manage'), catalog.createCoupon)
router.patch('/coupons/:id', requirePermission('marketing.manage'), catalog.updateCoupon)
router.delete('/coupons/:id', requirePermission('marketing.manage'), catalog.removeCoupon)

router.get('/discounts', requirePermission('marketing.view'), catalog.listDiscounts)
router.post('/discounts', requirePermission('marketing.manage'), catalog.createDiscount)
router.patch('/discounts/:id', requirePermission('marketing.manage'), catalog.updateDiscount)
router.delete('/discounts/:id', requirePermission('marketing.manage'), catalog.removeDiscount)

router.get('/offers', requirePermission('marketing.view'), catalog.listOffers)
router.post('/offers', requirePermission('marketing.manage'), catalog.createOffer)
router.patch('/offers/:id', requirePermission('marketing.manage'), catalog.updateOffer)
router.delete('/offers/:id', requirePermission('marketing.manage'), catalog.removeOffer)

router.get('/deals', requirePermission('marketing.view'), catalog.listDeals)
router.post('/deals', requirePermission('marketing.manage'), catalog.createDeal)
router.patch('/deals/:id', requirePermission('marketing.manage'), catalog.updateDeal)
router.delete('/deals/:id', requirePermission('marketing.manage'), catalog.removeDeal)

router.get('/payment-gateways', requirePermission('settings.view'), catalog.listPaymentGateways)
router.post('/payment-gateways', requirePermission('settings.manage'), catalog.createPaymentGateway)
router.patch('/payment-gateways/:id', requirePermission('settings.manage'), catalog.updatePaymentGateway)
router.delete('/payment-gateways/:id', requirePermission('settings.manage'), catalog.removePaymentGateway)

router.get('/shipping-methods', requirePermission('settings.view'), catalog.listShippingMethods)
router.post('/shipping-methods', requirePermission('settings.manage'), catalog.createShippingMethod)
router.patch('/shipping-methods/:id', requirePermission('settings.manage'), catalog.updateShippingMethod)
router.delete('/shipping-methods/:id', requirePermission('settings.manage'), catalog.removeShippingMethod)

router.get('/branches', catalog.listBranches)
router.post('/branches', requirePermission('branches.manage'), catalog.createBranch)
router.patch('/branches/:id', requirePermission('branches.manage'), catalog.updateBranch)
router.delete('/branches/:id', requirePermission('branches.manage'), catalog.removeBranch)

router.get('/carts', requirePermission('abandoned_carts.view'), catalog.listCarts)
router.post('/carts', requirePermission('abandoned_carts.manage'), catalog.createCart)
router.patch('/carts/:id', requirePermission('abandoned_carts.manage'), catalog.updateCart)
router.delete('/carts/:id', requirePermission('abandoned_carts.manage'), catalog.removeCart)

router.get('/tax-codes', requirePermission('settings.view', 'products.view', 'marketing.view'), catalog.listTaxCodes)
router.post('/tax-codes', requirePermission('settings.manage'), catalog.createTaxCode)
router.patch('/tax-codes/:id', requirePermission('settings.manage'), catalog.updateTaxCode)
router.delete('/tax-codes/:id', requirePermission('settings.manage'), catalog.removeTaxCode)

router.get('/users', requirePermission('users.view'), catalog.listUsers)
router.post('/users', requirePermission('users.manage'), catalog.createUser)
router.patch('/users/:id', requirePermission('users.manage'), catalog.updateUser)
router.delete('/users/:id', requirePermission('users.manage'), catalog.removeUser)

router.get('/permissions', requirePermission('roles.view', 'users.manage'), catalog.listPermissions)
router.get('/roles', requirePermission('roles.view', 'users.manage'), catalog.listRoles)
router.post('/roles', requirePermission('roles.manage'), catalog.createRole)
router.patch('/roles/:id', requirePermission('roles.manage'), catalog.updateRole)
router.delete('/roles/:id', requirePermission('roles.manage'), catalog.removeRole)

export default router
