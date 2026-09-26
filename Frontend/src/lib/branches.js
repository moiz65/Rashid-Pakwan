export const ALL_BRANCHES = 'all'
export const PRIMARY_BRANCH_ID = 'br_xyz_karachi'

export function isAllBranches(branchId) {
  return !branchId || branchId === ALL_BRANCHES
}

export function isDemoRecord(record) {
  if (!record) return false
  if (record.isDemo) return true
  const id = String(record.id || '')
  return id.startsWith('demo_')
}

export function getBranchById(branches, branchId) {
  if (!branches?.length || isAllBranches(branchId)) return null
  return branches.find((b) => b.id === branchId) || null
}

export function getPrimaryBranchId(branches) {
  return branches?.find((b) => b.isPrimary)?.id || PRIMARY_BRANCH_ID
}

export function apiBranchParams(branchId) {
  if (isAllBranches(branchId)) return {}
  return { branchId }
}

export function filterByBranch(items, branchId, { includeAllScoped = false } = {}) {
  if (!Array.isArray(items)) return []
  if (isAllBranches(branchId)) return items
  return items.filter((item) => {
    const ids = Array.isArray(item.branchIds) ? item.branchIds.filter(Boolean) : []
    if (ids.length > 0) return ids.includes(branchId)
    if (item.branchId === branchId) return true
    // Catalog/marketing: null branchId means available on every branch
    if (includeAllScoped && (item.branchId == null || item.branchId === '')) return true
    return false
  })
}

export function tagLiveRecords(items, branchId) {
  return (items || []).map((item) => ({
    ...item,
    branchId: item.branchId || branchId,
    isDemo: Boolean(item.isDemo),
  }))
}

export function mergeLiveWithDemo(liveItems, demoItems, primaryBranchId) {
  const taggedLive = tagLiveRecords(liveItems, primaryBranchId)
  const liveIds = new Set(taggedLive.map((item) => item.id))
  if (taggedLive.length > 0) {
    const extraDemo = (demoItems || []).filter(
      (item) => item.branchId !== primaryBranchId && !liveIds.has(item.id),
    )
    return [...taggedLive, ...extraDemo]
  }
  return [...(demoItems || [])]
}
