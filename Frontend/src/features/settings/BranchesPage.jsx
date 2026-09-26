import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { FormDialog } from '@/components/shared/FormDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addBranch, deleteBranch, setBranches, updateBranch } from '@/store/slices/branchesSlice'
import { selectAccessibleBranches, selectAuth, selectCurrentUser } from '@/store/selectors'
import {
  createBranchRequest,
  deleteBranchRequest,
  fetchBranches,
  updateBranchRequest,
} from '@/lib/api'
import { usePermission } from '@/hooks/usePermission'

const emptyForm = {
  name: '',
  code: '',
  city: '',
  address: '',
  phone: '',
  manager: '',
  hours: '',
  status: 'active',
}

export default function BranchesPage() {
  const dispatch = useAppDispatch()
  const branches = useAppSelector(selectAccessibleBranches)
  const user = useAppSelector(selectCurrentUser)
  const { token } = useAppSelector(selectAuth)
  const { canManage } = usePermission()
  const canManageBranches = canManage('branches')

  const assignedIds = Array.isArray(user?.branchIds) ? user.branchIds.filter(Boolean) : []
  const isHqUser = user?.role === 'admin' || assignedIds.length === 0
  const canCreate = isHqUser && canManageBranches

  const canEditBranch = (branch) => {
    if (!canManageBranches) return false
    if (isHqUser) return true
    return assignedIds.includes(branch.id)
  }

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    let active = true
    setLoading(true)
    fetchBranches(token)
      .then((list) => {
        if (!active) return
        if (Array.isArray(list)) dispatch(setBranches(list))
      })
      .catch((err) => {
        if (!active) return
        toast.error(err.message || 'Failed to load branches')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [dispatch, token])

  const resetAndClose = () => {
    setOpen(false)
    setEditing(null)
    setForm(emptyForm)
  }

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  const openEdit = (branch) => {
    setEditing(branch)
    setForm({
      name: branch.name,
      code: branch.code || '',
      city: branch.city || '',
      address: branch.address || '',
      phone: branch.phone || '',
      manager: branch.manager || '',
      hours: branch.hours || '',
      status: branch.status || 'active',
    })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !token) {
      toast.error('Branch name is required')
      return
    }
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase() || form.name.trim().slice(0, 3).toUpperCase(),
      city: form.city.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      manager: form.manager.trim(),
      hours: form.hours.trim(),
      status: form.status,
    }
    try {
      if (editing) {
        const branch = await updateBranchRequest(token, editing.id, payload)
        dispatch(updateBranch(branch))
        toast.success('Branch updated')
      } else {
        const branch = await createBranchRequest(token, payload)
        dispatch(addBranch(branch))
        toast.success('Branch created')
      }
      resetAndClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save branch')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId || !token) return
    try {
      await deleteBranchRequest(token, deleteId)
      dispatch(deleteBranch(deleteId))
      toast.success('Branch removed')
      setDeleteId(null)
    } catch (err) {
      toast.error(err.message || 'Failed to delete branch')
    }
  }

  const showActionsColumn = branches.some((b) => canEditBranch(b))

  const columns = [
    { header: 'Name', key: 'name' },
    { header: 'Code', key: 'code' },
    { header: 'City', key: 'city' },
    {
      header: 'Address',
      render: (r) => <span className="max-w-[220px] truncate block">{r.address || '—'}</span>,
    },
    { header: 'Manager', key: 'manager' },
    {
      header: 'Type',
      render: (r) => (
        <span className="text-xs text-muted-foreground">{r.isPrimary ? 'Primary' : 'Branch'}</span>
      ),
    },
    { header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    ...(showActionsColumn
      ? [{
          header: 'Actions',
          render: (r) =>
            canEditBranch(r) ? (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                {isHqUser ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={r.isPrimary}
                    onClick={() => setDeleteId(r.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            ) : null,
        }]
      : []),
  ]

  return (
    <div>
      <PageHeader
        title="Branches"
        description={
          isHqUser
            ? 'Manage restaurant locations. Branches appear on the ordering website for pickup and filter admin orders by location.'
            : 'View and update your assigned branch location details.'
        }
        actionLabel={canCreate ? 'Add branch' : undefined}
        onAction={canCreate ? openCreate : undefined}
      />
      <DataTable
        data={branches}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search branches..."
        emptyMessage={
          loading
            ? 'Loading branches…'
            : isHqUser
              ? 'No branches yet. Add your first location.'
              : 'No branch assigned to your account. Ask an administrator to assign you to a branch.'
        }
      />

      <FormDialog
        open={open}
        onOpenChange={(next) => { if (!next) resetAndClose(); else setOpen(true) }}
        title={editing ? 'Edit branch' : 'Add branch'}
        footer={
          <>
            <Button variant="outline" onClick={resetAndClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !canManageBranches}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      >
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Code</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="XYZ" />
            </div>
            <div className="grid gap-2">
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Address</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Manager</Label>
              <Input value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Hours</Label>
              <Input value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </FormDialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Remove branch"
        description="Delete this branch? Users assigned to it will lose access."
        onConfirm={handleDelete}
      />
    </div>
  )
}
