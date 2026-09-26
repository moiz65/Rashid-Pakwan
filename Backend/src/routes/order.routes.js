import { Router } from 'express'
import * as orderController from '../controllers/order.controller.js'
import { authorizeRequest } from '../middleware/authorizeRequest.js'
import { requirePermission } from '../middleware/requirePermission.js'

const router = Router()

router.get('/', authorizeRequest, requirePermission('orders.view'), orderController.list)
router.get('/:id', authorizeRequest, requirePermission('orders.view'), orderController.getById)
router.post('/', authorizeRequest, requirePermission('orders.manage'), orderController.create)
router.patch('/:id/status', authorizeRequest, requirePermission('orders.manage'), orderController.updateStatus)
router.delete('/:id', authorizeRequest, requirePermission('orders.manage'), orderController.remove)

export default router
