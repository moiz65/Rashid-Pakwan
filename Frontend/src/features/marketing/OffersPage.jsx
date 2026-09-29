import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TaxFields } from '@/components/shared/TaxFields'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormDialog, FormSection } from '@/components/shared/FormDialog'
import {
  BranchScopeField,
  BRANCH_SCOPE_ALL,
  branchScopeFromRecord,
  branchScopeToApi,
  useDefaultBranchScope,
} from '@/components/shared/BranchScopeField'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addOffer, updateOffer, deleteOffer } from '@/store/slices/marketingSlice'
import { selectAuth, selectBranchCategories, selectBranchOffers, selectBranchNameById } from '@/store/selectors'
import { formatDate } from '@/lib/formatters'
import {
  createOfferRequest,
  deleteOfferRequest,
  updateOfferRequest,
} from '@/lib/api'
import { usePermission } from '@/hooks/usePermission'
import { useCatalogForBranchScope } from '@/hooks/useCatalogForBranchScope'
import { activeCatalogAddons } from '@/lib/orderAddons'

const NONE = '__none__'

const emptyForm = {
  title: '',
  description: '',
  type: 'percentage',
  discountValue: '',
  minOrder: '0',
  maxDiscount: '',
  buyQty: '1',
  getQty: '1',
  applyScope: 'all',
  categoryId: '',
  productIds: [],
  buyProductIds: [],
  getProductIds: [],
  freeProductId: '',
  taxCodeId: '',
  taxMode: 'inclusive',
  active: true,
  startDate: '',
  endDate: '',
  branchScope: 'all',
}

const TYPE_LABELS = {
  percentage: 'Percentage off',
  fixed: 'Fixed amount off',
  bogo: 'Buy X Get Y',
  freebie: 'Free item (min order)',
  free_delivery: 'Free delivery',
}

/** Bulk edit uses "__unchanged__" sentinel so users can leave fields alone. */
const UNCHANGED = '__unchanged__'

const emptyBulkForm = {
  active: UNCHANGED,
  endDateMode: UNCHANGED,
  endDateValue: '',
}

export default function OffersPage() {
  const dispatch = useAppDispatch()
  const offers = useAppSelector(selectBranchOffers)
  const categories = useAppSelector(selectBranchCategories)
  const taxCodes = useAppSelector((s) => s.settings.taxCodes || [])
  const { token } = useAppSelector(selectAuth)
  const { canManage } = usePermission()
  const canEdit = canManage('marketing')
  const defaultBranchScope = useDefaultBranchScope()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const { products, drinks, addons } = useCatalogForBranchScope(form.branchScope)
  const branchNames = useAppSelector(selectBranchNameById)
  const showBranchInPicker = !form.branchScope || form.branchScope === BRANCH_SCOPE_ALL

  // ---- Selection state ----
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkEditOpen, setBulkEditOpen] = useState(false)
  const [bulkForm, setBulkForm] = useState(emptyBulkForm)
  const [bulkBusy, setBulkBusy] = useState(false)

  const menuItems = useMemo(() => {
    const label = (name, branchId) => {
      if (!showBranchInPicker || !branchId) return name
      const branch = branchNames[branchId]
      return branch ? `${name} (${branch})` : name
    }
    const productItems = (products || [])
      .filter((p) => p.status === 'active' || !p.status)
      .map((p) => ({ id: p.id, name: label(p.name, p.branchId), kind: 'Product' }))
    const drinkItems = (drinks || [])
      .filter((d) => d.status === 'active' || !d.status)
      .map((d) => ({ id: d.id, name: label(d.name, d.branchId), kind: 'Drink' }))
    const addonItems = activeCatalogAddons(addons).map((a) => ({
      id: a.id,
      name: label(a.name, a.branchId),
      kind: 'Add-on',
    }))
    return [...productItems, ...drinkItems, ...addonItems]
  }, [products, drinks, addons, showBranchInPicker, branchNames])

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

  const openEdit = (o) => {
    setEditing(o)
    setForm({
      title: o.title,
      description: o.description || o.conditions || '',
      type: ['percentage', 'fixed', 'bogo', 'freebie', 'free_delivery'].includes(o.type) ? o.type : 'percentage',
      discountValue: String(o.discountValue ?? ''),
      minOrder: String(o.minOrder ?? 0),
      maxDiscount: o.maxDiscount != null ? String(o.maxDiscount) : '',
      buyQty: String(o.buyQty ?? 1),
      getQty: String(o.getQty ?? 1),
      applyScope: o.applyScope || 'all',
      categoryId: o.categoryId || '',
      productIds: Array.isArray(o.productIds) ? o.productIds : [],
      buyProductIds: Array.isArray(o.buyProductIds) ? o.buyProductIds : [],
      getProductIds: Array.isArray(o.getProductIds) ? o.getProductIds : [],
      freeProductId: o.freeProductId || '',
      taxCodeId: o.taxCodeId || '',
      taxMode: o.taxMode || 'inclusive',
      active: o.active,
      startDate: o.startDate ? String(o.startDate).slice(0, 10) : '',
      endDate: o.endDate ? String(o.endDate).slice(0, 10) : '',
      branchScope: branchScopeFromRecord(o.branchId),
    })
    setOpen(true)
  }

  const toggleProduct = (id) => {
    setForm((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(id)
        ? prev.productIds.filter((p) => p !== id)
        : [...prev.productIds, id],
    }))
  }

  const toggleBuyProduct = (id) => {
    setForm((prev) => ({
      ...prev,
      buyProductIds: prev.buyProductIds.includes(id)
        ? prev.buyProductIds.filter((p) => p !== id)
        : [...prev.buyProductIds, id],
    }))
  }

  const toggleGetProduct = (id) => {
    setForm((prev) => ({
      ...prev,
      getProductIds: prev.getProductIds.includes(id)
        ? prev.getProductIds.filter((p) => p !== id)
        : [...prev.getProductIds, id],
    }))
  }

  const productName = (id) => menuItems.find((p) => p.id === id)?.name || id

  const renderMenuChecklist = (selectedIds, onToggle, emptyText = 'No menu items yet.') => {
    if (!menuItems.length) {
      return <p className="text-sm text-muted-foreground">{emptyText}</p>
    }
    return menuItems.map((item) => (
      <label key={item.id} className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={selectedIds.includes(item.id)}
          onChange={() => onToggle(item.id)}
        />
        <span className="flex-1 truncate">{item.name}</span>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground shrink-0">
          {item.kind}
        </span>
      </label>
    ))
  }

  const handleSave = async () => {
    if (!form.title.trim() || !token) {
      toast.error('Title is required')
      return
    }
    setSaving(true)
    const payload = {
      title: form.title.trim(),
      description: form.description,
      type: form.type,
      discountValue: parseFloat(form.discountValue) || 0,
      minOrder: parseFloat(form.minOrder) || 0,
      maxDiscount: form.maxDiscount === '' ? null : parseFloat(form.maxDiscount),
      buyQty: parseInt(form.buyQty, 10) || 1,
      getQty: parseInt(form.getQty, 10) || 1,
      applyScope: form.applyScope,
      categoryId: form.applyScope === 'category' ? form.categoryId || null : null,
      productIds: form.applyScope === 'products' ? form.productIds : [],
      buyProductIds: form.type === 'bogo' ? form.buyProductIds : [],
      getProductIds: form.type === 'bogo' ? form.getProductIds : [],
      freeProductId: form.type === 'freebie' ? form.freeProductId || null : null,
      taxCodeId: form.taxCodeId || null,
      taxMode: form.taxMode || 'inclusive',
      active: form.active,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      branchId: branchScopeToApi(form.branchScope),
    }
    try {
      if (editing) {
        const offer = await updateOfferRequest(token, editing.id, payload)
        dispatch(updateOffer(offer))
        toast.success('Offer updated')
      } else {
        const offer = await createOfferRequest(token, payload)
        dispatch(addOffer(offer))
        toast.success('Offer created')
      }
      resetAndClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save offer')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId || !token) return
    try {
      await deleteOfferRequest(token, deleteId)
      dispatch(deleteOffer(deleteId))
      setSelectedIds((prev) => prev.filter((x) => x !== deleteId))
      toast.success('Deleted')
      setDeleteId(null)
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    }
  }

  // ---- Selection helpers ----
  const visibleIds = useMemo(() => offers.map((o) => o.id), [offers])
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
      ids.map((id) => deleteOfferRequest(token, id)),
    )
    let ok = 0
    let failed = 0
    results.forEach((r, idx) => {
      if (r.status === 'fulfilled') {
        ok += 1
        dispatch(deleteOffer(ids[idx]))
      } else {
        failed += 1
      }
    })
    setBulkBusy(false)
    setBulkDeleteOpen(false)
    clearSelection()
    if (ok > 0 && failed === 0) toast.success(`Deleted ${ok} offer${ok === 1 ? '' : 's'}`)
    else if (ok > 0 && failed > 0) toast.error(`Deleted ${ok}, failed ${failed}`)
    else toast.error('Failed to delete selected offers')
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

  const buildBulkPayload = (o) => {
    const payload = {
      title: o.title,
      description: o.description || '',
      type: o.type,
      discountValue: Number(o.discountValue) || 0,
      minOrder: Number(o.minOrder) || 0,
      maxDiscount: o.maxDiscount != null ? Number(o.maxDiscount) : null,
      buyQty: Number(o.buyQty) || 1,
      getQty: Number(o.getQty) || 1,
      applyScope: o.applyScope || 'all',
      categoryId: o.categoryId || null,
      productIds: Array.isArray(o.productIds) ? o.productIds : [],
      buyProductIds: Array.isArray(o.buyProductIds) ? o.buyProductIds : [],
      getProductIds: Array.isArray(o.getProductIds) ? o.getProductIds : [],
      freeProductId: o.freeProductId || null,
      taxCodeId: o.taxCodeId || null,
      taxMode: o.taxMode || 'inclusive',
      active: o.active !== false,
      startDate: o.startDate ? new Date(o.startDate).toISOString() : null,
      endDate: o.endDate ? new Date(o.endDate).toISOString() : null,
      branchId: branchScopeToApi(branchScopeFromRecord(o.branchId)),
    }
    if (bulkForm.active !== UNCHANGED) payload.active = bulkForm.active === 'yes'
    if (bulkForm.endDateMode === 'set') {
      payload.endDate = bulkForm.endDateValue
        ? new Date(bulkForm.endDateValue).toISOString()
        : null
    } else if (bulkForm.endDateMode === 'clear') {
      payload.endDate = null
    }
    return payload
  }

  const handleBulkEdit = async () => {
    if (!token || selectedIds.length === 0) return
    const selected = offers.filter((o) => selectedIds.includes(o.id))
    if (selected.length === 0) {
      closeBulkEdit()
      return
    }
    setBulkBusy(true)
    const results = await Promise.allSettled(
      selected.map((o) => updateOfferRequest(token, o.id, buildBulkPayload(o))),
    )
    let ok = 0
    let failed = 0
    results.forEach((r) => {
      if (r.status === 'fulfilled') {
        ok += 1
        dispatch(updateOffer(r.value))
      } else {
        failed += 1
      }
    })
    setBulkBusy(false)
    closeBulkEdit()
    clearSelection()
    if (ok > 0 && failed === 0) toast.success(`Updated ${ok} offer${ok === 1 ? '' : 's'}`)
    else if (ok > 0 && failed > 0) toast.error(`Updated ${ok}, failed ${failed}`)
    else toast.error('Failed to update selected offers')
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
                aria-label={`Select ${r.title}`}
              />
            ),
          },
        ]
      : []),
    { header: 'Title', key: 'title' },
    { header: 'Type', render: (r) => TYPE_LABELS[r.type] || r.type },
    {
      header: 'Rule',
      render: (r) => {
        if (r.type === 'percentage') return `${r.discountValue}% off`
        if (r.type === 'fixed') return `${r.discountValue} off`
        if (r.type === 'bogo') {
          const buy = (r.buyProductIds || []).map(productName).join(', ') || '—'
          const get = (r.getProductIds || []).map(productName).join(', ') || '—'
          return `Buy ${r.buyQty}× ${buy} → Get ${r.getQty}× ${get}`
        }
        if (r.type === 'freebie') return `Free item @ min ${r.minOrder}`
        if (r.type === 'free_delivery') return `Free delivery @ min ${r.minOrder}`
        return r.conditions || '—'
      },
    },
    {
      header: 'Dates',
      render: (r) =>
        r.startDate || r.endDate
          ? `${formatDate(r.startDate)} – ${formatDate(r.endDate)}`
          : 'Always',
    },
    {
      header: 'Status',
      render: (r) => <StatusBadge status={r.active ? 'active' : 'inactive'} />,
    },
    ...(canEdit
      ? [{
          header: '',
          render: (r) => (
            <div className="flex gap-1 justify-end">
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
        title="Offers"
        description="Automatic promotions (no code) — shown on the website. Different from Coupons (code at checkout), Discounts (menu sale prices), and Deals (fixed combos)."
        action={canEdit ? <Button onClick={openCreate}>Add Offer</Button> : undefined}
      />

      {/* Select-all / bulk-actions bar */}
      {canEdit && offers.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2">
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <Checkbox
              checked={allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false}
              onCheckedChange={(v) => toggleSelectAll(v === true)}
              aria-label="Select all offers"
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

      <DataTable data={offers} columns={columns} searchKey="title" searchPlaceholder="Search offers..." />

      <FormDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={editing ? 'Edit Offer' : 'Add Offer'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={resetAndClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !canEdit}>{saving ? 'Saving…' : 'Save'}</Button>
          </>
        }
      >
        <FormSection title="Basics">
          <BranchScopeField
            value={form.branchScope}
            onChange={(v) => setForm({ ...form, branchScope: v })}
          />
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
            />
          </div>
          <div className="grid gap-2">
            <Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </FormSection>

        <FormSection title="Discount rules">
          {(form.type === 'percentage' || form.type === 'fixed') && (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{form.type === 'percentage' ? 'Percent' : 'Amount'}</Label>
                <Input
                  type="number"
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                />
              </div>
              {form.type === 'percentage' && (
                <div className="grid gap-2">
                  <Label>Max discount</Label>
                  <Input
                    type="number"
                    value={form.maxDiscount}
                    onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                    placeholder="Optional cap"
                  />
                </div>
              )}
            </div>
          )}

          {form.type === 'bogo' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Buy qty (X)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.buyQty}
                    onChange={(e) => setForm({ ...form, buyQty: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Get qty free (Y)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.getQty}
                    onChange={(e) => setForm({ ...form, getQty: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2 max-h-40 overflow-y-auto rounded-md border p-2">
                <Label>Buy items (X) — products, drinks, or add-ons</Label>
                {renderMenuChecklist(form.buyProductIds, toggleBuyProduct)}
              </div>
              <div className="grid gap-2 max-h-40 overflow-y-auto rounded-md border p-2">
                <Label>Get items (Y) — these become free at checkout</Label>
                {renderMenuChecklist(form.getProductIds, toggleGetProduct)}
              </div>
            </>
          )}

          {form.type === 'freebie' && (
            <div className="grid gap-2">
              <Label>Free menu item</Label>
              <Select
                value={form.freeProductId || NONE}
                onValueChange={(v) => setForm({ ...form, freeProductId: v === NONE ? '' : v })}
              >
                <SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Select…</SelectItem>
                  {menuItems.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.kind})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label>{form.type === 'free_delivery' ? 'Min order for free delivery' : 'Min order'}</Label>
            <Input
              type="number"
              value={form.minOrder}
              onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
            />
          </div>

          {form.type !== 'bogo' && (
          <div className="grid gap-2">
            <Label>Applies to</Label>
            <Select value={form.applyScope} onValueChange={(v) => setForm({ ...form, applyScope: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Entire order</SelectItem>
                <SelectItem value="category">One category</SelectItem>
                <SelectItem value="products">Selected products / drinks / add-ons</SelectItem>
              </SelectContent>
            </Select>
          </div>
          )}

          {form.type !== 'bogo' && form.applyScope === 'category' && (
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select
                value={form.categoryId || NONE}
                onValueChange={(v) => setForm({ ...form, categoryId: v === NONE ? '' : v })}
              >
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Select…</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {form.type !== 'bogo' && form.applyScope === 'products' && (
            <div className="grid gap-2 max-h-40 overflow-y-auto rounded-md border p-2">
              <Label>Menu items</Label>
              {renderMenuChecklist(form.productIds, toggleProduct)}
            </div>
          )}
        </FormSection>

        <FormSection title="Tax">
          <TaxFields
            taxCodes={taxCodes}
            taxCodeId={form.taxCodeId}
            taxMode={form.taxMode}
            onChange={(patch) => setForm({ ...form, ...patch })}
          />
        </FormSection>

        <FormSection title="Schedule">
          <div className="grid grid-cols-2 gap-4">
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
          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <Label>Active</Label>
            <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
          </div>
        </FormSection>
      </FormDialog>

      {/* ---- Bulk Edit dialog ---- */}
      <FormDialog
        open={bulkEditOpen}
        onOpenChange={(next) => !next && closeBulkEdit()}
        title={`Edit ${selectedIds.length} offer${selectedIds.length === 1 ? '' : 's'}`}
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
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Offer"
        description="Remove this offer?"
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={(next) => !next && setBulkDeleteOpen(false)}
        title={`Delete ${selectedIds.length} offer${selectedIds.length === 1 ? '' : 's'}?`}
        description="This will permanently remove the selected offers. This action cannot be undone."
        onConfirm={handleBulkDelete}
      />
    </div>
  )
}