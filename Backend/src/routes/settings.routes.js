import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { requirePermission } from '../middleware/requirePermission.js'
import * as settingsController from '../controllers/settings.controller.js'
import * as reviewController from '../controllers/review.controller.js'

const router = Router()

router.get('/tracking', authenticate, requirePermission('settings.view'), settingsController.getTrackingSettings)
router.patch('/tracking', authenticate, requirePermission('settings.manage'), settingsController.updateTrackingSettings)

router.get(
  '/delivery-charges',
  authenticate,
  requirePermission('settings.view'),
  settingsController.getDeliveryChargeSettings
)
router.patch(
  '/delivery-charges',
  authenticate,
  requirePermission('settings.manage'),
  settingsController.updateDeliveryChargeSettings
)

router.get(
  '/delivery-areas',
  authenticate,
  requirePermission('settings.view'),
  settingsController.listDeliveryAreas
)
router.post(
  '/delivery-areas',
  authenticate,
  requirePermission('settings.manage'),
  settingsController.createDeliveryArea
)
router.patch(
  '/delivery-areas/:id',
  authenticate,
  requirePermission('settings.manage'),
  settingsController.updateDeliveryArea
)
router.delete(
  '/delivery-areas/:id',
  authenticate,
  requirePermission('settings.manage'),
  settingsController.removeDeliveryArea
)

router.get('/reviews', authenticate, requirePermission('settings.view'), reviewController.getReviewSettings)
router.patch('/reviews', authenticate, requirePermission('settings.manage'), reviewController.updateReviewSettings)

export default router
