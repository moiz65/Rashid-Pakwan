import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { FormDialog, FormSection } from '@/components/shared/FormDialog'
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
import { Checkbox } from '@/components/ui/checkbox'
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

/** Bulk edit uses "__unchanged__" sentinel so users can leave fields alone. */
const UNCHANGED = '__unchanged__'

const emptyBulkForm = {
  active: UNCHANGED,
  expiryMode: UNCHANGED,
  expiryValue: '',
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

  // ---- Selection state ----
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkEditOpen, setBulkEditOpen] = useState(false)
  const [bulkForm, setBulkForm] = useState(emptyBulkForm)
  const [bulkBusy, setBulkBusy] = useState(false)

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
      setSelectedIds((prev) => prev.filter((x) => x !== deleteId))
      toast.success('Deleted')
      setDeleteId(null)
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    }
  }

  // ---- Selection helpers ----
  const visibleIds = useMemo(() => coupons.map((c) => c.id), [coupons])
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

  // ---- Bulk delete ----
  const handleBulkDelete = async () => {
    if (!token || selectedIds.length === 0) return
    setBulkBusy(true)
    const ids = [...selectedIds]
    const results = await Promise.allSettled(
      ids.map((id) => deleteCouponRequest(token, id)),
    )
    let ok = 0
    let failed = 0
    results.forEach((r, idx) => {
      if (r.status === 'fulfilled') {
        ok += 1
        dispatch(deleteCoupon(ids[idx]))
      } else {
        failed += 1
      }
    })
    setBulkBusy(false)
    setBulkDeleteOpen(false)
    clearSelection()
    if (ok > 0 && failed === 0) toast.success(`Deleted ${ok} coupon${ok === 1 ? '' : 's'}`)
    else if (ok > 0 && failed > 0) toast.error(`Deleted ${ok}, failed ${failed}`)
    else toast.error('Failed to delete selected coupons')
  }

  // ---- Bulk edit ----
  const openBulkEdit = () => {
    setBulkForm(emptyBulkForm)
    setBulkEditOpen(true)
  }

  const closeBulkEdit = () => {
    setBulkEditOpen(false)
    setBulkForm(emptyBulkForm)
  }

  const buildBulkPayload = (c) => {
    const payload = {
      code: c.code,
      type: c.type,
      value: Number(c.value) || 0,
      minOrder: Number(c.minOrder) || 0,
      maxUses: Number(c.maxUses) || 0,
      expiry: c.expiry ? new Date(c.expiry).toISOString() : null,
      usedCount: c.usedCount || 0,
      active: Boolean(c.active),
      branchId: branchScopeToApi(branchScopeFromRecord(c.branchId)),
    }
    if (bulkForm.active !== UNCHANGED) payload.active = bulkForm.active === 'yes'
    if (bulkForm.expiryMode === 'set') {
      payload.expiry = bulkForm.expiryValue
        ? new Date(bulkForm.expiryValue).toISOString()
        : null
    } else if (bulkForm.expiryMode === 'clear') {
      payload.expiry = null
    }
    return payload
  }

  const handleBulkEdit = async () => {
    if (!token || selectedIds.length === 0) return
    const selected = coupons.filter((c) => selectedIds.includes(c.id))
    if (selected.length === 0) {
      closeBulkEdit()
      return
    }
    setBulkBusy(true)
    const results = await Promise.allSettled(
      selected.map((c) => updateCouponRequest(token, c.id, buildBulkPayload(c))),
    )
    let ok = 0
    let failed = 0
    results.forEach((r) => {
      if (r.status === 'fulfilled') {
        ok += 1
        dispatch(updateCoupon(r.value))
      } else {
        failed += 1
      }
    })
    setBulkBusy(false)
    closeBulkEdit()
    clearSelection()
    if (ok > 0 && failed === 0) toast.success(`Updated ${ok} coupon${ok === 1 ? '' : 's'}`)
    else if (ok > 0 && failed > 0) toast.error(`Updated ${ok}, failed ${failed}`)
    else toast.error('Failed to update selected coupons')
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
                aria-label={`Select ${r.code}`}
              />
            ),
          },
        ]
      : []),
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

      {/* Select-all / bulk-actions bar */}
      {canEdit && coupons.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2">
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <Checkbox
              checked={allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false}
              onCheckedChange={(v) => toggleSelectAll(v === true)}
              aria-label="Select all coupons"
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
              <Button type="button" variant="ghost" size="sm" disabled={bulkBusy} onClick={clearSelection}>
                Clear
              </Button>
              <Button type="button" variant="outline" size="sm" disabled={bulkBusy} onClick={openBulkEdit}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit selected
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={bulkBusy}
                onClick={() => setBulkDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete selected
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

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

      {/* ---- Bulk Edit dialog ---- */}
      <FormDialog
        open={bulkEditOpen}
        onOpenChange={(next) => !next && closeBulkEdit()}
        title={`Edit ${selectedIds.length} coupon${selectedIds.length === 1 ? '' : 's'}`}
        description="Only fields you change here will be applied. Leave a field as 'Keep current' to leave it untouched."
        footer={
          <>
            <Button type="button" variant="outline" onClick={closeBulkEdit} disabled={bulkBusy}>Cancel</Button>
            <Button type="button" onClick={handleBulkEdit} disabled={bulkBusy || !canEdit}>{bulkBusy ? 'Saving…' : 'Apply changes'}</Button>
          </>
        }
      >
        <FormSection title="Status">
          <div className="grid gap-2">
            <Label>Active</Label>
            <Select value={bulkForm.active} onValueChange={(v) => setBulkForm({ ...bulkForm, active: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={UNCHANGED}>Keep current</SelectItem>
                <SelectItem value="yes">Active</SelectItem>
                <SelectItem value="no">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FormSection>

        <FormSection title="Expiry">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Expiry action</Label>
              <Select value={bulkForm.expiryMode} onValueChange={(v) => setBulkForm({ ...bulkForm, expiryMode: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNCHANGED}>Keep current</SelectItem>
                  <SelectItem value="set">Set new date</SelectItem>
                  <SelectItem value="clear">Clear expiry (no expiry)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {bulkForm.expiryMode === 'set' ? (
              <div className="grid gap-2">
                <Label>New expiry date</Label>
                <Input
                  type="date"
                  value={bulkForm.expiryValue}
                  onChange={(e) => setBulkForm({ ...bulkForm, expiryValue: e.target.value })}
                />
              </div>
            ) : null}
          </div>
        </FormSection>
      </FormDialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} title="Delete Coupon" description="Delete this coupon?" onConfirm={handleDelete} />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={(next) => !next && setBulkDeleteOpen(false)}
        title={`Delete ${selectedIds.length} coupon${selectedIds.length === 1 ? '' : 's'}?`}
        description="This will permanently remove the selected coupons. This action cannot be undone."
        onConfirm={handleBulkDelete}
      />
    </div>
  )
}