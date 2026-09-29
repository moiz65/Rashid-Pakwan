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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
import { addDrink, updateDrink, deleteDrink } from '@/store/slices/drinksSlice'
import { selectBranchDrinks, selectAuth, selectIsAllBranches } from '@/store/selectors'
import { formatCurrency } from '@/lib/formatters'
import {
  createDrinkRequest,
  updateDrinkRequest,
  deleteDrinkRequest,
  resolveMediaUrl,
} from '@/lib/api'
import { usePermission } from '@/hooks/usePermission'

const UNLIMITED_STOCK = -1

const emptyForm = {
  name: '',
  description: '',
  price: '',
  stock: '',
  stockUnlimited: true,
  image: '',
  status: 'active',
  sortOrder: '0',
  branchScope: 'all',
}

/** Bulk edit uses "__unchanged__" sentinel so users can leave fields alone. */
const UNCHANGED = '__unchanged__'

const emptyBulkForm = {
  status: UNCHANGED,
  stockMode: UNCHANGED,
  stockValue: '',
  priceMode: UNCHANGED,
  priceValue: '',
}

function formatStock(stock) {
  const n = Number(stock)
  if (!Number.isFinite(n) || n < 0) {
    return <span title="Unlimited stock" className="text-lg leading-none">∞</span>
  }
  return n
}

export default function DrinksPage() {
  const dispatch = useAppDispatch()
  const { canManage } = usePermission()
  const canEdit = canManage('products')

  const drinks = useAppSelector(selectBranchDrinks)
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

  const openEdit = (drink) => {
    setEditing(drink)
    const unlimited = Number(drink.stock) < 0
    setForm({
      name: drink.name || '',
      description: drink.description || '',
      price: String(drink.price ?? ''),
      stock: unlimited ? '' : String(drink.stock ?? ''),
      stockUnlimited: unlimited,
      image: drink.image || '',
      status: drink.status || 'active',
      sortOrder: String(drink.sortOrder ?? 0),
      branchScope: branchScopeFromRecord(drink.branchId),
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
      description: form.description.trim(),
      price: parseFloat(form.price) || 0,
      stock: form.stockUnlimited ? UNLIMITED_STOCK : parseInt(form.stock, 10) || 0,
      image: form.image,
      status: form.status,
      sortOrder: parseInt(form.sortOrder, 10) || 0,
      branchId: branchScopeToApi(form.branchScope),
    }
    try {
      if (editing) {
        const drink = await updateDrinkRequest(token, editing.id, payload)
        dispatch(updateDrink(drink))
        toast.success('Drink updated')
      } else {
        const drink = await createDrinkRequest(token, payload)
        dispatch(addDrink(drink))
        toast.success('Drink created')
      }
      resetAndClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save drink')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId || !token) return
    try {
      await deleteDrinkRequest(token, deleteId)
      dispatch(deleteDrink(deleteId))
      toast.success('Deleted')
      setDeleteId(null)
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    }
  }

  // ---- Selection helpers ----
  const visibleIds = useMemo(() => drinks.map((d) => d.id), [drinks])
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
      ids.map((id) => deleteDrinkRequest(token, id)),
    )
    let ok = 0
    let failed = 0
    results.forEach((r, idx) => {
      if (r.status === 'fulfilled') {
        ok += 1
        dispatch(deleteDrink(ids[idx]))
      } else {
        failed += 1
      }
    })
    setBulkBusy(false)
    setBulkDeleteOpen(false)
    clearSelection()
    if (ok > 0 && failed === 0) toast.success(`Deleted ${ok} drink${ok === 1 ? '' : 's'}`)
    else if (ok > 0 && failed > 0) toast.error(`Deleted ${ok}, failed ${failed}`)
    else toast.error('Failed to delete selected drinks')
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
      description: d.description || '',
      price: Number(d.price) || 0,
      stock: Number(d.stock ?? 0),
      image: d.image || '',
      status: d.status || 'active',
      sortOrder: Number(d.sortOrder ?? 0),
      branchId: branchScopeToApi(branchScopeFromRecord(d.branchId)),
    }
    if (bulkForm.status !== UNCHANGED) payload.status = bulkForm.status
    if (bulkForm.stockMode !== UNCHANGED) {
      if (bulkForm.stockMode === 'unlimited') {
        payload.stock = UNLIMITED_STOCK
      } else {
        const v = parseInt(bulkForm.stockValue, 10)
        payload.stock = Number.isNaN(v) ? 0 : Math.max(0, v)
      }
    }
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
    const selected = drinks.filter((d) => selectedIds.includes(d.id))
    if (selected.length === 0) {
      closeBulkEdit()
      return
    }
    setBulkBusy(true)
    const results = await Promise.allSettled(
      selected.map((d) => updateDrinkRequest(token, d.id, buildBulkPayload(d))),
    )
    let ok = 0
    let failed = 0
    results.forEach((r) => {
      if (r.status === 'fulfilled') {
        ok += 1
        dispatch(updateDrink(r.value))
      } else {
        failed += 1
      }
    })
    setBulkBusy(false)
    closeBulkEdit()
    clearSelection()
    if (ok > 0 && failed === 0) toast.success(`Updated ${ok} drink${ok === 1 ? '' : 's'}`)
    else if (ok > 0 && failed > 0) toast.error(`Updated ${ok}, failed ${failed}`)
    else toast.error('Failed to update selected drinks')
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
      header: 'Drink',
      render: (r) => (
        <div className="flex items-center gap-3">
          {r.image ? (
            <img
              src={resolveMediaUrl(r.image)}
              alt=""
              className="h-10 w-10 rounded object-cover border"
            />
          ) : (
            <div className="h-10 w-10 rounded bg-muted" />
          )}
          <div>
            <p className="font-medium">{r.name}</p>
            {r.description ? (
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{r.description}</p>
            ) : null}
          </div>
        </div>
      ),
    },
    { header: 'Price', render: (r) => formatCurrency(r.price) },
    ...(allMode
      ? [{ header: 'Branch', render: (r) => <BranchBadge branchId={r.branchId} /> }]
      : []),
    { header: 'Stock', render: (r) => formatStock(r.stock) },
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
        title="Drinks"
        description="Manage drinks, stock, and pricing for the menu and deals"
        actionLabel={canEdit ? 'Add Drink' : undefined}
        onAction={canEdit ? openCreate : undefined}
      />

      {/* Select-all / bulk-actions bar */}
      {canEdit && drinks.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2">
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <Checkbox
              checked={allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false}
              onCheckedChange={(v) => toggleSelectAll(v === true)}
              aria-label="Select all drinks"
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

      <DataTable data={drinks} columns={columns} searchKey="name" />

      <FormDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={`${editing ? 'Edit' : 'Add'} Drink`}
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
        <BranchScopeField
          value={form.branchScope}
          onChange={(v) => setForm({ ...form, branchScope: v })}
        />
        <div className="grid gap-2">
          <Label>Name</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Description</Label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Price</Label>
            <Input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="out_of_stock">Out of stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={form.stockUnlimited}
              onCheckedChange={(v) => setForm({ ...form, stockUnlimited: v })}
            />
            <Label>Unlimited stock</Label>
          </div>
          {!form.stockUnlimited ? (
            <Input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              placeholder="Stock quantity"
            />
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label>Sort order</Label>
          <Input
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
          />
        </div>
        <AiImageField
          label="Image"
          value={form.image}
          title={form.name}
          description={form.description}
          kind="drink"
          onChange={(url) => setForm((prev) => ({ ...prev, image: url }))}
        />
      </FormDialog>

      {/* ---- Bulk Edit dialog ---- */}
      <FormDialog
        open={bulkEditOpen}
        onOpenChange={(next) => !next && closeBulkEdit()}
        title={`Edit ${selectedIds.length} drink${selectedIds.length === 1 ? '' : 's'}`}
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
                <SelectItem value="out_of_stock">Out of stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FormSection>

        <FormSection title="Stock">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Stock mode</Label>
              <Select
                value={bulkForm.stockMode}
                onValueChange={(v) => setBulkForm({ ...bulkForm, stockMode: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNCHANGED}>Keep current</SelectItem>
                  <SelectItem value="unlimited">Unlimited (∞)</SelectItem>
                  <SelectItem value="set">Set quantity</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {bulkForm.stockMode === 'set' ? (
              <div className="grid gap-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="0"
                  value={bulkForm.stockValue}
                  onChange={(e) => setBulkForm({ ...bulkForm, stockValue: e.target.value })}
                  placeholder="e.g. 50"
                />
              </div>
            ) : null}
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
        onOpenChange={() => setDeleteId(null)}
        title="Delete Drink"
        description="Delete this drink?"
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={(next) => !next && setBulkDeleteOpen(false)}
        title={`Delete ${selectedIds.length} drink${selectedIds.length === 1 ? '' : 's'}?`}
        description="This will permanently remove the selected drinks. This action cannot be undone."
        onConfirm={handleBulkDelete}
      />
    </div>
  )
}