import { Check, Layers, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setSelectedBranchId } from '@/store/slices/branchesSlice'
import {
  selectAccessibleActiveBranches,
  selectCurrentUser,
  selectIsAllBranches,
  selectSelectedBranchId,
} from '@/store/selectors'
import { ALL_BRANCHES } from '@/lib/branches'

export function BranchSwitcher() {
  const dispatch = useAppDispatch()
  const branches = useAppSelector(selectAccessibleActiveBranches)
  const user = useAppSelector(selectCurrentUser)
  const selectedId = useAppSelector(selectSelectedBranchId)
  const allMode = useAppSelector(selectIsAllBranches)

  const assignedIds = Array.isArray(user?.branchIds) ? user.branchIds.filter(Boolean) : []
  const isHqUser = user?.role === 'admin' || assignedIds.length === 0
  const visibleBranches = branches
  const canViewAll = isHqUser || assignedIds.length > 1
  const current = visibleBranches.find((b) => b.id === selectedId)

  const select = (id) => {
    dispatch(setSelectedBranchId(id))
    if (id === ALL_BRANCHES) {
      toast.success('Viewing all locations combined')
      return
    }
    const branch = branches.find((b) => b.id === id)
    toast.success(`Switched to ${branch?.name || 'branch'}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 max-w-[220px] gap-2 px-2.5">
          {allMode ? (
            <Layers className="h-3.5 w-3.5 shrink-0 text-primary" />
          ) : (
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
          )}
          <span className="truncate text-xs font-medium">
            {allMode ? 'All locations' : current?.name || 'Select branch'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center justify-between gap-3 font-normal">
          <div>
            <p className="text-sm font-medium">All locations</p>
            <p className="text-xs text-muted-foreground">Combined view across every branch</p>
          </div>
          {canViewAll ? (
            <Switch
              checked={allMode}
              onCheckedChange={(checked) => {
                if (checked) select(ALL_BRANCHES)
                else select(visibleBranches[0]?.id || ALL_BRANCHES)
              }}
            />
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-72 overflow-auto p-1">
          {visibleBranches.map((branch) => {
            const active = !allMode && selectedId === branch.id
            return (
              <button
                key={branch.id}
                type="button"
                onClick={() => select(branch.id)}
                className="flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-accent"
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate font-medium">{branch.name}</span>
                    {branch.isPrimary ? (
                      <span className="rounded bg-muted px-1 text-[10px] text-muted-foreground">Primary</span>
                    ) : (
                      <span className="rounded bg-muted px-1 text-[10px] text-muted-foreground">Live</span>
                    )}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {branch.city} · {branch.address}
                  </span>
                </span>
                {active ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> : null}
              </button>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
