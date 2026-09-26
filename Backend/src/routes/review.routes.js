import { Router } from 'express'
import { authorizeRequest } from '../middleware/authorizeRequest.js'
import { requirePermission } from '../middleware/requirePermission.js'
import * as reviewController from '../controllers/review.controller.js'

const router = Router()

router.use(authorizeRequest)

router.get('/', requirePermission('products.view'), reviewController.listReviews)
router.patch('/:id', requirePermission('products.manage'), reviewController.updateReview)
router.delete('/:id', requirePermission('products.manage'), reviewController.removeReview)

export default router
