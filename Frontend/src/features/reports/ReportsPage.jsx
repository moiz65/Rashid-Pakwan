import { useMemo } from 'react'
import { Download } from 'lucide-react'
import { Line, LineChart, Bar, BarChart, Pie, PieChart, Cell, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { useAppSelector } from '@/store/hooks'
import {
  selectCurrentBranch,
  selectIsAllBranches,
  selectOrders,
  selectRevenueChartData,
  selectSalesByCategory,
  selectCombinedBranchStats,
} from '@/store/selectors'
import { formatCurrency, formatCurrencyCompact } from '@/lib/formatters'

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']

export default function ReportsPage() {
  const orders = useAppSelector(selectOrders)
  const revenueData = useAppSelector(selectRevenueChartData)
  const categoryData = useAppSelector(selectSalesByCategory)
  const allMode = useAppSelector(selectIsAllBranches)
  const currentBranch = useAppSelector(selectCurrentBranch)
  const branchStats = useAppSelector(selectCombinedBranchStats)

  const stats = useMemo(() => {
    const delivered = orders.filter((o) => o.status === 'delivered')
    const totalRevenue = delivered.reduce((s, o) => s + o.total, 0)
    return { totalOrders: orders.length, delivered: delivered.length, totalRevenue }
  }, [orders])

  const handleExport = () => {
    const headers = ['ID', 'Customer', 'Total', 'Status', 'Date']
    const rows = orders.map((o) => [o.id, o.customerName, o.total, o.status, o.createdAt])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'orders-report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description={
          allMode
            ? 'Analytics for every location. Open Combined report for the headquarters breakdown.'
            : `Sales analytics for ${currentBranch?.name || 'this location'}`
        }
        action={
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs font-medium uppercase text-muted-foreground">Total Orders</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{stats.totalOrders}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs font-medium uppercase text-muted-foreground">Delivered Orders</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.delivered}</p></CardContent></Card>
        <Card className="border-emerald-500/20 bg-emerald-500/5"><CardHeader className="pb-2"><CardTitle className="text-xs font-medium uppercase text-emerald-800 dark:text-emerald-300">Delivered Sales Cash</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.totalRevenue)}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs font-medium uppercase text-muted-foreground">Average Delivered Value</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(stats.delivered ? stats.totalRevenue / stats.delivered : 0)}</p></CardContent></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => formatCurrencyCompact(v)} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Orders per Day</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="orders" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Sales by Category</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {allMode ? (
        <Card>
          <CardHeader><CardTitle>By location</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Branch</th>
                    <th className="pb-2 font-medium">Orders</th>
                    <th className="pb-2 font-medium">Pending</th>
                    <th className="pb-2 font-medium">Revenue</th>
                    <th className="pb-2 font-medium">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {branchStats.map((b) => (
                    <tr key={b.id} className="border-b last:border-0">
                      <td className="py-2 font-medium">{b.name}</td>
                      <td className="py-2">{b.orders}</td>
                      <td className="py-2">{b.pending}</td>
                      <td className="py-2">{formatCurrency(b.revenue)}</td>
                      <td className="py-2">{b.share.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
