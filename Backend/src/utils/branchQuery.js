/** Parse optional branchId from query string (?branchId=...). */
export function parseBranchId(query = {}) {
  const id = query.branchId
  if (!id || id === 'all') return null
  return String(id)
}

/**
 * Normalize branch scope from create/update payloads.
 * null / '' / 'all' → all branches (stored as NULL).
 * undefined → leave unchanged (caller decides).
 */
export function parseBranchScope(value) {
  if (value === undefined) return undefined
  if (value === null || value === '' || value === 'all') return null
  return String(value)
}

/**
 * Catalog & marketing rows: NULL branch_id means the item is available on every branch.
 * Exact match only (orders/customers/carts) should not use this.
 */
export function catalogBranchClause(column, branchId, { leading = 'AND' } = {}) {
  if (!branchId) return { sql: '', params: {} }
  return {
    sql: ` ${leading} (${column} = :branchId OR ${column} IS NULL)`,
    params: { branchId },
  }
}

/**
 * Categories with optional multi-branch JSON `branch_ids`.
 * Show when: branch_ids null/empty and legacy branch_id matches/null,
 * OR branch_ids contains the requested branchId.
 */
export function categoryBranchClause(tableAlias, branchId, { leading = 'AND' } = {}) {
  if (!branchId) return { sql: '', params: {} }
  const a = tableAlias
  return {
    sql: ` ${leading} (
      (
        ${a}.branch_ids IS NOT NULL
        AND JSON_LENGTH(${a}.branch_ids) > 0
        AND JSON_CONTAINS(${a}.branch_ids, JSON_QUOTE(:branchId))
      )
      OR (
        (${a}.branch_ids IS NULL OR JSON_LENGTH(COALESCE(${a}.branch_ids, JSON_ARRAY())) = 0)
        AND (${a}.branch_id = :branchId OR ${a}.branch_id IS NULL)
      )
    )`,
    params: { branchId },
  }
}
