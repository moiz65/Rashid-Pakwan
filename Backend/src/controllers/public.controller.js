import * as trackingService from '../services/tracking.service.js'
import * as catalogService from '../services/catalog.service.js'
import * as pricingService from '../services/pricing.service.js'
import * as orderService from '../services/order.service.js'
import { sendSuccess } from '../utils/response.js'

export async function getTrackingSettings(req, res, next) {
  try {
    const settings = await trackingService.getPublicTrackingSettings()
    sendSuccess(res, { settings })
  } catch (err) {
    next(err)
  }
}

export async function getPublicOrder(req, res, next) {
  try {
    const order = await trackingService.getPublicOrder(req.params.id, req.query.phone)
    sendSuccess(res, { order })
  } catch (err) {
    next(err)
  }
}

export async function createPublicOrder(req, res, next) {
  try {
    const order = await orderService.createOrder({
      ...req.body,
      source: 'website',
    })
    sendSuccess(res, { order }, 201)
  } catch (err) {
    next(err)
  }
}

export async function getPublicMenu(req, res, next) {
  try {
    const menu = await catalogService.getPublicMenu(req.query)
    sendSuccess(res, menu)
  } catch (err) {
    next(err)
  }
}

export async function getPublicDeals(req, res, next) {
  try {
    const deals = await catalogService.getPublicDeals(req.query)
    sendSuccess(res, { deals })
  } catch (err) {
    next(err)
  }
}

export async function getPublicOffers(req, res, next) {
  try {
    const offers = await catalogService.getPublicOffers(req.query)
    sendSuccess(res, { offers })
  } catch (err) {
    next(err)
  }
}

export async function getPublicShippingMethods(req, res, next) {
  try {
    const shippingMethods = await catalogService.getPublicShippingMethods()
    sendSuccess(res, { shippingMethods })
  } catch (err) {
    next(err)
  }
}

export async function getPublicDeliveryChargeSettings(req, res, next) {
  try {
    const { getDeliveryChargeSettings } = await import('../services/deliveryCharge.service.js')
    const settings = await getDeliveryChargeSettings()
    sendSuccess(res, {
      settings: {
        fuelSurchargeFixed: settings.fuelSurchargeFixed,
        fuelSurchargePercent: settings.fuelSurchargePercent,
        freeDeliveryMinOrder: settings.freeDeliveryMinOrder,
        enabled: settings.enabled,
        notes: settings.notes,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function getPublicDeliveryAreas(req, res, next) {
  try {
    const { listDeliveryAreas } = await import('../services/deliveryArea.service.js')
    const branchId = req.query?.branchId || null
    if (!branchId) {
      return sendSuccess(res, { areas: [] })
    }
    const areas = await listDeliveryAreas({ enabledOnly: true, branchId })
    sendSuccess(res, {
      areas: areas.map((a) => ({
        id: a.id,
        name: a.name,
        charge: a.charge,
        sortOrder: a.sortOrder,
        branchId: a.branchId,
      })),
    })
  } catch (err) {
    next(err)
  }
}

export async function getPublicBranches(req, res, next) {
  try {
    const branches = await catalogService.getPublicBranches()
    sendSuccess(res, { branches })
  } catch (err) {
    next(err)
  }
}

export async function getPublicPaymentGateways(req, res, next) {
  try {
    const paymentGateways = await catalogService.getPublicPaymentGateways()
    sendSuccess(res, { paymentGateways })
  } catch (err) {
    next(err)
  }
}

export async function validateCoupon(req, res, next) {
  try {
    const result = await pricingService.validateCouponCode(
      req.body?.code,
      Number(req.body?.subtotal) || 0
    )
    sendSuccess(res, result)
  } catch (err) {
    next(err)
  }
}

export async function checkoutQuote(req, res, next) {
  try {
    const quote = await pricingService.quoteCart({
      items: req.body?.items,
      couponCode: req.body?.couponCode,
      trustClientPrices: false,
      deliveryType: req.body?.deliveryType || 'delivery',
      shippingMethodId: req.body?.shippingMethodId || null,
      deliveryAreaId: req.body?.deliveryAreaId || null,
    })
    sendSuccess(res, { quote })
  } catch (err) {
    next(err)
  }
}

export async function upsertAbandonedCart(req, res, next) {
  try {
    const cart = await catalogService.upsertPublicAbandonedCart(req.body || {})
    sendSuccess(res, { cart })
  } catch (err) {
    next(err)
  }
}

export async function recoverAbandonedCart(req, res, next) {
  try {
    const cart = await catalogService.recoverPublicAbandonedCart({
      sessionKey: req.body?.sessionKey,
      email: req.body?.email,
    })
    sendSuccess(res, { cart })
  } catch (err) {
    next(err)
  }
}
