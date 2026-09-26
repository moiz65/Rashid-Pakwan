import { Router } from 'express'
import * as publicController from '../controllers/public.controller.js'
import * as reviewController from '../controllers/review.controller.js'

const router = Router()

router.get('/tracking-settings', publicController.getTrackingSettings)
router.post('/orders', publicController.createPublicOrder)
router.get('/orders/:id', publicController.getPublicOrder)
router.get('/orders/:id/review', reviewController.getPublicReviewEligibility)
router.post('/orders/:id/review', reviewController.submitPublicReview)
router.get('/menu', publicController.getPublicMenu)
router.get('/deals', publicController.getPublicDeals)
router.get('/offers', publicController.getPublicOffers)
router.get('/reviews', reviewController.getPublicReviews)
router.get('/shipping-methods', publicController.getPublicShippingMethods)
router.get('/delivery-charges', publicController.getPublicDeliveryChargeSettings)
router.get('/delivery-areas', publicController.getPublicDeliveryAreas)
router.get('/branches', publicController.getPublicBranches)
router.get('/payment-gateways', publicController.getPublicPaymentGateways)
router.post('/coupons/validate', publicController.validateCoupon)
router.post('/checkout/quote', publicController.checkoutQuote)
router.post('/abandoned-carts', publicController.upsertAbandonedCart)
router.post('/abandoned-carts/recover', publicController.recoverAbandonedCart)

export default router
