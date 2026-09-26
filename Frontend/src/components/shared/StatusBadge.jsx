import { cn } from '@/lib/utils'

/** Compact SaaS status chips — soft fill, tight padding, no oversized pills. */
const statusConfig = {
  pending: { label: 'New', tone: 'warning' },
  confirmed: { label: 'Received', tone: 'info' },
  preparing: { label: 'Preparing', tone: 'orange' },
  delivered: { label: 'Delivered', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
  active: { label: 'Active', tone: 'success' },
  inactive: { label: 'Inactive', tone: 'neutral' },
  live: { label: 'Live', tone: 'success' },
  scheduled: { label: 'Scheduled', tone: 'info' },
  ended: { label: 'Ended', tone: 'neutral' },
  out_of_stock: { label: 'Out of Stock', tone: 'danger' },
  approved: { label: 'Approved', tone: 'success' },
  recovered: { label: 'Recovered', tone: 'success' },
  abandoned: { label: 'Abandoned', tone: 'warning' },
  admin: { label: 'Admin', tone: 'info' },
  website: { label: 'Website', tone: 'purple' },
  manager: { label: 'Manager', tone: 'info' },
  staff: { label: 'Staff', tone: 'neutral' },
}

const tones = {
  success:
    'bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-400',
  warning:
    'bg-amber-500/12 text-amber-700 dark:bg-amber-400/15 dark:text-amber-400',
  danger:
    'bg-red-500/12 text-red-700 dark:bg-red-400/15 dark:text-red-400',
  info:
    'bg-blue-500/12 text-blue-700 dark:bg-blue-400/15 dark:text-blue-400',
  orange:
    'bg-orange-500/12 text-orange-700 dark:bg-orange-400/15 dark:text-orange-400',
  purple:
    'bg-violet-500/12 text-violet-700 dark:bg-violet-400/15 dark:text-violet-400',
  neutral:
    'bg-muted text-muted-foreground',
}

export function StatusBadge({ status, className }) {
  const key = String(status || '').toLowerCase()
  const config = statusConfig[key] || {
    label: String(status || '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    tone: 'neutral',
  }

  return (
    <span
      className={cn(
        'inline-flex h-5 max-w-full items-center truncate rounded-md px-1.5 text-[11px] font-medium leading-none tracking-wide',
        tones[config.tone] || tones.neutral,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
