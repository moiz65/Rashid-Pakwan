import { useCallback, useEffect, useMemo, useState, Fragment } from 'react'
import { toast } from 'sonner'
import { Check, ChevronDown, ChevronRight, Loader2, X } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
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

  // ---- Selection state ----
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkBusy, setBulkBusy] = useState(false)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await fetchOrderReviews(token, apiBranchParams(selectedBranchId))
      setReviews(data || [])
      setSelectedIds([])
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
      setSelectedIds((prev) => prev.filter((x) => x !== id))
      toast.success('Review deleted')
    } catch (err) {
      toast.error(err.message || 'Failed to delete review')
    } finally {
      setBusyId(null)
    }
  }

  const filtered = useMemo(
    () =>
      reviews.filter((r) =>
        String(r.customerName ?? '').toLowerCase().includes(search.toLowerCase()),
      ),
    [reviews, search],
  )

  // ---- Selection helpers ----
  const visibleIds = useMemo(() => filtered.map((r) => r.id), [filtered])
  const selectedVisibleCount = useMemo(
    () => visibleIds.filter((id) => selectedIds.includes(id)).length,
    [visibleIds, selectedIds],
  )
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected

  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])))
    } else {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)))
    }
  }

  const toggleSelectOne = (id, checked) => {
    setSelectedIds((prev) =>
      checked ? Array.from(new Set([...prev, id])) : prev.filter((x) => x !== id),
    )
  }

  const clearSelection = () => setSelectedIds([])

  // ---- Bulk actions ----
  const selectedReviews = useMemo(
    () => reviews.filter((r) => selectedIds.includes(r.id)),
    [reviews, selectedIds],
  )

  const handleBulkStatus = async (status) => {
    if (!token || selectedIds.length === 0) return
    // Only update reviews that aren't already in the target status
    const targets = selectedReviews.filter((r) => r.status !== status)
    if (targets.length === 0) {
      toast.info(`All selected reviews are already ${status}`)
      return
    }
    setBulkBusy(true)
    const results = await Promise.allSettled(
      targets.map((r) => updateOrderReviewRequest(token, r.id, { status })),
    )
    let ok = 0
    let failed = 0
    const updates = new Map()
    results.forEach((res, idx) => {
      if (res.status === 'fulfilled') {
        ok += 1
        updates.set(targets[idx].id, res.value)
      } else {
        failed += 1
      }
    })
    if (updates.size) {
      setReviews((prev) => prev.map((r) => (updates.has(r.id) ? updates.get(r.id) : r)))
    }
    setBulkBusy(false)
    clearSelection()
    const label = status === 'approved' ? 'approved' : 'rejected'
    if (ok > 0 && failed === 0) toast.success(`${ok} review${ok === 1 ? '' : 's'} ${label}`)
    else if (ok > 0 && failed > 0) toast.error(`${ok} ${label}, failed ${failed}`)
    else toast.error(`Failed to ${label === 'approved' ? 'approve' : 'reject'} selected reviews`)
  }

  const handleBulkDelete = async () => {
    if (!token || selectedIds.length === 0) return
    setBulkBusy(true)
    const ids = [...selectedIds]
    const results = await Promise.allSettled(
      ids.map((id) => deleteOrderReviewRequest(token, id)),
    )
    let ok = 0
    let failed = 0
    const deleted = new Set()
    results.forEach((res, idx) => {
      if (res.status === 'fulfilled') {
        ok += 1
        deleted.add(ids[idx])
      } else {
        failed += 1
      }
    })
    if (deleted.size) {
      setReviews((prev) => prev.filter((r) => !deleted.has(r.id)))
    }
    setBulkBusy(false)
    setBulkDeleteOpen(false)
    clearSelection()
    if (ok > 0 && failed === 0) toast.success(`Deleted ${ok} review${ok === 1 ? '' : 's'}`)
    else if (ok > 0 && failed > 0) toast.error(`Deleted ${ok}, failed ${failed}`)
    else toast.error('Failed to delete selected reviews')
  }

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

          {/* Select-all / bulk-actions bar */}
          {canEdit && visibleIds.length > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <Checkbox
                  checked={allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false}
                  onCheckedChange={(v) => toggleSelectAll(v === true)}
                  aria-label="Select all reviews"
                />
                <span>Select all</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {selectedVisibleCount} of {visibleIds.length} selected
                </span>
              </label>
              {selectedIds.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {selectedIds.length} selected
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={bulkBusy}
                    onClick={clearSelection}
                  >
                    Clear
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={bulkBusy}
                    onClick={() => handleBulkStatus('approved')}
                  >
                    <Check className="h-4 w-4 mr-1 text-green-600" />
                    Approve
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={bulkBusy}
                    onClick={() => handleBulkStatus('rejected')}
                  >
                    <X className="h-4 w-4 mr-1 text-destructive" />
                    Reject
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={bulkBusy}
                    onClick={() => setBulkDeleteOpen(true)}
                  >
                    Delete selected
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  {canEdit ? <TableHead className="w-10" /> : null}
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
                    <TableCell
                      colSpan={canEdit ? 11 : 10}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No order reviews yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => {
                    const hasItems = r.items?.length > 0
                    const open = expanded[r.id]
                    const selected = selectedIds.includes(r.id)
                    return (
                      <Fragment key={r.id}>
                        <TableRow data-state={selected ? 'selected' : undefined}>
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
                          {canEdit ? (
                            <TableCell>
                              <Checkbox
                                checked={selected}
                                onCheckedChange={(v) => toggleSelectOne(r.id, v === true)}
                                aria-label={`Select review by ${r.customerName}`}
                              />
                            </TableCell>
                          ) : null}
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
                              <span
                                className="max-w-[180px] truncate block"
                                title={r.items.map((i) => i.productName).join(', ')}
                              >
                                {r.items.map((i) => i.productName).join(', ')}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="capitalize text-sm">
                            {r.source || 'tracking'}
                          </TableCell>
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
                            <TableCell
                              colSpan={canEdit ? 11 : 10}
                              className="bg-muted/40 py-3"
                            >
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

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={(next) => !next && setBulkDeleteOpen(false)}
        title={`Delete ${selectedIds.length} review${selectedIds.length === 1 ? '' : 's'}?`}
        description="This will permanently remove the selected reviews. This action cannot be undone."
        onConfirm={handleBulkDelete}
      />
    </div>
  )
}