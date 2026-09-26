import { useNavigate } from 'react-router-dom'
import { BellRing } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppSelector } from '@/store/hooks'
import { selectPendingOrders } from '@/store/selectors'
import { formatCurrency, formatOrderId } from '@/lib/formatters'

/**
 * Sticky banner while any order is still pending (not yet received by admin).
 */
export function NewOrderAlerts() {
  const navigate = useNavigate()
  const pending = useAppSelector(selectPendingOrders)

  if (!pending.length) return null

  const latest = [...pending].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )[0]

  return (
    <div
      role="alert"
      className="sticky top-0 z-40 border-b border-amber-600/40 bg-amber-500 text-amber-950 shadow-md"
    >
      <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-950/15 animate-pulse">
            <BellRing className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold leading-tight">
              {pending.length === 1
                ? '1 new order waiting to be received'
                : `${pending.length} new orders waiting to be received`}
            </p>
            <p className="text-sm text-amber-950/80 truncate">
              Latest: {formatOrderId(latest.id)} · {latest.customerName} ·{' '}
              {formatCurrency(latest.total)} — set status to Received to acknowledge.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="secondary"
          className="shrink-0 bg-amber-950 text-amber-50 hover:bg-amber-900"
          onClick={() => navigate('/orders/upcoming')}
        >
          Open incoming orders
        </Button>
      </div>
    </div>
  )
}
