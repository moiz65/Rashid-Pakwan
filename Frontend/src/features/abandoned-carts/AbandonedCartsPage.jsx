import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
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

  const handleDismiss = async (cart) => {
    if (isDemoRecord(cart)) {
      dispatch(deleteDemoCart(cart.id))
      toast.success('Removed demo cart')
      setBusyId(null)
      return
    }
    if (!token) {
      toast.error('Please sign in again')
      return
    }
    setBusyId(cart.id)
    try {
      // recovered:true deletes on the server; DELETE also works
      try {
        await deleteCartRequest(token, cart.id)
      } catch {
        await updateCartRequest(token, cart.id, { recovered: true })
      }
      dispatch(deleteCart(cart.id))
      toast.success('Removed from abandoned carts')
    } catch (err) {
      toast.error(err.message || 'Failed to remove cart')
    } finally {
      setBusyId(null)
    }
  }

  const columns = [
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
              disabled={busyId === r.id}
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
    </div>
  )
}
