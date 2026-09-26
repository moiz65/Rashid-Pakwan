import * as deliveryAreaModel from '../models/deliveryArea.model.js'
import { findAllBranches } from '../models/catalog.model.js'
import { KARACHI_AREAS, areaSlug } from '../constants/karachiAreas.js'
import { newId } from '../utils/ids.js'
import { ApiError } from '../utils/response.js'

const DEFAULT_CHARGE = 149

function areaIdForBranch(branchId, name) {
  const slug = areaSlug(name)
  const short = String(branchId || 'br')
    .replace(/^br_/, '')
    .replace(/[^a-z0-9]+/gi, '_')
    .slice(0, 24)
  return `da_${short}_${slug}`.slice(0, 64)
}

export async function ensureKarachiAreasSeeded(branchId = null) {
  const branches = await findAllBranches()
  const targets = branchId
    ? branches.filter((b) => b.id === branchId)
    : branches.filter((b) => b.status !== 'inactive')

  if (!targets.length && branchId) {
    // Branch may exist but not yet in findAll — still seed for given id
    targets.push({ id: branchId, name: branchId })
  }

  let total = 0
  for (const branch of targets) {
    const count = await deliveryAreaModel.countDeliveryAreas(branch.id)
    if (count > 0) {
      total += count
      continue
    }
    const rows = KARACHI_AREAS.map((name, index) => ({
      id: areaIdForBranch(branch.id, name),
      branchId: branch.id,
      name,
      slug: areaSlug(name),
      charge: DEFAULT_CHARGE,
      sortOrder: index + 1,
      enabled: true,
    }))
    await deliveryAreaModel.insertDeliveryAreas(rows)
    total += rows.length
  }
  return total
}

export async function listDeliveryAreas({ enabledOnly = false, branchId = null } = {}) {
  if (branchId) {
    await ensureKarachiAreasSeeded(branchId)
  } else {
    await ensureKarachiAreasSeeded()
  }
  return deliveryAreaModel.findAllDeliveryAreas({ enabledOnly, branchId })
}

export async function getDeliveryArea(id) {
  const area = await deliveryAreaModel.findDeliveryAreaById(id)
  if (!area) throw new ApiError(404, 'Delivery area not found')
  return area
}

export async function updateDeliveryArea(id, body = {}) {
  const existing = await deliveryAreaModel.findDeliveryAreaById(id)
  if (!existing) throw new ApiError(404, 'Delivery area not found')
  const updated = await deliveryAreaModel.updateDeliveryArea(id, {
    name: body.name,
    charge: body.charge,
    sortOrder: body.sortOrder,
    enabled: body.enabled,
  })
  return updated
}

export async function createDeliveryArea(body = {}) {
  const name = String(body.name || '').trim()
  if (!name) throw new ApiError(400, 'Area name is required')
  const branchId = body.branchId || null
  if (!branchId) throw new ApiError(400, 'branchId is required — areas are per branch')
  const slug = areaSlug(name)
  const id = body.id || areaIdForBranch(branchId, name) || newId('da')
  const existing = await deliveryAreaModel.findDeliveryAreaById(id)
  if (existing) throw new ApiError(409, 'Delivery area already exists for this branch')
  return deliveryAreaModel.createDeliveryArea({
    id,
    branchId,
    name,
    slug,
    charge: body.charge != null ? Number(body.charge) : DEFAULT_CHARGE,
    sortOrder: body.sortOrder != null ? Number(body.sortOrder) : 9999,
    enabled: body.enabled !== false,
  })
}

export async function removeDeliveryArea(id) {
  const existing = await deliveryAreaModel.findDeliveryAreaById(id)
  if (!existing) throw new ApiError(404, 'Delivery area not found')
  await deliveryAreaModel.deleteDeliveryArea(id)
  return { id }
}
