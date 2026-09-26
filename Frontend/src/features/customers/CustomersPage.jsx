import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ArrowDownUp, Eye, MoreHorizontal, Search, X } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { FormDialog } from '@/components/shared/FormDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addCustomer, deleteCustomer, setCustomers } from '@/store/slices/customersSlice'
import { deleteDemoCustomer } from '@/store/slices/branchesSlice'
import { selectAuth, selectCustomers, selectIsAllBranches, selectOrders, selectSelectedBranchId, selectWriteBranchId } from '@/store/selectors'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { apiBranchParams, isDemoRecord } from '@/lib/branches'
import { createCustomer, deleteCustomerRequest, fetchCustomers } from '@/lib/api'
import { BranchBadge } from '@/components/shared/BranchBadge'
import { usePermission } from '@/hooks/usePermission'

const emptyForm = { name: '', email: '', phone: '' }

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'totalOrders', label: 'Orders' },
  { value: 'spent', label: 'Total spent' },
  { value: 'joinedAt', label: 'Joined date' },
]

const defaultFilters = {
  search: '',
  activity: 'all',
  spent: 'all',
  sortBy: 'name',
  sortDir: 'asc',
}

export default function CustomersPage() {
  const dispatch = useAppDispatch()
  const customers = useAppSelector(selectCustomers)
  const orders = useAppSelector(selectOrders)
  const { token } = useAppSelector(selectAuth)
  const { canManage } = usePermission()
  const canEdit = canManage('customers')
  const allMode = useAppSelector(selectIsAllBranches)
  const writeBranchId = useAppSelector(selectWriteBranchId)
  const selectedBranchId = useAppSelector(selectSelectedBranchId)
  const [selected, setSelected] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const resetAndClose = () => {
    setOpen(false)
    setForm(emptyForm)
  }

  const handleOpenChange = (next) => {
    if (!next) resetAndClose()
    else setOpen(true)
  }
  const [saving, setSaving] = useState(false)
  const [filters, setFilters] = useState(defaultFilters)

  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }))

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.activity !== 'all' ||
    filters.spent !== 'all' ||
    filters.sortBy !== defaultFilters.sortBy ||
    filters.sortDir !== defaultFilters.sortDir

  const filteredCustomers = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    let list = customers.filter((c) => {
      const ordersCount = Number(c.totalOrders ?? 0)
      const spent = Number(c.spent ?? 0)

      if (filters.activity === 'has_orders' && ordersCount <= 0) return false
      if (filters.activity === 'no_orders' && ordersCount > 0) return false
      if (filters.spent === 'has_spent' && spent <= 0) return false
      if (filters.spent === 'no_spent' && spent > 0) return false
      if (filters.spent === 'high' && spent < 500) return false

      if (!q) return true
      const haystack = [c.name, c.email, c.phone].join(' ').toLowerCase()
      return haystack.includes(q)
    })

    const dir = filters.sortDir === 'desc' ? -1 : 1
    list = [...list].sort((a, b) => {
      switch (filters.sortBy) {
        case 'email':
          return String(a.email || '').localeCompare(String(b.email || '')) * dir
        case 'totalOrders':
          return (Number(a.totalOrders ?? 0) - Number(b.totalOrders ?? 0)) * dir
        case 'spent':
          return (Number(a.spent ?? 0) - Number(b.spent ?? 0)) * dir
        case 'joinedAt': {
          const aTime = a.joinedAt ? new Date(a.joinedAt).getTime() : 0
          const bTime = b.joinedAt ? new Date(b.joinedAt).getTime() : 0
          return (aTime - bTime) * dir
        }
        case 'name':
        default:
          return String(a.name || '').localeCompare(String(b.name || '')) * dir
      }
    })
    return list
  }, [customers, filters])

  const customerOrders = selected
    ? orders.filter((o) => o.customerId === selected.id)
    : []

  const refreshCustomers = async () => {
    const data = await fetchCustomers(token, apiBranchParams(selectedBranchId))
    dispatch(setCustomers(data))
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required')
      return
    }

    setSaving(true)
    try {
      const customer = await createCustomer(token, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        branchId: writeBranchId,
      })
      dispatch(addCustomer(customer))
      await refreshCustomers()
      toast.success('Customer created')
      resetAndClose()
    } catch (err) {
      toast.error(err.message || 'Failed to create customer')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const target = customers.find((c) => c.id === deleteId)
    try {
      if (target && isDemoRecord(target)) {
        dispatch(deleteDemoCustomer(deleteId))
        toast.success('Demo customer deleted')
        return
      }
      await deleteCustomerRequest(token, deleteId)
      dispatch(deleteCustomer(deleteId))
      toast.success('Customer deleted')
    } catch (err) {
      toast.error(err.message || 'Failed to delete customer')
    } finally {
      setDeleteId(null)
    }
  }

  const columns = [
    { header: 'Name', key: 'name' },
    ...(allMode
      ? [{ header: 'Branch', render: (r) => <BranchBadge branchId={r.branchId} /> }]
      : []),
    { header: 'Email', key: 'email' },
    { header: 'Phone', key: 'phone' },
    { header: 'Orders', key: 'totalOrders' },
    { header: 'Total Spent', render: (r) => formatCurrency(r.spent) },
    { header: 'Joined', render: (r) => formatDate(r.joinedAt) },
    {
      header: 'Actions',
      render: (r) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelected(r)}>
              <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            {canEdit ? (
              <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(r.id)}>
                Delete
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Manage your restaurant customers"
        actionLabel={canEdit ? 'Add Customer' : undefined}
        onAction={canEdit ? () => { setForm(emptyForm); setOpen(true) } : undefined}
      />

      <div className="mb-4 rounded-lg border bg-card p-4 space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, email, phone..."
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Select value={filters.activity} onValueChange={(v) => setFilter('activity', v)}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Activity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All activity</SelectItem>
                <SelectItem value="has_orders">Has orders</SelectItem>
                <SelectItem value="no_orders">No orders</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.spent} onValueChange={(v) => setFilter('spent', v)}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Spending" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All spending</SelectItem>
                <SelectItem value="has_spent">Has spent</SelectItem>
                <SelectItem value="high">High spenders (500+)</SelectItem>
                <SelectItem value="no_spent">No spend</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground inline-flex items-center gap-1.5">
              <ArrowDownUp className="h-3.5 w-3.5" /> Sort
            </span>
            <Select value={filters.sortBy} onValueChange={(v) => setFilter('sortBy', v)}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.sortDir} onValueChange={(v) => setFilter('sortDir', v)}>
              <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFilters(defaultFilters)}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredCustomers.length}</span>
            {' '}of {customers.length} customers
          </p>
        </div>
      </div>

      <DataTable
        data={filteredCustomers}
        columns={columns}
        emptyMessage={hasActiveFilters ? 'No customers match your filters.' : 'No customers yet.'}
      />

      <FormDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Add Customer"
        footer={
          <>
            <Button type="button" variant="outline" onClick={resetAndClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !canEdit}>{saving ? 'Saving...' : 'Save Customer'}</Button>
          </>
        }
      >
        <div className="grid gap-2">
          <Label>Name</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Phone</Label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
      </FormDialog>

      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selected?.name}</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Email</p><p>{selected.email}</p></div>
                <div><p className="text-muted-foreground">Phone</p><p>{selected.phone}</p></div>
                <div><p className="text-muted-foreground">Total Orders</p><p>{selected.totalOrders}</p></div>
                <div><p className="text-muted-foreground">Total Spent</p><p>{formatCurrency(selected.spent)}</p></div>
              </div>
              <div>
                <p className="font-medium mb-2">Order History ({customerOrders.length})</p>
                {customerOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No orders yet</p>
                ) : (
                  customerOrders.map((o) => (
                    <div key={o.id} className="flex justify-between py-2 border-b text-sm">
                      <span>{o.id}</span>
                      <span>{formatCurrency(o.total)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Customer"
        description="Are you sure you want to delete this customer?"
        onConfirm={handleDelete}
      />
    </div>
  )
}
