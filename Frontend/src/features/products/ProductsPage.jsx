import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowDownUp, MoreHorizontal, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { FormDialog, FormSection } from '@/components/shared/FormDialog'
import { AiImageField } from '@/components/shared/AiImageField'
import { TaxFields } from '@/components/shared/TaxFields'
import { AddonScopeFields } from '@/components/shared/AddonScopeFields'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addProduct, updateProduct, deleteProduct } from '@/store/slices/productsSlice'
import { selectBranchProducts, selectCategories, selectBrands, selectAuth, selectDiscounts, selectIsAllBranches, selectSelectedBranchId } from '@/store/selectors'
import { formatCurrency } from '@/lib/formatters'
import { filterByBranch } from '@/lib/branches'
import {
  applyDiscountToPrice,
  discountAppliesToCategory,
  findMatchingDiscount,
  formatDiscountLabel,
} from '@/lib/discounts'
import { BranchBadge } from '@/components/shared/BranchBadge'
import {
  BranchScopeField,
  branchScopeFromRecord,
  branchScopeToApi,
  useDefaultBranchScope,
} from '@/components/shared/BranchScopeField'
import {
  createProductRequest,
  updateProductRequest,
  deleteProductRequest,
  resolveMediaUrl,
} from '@/lib/api'
import { useCatalogForBranchScope } from '@/hooks/useCatalogForBranchScope'
import { usePermission } from '@/hooks/usePermission'

/** Backend uses -1 for unlimited stock (shown as ∞) */
const UNLIMITED_STOCK = -1

const NONE = '__none__'

const emptyForm = {
  name: '',
  categoryId: '',
  brandId: '',
  price: '',
  discountId: '',
  discountedPrice: '',
  stock: '',
  stockUnlimited: true,
  status: 'active',
  image: '',
  description: '',
  tag: '',
  isFeatured: false,
  sortOrder: '0',
  addonIds: [],
  addonMode: 'all',
  variations: [],
  taxCodeId: '',
  taxMode: 'inclusive',
  branchScope: 'all',
}

/** Bulk edit uses "__unchanged__" sentinel so users can leave fields alone. */
const UNCHANGED = '__unchanged__'

const emptyBulkForm = {
  status: UNCHANGED,
  featured: UNCHANGED,
  categoryId: UNCHANGED,
  brandId: UNCHANGED,
  tag: UNCHANGED,
  sortOrder: '',
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

const SORT_OPTIONS = [
  { value: 'sortOrder', label: 'Menu order' },
  { value: 'name', label: 'Name' },
  { value: 'price', label: 'Price' },
  { value: 'stock', label: 'Stock' },
  { value: 'sales', label: 'Sales' },
  { value: 'status', label: 'Status' },
]

const defaultFilters = {
  search: '',
  categoryId: 'all',
  brandId: 'all',
  status: 'all',
  featured: 'all',
  sortBy: 'sortOrder',
  sortDir: 'asc',
}

function effectivePrice(product) {
  return product.discountedPrice != null ? Number(product.discountedPrice) : Number(product.price ?? 0)
}

export default function ProductsPage() {
  const dispatch = useAppDispatch()
  const { canManage } = usePermission()
  const canEdit = canManage('products')

  const products = useAppSelector(selectBranchProducts)
  const allCategories = useAppSelector(selectCategories)
  const allBrands = useAppSelector(selectBrands)
  const allDiscounts = useAppSelector(selectDiscounts)
  const selectedBranchId = useAppSelector(selectSelectedBranchId)
  const taxCodes = useAppSelector((s) => s.settings.taxCodes || [])
  const { token } = useAppSelector(selectAuth)
  const allMode = useAppSelector(selectIsAllBranches)
  const defaultBranchScope = useDefaultBranchScope()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [filters, setFilters] = useState(defaultFilters)
  const { addons: formAddons } = useCatalogForBranchScope(form.branchScope)

  // ---- Selection state (Select All support) ----
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkEditOpen, setBulkEditOpen] = useState(false)
  const [bulkForm, setBulkForm] = useState(emptyBulkForm)
  const [bulkBusy, setBulkBusy] = useState(false)

  const categories = useMemo(
    () => filterByBranch(allCategories, selectedBranchId, { includeAllScoped: true }),
    [allCategories, selectedBranchId],
  )

  const brands = useMemo(
    () => filterByBranch(allBrands, selectedBranchId, { includeAllScoped: true }),
    [allBrands, selectedBranchId],
  )

  const formCategories = useMemo(
    () => filterByBranch(allCategories, form.branchScope || 'all', { includeAllScoped: true }),
    [allCategories, form.branchScope],
  )

  const formBrands = useMemo(
    () => filterByBranch(allBrands, form.branchScope || 'all', { includeAllScoped: true }),
    [allBrands, form.branchScope],
  )

  const formDiscounts = useMemo(() => {
    const scoped = filterByBranch(allDiscounts, form.branchScope || 'all', { includeAllScoped: true })
    const categoryName = formCategories.find((c) => c.id === form.categoryId)?.name
    return scoped.filter((d) => discountAppliesToCategory(d, categoryName || null))
  }, [allDiscounts, form.branchScope, form.categoryId, formCategories])

  const resetAndClose = () => {
    setOpen(false)
    setEditing(null)
    setForm(emptyForm)
  }

  const handleOpenChange = (next) => {
    if (!next) resetAndClose()
    else setOpen(true)
  }

  const getCategoryName = (id) => categories.find((c) => c.id === id)?.name || '—'
  const getBrandName = (id) => brands.find((b) => b.id === id)?.name || '—'

  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }))

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.categoryId !== 'all' ||
    filters.brandId !== 'all' ||
    filters.status !== 'all' ||
    filters.featured !== 'all' ||
    filters.sortBy !== defaultFilters.sortBy ||
    filters.sortDir !== defaultFilters.sortDir

  const filteredProducts = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    let list = products.filter((p) => {
      if (filters.categoryId !== 'all' && p.categoryId !== filters.categoryId) return false
      if (filters.brandId !== 'all' && p.brandId !== filters.brandId) return false
      if (filters.status !== 'all' && p.status !== filters.status) return false
      if (filters.featured === 'yes' && !p.isFeatured) return false
      if (filters.featured === 'no' && p.isFeatured) return false
      if (!q) return true
      const haystack = [p.name, p.description, p.tag, getCategoryName(p.categoryId), getBrandName(p.brandId)]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })

    const dir = filters.sortDir === 'desc' ? -1 : 1
    list = [...list].sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name) * dir
        case 'price':
          return (effectivePrice(a) - effectivePrice(b)) * dir
        case 'stock': {
          const as = Number(a.stock ?? 0) < 0 ? Number.POSITIVE_INFINITY : Number(a.stock ?? 0)
          const bs = Number(b.stock ?? 0) < 0 ? Number.POSITIVE_INFINITY : Number(b.stock ?? 0)
          return (as - bs) * dir
        }
        case 'sales':
          return (Number(a.sales ?? 0) - Number(b.sales ?? 0)) * dir
        case 'status':
          return String(a.status).localeCompare(String(b.status)) * dir
        case 'sortOrder':
        default: {
          const order = (Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0)) * dir
          return order !== 0 ? order : a.name.localeCompare(b.name)
        }
      }
    })
    return list
  }, [products, filters, categories, brands])

  // ---- Selection helpers (respect the current filtered view) ----
  const visibleIds = useMemo(() => filteredProducts.map((p) => p.id), [filteredProducts])
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
      ids.map((id) => deleteProductRequest(token, id)),
    )
    let ok = 0
    let failed = 0
    results.forEach((r, idx) => {
      if (r.status === 'fulfilled') {
        ok += 1
        dispatch(deleteProduct(ids[idx]))
      } else {
        failed += 1
      }
    })
    setBulkBusy(false)
    setBulkDeleteOpen(false)
    clearSelection()
    if (ok > 0 && failed === 0) toast.success(`Deleted ${ok} product${ok === 1 ? '' : 's'}`)
    else if (ok > 0 && failed > 0) toast.error(`Deleted ${ok}, failed ${failed}`)
    else toast.error('Failed to delete selected products')
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

  /**
   * Build a full update payload from an existing product record,
   * applying only the fields the user chose to change in the bulk editor.
   */
  const buildBulkPayload = (p) => {
    const payload = {
      name: p.name,
      categoryId: p.categoryId || null,
      brandId: p.brandId || null,
      price: Number(p.price) || 0,
      discountedPrice: p.discountedPrice != null ? Number(p.discountedPrice) : null,
      stock: Number(p.stock ?? 0),
      status: p.status,
      image: p.image || '',
      description: p.description || '',
      tag: p.tag || '',
      isFeatured: Boolean(p.isFeatured),
      sortOrder: Number(p.sortOrder ?? 0),
      addonMode: p.addonMode || 'all',
      taxCodeId: p.taxCodeId || null,
      taxMode: p.taxMode || 'inclusive',
      branchId: p.branchId ?? null,
      variations: Array.isArray(p.variations)
        ? p.variations.map((v) => ({
            id: v.id || undefined,
            name: v.name,
            price: Number(v.price) || 0,
          }))
        : [],
    }
    if (p.addonMode === 'selected') {
      payload.addonIds = (p.addons || []).map((a) => a.id)
    }

    // Apply requested overrides
    if (bulkForm.status !== UNCHANGED) payload.status = bulkForm.status
    if (bulkForm.featured !== UNCHANGED) payload.isFeatured = bulkForm.featured === 'yes'
    if (bulkForm.categoryId !== UNCHANGED) {
      payload.categoryId = bulkForm.categoryId === NONE ? null : bulkForm.categoryId
    }
    if (bulkForm.brandId !== UNCHANGED) {
      payload.brandId = bulkForm.brandId === NONE ? null : bulkForm.brandId
    }
    if (bulkForm.tag !== UNCHANGED) payload.tag = bulkForm.tag
    if (bulkForm.sortOrder.trim() !== '') {
      payload.sortOrder = parseInt(bulkForm.sortOrder, 10) || 0
    }
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
    const selected = products.filter((p) => selectedIds.includes(p.id))
    if (selected.length === 0) {
      closeBulkEdit()
      return
    }
    setBulkBusy(true)
    const results = await Promise.allSettled(
      selected.map((p) => updateProductRequest(token, p.id, buildBulkPayload(p))),
    )
    let ok = 0
    let failed = 0
    results.forEach((r) => {
      if (r.status === 'fulfilled') {
        ok += 1
        dispatch(updateProduct(r.value))
      } else {
        failed += 1
      }
    })
    setBulkBusy(false)
    closeBulkEdit()
    clearSelection()
    if (ok > 0 && failed === 0) toast.success(`Updated ${ok} product${ok === 1 ? '' : 's'}`)
    else if (ok > 0 && failed > 0) toast.error(`Updated ${ok}, failed ${failed}`)
    else toast.error('Failed to update selected products')
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm, branchScope: defaultBranchScope })
    setOpen(true)
  }

  const openEdit = (product) => {
    setEditing(product)
    const price = String(product.price ?? '')
    const storedSale =
      product.discountedPrice != null ? String(product.discountedPrice) : ''
    // Only keep a sale price when it matches an active discount rule.
    // Otherwise "No discount" must mean list price (no leftover sale).
    const discountId = findMatchingDiscount(price, storedSale, formDiscounts)
    const sale = discountId ? storedSale : ''
    setForm({
      name: product.name,
      categoryId: product.categoryId || '',
      brandId: product.brandId || '',
      price,
      discountId,
      discountedPrice: sale,
      stock: Number(product.stock) < 0 ? '' : String(product.stock ?? 0),
      stockUnlimited: Number(product.stock) < 0,
      status: product.status,
      image: product.image || '',
      description: product.description || '',
      tag: product.tag || '',
      isFeatured: Boolean(product.isFeatured),
      sortOrder: String(product.sortOrder ?? 0),
      addonIds: (product.addons || []).map((a) => a.id),
      addonMode: product.addonMode || (product.addons?.length ? 'selected' : 'all'),
      variations: Array.isArray(product.variations)
        ? product.variations.map((v) => ({
            id: v.id || `var_${Math.random().toString(36).slice(2, 9)}`,
            name: v.name || '',
            price: String(v.price ?? ''),
          }))
        : [],
      taxCodeId: product.taxCodeId || '',
      taxMode: product.taxMode || 'inclusive',
      branchScope: branchScopeFromRecord(product.branchId),
    })
    setOpen(true)
  }

  const setPrice = (price) => {
    setForm((prev) => {
      const discount = formDiscounts.find((d) => d.id === prev.discountId)
      const sale = applyDiscountToPrice(price, discount)
      return {
        ...prev,
        price,
        discountedPrice: sale != null ? String(sale) : '',
      }
    })
  }

  const setDiscountId = (discountId) => {
    setForm((prev) => {
      const id = discountId === NONE ? '' : discountId
      const discount = formDiscounts.find((d) => d.id === id)
      const sale = applyDiscountToPrice(prev.price, discount)
      return {
        ...prev,
        discountId: id,
        discountedPrice: sale != null ? String(sale) : '',
      }
    })
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    if (!token) return
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      categoryId: form.categoryId || null,
      brandId: form.brandId || null,
      price: parseFloat(form.price) || 0,
      // No discount selected → never keep a stale sale price
      discountedPrice:
        form.discountId && form.discountedPrice !== ''
          ? parseFloat(form.discountedPrice)
          : null,
      stock: form.stockUnlimited ? UNLIMITED_STOCK : Math.max(0, parseInt(form.stock, 10) || 0),
      status: form.status,
      image: form.image,
      description: form.description,
      tag: form.tag,
      isFeatured: form.isFeatured,
      sortOrder: parseInt(form.sortOrder, 10) || 0,
      addonMode: form.addonMode || 'all',
      taxCodeId: form.taxCodeId || null,
      taxMode: form.taxMode || 'inclusive',
      branchId: branchScopeToApi(form.branchScope),
      variations: (form.variations || [])
        .filter((v) => String(v.name || '').trim())
        .map((v) => ({
          id: v.id || undefined,
          name: String(v.name).trim(),
          price: parseFloat(v.price) || 0,
        })),
    }
    if (form.addonMode === 'selected') {
      payload.addonIds = form.addonIds || []
    }
    try {
      if (editing) {
        const product = await updateProductRequest(token, editing.id, payload)
        dispatch(updateProduct(product))
        toast.success('Product updated')
      } else {
        const product = await createProductRequest(token, payload)
        dispatch(addProduct(product))
        toast.success('Product created')
      }
      resetAndClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId || !token) return
    try {
      await deleteProductRequest(token, deleteId)
      dispatch(deleteProduct(deleteId))
      toast.success('Product deleted')
      setDeleteId(null)
    } catch (err) {
      toast.error(err.message || 'Failed to delete product')
    }
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
      header: '',
      render: (r) => {
        const src = resolveMediaUrl(r.image)
        return src ? (
          <img src={src} alt="" className="h-10 w-10 rounded object-contain" />
        ) : (
          <span className="text-xl">🍽️</span>
        )
      },
    },
    { header: 'Name', key: 'name' },
    ...(allMode
      ? [{ header: 'Branch', render: (r) => <BranchBadge branchId={r.branchId} /> }]
      : []),
    { header: 'Category', render: (r) => getCategoryName(r.categoryId) },
    { header: 'Brand', render: (r) => getBrandName(r.brandId) },
    {
      header: 'Price',
      render: (r) =>
        r.discountedPrice != null ? (
          <span>
            <span className="text-muted-foreground line-through mr-1">{formatCurrency(r.price)}</span>
            {formatCurrency(r.discountedPrice)}
          </span>
        ) : (
          formatCurrency(r.price)
        ),
    },
    { header: 'Stock', render: (r) => formatStock(r.stock) },
    { header: 'Featured', render: (r) => (r.isFeatured ? 'Yes' : '—') },
    { header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    ...(canEdit
      ? [
          {
            header: 'Actions',
            render: (r) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(r)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(r.id)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]
      : []),
  ]

  return (
    <div>
      <PageHeader
        title="All Products"
        description="Manage your menu items and products"
        actionLabel={canEdit ? 'Add Product' : undefined}
        onAction={canEdit ? openCreate : undefined}
      />

      <div className="mb-4 rounded-md border border-dashed bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        Combo deals and timed promos are created in the{' '}
        <Link to="/marketing/deals" className="font-medium text-foreground underline underline-offset-2 hover:text-primary">
          Deals
        </Link>{' '}
        module under Marketing — not as regular products here.
      </div>

      <div className="mb-4 rounded-lg border bg-card p-4 space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, tag, category..."
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Select value={filters.categoryId} onValueChange={(v) => setFilter('categoryId', v)}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.brandId} onValueChange={(v) => setFilter('brandId', v)}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Brand" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All brands</SelectItem>
                {brands.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(v) => setFilter('status', v)}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="out_of_stock">Out of stock</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.featured} onValueChange={(v) => setFilter('featured', v)}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Featured" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All items</SelectItem>
                <SelectItem value="yes">Featured</SelectItem>
                <SelectItem value="no">Not featured</SelectItem>
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
            Showing <span className="font-medium text-foreground">{filteredProducts.length}</span>
            {' '}of {products.length} products
          </p>
        </div>

        {/* Select-all toggle in the filter bar */}
        {canEdit && visibleIds.length > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <Checkbox
                checked={allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false}
                onCheckedChange={(v) => toggleSelectAll(v === true)}
                aria-label="Select all visible products"
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
      </div>

      <DataTable
        data={filteredProducts}
        columns={columns}
        emptyMessage={hasActiveFilters ? 'No products match your filters.' : 'No products yet. Add your first menu item.'}
      />

      <FormDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={editing ? 'Edit Product' : 'Add Product'}
        description="Set pricing, tax, stock, and optional add-ons for the menu."
        size="lg"
        footer={
          <>
            <Button type="button" variant="outline" onClick={resetAndClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !canEdit}>
              {saving ? 'Saving…' : 'Save product'}
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
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Zinger Burger"
            />
          </div>
          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="Short menu description"
            />
          </div>
          <AiImageField
            label="Image"
            value={form.image}
            title={form.name}
            description={form.description}
            kind="product"
            onChange={(url) => setForm((prev) => ({ ...prev, image: url }))}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Category</Label>
                <Select
                value={form.categoryId || NONE}
                onValueChange={(v) => {
                  const categoryId = v === NONE ? '' : v
                  setForm((prev) => {
                    const categoryName = formCategories.find((c) => c.id === categoryId)?.name
                    const discountStillValid =
                      !prev.discountId ||
                      discountAppliesToCategory(
                        formDiscounts.find((d) => d.id === prev.discountId) ||
                          allDiscounts.find((d) => d.id === prev.discountId),
                        categoryName || null,
                      )
                    if (discountStillValid) return { ...prev, categoryId }
                    return { ...prev, categoryId, discountId: '', discountedPrice: '' }
                  })
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>None</SelectItem>
                  {formCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                      {c.branchId ? '' : ' (all branches)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Brand</Label>
              <Select
                value={form.brandId || NONE}
                onValueChange={(v) => setForm({ ...form, brandId: v === NONE ? '' : v })}
              >
                <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>None</SelectItem>
                  {formBrands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                      {b.branchId ? '' : ' (all branches)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Pricing"
          description="Create discounts under Marketing → Discounts, then pick one here."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>List price</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <Label>Discount</Label>
              <Select
                value={form.discountId || NONE}
                onValueChange={setDiscountId}
              >
                <SelectTrigger><SelectValue placeholder="No discount" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>No discount</SelectItem>
                  {formDiscounts.filter((d) => d.active !== false).map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {formatDiscountLabel(d)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="rounded-lg border bg-muted/40 px-3 py-2.5 text-sm flex items-center justify-between gap-3">
            <span className="text-muted-foreground">
              {form.discountId ? 'Sale price on website' : 'Price on website'}
            </span>
            <span className="font-semibold tabular-nums">
              {form.discountId && form.discountedPrice !== ''
                ? formatCurrency(parseFloat(form.discountedPrice) || 0)
                : form.price !== ''
                  ? formatCurrency(parseFloat(form.price) || 0)
                  : '—'}
            </span>
          </div>
          {formDiscounts.filter((d) => d.active !== false).length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No active discounts yet.{' '}
              <Link to="/marketing/discounts" className="text-primary underline-offset-2 hover:underline">
                Create a discount
              </Link>{' '}
              first.
            </p>
          ) : null}
          <TaxFields
            taxCodes={taxCodes}
            taxCodeId={form.taxCodeId}
            taxMode={form.taxMode}
            listPrice={parseFloat(form.price) || 0}
            listedPrice={
              form.discountId && form.discountedPrice !== ''
                ? parseFloat(form.discountedPrice) || 0
                : parseFloat(form.price) || 0
            }
            label="Total shown on ordering website"
            onChange={(patch) => setForm({ ...form, ...patch })}
          />
        </FormSection>

        <FormSection title="Availability">
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Stock</Label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <Switch
                  checked={form.stockUnlimited}
                  onCheckedChange={(v) =>
                    setForm({
                      ...form,
                      stockUnlimited: v,
                      stock: v ? '' : form.stock || '0',
                    })
                  }
                />
                <span>Unlimited (∞)</span>
              </label>
            </div>
            {form.stockUnlimited ? (
              <div className="flex h-9 items-center rounded-md border px-3 text-muted-foreground text-sm">
                <span className="text-xl mr-2 leading-none">∞</span>
                No stock limit — always available
              </div>
            ) : (
              <Input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="e.g. 50"
              />
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
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
          <div className="grid gap-2">
            <Label>Tag</Label>
            <Input
              value={form.tag}
              onChange={(e) => setForm({ ...form, tag: e.target.value })}
              placeholder="Bestseller"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
            <div>
              <Label htmlFor="featured">Featured on website</Label>
              <p className="text-xs text-muted-foreground">Show in featured section</p>
            </div>
            <Switch
              id="featured"
              checked={form.isFeatured}
              onCheckedChange={(v) => setForm({ ...form, isFeatured: v })}
            />
          </div>
        </FormSection>

        <FormSection
          title="Variations"
          description="Optional sizes/portions (Half, Full, Quarter…). When set, customers pick one; list price stays as default/min."
        >
          <div className="space-y-2">
            {(form.variations || []).map((v, idx) => (
              <div key={v.id || idx} className="grid grid-cols-[1fr_120px_auto] gap-2 items-end">
                <div className="grid gap-1">
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <Input
                    value={v.name}
                    onChange={(e) => {
                      const next = [...(form.variations || [])]
                      next[idx] = { ...next[idx], name: e.target.value }
                      setForm({ ...form, variations: next })
                    }}
                    placeholder="e.g. Full"
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs text-muted-foreground">Price</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={v.price}
                    onChange={(e) => {
                      const next = [...(form.variations || [])]
                      next[idx] = { ...next[idx], price: e.target.value }
                      setForm({ ...form, variations: next })
                    }}
                    placeholder="0"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setForm({
                      ...form,
                      variations: (form.variations || []).filter((_, i) => i !== idx),
                    })
                  }
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setForm({
                  ...form,
                  variations: [
                    ...(form.variations || []),
                    {
                      id: `var_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                      name: '',
                      price: '',
                    },
                  ],
                })
              }
            >
              <Plus className="h-4 w-4 mr-1" />
              Add variation
            </Button>
          </div>
        </FormSection>

        <FormSection title="Add-ons" description="Choose what extras appear when customers customize this product.">
          <AddonScopeFields
            addons={formAddons}
            addonMode={form.addonMode || 'all'}
            addonIds={form.addonIds || []}
            onChange={(patch) => setForm({ ...form, ...patch })}
          />
        </FormSection>
      </FormDialog>

      {/* ---- Bulk Edit dialog ---- */}
      <FormDialog
        open={bulkEditOpen}
        onOpenChange={(next) => !next && closeBulkEdit()}
        title={`Edit ${selectedIds.length} product${selectedIds.length === 1 ? '' : 's'}`}
        description="Only fields you change here will be applied. Leave a field as 'Keep current' to leave it untouched."
        size="lg"
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
        <FormSection title="Status & visibility">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Featured</Label>
              <Select
                value={bulkForm.featured}
                onValueChange={(v) => setBulkForm({ ...bulkForm, featured: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNCHANGED}>Keep current</SelectItem>
                  <SelectItem value="yes">Featured</SelectItem>
                  <SelectItem value="no">Not featured</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </FormSection>

        <FormSection title="Category & brand">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select
                value={bulkForm.categoryId}
                onValueChange={(v) => setBulkForm({ ...bulkForm, categoryId: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNCHANGED}>Keep current</SelectItem>
                  <SelectItem value={NONE}>None</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Brand</Label>
              <Select
                value={bulkForm.brandId}
                onValueChange={(v) => setBulkForm({ ...bulkForm, brandId: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNCHANGED}>Keep current</SelectItem>
                  <SelectItem value={NONE}>None</SelectItem>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </FormSection>

        <FormSection title="Tag & sort order">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Tag</Label>
              <Input
                value={bulkForm.tag === UNCHANGED ? '' : bulkForm.tag}
                placeholder="Keep current"
                onChange={(e) =>
                  setBulkForm({ ...bulkForm, tag: e.target.value === '' ? UNCHANGED : e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Sort order</Label>
              <Input
                type="number"
                value={bulkForm.sortOrder}
                placeholder="Keep current"
                onChange={(e) => setBulkForm({ ...bulkForm, sortOrder: e.target.value })}
              />
            </div>
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
          {bulkForm.priceMode === 'set' ? (
            <p className="text-xs text-muted-foreground">
              Note: the existing sale price (if any) will be preserved. To reset the sale price, edit products individually.
            </p>
          ) : null}
        </FormSection>
      </FormDialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Product"
        description="Are you sure you want to delete this product?"
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={(next) => !next && setBulkDeleteOpen(false)}
        title={`Delete ${selectedIds.length} product${selectedIds.length === 1 ? '' : 's'}?`}
        description="This will permanently remove the selected products. This action cannot be undone."
        onConfirm={handleBulkDelete}
      />
    </div>
  )
}