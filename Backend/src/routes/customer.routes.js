import { Router } from 'express'
import * as customerController from '../controllers/customer.controller.js'
import { authorizeRequest } from '../middleware/authorizeRequest.js'
import { requirePermission } from '../middleware/requirePermission.js'

const router = Router()

router.get('/', authorizeRequest, requirePermission('customers.view'), customerController.list)
router.get('/:id', authorizeRequest, requirePermission('customers.view'), customerController.getById)
router.post('/', authorizeRequest, requirePermission('customers.manage'), customerController.create)
router.patch('/:id', authorizeRequest, requirePermission('customers.manage'), customerController.update)
router.delete('/:id', authorizeRequest, requirePermission('customers.manage'), customerController.remove)

export default router
