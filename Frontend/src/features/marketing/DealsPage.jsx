import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ProductSearchSelect } from '@/components/shared/ProductSearchSelect'
import { AiImageField } from '@/components/shared/AiImageField'
import { TaxFields } from '@/components/shared/TaxFields'
import { AddonScopeFields } from '@/components/shared/AddonScopeFields'
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
import { addDeal, updateDeal, deleteDeal } from '@/store/slices/marketingSlice'
import {
  selectAuth,
  selectBranchDeals,
  selectBranchNameById,
} from '@/store/selectors'
import { formatCurrency, formatDate } from '@/lib/formatters'
import {
  createDealRequest,
  deleteDealRequest,
  resolveMediaUrl,
  updateDealRequest,
} from '@/lib/api'
import { useCatalogForBranchScope } from '@/hooks/useCatalogForBranchScope'
import { usePermission } from '@/hooks/usePermission'

const WEEK_DAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
]

const DAY_PRESETS = [
  { label: 'Every day', days: [0, 1, 2, 3, 4, 5, 6] },
  { label: 'Weekdays', days: [1, 2, 3, 4, 5] },
  { label: 'Weekends', days: [0, 6] },
  { label: 'Alt Mon/Wed/Fri', days: [1, 3, 5] },
  { label: 'Alt Tue/Thu/Sat', days: [2, 4, 6] },
]

const emptyItem = () => ({
  itemType: 'product',
  productId: '',
  drinkId: '',
  addonId: '',
  name: '',
  qty: '1',
  unitPrice: '',
  customerChoice: false,
  choiceIds: [],
})

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]

function createEmptyForm() {
  return {
    title: '',
    description: '',
    badgeText: '',
    image: '',
    price: '',
    originalPrice: '',
    taxCodeId: '',
    taxMode: 'inclusive',
    startAt: '',
    endAt: '',
    daysOfWeek: [...ALL_DAYS],
    dailyStartTime: '',
    dailyEndTime: '',
    showCountdown: true,
    active: true,
    sortOrder: '0',
    addonMode: 'all',
    addonIds: [],
    items: [emptyItem()],
    branchScope: 'all',
  }
}

function toLocalDateInput(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** YYYY-MM-DD → ISO; start = beginning of day, end = end of day (inclusive). */
function campaignDateToIso(value, endOfDay = false) {
  if (!value) return null
  const [y, m, day] = String(value).slice(0, 10).split('-').map(Number)
  if (!y || !m || !day) return null
  const d = endOfDay
    ? new Date(y, m - 1, day, 23, 59, 59, 999)
    : new Date(y, m - 1, day, 0, 0, 0, 0)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

function toTimeInput(value) {
  if (!value) return ''
  return String(value).slice(0, 5)
}

function formatDaysLabel(days) {
  if (!days || !days.length || days.length === 7) return 'Every day'
  const set = new Set(days.map(Number))
  if ([1, 2, 3, 4, 5].every((d) => set.has(d)) && set.size === 5) return 'Weekdays'
  if (set.size === 2 && set.has(0) && set.has(6)) return 'Weekends'
  if (set.size === 3 && set.has(1) && set.has(3) && set.has(5)) return 'Mon/Wed/Fri'
  if (set.size === 3 && set.has(2) && set.has(4) && set.has(6)) return 'Tue/Thu/Sat'
  return WEEK_DAYS.filter((d) => set.has(d.value)).map((d) => d.label).join(', ')
}

function dealScheduleStatus(deal) {
  if (!deal.active) return 'inactive'
  const now = new Date()
  const start = deal.startAt ? new Date(deal.startAt).getTime() : null
  const end = deal.endAt ? new Date(deal.endAt).getTime() : null
  if (start != null && now.getTime() < start) return 'scheduled'
  if (end != null && now.getTime() > end) return 'ended'

  const days = deal.daysOfWeek
  if (Array.isArray(days) && days.length > 0 && !days.map(Number).includes(now.getDay())) {
    return 'scheduled'
  }

  const pad = (n) => String(n).padStart(2, '0')
  const t = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  const dailyStart = deal.dailyStartTime ? String(deal.dailyStartTime).slice(0, 8) : null
  const dailyEnd = deal.dailyEndTime ? String(deal.dailyEndTime).slice(0, 8) : null
  if (dailyStart && dailyEnd) {
    if (dailyStart <= dailyEnd) {
      if (t < dailyStart || t > dailyEnd) return 'scheduled'
    } else if (t < dailyStart && t > dailyEnd) {
      return 'scheduled'
    }
  } else if (dailyStart && t < dailyStart) {
    return 'scheduled'
  } else if (dailyEnd && t > dailyEnd) {
    return 'scheduled'
  }
  return 'live'
}

function itemsSubtotal(items) {
  return items.reduce((sum, item) => {
    const qty = Math.max(1, parseInt(item.qty, 10) || 1)
    const price = parseFloat(item.unitPrice) || 0
    return sum + qty * price
  }, 0)
}

export default function DealsPage() {
  const dispatch = useAppDispatch()
  const { canManage } = usePermission()
  const canEdit = canManage('marketing')

  const deals = useAppSelector(selectBranchDeals)
  const taxCodes = useAppSelector((s) => s.settings.taxCodes || [])
  const { token } = useAppSelector(selectAuth)
  const defaultBranchScope = useDefaultBranchScope()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState(createEmptyForm)
  const [saving, setSaving] = useState(false)
  const { products, drinks, addons } = useCatalogForBranchScope(form.branchScope)
  const branchNames = useAppSelector(selectBranchNameById)
  const showBranchInPicker = !form.branchScope || form.branchScope === BRANCH_SCOPE_ALL

  const resetAndClose = () => {
    setOpen(false)
    setEditing(null)
    setForm(createEmptyForm())
  }

  const handleOpenChange = (next) => {
    if (!next) resetAndClose()
    else setOpen(true)
  }

  const selectedDays = Array.isArray(form.daysOfWeek) ? form.daysOfWeek : ALL_DAYS
  const subtotal = useMemo(() => itemsSubtotal(form.items || []), [form.items])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...createEmptyForm(), branchScope: defaultBranchScope })
    setOpen(true)
  }

  const openEdit = (deal) => {
    setEditing(deal)
    setForm({
      title: deal.title || '',
      description: deal.description || '',
      badgeText: deal.badgeText || '',
      image: deal.image || '',
      price: deal.price != null ? String(deal.price) : '',
      originalPrice: deal.originalPrice != null ? String(deal.originalPrice) : '',
      taxCodeId: deal.taxCodeId || '',
      taxMode: deal.taxMode || 'inclusive',
      startAt: toLocalDateInput(deal.startAt),
      endAt: toLocalDateInput(deal.endAt),
      daysOfWeek:
        Array.isArray(deal.daysOfWeek) && deal.daysOfWeek.length
          ? deal.daysOfWeek.map(Number)
          : [...ALL_DAYS],
      dailyStartTime: toTimeInput(deal.dailyStartTime),
      dailyEndTime: toTimeInput(deal.dailyEndTime),
      showCountdown: deal.showCountdown !== false,
      active: deal.active !== false,
      sortOrder: String(deal.sortOrder ?? 0),
      addonMode: deal.addonMode || 'all',
      addonIds: Array.isArray(deal.addonIds) ? deal.addonIds : [],
      items:
        deal.items?.length > 0
          ? deal.items.map((item) => ({
              itemType: item.itemType || 'product',
              productId: item.productId || '',
              drinkId: item.drinkId || '',
              addonId: item.addonId || '',
              name: item.name || '',
              qty: String(item.qty ?? 1),
              unitPrice: String(item.unitPrice ?? ''),
              customerChoice: Boolean(item.customerChoice),
              choiceIds: Array.isArray(item.choiceIds) ? item.choiceIds : [],
            }))
          : [emptyItem()],
      branchScope: branchScopeFromRecord(deal.branchId),
    })
    setOpen(true)
  }

  const toggleDay = (day) => {
    setForm((prev) => {
      const current = Array.isArray(prev.daysOfWeek) ? prev.daysOfWeek : [...ALL_DAYS]
      const set = new Set(current)
      if (set.has(day)) set.delete(day)
      else set.add(day)
      const next = [...set].sort((a, b) => a - b)
      return { ...prev, daysOfWeek: next.length ? next : [day] }
    })
  }

  const applyDayPreset = (days) => {
    setForm((prev) => ({ ...prev, daysOfWeek: [...days] }))
  }

  const updateItem = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    }))
  }

  const handleProductSelect = (index, product) => {
    const unit =
      product.discountedPrice != null ? product.discountedPrice : product.price
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index
          ? {
              ...item,
              itemType: 'product',
              productId: product.id,
              drinkId: '',
              addonId: '',
              name: product.name,
              unitPrice: String(unit ?? 0),
            }
          : item
      ),
    }))
  }

  const handleDrinkSelect = (index, drinkId) => {
    const drink = drinks.find((d) => d.id === drinkId)
    if (!drink) return
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index
          ? {
              ...item,
              itemType: 'drink',
              productId: '',
              drinkId: drink.id,
              addonId: '',
              name: drink.name,
              unitPrice: String(drink.price ?? 0),
              customerChoice: false,
            }
          : item
      ),
    }))
  }

  const setDrinkCustomerChoice = (index, enabled) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index
          ? {
              ...item,
              itemType: 'drink',
              customerChoice: enabled,
              drinkId: enabled ? '' : item.drinkId,
              name: enabled ? 'Choose your drink' : item.name,
              choiceIds: enabled ? item.choiceIds || [] : [],
              unitPrice: enabled ? item.unitPrice || '0' : item.unitPrice,
            }
          : item
      ),
    }))
  }

  const toggleDrinkChoiceId = (index, drinkId, checked) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i !== index) return item
        const current = Array.isArray(item.choiceIds) ? item.choiceIds : []
        const choiceIds = checked
          ? [...new Set([...current, drinkId])]
          : current.filter((id) => id !== drinkId)
        return { ...item, choiceIds }
      }),
    }))
  }

  const handleAddonSelect = (index, addonId) => {
    const addon = addons.find((a) => a.id === addonId)
    if (!addon) return
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index
          ? {
              ...item,
              itemType: 'addon',
              productId: '',
              drinkId: '',
              addonId: addon.id,
              name: addon.name,
              unitPrice: String(addon.price ?? 0),
            }
          : item
      ),
    }))
  }

  const changeItemType = (index, itemType) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index
          ? {
              ...emptyItem(),
              itemType,
              qty: item.qty || '1',
            }
          : item
      ),
    }))
  }

  const addItemRow = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }))
  }

  const removeItemRow = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.length <= 1 ? [emptyItem()] : prev.items.filter((_, i) => i !== index),
    }))
  }

  const fillPriceFromItems = () => {
    setForm((prev) => ({
      ...prev,
      originalPrice: String(subtotal),
      price: prev.price || String(subtotal),
    }))
  }

  const handleSave = async () => {
    if (!form.title.trim() || !token) {
      toast.error('Title is required')
      return
    }
    if (!selectedDays.length) {
      toast.error('Select at least one day')
      return
    }
    const items = form.items
      .filter((item) => {
        if (item.itemType === 'drink' && item.customerChoice) return true
        return item.name.trim()
      })
      .map((item) => ({
        itemType: item.itemType || 'product',
        productId: item.itemType === 'product' ? item.productId || null : null,
        drinkId:
          item.itemType === 'drink' && !item.customerChoice ? item.drinkId || null : null,
        addonId: item.itemType === 'addon' ? item.addonId || null : null,
        name:
          item.itemType === 'drink' && item.customerChoice
            ? item.name.trim() || 'Choose your drink'
            : item.name.trim(),
        qty: Math.max(1, parseInt(item.qty, 10) || 1),
        unitPrice: parseFloat(item.unitPrice) || 0,
        customerChoice: Boolean(item.itemType === 'drink' && item.customerChoice),
        choiceIds:
          item.itemType === 'drink' && item.customerChoice
            ? Array.isArray(item.choiceIds)
              ? item.choiceIds
              : []
            : [],
      }))
    if (!items.length) {
      toast.error('Add at least one product, drink, or addon to the deal')
      return
    }

    setSaving(true)
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      badgeText: form.badgeText.trim(),
      image: form.image,
      price: form.price !== '' ? parseFloat(form.price) : subtotal,
      originalPrice: form.originalPrice !== '' ? parseFloat(form.originalPrice) : subtotal,
      taxCodeId: form.taxCodeId || null,
      taxMode: form.taxMode || 'inclusive',
      startAt: campaignDateToIso(form.startAt, false),
      endAt: campaignDateToIso(form.endAt, true),
      daysOfWeek: selectedDays,
      dailyStartTime: form.dailyStartTime || null,
      dailyEndTime: form.dailyEndTime || null,
      showCountdown: form.showCountdown,
      active: form.active,
      sortOrder: parseInt(form.sortOrder, 10) || 0,
      addonMode: form.addonMode || 'all',
      addonIds: form.addonMode === 'selected' ? form.addonIds || [] : undefined,
      items,
      branchId: branchScopeToApi(form.branchScope),
    }
    try {
      if (editing) {
        const deal = await updateDealRequest(token, editing.id, payload)
        dispatch(updateDeal(deal))
        toast.success('Deal updated')
      } else {
        const deal = await createDealRequest(token, payload)
        dispatch(addDeal(deal))
        toast.success('Deal created')
      }
      resetAndClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save deal')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId || !token) return
    try {
      await deleteDealRequest(token, deleteId)
      dispatch(deleteDeal(deleteId))
      toast.success('Deal deleted')
      setDeleteId(null)
    } catch (err) {
      toast.error(err.message || 'Failed to delete deal')
    }
  }

  const columns = [
    {
      header: 'Deal',
      render: (r) => (
        <div className="flex items-center gap-3 min-w-[180px]">
          {r.image ? (
            <img
              src={resolveMediaUrl(r.image)}
              alt=""
              className="h-10 w-10 rounded-md object-cover border shrink-0"
            />
          ) : (
            <div className="h-10 w-10 rounded-md bg-muted shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-medium truncate">{r.title}</p>
            {r.badgeText ? (
              <p className="text-xs text-muted-foreground truncate">{r.badgeText}</p>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      header: 'Products',
      render: (r) => {
        const list = r.items || []
        if (!list.length) return <span className="text-muted-foreground">—</span>
        return (
          <div className="max-w-[220px]">
            <p className="text-sm truncate">
              {list.map((i) => `${i.qty}× ${i.name}`).join(', ')}
            </p>
            <p className="text-xs text-muted-foreground">
              {list.length} item{list.length === 1 ? '' : 's'}
            </p>
          </div>
        )
      },
    },
    {
      header: 'Deal Price',
      render: (r) => (
        <div>
          <p className="font-medium">{formatCurrency(r.price ?? 0)}</p>
          {r.originalPrice != null && Number(r.originalPrice) > Number(r.price ?? 0) ? (
            <p className="text-xs text-muted-foreground line-through">
              {formatCurrency(r.originalPrice)}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      header: 'Days / Time',
      render: (r) => {
        const days = formatDaysLabel(r.daysOfWeek)
        const start = r.dailyStartTime ? String(r.dailyStartTime).slice(0, 5) : null
        const end = r.dailyEndTime ? String(r.dailyEndTime).slice(0, 5) : null
        const time =
          start && end ? `${start}–${end}` : start ? `from ${start}` : end ? `until ${end}` : 'All day'
        return (
          <div className="text-sm whitespace-nowrap">
            <p>{days}</p>
            <p className="text-xs text-muted-foreground">{time}</p>
          </div>
        )
      },
    },
    {
      header: 'Campaign',
      render: (r) => (
        <span className="text-sm whitespace-nowrap">
          {r.startAt ? formatDate(r.startAt) : 'Anytime'}
          {' — '}
          {r.endAt ? formatDate(r.endAt) : 'Open'}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (r) => <StatusBadge status={dealScheduleStatus(r)} />,
    },
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
        title="Deals"
        description="Fixed-price combo bundles on the website menu. Separate from Offers (auto checkout discounts) and Coupons (codes)."
        action={
          canEdit ? (
            <Button
              onClick={openCreate}
              className="bg-[#960002] text-white hover:bg-[#780002]"
            >
              Create Deal
            </Button>
          ) : undefined
        }
      />
      <DataTable data={deals} columns={columns} searchKey="title" />

      <FormDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={`${editing ? 'Edit' : 'Create'} Deal`}
        size="xl"
        footer={
          <>
            <Button type="button" variant="outline" onClick={resetAndClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !canEdit}>
              {saving ? 'Saving…' : 'Save deal'}
            </Button>
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
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Family Feast Combo"
            />
          </div>
          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What is included in this deal"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Badge text</Label>
              <Input
                placeholder="e.g. 30% OFF"
                value={form.badgeText}
                onChange={(e) => setForm({ ...form, badgeText: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Sort order</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              />
            </div>
          </div>

          <AiImageField
            label="Deal image"
            value={form.image}
            title={form.title}
            description={form.description}
            kind="deal"
            onChange={(url) => setForm((prev) => ({ ...prev, image: url }))}
          />
        </FormSection>

        <FormSection title="Items">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Deal items (products, drinks, addons)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItemRow}>
                <Plus className="mr-1 h-4 w-4" /> Add item
              </Button>
            </div>
            {form.items.map((item, index) => (
              <div key={index} className="rounded-lg border p-3 space-y-3">
                <div className="grid grid-cols-[120px_1fr_70px_110px_40px] gap-2 items-end">
                  <div className="grid gap-1">
                    <Label className="text-xs">Type</Label>
                    <Select
                      value={item.itemType || 'product'}
                      onValueChange={(v) => changeItemType(index, v)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="drink">Drink</SelectItem>
                        <SelectItem value="addon">Addon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">
                      {item.itemType === 'drink' ? 'Drink' : item.itemType === 'addon' ? 'Addon' : 'Product'}
                    </Label>
                    {item.itemType === 'drink' ? (
                      item.customerChoice ? (
                        <div className="flex h-9 items-center rounded-md border px-3 text-sm text-muted-foreground">
                          Customer chooses at checkout
                        </div>
                      ) : (
                        <Select
                          value={item.drinkId || undefined}
                          onValueChange={(v) => handleDrinkSelect(index, v)}
                        >
                          <SelectTrigger><SelectValue placeholder="Select drink..." /></SelectTrigger>
                          <SelectContent>
                            {drinks.map((d) => (
                              <SelectItem key={d.id} value={d.id}>
                                {d.name} ({formatCurrency(d.price)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )
                    ) : item.itemType === 'addon' ? (
                      <Select
                        value={item.addonId || undefined}
                        onValueChange={(v) => handleAddonSelect(index, v)}
                      >
                        <SelectTrigger><SelectValue placeholder="Select addon..." /></SelectTrigger>
                        <SelectContent>
                          {addons
                            .filter((a) => a.status === 'active' || !a.status)
                            .map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name} ({formatCurrency(a.price)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <ProductSearchSelect
                        products={products}
                        value={item.name}
                        productId={item.productId}
                        onSelect={(product) => handleProductSelect(index, product)}
                        onNameChange={(name) => updateItem(index, 'name', name)}
                        placeholder="Select a product..."
                        showBranch={showBranchInPicker}
                        branchNames={branchNames}
                      />
                    )}
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => updateItem(index, 'qty', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">Catalog value</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                      title="Reference only — used for compare-at / items total, not charged separately"
                    />
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItemRow(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {item.itemType === 'drink' ? (
                  <div className="space-y-2 rounded-md border bg-muted/20 p-3">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={Boolean(item.customerChoice)}
                        onCheckedChange={(v) => setDrinkCustomerChoice(index, Boolean(v))}
                      />
                      <span className="font-medium">Let customer choose the drink</span>
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Included in deal price — customer picks which drink at checkout (e.g. 7up or test drink).
                    </p>
                    {item.customerChoice ? (
                      <div className="space-y-2 pt-1">
                        <p className="text-xs font-medium">Allowed drinks (leave all unchecked = any drink)</p>
                        <div className="grid sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                          {drinks.filter((d) => d.status !== 'inactive').map((d) => (
                            <label key={d.id} className="flex items-center gap-2 text-sm cursor-pointer">
                              <Checkbox
                                checked={(item.choiceIds || []).includes(d.id)}
                                onCheckedChange={(v) => toggleDrinkChoiceId(index, d.id, Boolean(v))}
                              />
                              <span className="truncate">{d.name}</span>
                              <span className="text-muted-foreground text-xs shrink-0">
                                {formatCurrency(d.price)}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-muted-foreground">Items catalog total</span>
                <p className="text-xs text-muted-foreground">
                  Reference only — customer pays the Deal price below (included drinks/products are not charged again)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{formatCurrency(subtotal)}</span>
                <Button type="button" variant="ghost" size="sm" onClick={fillPriceFromItems}>
                  Use as prices
                </Button>
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection title="Pricing">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Deal price</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder={String(subtotal || 0)}
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
                placeholder={String(subtotal || 0)}
              />
            </div>
          </div>

          <TaxFields
            taxCodes={taxCodes}
            taxCodeId={form.taxCodeId}
            taxMode={form.taxMode}
            listPrice={parseFloat(form.originalPrice) || 0}
            listedPrice={parseFloat(form.price) || 0}
            label="Deal total on ordering website"
            onChange={(patch) => setForm({ ...form, ...patch })}
          />
        </FormSection>

        <FormSection
          title="Optional add-ons"
          description="Extras customers can buy with this deal (paid on top of deal price)."
        >
          <AddonScopeFields
            addons={addons}
            addonMode={form.addonMode || 'all'}
            addonIds={form.addonIds || []}
            onChange={(patch) => setForm({ ...form, ...patch })}
          />
        </FormSection>

        <FormSection title="Schedule">
          <div className="space-y-3 rounded-lg border p-3">
            <div>
              <Label>Active days</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Deal shows on these weekdays at the same daily time (e.g. alternate Mon/Wed/Fri).
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {DAY_PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyDayPreset(preset.days)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              {WEEK_DAYS.map((day) => (
                <label key={day.value} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={selectedDays.includes(day.value)}
                    onCheckedChange={() => toggleDay(day.value)}
                  />
                  {day.label}
                </label>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Daily start time</Label>
                <Input
                  type="time"
                  value={form.dailyStartTime}
                  onChange={(e) => setForm({ ...form, dailyStartTime: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Daily end time</Label>
                <Input
                  type="time"
                  value={form.dailyEndTime}
                  onChange={(e) => setForm({ ...form, dailyEndTime: e.target.value })}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Leave times empty for all day on the selected days.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Campaign starts</Label>
              <Input
                type="date"
                value={form.startAt}
                onChange={(e) => setForm({ ...form, startAt: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Campaign ends</Label>
              <Input
                type="date"
                value={form.endAt}
                onChange={(e) => setForm({ ...form, endAt: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={form.showCountdown}
                onCheckedChange={(v) => setForm({ ...form, showCountdown: v })}
              />
              <Label>Show countdown</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setForm({ ...form, active: v })}
              />
              <Label>Active</Label>
            </div>
          </div>
        </FormSection>
      </FormDialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Deal"
        description="Delete this deal and its products?"
        onConfirm={handleDelete}
      />
    </div>
  )
}
