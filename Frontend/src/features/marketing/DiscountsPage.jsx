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
import { addDiscount, updateDiscount, deleteDiscount } from '@/store/slices/marketingSlice'
import { selectAuth, selectBranchDiscounts, selectCategories } from '@/store/selectors'
import { formatDate, formatCurrency } from '@/lib/formatters'
import { filterByBranch } from '@/lib/branches'
import {
  createDiscountRequest,
  deleteDiscountRequest,
  updateDiscountRequest,
} from '@/lib/api'
import { usePermission } from '@/hooks/usePermission'
import {
  formatDiscountCategories,
  parseDiscountCategories,
  serializeDiscountCategories,
} from '@/lib/discounts'

const ALL = 'All'

const emptyForm = {
  name: '',
  type: 'percentage',
  value: '',
  categories: [ALL],
  active: true,
  startDate: '',
  endDate: '',
  branchScope: 'all',
}

/** Bulk edit uses "__unchanged__" sentinel so users can leave fields alone. */
const UNCHANGED = '__unchanged__'

const emptyBulkForm = {
  active: UNCHANGED,
  endDateMode: UNCHANGED,
  endDateValue: '',
}

export default function DiscountsPage() {
  const dispatch = useAppDispatch()
  const discounts = useAppSelector(selectBranchDiscounts)
  const allCategories = useAppSelector(selectCategories)
  const { token } = useAppSelector(selectAuth)
  const { canManage } = usePermission()
  const canEdit = canManage('marketing')
  const defaultBranchScope = useDefaultBranchScope()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  // ---- Selection state ----
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkEditOpen, setBulkEditOpen] = useState(false)
  const [bulkForm, setBulkForm] = useState(emptyBulkForm)
  const [bulkBusy, setBulkBusy] = useState(false)

  const formCategories = useMemo(
    () => filterByBranch(allCategories, form.branchScope || 'all', { includeAllScoped: true }),
    [allCategories, form.branchScope],
  )

  const resetAndClose = () => {
    setOpen(false)
    setEditing(null)
    setForm(emptyForm)
  }

  const handleOpenChange = (next) => {
    if (!next) resetAndClose()
    else setOpen(true)
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm, branchScope: defaultBranchScope })
    setOpen(true)
  }

  const openEdit = (d) => {
    setEditing(d)
    setForm({
      name: d.name,
      type: d.type,
      value: String(d.value),
      categories: parseDiscountCategories(d.category),
      active: d.active,
      startDate: d.startDate ? String(d.startDate).slice(0, 10) : '',
      endDate: d.endDate ? String(d.endDate).slice(0, 10) : '',
      branchScope: branchScopeFromRecord(d.branchId),
    })
    setOpen(true)
  }

  const toggleCategory = (name, checked) => {
    setForm((prev) => {
      if (name === ALL) {
        return { ...prev, categories: checked ? [ALL] : [] }
      }
      const withoutAll = (prev.categories || []).filter((c) => c !== ALL && c !== name)
      const next = checked ? [...withoutAll, name] : withoutAll
      return { ...prev, categories: next.length ? next : [ALL] }
    })
  }

  const handleSave = async () => {
    if (!form.name.trim() || !token) {
      toast.error('Name is required')
      return
    }
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      type: form.type,
      value: parseFloat(form.value) || 0,
      category: serializeDiscountCategories(form.categories),
      active: form.active,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      endDate: form.endDate ? new Date(`${form.endDate}T23:59:59`).toISOString() : null,
      branchId: branchScopeToApi(form.branchScope),
    }
    try {
      if (editing) {
        const discount = await updateDiscountRequest(token, editing.id, payload)
        dispatch(updateDiscount(discount))
        toast.success('Discount updated')
      } else {
        const discount = await createDiscountRequest(token, payload)
        dispatch(addDiscount(discount))
        toast.success('Discount created')
      }
      resetAndClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save discount')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId || !token) return
    try {
      await deleteDiscountRequest(token, deleteId)
      dispatch(deleteDiscount(deleteId))
      setSelectedIds((prev) => prev.filter((x) => x !== deleteId))
      toast.success('Deleted')
      setDeleteId(null)
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    }
  }

  // ---- Selection helpers ----
  const visibleIds = useMemo(() => discounts.map((d) => d.id), [discounts])
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
      ids.map((id) => deleteDiscountRequest(token, id)),
    )
    let ok = 0
    let failed = 0
    results.forEach((r, idx) => {
      if (r.status === 'fulfilled') {
        ok += 1
        dispatch(deleteDiscount(ids[idx]))
      } else {
        failed += 1
      }
    })
    setBulkBusy(false)
    setBulkDeleteOpen(false)
    clearSelection()
    if (ok > 0 && failed === 0) toast.success(`Deleted ${ok} discount${ok === 1 ? '' : 's'}`)
    else if (ok > 0 && failed > 0) toast.error(`Deleted ${ok}, failed ${failed}`)
    else toast.error('Failed to delete selected discounts')
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

  const buildBulkPayload = (d) => {
    const payload = {
      name: d.name,
      type: d.type,
      value: Number(d.value) || 0,
      category: serializeDiscountCategories(parseDiscountCategories(d.category)),
      active: d.active !== false,
      startDate: d.startDate ? new Date(d.startDate).toISOString() : null,
      endDate: d.endDate ? new Date(d.endDate).toISOString() : null,
      branchId: branchScopeToApi(branchScopeFromRecord(d.branchId)),
    }
    if (bulkForm.active !== UNCHANGED) payload.active = bulkForm.active === 'yes'
    if (bulkForm.endDateMode === 'set') {
      payload.endDate = bulkForm.endDateValue
        ? new Date(`${bulkForm.endDateValue}T23:59:59`).toISOString()
        : null
    } else if (bulkForm.endDateMode === 'clear') {
      payload.endDate = null
    }
    return payload
  }

  const handleBulkEdit = async () => {
    if (!token || selectedIds.length === 0) return
    const selected = discounts.filter((d) => selectedIds.includes(d.id))
    if (selected.length === 0) {
      closeBulkEdit()
      return
    }
    setBulkBusy(true)
    const results = await Promise.allSettled(
      selected.map((d) => updateDiscountRequest(token, d.id, buildBulkPayload(d))),
    )
    let ok = 0
    let failed = 0
    results.forEach((r) => {
      if (r.status === 'fulfilled') {
        ok += 1
        dispatch(updateDiscount(r.value))
      } else {
        failed += 1
      }
    })
    setBulkBusy(false)
    closeBulkEdit()
    clearSelection()
    if (ok > 0 && failed === 0) toast.success(`Updated ${ok} discount${ok === 1 ? '' : 's'}`)
    else if (ok > 0 && failed > 0) toast.error(`Updated ${ok}, failed ${failed}`)
    else toast.error('Failed to update selected discounts')
  }

  const allSelected = (form.categories || []).includes(ALL)

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
                aria-label={`Select ${r.name}`}
              />
            ),
          },
        ]
      : []),
    { header: 'Name', key: 'name' },
    { header: 'Type', key: 'type' },
    {
      header: 'Value',
      render: (r) => (r.type === 'percentage' ? `${r.value}%` : formatCurrency(r.value)),
    },
    {
      header: 'Category',
      render: (r) => formatDiscountCategories(r),
    },
    {
      header: 'Period',
      render: (r) => `${formatDate(r.startDate)} - ${formatDate(r.endDate)}`,
    },
    {
      header: 'Status',
      render: (r) => <StatusBadge status={r.active ? 'active' : 'inactive'} />,
    },
    ...(canEdit
      ? [{
          header: 'Actions',
          render: (r) => (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setDeleteId(r.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ),
        }]
      : []),
  ]

  return (
    <div>
      <PageHeader
        title="Discounts"
        description="Permanent sale prices on menu items (via product form). No checkout code — different from Offers (auto promos) and Coupons (codes)."
        actionLabel={canEdit ? 'Add Discount' : undefined}
        onAction={canEdit ? openCreate : undefined}
      />

      {/* Select-all / bulk-actions bar */}
      {canEdit && discounts.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2">
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <Checkbox
              checked={allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false}
              onCheckedChange={(v) => toggleSelectAll(v === true)}
              aria-label="Select all discounts"
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

      <DataTable data={discounts} columns={columns} searchKey="name" />

      <FormDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={editing ? 'Edit Discount' : 'Add Discount'}
        description="These appear in the product form Discount dropdown."
        size="md"
        footer={
          <>
            <Button type="button" variant="outline" onClick={resetAndClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !canEdit}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      >
        <FormSection title="Details">
          <BranchScopeField
            value={form.branchScope}
            onChange={(v) => setForm({ ...form, branchScope: v })}
          />
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Weekend 10% Off"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>{form.type === 'percentage' ? 'Percent' : 'Amount (Rs)'}</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder={form.type === 'percentage' ? '10' : '100'}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Applies to categories</Label>
            <div className="max-h-44 overflow-y-auto rounded-lg border p-3 space-y-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => toggleCategory(ALL, Boolean(checked))}
                />
                <span>All categories</span>
              </label>
              {formCategories.map((c) => {
                const checked = !allSelected && (form.categories || []).includes(c.name)
                return (
                  <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={checked}
                      disabled={allSelected}
                      onCheckedChange={(v) => toggleCategory(c.name, Boolean(v))}
                    />
                    <span className="truncate">{c.name}</span>
                  </label>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Select one or more categories, or All categories.
            </p>
          </div>
        </FormSection>

        <FormSection title="Schedule">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Start date</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>End date</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
            <div>
              <Label>Active</Label>
              <p className="text-xs text-muted-foreground">Only active discounts show on products</p>
            </div>
            <Switch
              checked={form.active}
              onCheckedChange={(v) => setForm({ ...form, active: v })}
            />
          </div>
        </FormSection>
      </FormDialog>

      {/* ---- Bulk Edit dialog ---- */}
      <FormDialog
        open={bulkEditOpen}
        onOpenChange={(next) => !next && closeBulkEdit()}
        title={`Edit ${selectedIds.length} discount${selectedIds.length === 1 ? '' : 's'}`}
        description="Only fields you change here will be applied. Leave a field as 'Keep current' to leave it untouched."
        footer={
          <>
            <Button type="button" variant="outline" onClick={closeBulkEdit} disabled={bulkBusy}>
              Cancel
            </Button>
            <Button type="button" onClick={handleBulkEdit} disabled={bulkBusy || !canEdit}>
              {bulkBusy ? 'Saving…' : 'Apply changes'}
            </Button>
          </>
        }
      >
        <FormSection title="Status">
          <div className="grid gap-2">
            <Label>Active</Label>
            <Select
              value={bulkForm.active}
              onValueChange={(v) => setBulkForm({ ...bulkForm, active: v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={UNCHANGED}>Keep current</SelectItem>
                <SelectItem value="yes">Active</SelectItem>
                <SelectItem value="no">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FormSection>

        <FormSection title="End date">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>End date action</Label>
              <Select
                value={bulkForm.endDateMode}
                onValueChange={(v) => setBulkForm({ ...bulkForm, endDateMode: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNCHANGED}>Keep current</SelectItem>
                  <SelectItem value="set">Set new end date</SelectItem>
                  <SelectItem value="clear">Clear end date (no expiry)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {bulkForm.endDateMode === 'set' ? (
              <div className="grid gap-2">
                <Label>New end date</Label>
                <Input
                  type="date"
                  value={bulkForm.endDateValue}
                  onChange={(e) => setBulkForm({ ...bulkForm, endDateValue: e.target.value })}
                />
              </div>
            ) : null}
          </div>
        </FormSection>
      </FormDialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Discount"
        description="Delete this discount?"
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={(next) => !next && setBulkDeleteOpen(false)}
        title={`Delete ${selectedIds.length} discount${selectedIds.length === 1 ? '' : 's'}?`}
        description="This will permanently remove the selected discounts. This action cannot be undone."
        onConfirm={handleBulkDelete}
      />
    </div>
  )
}