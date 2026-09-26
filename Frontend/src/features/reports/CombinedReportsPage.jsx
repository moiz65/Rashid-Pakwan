import { Download, GitBranch, Layers } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { DataTable } from '@/components/shared/DataTable'
import { useAppSelector } from '@/store/hooks'
import {
  selectCombinedBranchStats,
  selectHqDashboardStats,
  selectHqOrders,
  selectHqRevenueChartData,
} from '@/store/selectors'
import { formatCurrency, formatCurrencyCompact } from '@/lib/formatters'

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']

export default function CombinedReportsPage() {
  const stats = useAppSelector(selectHqDashboardStats)
  const byBranch = useAppSelector(selectCombinedBranchStats)
  const revenueData = useAppSelector(selectHqRevenueChartData)
  const orders = useAppSelector(selectHqOrders)

  const pieData = byBranch
    .filter((b) => b.revenue > 0)
    .map((b) => ({ name: b.name, value: b.revenue }))

  const handleExport = () => {
    const headers = ['Branch', 'Orders', 'Delivered', 'Pending', 'Customers', 'Revenue', 'Avg ticket', 'Share %']
    const rows = byBranch.map((b) => [
      b.name,
      b.orders,
      b.delivered,
      b.pending,
      b.customers,
      b.revenue.toFixed(2),
      b.avgOrderValue.toFixed(2),
      b.share.toFixed(1),
    ])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'combined-branch-report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const columns = [
    { header: 'Branch', key: 'name' },
    { header: 'Orders', key: 'orders' },
    { header: 'Pending', key: 'pending' },
    { header: 'Delivered', key: 'delivered' },
    { header: 'Customers', key: 'customers' },
    { header: 'Revenue', render: (r) => formatCurrency(r.revenue) },
    { header: 'Avg ticket', render: (r) => formatCurrency(r.avgOrderValue) },
    { header: 'Share', render: (r) => `${r.share.toFixed(1)}%` },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Combined report"
        description="Headquarters view of every location together. This page always shows all branches, independent of the switcher."
        action={
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Network revenue" value={formatCurrency(stats.totalRevenue)} icon={Layers} />
        <StatCard title="All orders" value={stats.totalOrders} icon={GitBranch} />
        <StatCard title="Customers" value={stats.totalCustomers} />
        <StatCard title="Avg order value" value={formatCurrency(stats.avgOrderValue)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by location</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byBranch}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="code" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => formatCurrencyCompact(v)} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Share of delivered revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">No delivered revenue yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders vs revenue (7 days, all locations)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis yAxisId="left" className="text-xs" tickFormatter={(v) => formatCurrencyCompact(v)} />
              <YAxis yAxisId="right" orientation="right" className="text-xs" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Revenue" />
              <Bar yAxisId="right" dataKey="orders" fill="var(--chart-2)" radius={[4, 4, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable data={byBranch} columns={columns} pageSize={10} />
          <p className="mt-3 text-xs text-muted-foreground">
            {orders.length} orders across {byBranch.length} locations. Downtown uses live data when the API is connected; other locations use frontend demo data.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
