import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppSelector } from '@/store/hooks'
import {
  selectActiveBranches,
  selectIsAllBranches,
  selectSelectedBranchId,
} from '@/store/selectors'
import { ALL_BRANCHES } from '@/lib/branches'

export const BRANCH_SCOPE_ALL = ALL_BRANCHES

/** Default scope when opening a create form. */
export function defaultBranchScopeValue() {
  // Read via hooks in the form; this helper is for non-hook defaults only.
  return BRANCH_SCOPE_ALL
}

export function useDefaultBranchScope() {
  const selected = useAppSelector(selectSelectedBranchId)
  const allMode = useAppSelector(selectIsAllBranches)
  return allMode ? BRANCH_SCOPE_ALL : selected
}

/** Convert form value → API branchId (null = all branches). */
export function branchScopeToApi(value) {
  if (!value || value === BRANCH_SCOPE_ALL) return null
  return value
}

/** Convert stored branchId → form select value. */
export function branchScopeFromRecord(branchId) {
  return branchId || BRANCH_SCOPE_ALL
}

/**
 * Multi-branch form state from API record.
 * Returns [] for all branches; otherwise selected branch id list.
 */
export function branchIdsFromRecord(branchId, branchIds) {
  const ids = Array.isArray(branchIds) ? branchIds.filter(Boolean) : []
  if (ids.length > 0) return ids
  if (branchId) return [branchId]
  return []
}

/**
 * Form branch ids → API payload.
 * Empty = all branches (null / null). Single → branchId set. Multiple → branchId null.
 */
export function branchIdsToApi(selectedIds = []) {
  const ids = (selectedIds || []).filter(Boolean)
  if (!ids.length) return { branchId: null, branchIds: null }
  if (ids.length === 1) return { branchId: ids[0], branchIds: ids }
  return { branchId: null, branchIds: ids }
}

export function useDefaultBranchIds() {
  const selected = useAppSelector(selectSelectedBranchId)
  const allMode = useAppSelector(selectIsAllBranches)
  return allMode ? [] : selected ? [selected] : []
}

export function BranchScopeField({ value, onChange, disabled = false }) {
  const branches = useAppSelector(selectActiveBranches)

  return (
    <div className="grid gap-2">
      <Label>Branch</Label>
      <Select
        value={value || BRANCH_SCOPE_ALL}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select branch" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={BRANCH_SCOPE_ALL}>All branches</SelectItem>
          {branches.map((b) => (
            <SelectItem key={b.id} value={b.id}>
              {b.name}
              {b.isPrimary ? ' (primary)' : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        All branches shows this item everywhere. Selected branch limits it to that location.
      </p>
    </div>
  )
}

/** Multi-checkbox branch picker: All branches OR one/more specific branches. */
export function BranchMultiScopeField({ value = [], onChange, disabled = false }) {
  const branches = useAppSelector(selectActiveBranches)
  const selected = Array.isArray(value) ? value.filter(Boolean) : []
  const allMode = selected.length === 0

  const setAll = () => onChange?.([])

  const toggle = (id, checked) => {
    const set = new Set(selected)
    if (checked) set.add(id)
    else set.delete(id)
    onChange?.([...set])
  }

  return (
    <div className="grid gap-2">
      <Label>Branches</Label>
      <div className="rounded-lg border p-3 space-y-2">
        <label className="flex items-center gap-2 text-sm cursor-pointer font-medium">
          <Checkbox
            checked={allMode}
            disabled={disabled}
            onCheckedChange={(checked) => {
              if (checked) setAll()
              else if (branches[0]) onChange?.([branches[0].id])
            }}
          />
          <span>All branches</span>
        </label>
        {!allMode ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {branches.map((b) => (
              <label
                key={b.id}
                className="flex items-center gap-2 rounded border bg-card p-2 text-xs font-medium cursor-pointer hover:bg-accent"
              >
                <Checkbox
                  checked={selected.includes(b.id)}
                  disabled={disabled}
                  onCheckedChange={(checked) => toggle(b.id, Boolean(checked))}
                />
                <span className="truncate">{b.name}</span>
                {b.isPrimary ? (
                  <span className="ml-auto text-[10px] text-muted-foreground">Primary</span>
                ) : null}
              </label>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Shown on every branch. Uncheck All to pick specific locations.
          </p>
        )}
      </div>
    </div>
  )
}
