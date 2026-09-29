import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { AiImageField } from '@/components/shared/AiImageField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormDialog, FormSection } from '@/components/shared/FormDialog'
import { BranchBadge } from '@/components/shared/BranchBadge'
import {
  BranchScopeField,
  branchScopeFromRecord,
  branchScopeToApi,
  useDefaultBranchScope,
} from '@/components/shared/BranchScopeField'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addAddon, updateAddon, deleteAddon } from '@/store/slices/addonsSlice'
import { selectBranchAddons, selectAuth, selectIsAllBranches } from '@/store/selectors'
import { formatCurrency } from '@/lib/formatters'
import {
  createAddonRequest,
  updateAddonRequest,
  deleteAddonRequest,
  resolveMediaUrl,
} from '@/lib/api'
import { usePermission } from '@/hooks/usePermission'

const emptyForm = { name: '', price: '', originalPrice: '', image: '', status: 'active', branchScope: 'all' }

/** Bulk edit uses "__unchanged__" sentinel so users can leave fields alone. */
const UNCHANGED = '__unchanged__'

const emptyBulkForm = {
  status: UNCHANGED,
  priceMode: UNCHANGED,
  priceValue: '',
}

export default function AddonsPage() {
  const dispatch = useAppDispatch()
  const { canManage } = usePermission()
  const canEdit = canManage('products')

  const addons = useAppSelector(selectBranchAddons)
  const { token } = useAppSelector(selectAuth)
  const allMode = useAppSelector(selectIsAllBranches)
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

  const openEdit = (addon) => {
    setEditing(addon)
    setForm({
      name: addon.name,
      price: String(addon.price ?? ''),
      originalPrice: addon.originalPrice != null ? String(addon.originalPrice) : '',
      image: addon.image || '',
      status: addon.status || 'active',
      branchScope: branchScopeFromRecord(addon.branchId),
    })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !token) {
      toast.error('Name is required')
      return
    }
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      price: parseFloat(form.price) || 0,
      originalPrice:
        form.originalPrice !== '' && form.originalPrice != null
          ? parseFloat(form.originalPrice)
          : null,
      image: form.image || '',
      status: form.status,
      branchId: branchScopeToApi(form.branchScope),
    }
    try {
      if (editing) {
        const addon = await updateAddonRequest(token, editing.id, payload)
        dispatch(updateAddon(addon))
        toast.success('Addon updated')
      } else {
        const addon = await createAddonRequest(token, payload)
        dispatch(addAddon(addon))
        toast.success('Addon created')
      }
      resetAndClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save addon')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId || !token) return
    try {
      await deleteAddonRequest(token, deleteId)
      dispatch(deleteAddon(deleteId))
      toast.success('Deleted')
      setDeleteId(null)
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    }
  }

  // ---- Selection helpers ----
  const visibleIds = useMemo(() => addons.map((a) => a.id), [addons])
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
      ids.map((id) => deleteAddonRequest(token, id)),
    )
    let ok = 0
    let failed = 0
    results.forEach((r, idx) => {
      if (r.status === 'fulfilled') {
        ok += 1
        dispatch(deleteAddon(ids[idx]))
      } else {
        failed += 1
      }
    })
    setBulkBusy(false)
    setBulkDeleteOpen(false)
    clearSelection()
    if (ok > 0 && failed === 0) toast.success(`Deleted ${ok} addon${ok === 1 ? '' : 's'}`)
    else if (ok > 0 && failed > 0) toast.error(`Deleted ${ok}, failed ${failed}`)
    else toast.error('Failed to delete selected addons')
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

  const buildBulkPayload = (a) => {
    const payload = {
      name: a.name,
      price: Number(a.price) || 0,
      originalPrice: a.originalPrice != null ? Number(a.originalPrice) : null,
      image: a.image || '',
      status: a.status || 'active',
      branchId: branchScopeToApi(branchScopeFromRecord(a.branchId)),
    }
    if (bulkForm.status !== UNCHANGED) payload.status = bulkForm.status
    if (bulkForm.priceMode !== UNCHANGED) {
      if (bulkForm.priceMode === 'set') {
        const v = parseFloat(bulkForm.priceValue)
        payload.price = Number.isNaN(v) ? 0 : v
      } else if (bulkForm.priceMode === 'increase') {
        const v = parseFloat(bulkForm.priceValue)
        const pct = Number.isNaN(v) ? 0 : v
        payload.price = Math.round(payload.price * (1 + pct / 100) * 100) / 100
      } else if (bulkForm.priceMode === 'decrease') {
        const v = parseFloat(bulkForm.priceValue)
        const pct = Number.isNaN(v) ? 0 : v
        payload.price = Math.round(payload.price * (1 - pct / 100) * 100) / 100
      }
    }
    return payload
  }

  const handleBulkEdit = async () => {
    if (!token || selectedIds.length === 0) return
    const selected = addons.filter((a) => selectedIds.includes(a.id))
    if (selected.length === 0) {
      closeBulkEdit()
      return
    }
    setBulkBusy(true)
    const results = await Promise.allSettled(
      selected.map((a) => updateAddonRequest(token, a.id, buildBulkPayload(a))),
    )
    let ok = 0
    let failed = 0
    results.forEach((r) => {
      if (r.status === 'fulfilled') {
        ok += 1
        dispatch(updateAddon(r.value))
      } else {
        failed += 1
      }
    })
    setBulkBusy(false)
    closeBulkEdit()
    clearSelection()
    if (ok > 0 && failed === 0) toast.success(`Updated ${ok} addon${ok === 1 ? '' : 's'}`)
    else if (ok > 0 && failed > 0) toast.error(`Updated ${ok}, failed ${failed}`)
    else toast.error('Failed to update selected addons')
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
                aria-label={`Select ${r.name}`}
              />
            ),
          },
        ]
      : []),
    {
      header: 'Addon',
      render: (r) => (
        <div className="flex items-center gap-3">
          {r.image ? (
            <img
              src={resolveMediaUrl(r.image)}
              alt=""
              className="h-10 w-10 rounded object-cover border"
            />
          ) : (
            <div className="h-10 w-10 rounded bg-muted border" />
          )}
          <span className="font-medium">{r.name}</span>
        </div>
      ),
    },
    { header: 'Price', render: (r) => (
      <span className="tabular-nums">
        {r.originalPrice != null && Number(r.originalPrice) > Number(r.price ?? 0) ? (
          <>
            <span className="text-muted-foreground line-through mr-1">
              {formatCurrency(r.originalPrice)}
            </span>
            {formatCurrency(r.price)}
          </>
        ) : (
          formatCurrency(r.price)
        )}
      </span>
    ) },
    ...(allMode
      ? [{ header: 'Branch', render: (r) => <BranchBadge branchId={r.branchId} /> }]
      : []),
    { header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    ...(canEdit
      ? [
          {
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
          },
        ]
      : []),
  ]

  return (
    <div>
      <PageHeader
        title="Addons"
        description="Extras customers can add to menu items — also shown on the ordering site"
        actionLabel={canEdit ? 'Add Addon' : undefined}
        onAction={canEdit ? openCreate : undefined}
      />

      {/* Select-all / bulk-actions bar */}
      {canEdit && addons.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2">
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <Checkbox
              checked={allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false}
              onCheckedChange={(v) => toggleSelectAll(v === true)}
              aria-label="Select all addons"
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
              <Button type="button" variant="ghost" size="sm" onClick={clearSelection}>
                Clear
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={bulkBusy}
                onClick={openBulkEdit}
              >
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

      <DataTable data={addons} columns={columns} searchKey="name" />

      <FormDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={`${editing ? 'Edit' : 'Add'} Addon`}
        footer={
          <>
            <Button type="button" variant="outline" onClick={resetAndClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving || !canEdit}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      >
        <BranchScopeField
          value={form.branchScope}
          onChange={(v) => setForm({ ...form, branchScope: v })}
        />
        <div className="grid gap-2">
          <Label>Name</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Price (sale)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Original / compare-at price</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.originalPrice}
              onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
              placeholder="Optional"
            />
            <p className="text-xs text-muted-foreground">Add price comparison (shown struck through when higher than sale price).</p>
          </div>
        </div>
        <AiImageField
          label="Image"
          value={form.image}
          title={form.name}
          description="Food add-on or side for a restaurant meal"
          kind="addon"
          onChange={(url) => setForm((prev) => ({ ...prev, image: url }))}
        />
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
      </FormDialog>

      {/* ---- Bulk Edit dialog ---- */}
      <FormDialog
        open={bulkEditOpen}
        onOpenChange={(next) => !next && closeBulkEdit()}
        title={`Edit ${selectedIds.length} addon${selectedIds.length === 1 ? '' : 's'}`}
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
            <Label>Status</Label>
            <Select
              value={bulkForm.status}
              onValueChange={(v) => setBulkForm({ ...bulkForm, status: v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={UNCHANGED}>Keep current</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FormSection>

        <FormSection title="Price">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Price action</Label>
              <Select
                value={bulkForm.priceMode}
                onValueChange={(v) => setBulkForm({ ...bulkForm, priceMode: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNCHANGED}>Keep current</SelectItem>
                  <SelectItem value="set">Set to fixed price</SelectItem>
                  <SelectItem value="increase">Increase by %</SelectItem>
                  <SelectItem value="decrease">Decrease by %</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {bulkForm.priceMode !== UNCHANGED ? (
              <div className="grid gap-2">
                <Label>
                  {bulkForm.priceMode === 'set'
                    ? 'New price'
                    : bulkForm.priceMode === 'increase'
                      ? 'Increase %'
                      : 'Decrease %'}
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={bulkForm.priceValue}
                  onChange={(e) => setBulkForm({ ...bulkForm, priceValue: e.target.value })}
                  placeholder={bulkForm.priceMode === 'set' ? '0' : '10'}
                />
              </div>
            ) : null}
          </div>
        </FormSection>
      </FormDialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Addon"
        description="Delete this addon?"
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={(next) => !next && setBulkDeleteOpen(false)}
        title={`Delete ${selectedIds.length} addon${selectedIds.length === 1 ? '' : 's'}?`}
        description="This will permanently remove the selected addons. This action cannot be undone."
        onConfirm={handleBulkDelete}
      />
    </div>
  )
}