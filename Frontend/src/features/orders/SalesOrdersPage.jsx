import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Calendar,
  Download,
  Eye,
  CreditCard,
  Banknote,
  Receipt,
  Package,
  Layers,
  ArrowUpDown,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { BranchBadge } from '@/components/shared/BranchBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useAppSelector } from '@/store/hooks'
import {
  selectDeliveredOrders,
  selectIsAllBranches,
  selectSalesMetrics,
  selectBranchNameById,
} from '@/store/selectors'
import { formatCurrency, formatDateTime, formatOrderId } from '@/lib/formatters'
import { parseOrderNotes, getItemExtras } from '@/lib/orderNotes'

function DetailRow({ label, value, mono = false, capitalize = false }) {
  if (value == null || value === '') return null
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={`mt-0.5 text-sm font-medium break-words whitespace-pre-wrap ${
          mono ? 'font-mono text-xs' : ''
        } ${capitalize ? 'capitalize' : ''}`}
      >
        {value}
      </p>
    </div>
  )
}

function DetailSection({ title, children }) {
  return (
    <section className="rounded-xl border bg-card/40 p-3.5 space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </section>
  )
}

export default function SalesOrdersPage() {
  const orders = useAppSelector(selectDeliveredOrders)
  const metrics = useAppSelector(selectSalesMetrics)
  const allMode = useAppSelector(selectIsAllBranches)
  const branchNames = useAppSelector(selectBranchNameById)

  const [selected, setSelected] = useState(null)
  const [activeTab, setActiveTab] = useState('orders')

  const parsedNotes = selected ? parseOrderNotes(selected.notes) : null

  // Calculate product-level sales breakdown from delivered orders
  const itemSales = useMemo(() => {
    const map = new Map()
    for (const order of orders) {
      for (const item of order.items || []) {
        const key = item.name || 'Unknown Item'
        const qty = Number(item.qty || 1)
        const price = Number(item.price || 0)
        const revenue = qty * price

        if (!map.has(key)) {
          map.set(key, { name: key, qty: 0, revenue: 0, orderCount: 0 })
        }
        const curr = map.get(key)
        curr.qty += qty
        curr.revenue += revenue
        curr.orderCount += 1
      }
    }
    return [...map.values()].sort((a, b) => b.revenue - a.revenue)
  }, [orders])

  const handleExportCSV = () => {
    if (!orders.length) {
      toast.error('No delivered orders to export')
      return
    }
    const headers = ['Order Track ID', 'Customer Name', 'Email', 'Phone', 'Branch', 'Items Count', 'Subtotal', 'Tax', 'Discount', 'Total Revenue', 'Delivered Date']
    const rows = orders.map((o) => [
      formatOrderId(o.id),
      `"${o.customerName || ''}"`,
      `"${o.customerEmail || ''}"`,
      `"${o.customerPhone || ''}"`,
      `"${branchNames[o.branchId] || o.branchId || 'Main'}"`,
      o.items?.length || 0,
      o.subtotal || o.total,
      o.taxAmount || 0,
      o.couponDiscount || 0,
      o.total,
      `"${formatDateTime(o.createdAt)}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `sales-delivered-orders-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Sales report exported to CSV')
  }

  const columns = [
    {
      header: 'Track ID',
      key: 'id',
      render: (r) => (
        <button
          type="button"
          className="font-mono text-xs font-semibold tracking-wide text-primary hover:underline"
          title="Click to copy track ID"
          onClick={() => {
            navigator.clipboard?.writeText(String(r.id || '')).then(
              () => toast.success(`Copied Track ID: ${formatOrderId(r.id)}`),
              () => {},
            )
          }}
        >
          {formatOrderId(r.id)}
        </button>
      ),
    },
    { header: 'Customer', key: 'customerName' },
    ...(allMode
      ? [{ header: 'Branch', render: (r) => <BranchBadge branchId={r.branchId} /> }]
      : []),
    { header: 'Source', render: (r) => <StatusBadge status={r.source || 'admin'} /> },
    {
      header: 'Items',
      render: (r) => (
        <span className="text-xs font-medium" title={r.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}>
          {r.items.length} item{r.items.length !== 1 ? 's' : ''}
        </span>
      ),
    },
    {
      header: 'Total Sales Cash',
      render: (r) => (
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(r.total)}
        </span>
      ),
    },
    { header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { header: 'Date Delivered', render: (r) => formatDateTime(r.createdAt) },
    {
      header: 'Actions',
      render: (r) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Eye className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelected(r)}>
              <Eye className="mr-2 h-4 w-4" /> View Full Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Module (Delivered Orders)"
        description="Comprehensive record of delivered orders, cash revenue, sales analytics, and itemized performance."
        action={
          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export Sales Report
          </Button>
        }
      />

      {/* Sales Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Sales Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {formatCurrency(metrics.totalRevenue)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              From {metrics.deliveredCount} delivered order{metrics.deliveredCount !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Delivered Orders
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.deliveredCount}</div>
            <p className="mt-1 text-xs text-muted-foreground">Successfully fulfilled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Average Order Value (AOV)
            </CardTitle>
            <Receipt className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.avgOrderValue)}</div>
            <p className="mt-1 text-xs text-muted-foreground">Per delivered sale</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Today's Sales Cash
            </CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
              {formatCurrency(metrics.todayRevenue)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {metrics.todayCount} order{metrics.todayCount !== 1 ? 's' : ''} today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs View */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" /> Delivered Orders ({orders.length})
          </TabsTrigger>
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Package className="h-4 w-4" /> Item Breakdown
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <Banknote className="h-4 w-4" /> Payment Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <DataTable
            data={orders}
            columns={columns}
            searchKey="customerName"
            searchPlaceholder="Search customer, track ID..."
            emptyMessage="No delivered orders found in sales record."
          />
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Itemized Sales Performance from Delivered Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {itemSales.length === 0 ? (
                <p className="text-center py-8 text-sm text-muted-foreground">
                  No item sales data recorded yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                        <th className="pb-3 font-semibold">Product / Item Name</th>
                        <th className="pb-3 font-semibold text-center">Units Delivered</th>
                        <th className="pb-3 font-semibold text-center">Orders Appeared In</th>
                        <th className="pb-3 font-semibold text-right">Total Cash Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {itemSales.map((item, idx) => {
                        return (
                          <tr key={idx} className="hover:bg-muted/50 transition-colors">
                            <td className="py-3 font-medium flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                {idx + 1}
                              </span>
                              {item.name}
                            </td>
                            <td className="py-3 text-center font-mono">{item.qty}</td>
                            <td className="py-3 text-center text-muted-foreground">{item.orderCount}</td>
                            <td className="py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(item.revenue)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Cash on Delivery (COD)
                </CardTitle>
                <Banknote className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{formatCurrency(metrics.paymentBreakdown.cash)}</div>
                <p className="mt-1 text-xs text-muted-foreground">Cash collected on fulfillment</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Card / POS Payments
                </CardTitle>
                <CreditCard className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{formatCurrency(metrics.paymentBreakdown.card)}</div>
                <p className="mt-1 text-xs text-muted-foreground">Card reader / POS machine</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Online / Digital Gateway
                </CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{formatCurrency(metrics.paymentBreakdown.online)}</div>
                <p className="mt-1 text-xs text-muted-foreground">Online portal / mobile payments</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Order Details Drawer Sheet */}
      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto p-0">
          <SheetHeader className="border-b px-4 py-4 pr-12">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <SheetTitle className="text-lg">Delivered Order Details</SheetTitle>
                <p className="mt-1 text-xs text-muted-foreground">Track ID</p>
                <button
                  type="button"
                  className="mt-0.5 font-mono text-sm font-semibold text-primary hover:underline"
                  title="Click to copy"
                  onClick={() => {
                    if (!selected?.id) return
                    navigator.clipboard?.writeText(String(selected.id)).then(
                      () => toast.success(`Copied: ${formatOrderId(selected.id)}`),
                      () => {},
                    )
                  }}
                >
                  {selected ? formatOrderId(selected.id) : ''}
                </button>
              </div>
              <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                {selected && <StatusBadge status={selected.status} />}
                {selected && <StatusBadge status={selected.source || 'admin'} />}
                {selected?.branchId ? <BranchBadge branchId={selected.branchId} /> : null}
              </div>
            </div>
          </SheetHeader>
          {selected && parsedNotes && (
            <div className="space-y-3 p-4">
              <DetailSection title="Sales Info">
                <div className="grid grid-cols-2 gap-3">
                  <DetailRow label="Delivered At" value={formatDateTime(selected.createdAt)} />
                  <DetailRow label="Status" value="Delivered & Paid" capitalize />
                </div>
              </DetailSection>

              <DetailSection title="Customer">
                <div className="grid grid-cols-2 gap-3">
                  <DetailRow label="Name" value={selected.customerName} />
                  <DetailRow label="Phone" value={selected.customerPhone} />
                  <DetailRow label="Email" value={selected.customerEmail} />
                  <DetailRow label="Alt. phone" value={parsedNotes.alternatePhone} />
                </div>
              </DetailSection>

              {(parsedNotes.deliveryType || parsedNotes.address || parsedNotes.branch || parsedNotes.payment) && (
                <DetailSection title="Delivery & payment">
                  <div className="grid grid-cols-2 gap-3">
                    <DetailRow label="Type" value={parsedNotes.deliveryType} capitalize />
                    <DetailRow label="Payment Method" value={parsedNotes.payment || 'Cash on Delivery'} capitalize />
                    <DetailRow label="Address" value={parsedNotes.address} />
                    <DetailRow label="Branch" value={parsedNotes.branch} />
                  </div>
                  {parsedNotes.instructions && (
                    <DetailRow label="Instructions" value={parsedNotes.instructions} />
                  )}
                </DetailSection>
              )}

              <DetailSection title="Items Delivered">
                <div className="space-y-2">
                  {selected.items.map((item, i) => {
                    const extras = getItemExtras(parsedNotes, item.name)
                    return (
                      <div
                        key={item.id || i}
                        className="rounded-lg border border-border/60 bg-background/50 px-3 py-2.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium leading-snug">
                              <span className="text-muted-foreground">{item.qty}×</span> {item.name}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {formatCurrency(item.price)} each
                            </p>
                            {extras.addons && (
                              <p className="mt-1 text-xs text-muted-foreground">+ {extras.addons}</p>
                            )}
                            {extras.note && (
                              <p className="mt-0.5 text-xs italic text-muted-foreground">{extras.note}</p>
                            )}
                          </div>
                          <span className="shrink-0 text-sm font-semibold tabular-nums">
                            {formatCurrency(item.qty * item.price)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-sm font-medium text-muted-foreground font-semibold">Total Delivered Sales</span>
                  <span className="text-base font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(selected.total)}
                  </span>
                </div>
                {(selected.subtotal != null || selected.couponCode || Number(selected.taxAmount) > 0) && (
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {selected.subtotal != null && (
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatCurrency(selected.subtotal)}</span>
                      </div>
                    )}
                    {Number(selected.offerDiscount) > 0 && (
                      <div className="flex justify-between">
                        <span>Offer Discount</span>
                        <span>−{formatCurrency(selected.offerDiscount)}</span>
                      </div>
                    )}
                    {Number(selected.couponDiscount) > 0 && (
                      <div className="flex justify-between">
                        <span>Coupon ({selected.couponCode})</span>
                        <span>−{formatCurrency(selected.couponDiscount)}</span>
                      </div>
                    )}
                    {Number(selected.taxAmount) > 0 && (
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>{formatCurrency(selected.taxAmount)}</span>
                      </div>
                    )}
                  </div>
                )}
              </DetailSection>

              {parsedNotes.other && (
                <DetailSection title="Other notes">
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">{parsedNotes.other}</p>
                </DetailSection>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
