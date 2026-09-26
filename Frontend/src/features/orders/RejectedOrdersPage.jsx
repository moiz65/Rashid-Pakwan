import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { BranchBadge } from '@/components/shared/BranchBadge'
import { useAppSelector } from '@/store/hooks'
import { selectIsAllBranches, selectRejectedOrders } from '@/store/selectors'
import { formatCurrency, formatDateTime, formatOrderId } from '@/lib/formatters'

export default function RejectedOrdersPage() {
  const orders = useAppSelector(selectRejectedOrders)
  const allMode = useAppSelector(selectIsAllBranches)

  const columns = [
    {
      header: 'Track ID',
      key: 'id',
      render: (r) => (
        <span className="font-mono text-xs font-semibold tracking-wide" title={r.id}>
          {formatOrderId(r.id)}
        </span>
      ),
    },
    { header: 'Customer', key: 'customerName' },
    ...(allMode
      ? [{ header: 'Branch', render: (r) => <BranchBadge branchId={r.branchId} /> }]
      : []),
    { header: 'Items', render: (r) => r.items.length },
    { header: 'Total', render: (r) => formatCurrency(r.total) },
    { header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      header: 'Reason',
      key: 'rejectionReason',
      render: (r) => (
        <span className="text-sm text-muted-foreground max-w-[200px] truncate block" title={r.rejectionReason}>
          {r.rejectionReason || '—'}
        </span>
      ),
    },
    { header: 'Date', render: (r) => formatDateTime(r.createdAt) },
  ]

  return (
    <div>
      <PageHeader
        title="Rejected Orders"
        description="View cancelled and rejected orders"
      />
      <DataTable
        data={orders}
        columns={columns}
        searchKey="customerName"
        searchPlaceholder="Search customers..."
        emptyMessage="No rejected orders found."
      />
    </div>
  )
}
