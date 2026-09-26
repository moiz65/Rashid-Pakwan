import { Router } from 'express'
import authRoutes from './auth.routes.js'
import orderRoutes from './order.routes.js'
import customerRoutes from './customer.routes.js'
import publicRoutes from './public.routes.js'
import settingsRoutes from './settings.routes.js'
import catalogRoutes from './catalog.routes.js'
import reviewRoutes from './review.routes.js'

const router = Router()

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'API is running' })
})

router.use('/auth', authRoutes)
router.use('/orders', orderRoutes)
router.use('/customers', customerRoutes)
router.use('/public', publicRoutes)
router.use('/settings', settingsRoutes)
router.use('/catalog', catalogRoutes)
router.use('/reviews', reviewRoutes)

export default router
