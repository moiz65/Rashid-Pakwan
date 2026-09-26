import { cn } from '@/lib/utils'
import { useAppSelector } from '@/store/hooks'
import { selectBranchNameById } from '@/store/selectors'

export function BranchBadge({ branchId, name, className }) {
  const names = useAppSelector(selectBranchNameById)
  const label = name || (branchId ? names[branchId] : 'All branches') || branchId
  if (!label) return null

  return (
    <span
      className={cn(
        'inline-flex h-5 max-w-full items-center truncate rounded-md bg-violet-500/12 px-1.5 text-[11px] font-medium leading-none text-violet-700 dark:bg-violet-400/15 dark:text-violet-300',
        className,
      )}
      title={label}
    >
      {label}
    </span>
  )
}
