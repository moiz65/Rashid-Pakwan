import { useCallback, useEffect, useState, Fragment } from 'react'
import { toast } from 'sonner'
import { Check, ChevronDown, ChevronRight, Loader2, X } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAppSelector } from '@/store/hooks'
import { selectAuth, selectSelectedBranchId } from '@/store/selectors'
import { formatRelative } from '@/lib/formatters'
import { apiBranchParams } from '@/lib/branches'
import {
  deleteOrderReviewRequest,
  fetchOrderReviews,
  updateOrderReviewRequest,
} from '@/lib/api'
import { usePermission } from '@/hooks/usePermission'

function shortOrderId(id) {
  if (!id) return '—'
  const parts = String(id).split('_')
  const short = parts.length > 1 ? parts[parts.length - 1] : id
  return `#${short.slice(0, 8)}`
}

function Stars({ rating }) {
  const n = Number(rating) || 0
  return (
    <span className="text-amber-500 tracking-tight" title={`${n}/5`}>
      {'★'.repeat(n)}
      <span className="text-muted-foreground/40">{'★'.repeat(Math.max(0, 5 - n))}</span>
    </span>
  )
}

export default function ReviewsPage() {
  const { token } = useAppSelector(selectAuth)
  const selectedBranchId = useAppSelector(selectSelectedBranchId)
  const { canManage } = usePermission()
  const canEdit = canManage('products')

  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState({})
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await fetchOrderReviews(token, apiBranchParams(selectedBranchId))
      setReviews(data || [])
    } catch (err) {
      toast.error(err.message || 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }, [token, selectedBranchId])

  useEffect(() => {
    load()
  }, [load])

  const setStatus = async (id, status) => {
    setBusyId(id)
    try {
      const review = await updateOrderReviewRequest(token, id, { status })
      setReviews((prev) => prev.map((r) => (r.id === id ? review : r)))
      toast.success(status === 'approved' ? 'Review approved' : 'Review rejected')
    } catch (err) {
      toast.error(err.message || 'Failed to update review')
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (id) => {
    setBusyId(id)
    try {
      await deleteOrderReviewRequest(token, id)
      setReviews((prev) => prev.filter((r) => r.id !== id))
      toast.success('Review deleted')
    } catch (err) {
      toast.error(err.message || 'Failed to delete review')
    } finally {
      setBusyId(null)
    }
  }

  const filtered = reviews.filter((r) =>
    String(r.customerName ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <PageHeader
        title="Order Reviews"
        description="Moderate customer reviews from order tracking and future invite channels"
      />

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading reviews…
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Input
              placeholder="Search by customer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Overall</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No order reviews yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => {
                    const hasItems = r.items?.length > 0
                    const open = expanded[r.id]
                    return (
                      <Fragment key={r.id}>
                        <TableRow>
                          <TableCell>
                            {hasItems ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() =>
                                  setExpanded((prev) => ({ ...prev, [r.id]: !prev[r.id] }))
                                }
                              >
                                {open ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            ) : null}
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs">{shortOrderId(r.orderId)}</span>
                          </TableCell>
                          <TableCell>{r.customerName}</TableCell>
                          <TableCell>
                            <Stars rating={r.overallRating} />
                          </TableCell>
                          <TableCell>
                            <span className="max-w-xs truncate block">{r.comment || '—'}</span>
                          </TableCell>
                          <TableCell className="text-sm">
                            {hasItems ? (
                              <span className="max-w-[180px] truncate block" title={r.items.map((i) => i.productName).join(', ')}>
                                {r.items.map((i) => i.productName).join(', ')}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="capitalize text-sm">{r.source || 'tracking'}</TableCell>
                          <TableCell>
                            <StatusBadge status={r.status} />
                          </TableCell>
                          <TableCell>{formatRelative(r.createdAt)}</TableCell>
                          <TableCell>
                            {canEdit ? (
                              <div className="flex gap-1">
                                {r.status === 'pending' && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      disabled={busyId === r.id}
                                      onClick={() => setStatus(r.id, 'approved')}
                                    >
                                      <Check className="h-4 w-4 text-green-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      disabled={busyId === r.id}
                                      onClick={() => setStatus(r.id, 'rejected')}
                                    >
                                      <X className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive"
                                  disabled={busyId === r.id}
                                  onClick={() => remove(r.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            ) : null}
                          </TableCell>
                        </TableRow>
                        {open && hasItems && (
                          <TableRow>
                            <TableCell colSpan={10} className="bg-muted/40 py-3">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                Product ratings
                              </p>
                              <div className="space-y-1.5 pl-2">
                                {r.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between gap-4 text-sm max-w-md"
                                  >
                                    <span>{item.productName}</span>
                                    <Stars rating={item.rating} />
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
