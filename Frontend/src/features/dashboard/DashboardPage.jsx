import { Link } from 'react-router-dom'
import { Banknote, ShoppingCart, Users, TrendingUp } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/shared/StatCard'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { BranchBadge } from '@/components/shared/BranchBadge'
import { useAppSelector } from '@/store/hooks'
import {
  selectCombinedBranchStats,
  selectCurrentBranch,
  selectDashboardStats,
  selectIsAllBranches,
  selectRevenueChartData,
  selectOrdersByStatus,
  selectRecentOrders,
  selectTopProducts,
} from '@/store/selectors'
import { formatCurrency, formatCurrencyCompact, formatDateTime, formatOrderId } from '@/lib/formatters'
import { resolveMediaUrl } from '@/lib/api'

export default function DashboardPage() {
  const stats = useAppSelector(selectDashboardStats)
  const revenueData = useAppSelector(selectRevenueChartData)
  const ordersByStatus = useAppSelector(selectOrdersByStatus)
  const recentOrders = useAppSelector(selectRecentOrders)
  const topProducts = useAppSelector(selectTopProducts)
  const allMode = useAppSelector(selectIsAllBranches)
  const currentBranch = useAppSelector(selectCurrentBranch)
  const branchStats = useAppSelector(selectCombinedBranchStats)

  const recentColumns = [
    {
      header: 'Order',
      key: 'id',
      render: (r) => (
        <span className="font-mono text-xs" title={r.id}>{formatOrderId(r.id)}</span>
      ),
    },
    { header: 'Customer', key: 'customerName' },
    ...(allMode
      ? [{ header: 'Branch', render: (r) => <BranchBadge branchId={r.branchId} /> }]
      : []),
    { header: 'Total', render: (r) => formatCurrency(r.total) },
    { header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { header: 'Date', render: (r) => formatDateTime(r.createdAt) },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          {allMode
            ? 'Combined overview of every restaurant location'
            : `Overview of ${currentBranch?.name || 'this location'}`}
          {allMode ? (
            <>
              {' · '}
              <Link to="/reports/combined" className="text-primary hover:underline">
                Open combined report
              </Link>
            </>
          ) : null}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Today's Revenue" value={formatCurrency(stats.todayRevenue)} icon={Banknote} trend={12} />
        <StatCard title="Today's Orders" value={stats.todayOrders} icon={ShoppingCart} trend={8} />
        <StatCard title="Total Customers" value={stats.totalCustomers} icon={Users} trend={5} />
        <StatCard title="Avg Order Value" value={formatCurrency(stats.avgOrderValue)} icon={TrendingUp} trend={-2} />
      </div>

      {allMode ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {branchStats.map((b) => (
            <Card key={b.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{b.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold tabular-nums">{formatCurrency(b.revenue)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {b.orders} orders · {b.pending} pending
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => formatCurrencyCompact(v)} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ordersByStatus}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="status" className="text-xs capitalize" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable data={recentOrders} columns={recentColumns} pageSize={5} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((p) => {
                const src = resolveMediaUrl(p.image)
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    {src ? (
                      <img
                        src={src}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-md object-cover border"
                      />
                    ) : (
                      <div className="h-10 w-10 shrink-0 rounded-md bg-muted border" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{p.name}</p>
                      <p className="text-sm text-muted-foreground">{p.sales} sales</p>
                    </div>
                    <span className="font-semibold shrink-0 tabular-nums">{formatCurrency(p.price)}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
