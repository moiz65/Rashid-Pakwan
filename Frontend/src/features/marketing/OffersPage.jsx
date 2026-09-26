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
      toast.success('Deleted')
      setDeleteId(null)
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    }
  }

  const columns = [
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

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Offer"
        description="Remove this offer?"
        onConfirm={handleDelete}
      />
    </div>
  )
}
