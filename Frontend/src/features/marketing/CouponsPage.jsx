import { useState } from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { FormDialog } from '@/components/shared/FormDialog'
import {
  BranchScopeField,
  branchScopeFromRecord,
  branchScopeToApi,
  useDefaultBranchScope,
} from '@/components/shared/BranchScopeField'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addCoupon, updateCoupon, deleteCoupon } from '@/store/slices/marketingSlice'
import { selectAuth, selectBranchCoupons } from '@/store/selectors'
import { formatDate, formatCurrency } from '@/lib/formatters'
import {
  createCouponRequest,
  deleteCouponRequest,
  updateCouponRequest,
} from '@/lib/api'
import { usePermission } from '@/hooks/usePermission'

const emptyCoupon = {
  code: '',
  type: 'percentage',
  value: '',
  minOrder: '',
  maxUses: '',
  expiry: '',
  active: true,
  branchScope: 'all',
}

export default function CouponsPage() {
  const dispatch = useAppDispatch()
  const coupons = useAppSelector(selectBranchCoupons)
  const { token } = useAppSelector(selectAuth)
  const { canManage } = usePermission()
  const canEdit = canManage('marketing')
  const defaultBranchScope = useDefaultBranchScope()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState(emptyCoupon)
  const [saving, setSaving] = useState(false)

  const resetAndClose = () => {
    setOpen(false)
    setEditing(null)
    setForm(emptyCoupon)
  }

  const handleOpenChange = (next) => {
    if (!next) resetAndClose()
    else setOpen(true)
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyCoupon, branchScope: defaultBranchScope })
    setOpen(true)
  }
  const openEdit = (c) => {
    setEditing(c)
    setForm({
      code: c.code,
      type: c.type,
      value: String(c.value),
      minOrder: String(c.minOrder),
      maxUses: String(c.maxUses),
      expiry: c.expiry ? String(c.expiry).slice(0, 10) : '',
      active: c.active,
      branchScope: branchScopeFromRecord(c.branchId),
    })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.code.trim() || !token) {
      toast.error('Code is required')
      return
    }
    setSaving(true)
    const payload = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: parseFloat(form.value) || 0,
      minOrder: parseFloat(form.minOrder) || 0,
      maxUses: parseInt(form.maxUses, 10) || 0,
      expiry: form.expiry ? new Date(form.expiry).toISOString() : null,
      usedCount: editing?.usedCount || 0,
      active: form.active,
      branchId: branchScopeToApi(form.branchScope),
    }
    try {
      if (editing) {
        const coupon = await updateCouponRequest(token, editing.id, payload)
        dispatch(updateCoupon(coupon))
        toast.success('Coupon updated')
      } else {
        const coupon = await createCouponRequest(token, payload)
        dispatch(addCoupon(coupon))
        toast.success('Coupon created')
      }
      resetAndClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save coupon')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId || !token) return
    try {
      await deleteCouponRequest(token, deleteId)
      dispatch(deleteCoupon(deleteId))
      toast.success('Deleted')
      setDeleteId(null)
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    }
  }

  const columns = [
    { header: 'Code', key: 'code', render: (r) => <span className="font-mono font-bold">{r.code}</span> },
    { header: 'Type', key: 'type' },
    { header: 'Value', render: (r) => r.type === 'percentage' ? `${r.value}%` : formatCurrency(r.value) },
    { header: 'Usage', render: (r) => `${r.usedCount}/${r.maxUses}` },
    { header: 'Expires', render: (r) => formatDate(r.expiry) },
    { header: 'Status', render: (r) => <StatusBadge status={r.active ? 'active' : 'inactive'} /> },
    ...(canEdit
      ? [{
          header: 'Actions',
          render: (r) => (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setDeleteId(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ),
        }]
      : []),
  ]

  return (
    <div>
      <PageHeader
        title="Coupons"
        description="Customer-entered codes at checkout. Discount food subtotal only — not delivery. Different from automatic Offers."
        actionLabel={canEdit ? 'Create Coupon' : undefined}
        onAction={canEdit ? openCreate : undefined}
      />
      <DataTable data={coupons} columns={columns} searchKey="code" />
      <FormDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={`${editing ? 'Edit' : 'Create'} Coupon`}
        footer={
          <>
            <Button type="button" variant="outline" onClick={resetAndClose} disabled={saving}>Cancel</Button>
            <Button type="button" onClick={handleSave} disabled={saving || !canEdit}>{saving ? 'Saving…' : 'Save'}</Button>
          </>
        }
      >
        <BranchScopeField
          value={form.branchScope}
          onChange={(v) => setForm({ ...form, branchScope: v })}
        />
        <div className="grid gap-2"><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2"><Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="percentage">Percentage</SelectItem><SelectItem value="fixed">Fixed</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="grid gap-2"><Label>Value</Label><Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2"><Label>Min Order</Label><Input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} /></div>
          <div className="grid gap-2"><Label>Max Uses</Label><Input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} /></div>
        </div>
        <div className="grid gap-2"><Label>Expiry Date</Label><Input type="date" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} /></div>
        <div className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /><Label>Active</Label></div>
      </FormDialog>
      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} title="Delete Coupon" description="Delete this coupon?" onConfirm={handleDelete} />
    </div>
  )
}
