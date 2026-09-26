import {
  findDeliveryChargeSettings,
  upsertDeliveryChargeSettings,
} from '../models/deliveryCharge.model.js'

export async function getDeliveryChargeSettings() {
  return findDeliveryChargeSettings()
}

export async function updateDeliveryChargeSettings(body = {}) {
  const existing = await findDeliveryChargeSettings()
  return upsertDeliveryChargeSettings({
    fuelSurchargeFixed:
      body.fuelSurchargeFixed !== undefined
        ? body.fuelSurchargeFixed
        : existing.fuelSurchargeFixed,
    fuelSurchargePercent:
      body.fuelSurchargePercent !== undefined
        ? body.fuelSurchargePercent
        : existing.fuelSurchargePercent,
    freeDeliveryMinOrder:
      body.freeDeliveryMinOrder !== undefined
        ? body.freeDeliveryMinOrder
        : existing.freeDeliveryMinOrder,
    enabled: body.enabled !== undefined ? body.enabled : existing.enabled,
    notes: body.notes !== undefined ? body.notes : existing.notes,
  })
}

/** Pass-through fee (fuel surcharge UI removed). Free-delivery offers still handled in pricing. */
export function applyDeliveryChargeRules(baseFee, _settings, { subtotal: _subtotal = 0 } = {}) {
  const base = Number(baseFee) || 0
  const fee = Math.round(base * 100) / 100
  return {
    base,
    fuelFixed: 0,
    fuelPercent: 0,
    fuelAmount: 0,
    fee,
    freeDeliveryApplied: false,
    freeDeliveryReason: null,
  }
}
