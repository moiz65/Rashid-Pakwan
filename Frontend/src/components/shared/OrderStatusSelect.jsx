import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'New (unreceived)' },
  { value: 'confirmed', label: 'Received' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
]

const STATUS_CLASS = {
  pending: 'text-yellow-600 dark:text-yellow-400',
  confirmed: 'text-blue-600 dark:text-blue-400',
  preparing: 'text-orange-600 dark:text-orange-400',
  delivered: 'text-green-600 dark:text-green-400',
  rejected: 'text-destructive',
  cancelled: 'text-muted-foreground',
}

/** Allowed next statuses for upcoming orders table */
export function getUpcomingStatusOptions(currentStatus) {
  const base = ORDER_STATUS_OPTIONS.filter((o) => o.value === currentStatus)
  const next = {
    pending: ['confirmed', 'rejected'],
    confirmed: ['preparing', 'rejected'],
    preparing: ['delivered', 'rejected'],
  }[currentStatus] || []

  const extras = ORDER_STATUS_OPTIONS.filter((o) => next.includes(o.value))
  return [...base, ...extras]
}

/** All statuses for manual order create */
export const MANUAL_ORDER_STATUS_OPTIONS = ORDER_STATUS_OPTIONS.filter((o) =>
  ['pending', 'confirmed', 'preparing', 'delivered'].includes(o.value),
)

export function OrderStatusSelect({
  value,
  options = ORDER_STATUS_OPTIONS,
  onChange,
  className,
  disabled = false,
}) {
  const statusClass = STATUS_CLASS[value] || ''

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={cn('h-8 w-[150px] text-xs font-medium', statusClass, className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
