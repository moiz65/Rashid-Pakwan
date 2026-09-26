import * as trackingService from '../services/tracking.service.js'
import * as deliveryChargeService from '../services/deliveryCharge.service.js'
import * as deliveryAreaService from '../services/deliveryArea.service.js'
import { sendSuccess } from '../utils/response.js'

export async function getTrackingSettings(req, res, next) {
  try {
    const settings = await trackingService.getTrackingSettings()
    sendSuccess(res, { settings })
  } catch (err) {
    next(err)
  }
}

export async function updateTrackingSettings(req, res, next) {
  try {
    const settings = await trackingService.updateTrackingSettings(req.body)
    sendSuccess(res, { settings })
  } catch (err) {
    next(err)
  }
}

export async function getDeliveryChargeSettings(req, res, next) {
  try {
    const settings = await deliveryChargeService.getDeliveryChargeSettings()
    sendSuccess(res, { settings })
  } catch (err) {
    next(err)
  }
}

export async function updateDeliveryChargeSettings(req, res, next) {
  try {
    const settings = await deliveryChargeService.updateDeliveryChargeSettings(req.body || {})
    sendSuccess(res, { settings })
  } catch (err) {
    next(err)
  }
}

export async function listDeliveryAreas(req, res, next) {
  try {
    const branchId = req.query?.branchId || null
    const areas = await deliveryAreaService.listDeliveryAreas({
      enabledOnly: false,
      branchId,
    })
    sendSuccess(res, { areas })
  } catch (err) {
    next(err)
  }
}

export async function createDeliveryArea(req, res, next) {
  try {
    const area = await deliveryAreaService.createDeliveryArea(req.body || {})
    sendSuccess(res, { area }, 201)
  } catch (err) {
    next(err)
  }
}

export async function updateDeliveryArea(req, res, next) {
  try {
    const area = await deliveryAreaService.updateDeliveryArea(req.params.id, req.body || {})
    sendSuccess(res, { area })
  } catch (err) {
    next(err)
  }
}

export async function removeDeliveryArea(req, res, next) {
  try {
    const result = await deliveryAreaService.removeDeliveryArea(req.params.id)
    sendSuccess(res, result)
  } catch (err) {
    next(err)
  }
}
