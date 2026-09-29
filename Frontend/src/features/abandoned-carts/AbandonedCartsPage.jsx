import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { deleteCart } from '@/store/slices/cartsSlice'
import { deleteDemoCart } from '@/store/slices/branchesSlice'
import { selectAuth, selectCarts, selectIsAllBranches } from '@/store/selectors'
import { deleteCartRequest, updateCartRequest } from '@/lib/api'
import { formatCurrency, formatRelative } from '@/lib/formatters'
import { isDemoRecord } from '@/lib/branches'
import { BranchBadge } from '@/components/shared/BranchBadge'
import { usePermission } from '@/hooks/usePermission'

export default function AbandonedCartsPage() {
  const dispatch = useAppDispatch()
  const { token } = useAppSelector(selectAuth)
  const { canManage } = usePermission()
  const canEdit = canManage('abandoned_carts')
  const carts = useAppSelector(selectCarts)
  const allMode = useAppSelector(selectIsAllBranches)
  const [busyId, setBusyId] = useState(null)

  // ---- Selection state ----
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkBusy, setBulkBusy] = useState(false)

  const dismissOne = async (cart) => {
    if (isDemoRecord(cart)) {
      dispatch(deleteDemoCart(cart.id))
      return
    }
    if (!token) throw new Error('Please sign in again')
    try {
      await deleteCartRequest(token, cart.id)
    } catch {
      await updateCartRequest(token, cart.id, { recovered: true })
    }
    dispatch(deleteCart(cart.id))
  }

  const handleDismiss = async (cart) => {
    if (isDemoRecord(cart)) {
      dispatch(deleteDemoCart(cart.id))
      setSelectedIds((prev) => prev.filter((x) => x !== cart.id))
      toast.success('Removed demo cart')
      setBusyId(null)
      return
    }
    setBusyId(cart.id)
    try {
      await dismissOne(cart)
      setSelectedIds((prev) => prev.filter((x) => x !== cart.id))
      toast.success('Removed from abandoned carts')
    } catch (err) {
      toast.error(err.message || 'Failed to remove cart')
    } finally {
      setBusyId(null)
    }
  }

  // ---- Selection helpers ----
  const visibleIds = useMemo(() => carts.map((c) => c.id), [carts])
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

  // ---- Bulk dismiss ----
  const handleBulkDismiss = async () => {
    if (selectedIds.length === 0) return
    setBulkBusy(true)
    const ids = [...selectedIds]
    const selectedCarts = carts.filter((c) => ids.includes(c.id))

    let ok = 0
    let failed = 0

    // Demo carts: local-only removal (synchronous)
    const demoCarts = selectedCarts.filter((c) => isDemoRecord(c))
    demoCarts.forEach((c) => {
      dispatch(deleteDemoCart(c.id))
      ok += 1
    })

    // Real carts: hit the API in parallel
    const realCarts = selectedCarts.filter((c) => !isDemoRecord(c))
    if (realCarts.length > 0) {
      if (!token) {
        toast.error('Please sign in again')
        setBulkBusy(false)
        return
      }
      const results = await Promise.allSettled(realCarts.map((c) => dismissOne(c)))
      results.forEach((r) => {
        if (r.status === 'fulfilled') ok += 1
        else failed += 1
      })
    }

    setBulkBusy(false)
    setBulkDeleteOpen(false)
    clearSelection()
    if (ok > 0 && failed === 0) toast.success(`Dismissed ${ok} cart${ok === 1 ? '' : 's'}`)
    else if (ok > 0 && failed > 0) toast.error(`Dismissed ${ok}, failed ${failed}`)
    else toast.error('Failed to dismiss selected carts')
  }

  const columns = [
    // Select-all checkbox column
    ...(canEdit
      ? [
          {
            header: (
              <Checkbox
                checked={allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false}
                onCheckedChange={(v) => toggleSelectAll(v === true)}
                aria-label="Select all"
              />
            ),
            render: (r) => (
              <Checkbox
                checked={selectedIds.includes(r.id)}
                onCheckedChange={(v) => toggleSelectOne(r.id, v === true)}
                aria-label={`Select ${r.customerName || 'cart'}`}
              />
            ),
          },
        ]
      : []),
    {
      header: 'Customer',
      render: (r) => (
        <div className="min-w-[160px]">
          <p className="font-medium">{r.customerName || '—'}</p>
          {r.phone ? <p className="text-xs text-muted-foreground">{r.phone}</p> : null}
          {r.email ? (
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{r.email}</p>
          ) : null}
        </div>
      ),
    },
    {
      header: 'Delivery details',
      render: (r) => (
        <div className="min-w-[180px] max-w-[260px]">
          {r.deliveryType ? (
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
              {r.deliveryType}
            </p>
          ) : null}
          <p className="text-sm truncate" title={r.address || ''}>
            {r.address || '—'}
          </p>
          {r.landmark ? (
            <p className="text-xs text-muted-foreground truncate">Near: {r.landmark}</p>
          ) : null}
        </div>
      ),
    },
    {
      header: 'Items',
      render: (r) => {
        const list = Array.isArray(r.items) ? r.items : []
        if (!list.length) return <span className="text-muted-foreground">0</span>
        return (
          <div className="max-w-[220px]">
            <p
              className="text-sm truncate"
              title={list.map((i) => `${i.qty}× ${i.name}`).join(', ')}
            >
              {list.map((i) => `${i.qty}× ${i.name}`).join(', ')}
            </p>
            <p className="text-xs text-muted-foreground">
              {list.length} item{list.length === 1 ? '' : 's'}
            </p>
          </div>
        )
      },
    },
    { header: 'Value', render: (r) => formatCurrency(r.value) },
    ...(allMode
      ? [{ header: 'Branch', render: (r) => <BranchBadge branchId={r.branchId} /> }]
      : []),
    { header: 'Last activity', render: (r) => formatRelative(r.abandonedAt) },
    {
      header: 'Status',
      render: () => <StatusBadge status="abandoned" />,
    },
    ...(canEdit
      ? [{
          header: 'Actions',
          render: (r) => (
            <Button
              variant="outline"
              size="sm"
              disabled={busyId === r.id || bulkBusy}
              onClick={() => handleDismiss(r)}
            >
              {busyId === r.id ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Dismiss
            </Button>
          ),
        }]
      : []),
  ]

  return (
    <div>
      <PageHeader
        title="Abandoned Carts"
        description="Only incomplete checkouts — carts are removed automatically when an order is placed successfully."
      />

      {/* Select-all / bulk-actions bar */}
      {canEdit && carts.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2">
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <Checkbox
              checked={allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false}
              onCheckedChange={(v) => toggleSelectAll(v === true)}
              aria-label="Select all carts"
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
                variant="destructive"
                size="sm"
                disabled={bulkBusy}
                onClick={() => setBulkDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Dismiss selected
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <DataTable
        data={carts}
        columns={columns}
        searchKey="customerName"
        searchPlaceholder="Search customers..."
      />
      {carts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No abandoned checkouts right now.
        </p>
      ) : null}

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={(next) => !next && setBulkDeleteOpen(false)}
        title={`Dismiss ${selectedIds.length} cart${selectedIds.length === 1 ? '' : 's'}?`}
        description="This will remove the selected abandoned carts. This action cannot be undone."
        onConfirm={handleBulkDismiss}
      />
    </div>
  )
}