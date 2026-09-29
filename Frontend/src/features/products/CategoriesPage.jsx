import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2, Upload } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  BranchMultiScopeField,
  branchIdsFromRecord,
  branchIdsToApi,
  useDefaultBranchIds,
} from '@/components/shared/BranchScopeField'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addCategory, updateCategory, deleteCategory } from '@/store/slices/categoriesSlice'
import { selectAuth, selectBranchCategories } from '@/store/selectors'
import {
  createCategoryRequest,
  updateCategoryRequest,
  deleteCategoryRequest,
  uploadCatalogImage,
  resolveMediaUrl,
} from '@/lib/api'
import { usePermission } from '@/hooks/usePermission'

const emptyForm = { name: '', slug: '', image: '', sortOrder: '0', isVisible: true, branchIds: [] }

/** Bulk edit uses "__unchanged__" sentinel so users can leave fields alone. */
const UNCHANGED = '__unchanged__'

const emptyBulkForm = {
  isVisible: UNCHANGED,
  sortOrder: '',
}

export default function CategoriesPage() {
  const dispatch = useAppDispatch()
  const { canManage } = usePermission()
  const canEdit = canManage('products')

  const categories = useAppSelector(selectBranchCategories)
  const { token } = useAppSelector(selectAuth)
  const defaultBranchIds = useDefaultBranchIds()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

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
    setForm({ ...emptyForm, branchIds: defaultBranchIds })
    setOpen(true)
  }

  const openEdit = (cat) => {
    setEditing(cat)
    setForm({
      name: cat.name,
      slug: cat.slug || '',
      image: cat.image || '',
      sortOrder: String(cat.sortOrder ?? 0),
      isVisible: cat.isVisible !== false,
      branchIds: branchIdsFromRecord(cat.branchId, cat.branchIds),
    })
    setOpen(true)
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !token) return
    setUploading(true)
    try {
      const url = await uploadCatalogImage(token, file)
      setForm((prev) => ({ ...prev, image: url }))
      toast.success('Image uploaded')
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSave = async () => {
    if (!form.name.trim() || !token) {
      toast.error('Name is required')
      return
    }
    setSaving(true)
    const scope = branchIdsToApi(form.branchIds)
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      image: form.image,
      sortOrder: parseInt(form.sortOrder, 10) || 0,
      isVisible: form.isVisible,
      branchId: scope.branchId,
      branchIds: scope.branchIds,
    }
    try {
      if (editing) {
        const category = await updateCategoryRequest(token, editing.id, payload)
        dispatch(updateCategory(category))
        toast.success('Category updated')
      } else {
        const category = await createCategoryRequest(token, payload)
        dispatch(addCategory(category))
        toast.success('Category created')
      }
      resetAndClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId || !token) return
    try {
      await deleteCategoryRequest(token, deleteId)
      dispatch(deleteCategory(deleteId))
      toast.success('Deleted')
      setDeleteId(null)
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    }
  }

  // ---- Selection helpers ----
  const visibleIds = useMemo(() => categories.map((c) => c.id), [categories])
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
      ids.map((id) => deleteCategoryRequest(token, id)),
    )
    let ok = 0
    let failed = 0
    results.forEach((r, idx) => {
      if (r.status === 'fulfilled') {
        ok += 1
        dispatch(deleteCategory(ids[idx]))
      } else {
        failed += 1
      }
    })
    setBulkBusy(false)
    setBulkDeleteOpen(false)
    clearSelection()
    if (ok > 0 && failed === 0) toast.success(`Deleted ${ok} categor${ok === 1 ? 'y' : 'ies'}`)
    else if (ok > 0 && failed > 0) toast.error(`Deleted ${ok}, failed ${failed}`)
    else toast.error('Failed to delete selected categories')
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
    const scope = branchIdsToApi(branchIdsFromRecord(c.branchId, c.branchIds))
    const payload = {
      name: c.name,
      slug: c.slug || undefined,
      image: c.image || '',
      sortOrder: Number(c.sortOrder ?? 0),
      isVisible: c.isVisible !== false,
      branchId: scope.branchId,
      branchIds: scope.branchIds,
    }
    if (bulkForm.isVisible !== UNCHANGED) payload.isVisible = bulkForm.isVisible === 'yes'
    if (bulkForm.sortOrder.trim() !== '') {
      payload.sortOrder = parseInt(bulkForm.sortOrder, 10) || 0
    }
    return payload
  }

  const handleBulkEdit = async () => {
    if (!token || selectedIds.length === 0) return
    const selected = categories.filter((c) => selectedIds.includes(c.id))
    if (selected.length === 0) {
      closeBulkEdit()
      return
    }
    setBulkBusy(true)
    const results = await Promise.allSettled(
      selected.map((c) => updateCategoryRequest(token, c.id, buildBulkPayload(c))),
    )
    let ok = 0
    let failed = 0
    results.forEach((r) => {
      if (r.status === 'fulfilled') {
        ok += 1
        dispatch(updateCategory(r.value))
      } else {
        failed += 1
      }
    })
    setBulkBusy(false)
    closeBulkEdit()
    clearSelection()
    if (ok > 0 && failed === 0) toast.success(`Updated ${ok} categor${ok === 1 ? 'y' : 'ies'}`)
    else if (ok > 0 && failed > 0) toast.error(`Updated ${ok}, failed ${failed}`)
    else toast.error('Failed to update selected categories')
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
          <img src={src} alt="" className="h-8 w-8 rounded object-cover" />
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
    },
    { header: 'Name', key: 'name' },
    { header: 'Slug', key: 'slug' },
    { header: 'Order', key: 'sortOrder' },
    { header: 'Visible', render: (r) => (r.isVisible !== false ? 'Yes' : 'No') },
    { header: 'Products', key: 'productCount' },
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

  const previewSrc = resolveMediaUrl(form.image)

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Organize products into categories"
        actionLabel={canEdit ? 'Add Category' : undefined}
        onAction={canEdit ? openCreate : undefined}
      />

      {/* Select-all / bulk-actions bar */}
      {canEdit && categories.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2">
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <Checkbox
              checked={allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false}
              onCheckedChange={(v) => toggleSelectAll(v === true)}
              aria-label="Select all categories"
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

      <DataTable data={categories} columns={columns} searchKey="name" />

      <FormDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={`${editing ? 'Edit' : 'Add'} Category`}
        footer={
          <>
            <Button variant="outline" onClick={resetAndClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !canEdit}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      >
        <BranchMultiScopeField
          value={form.branchIds}
          onChange={(ids) => setForm({ ...form, branchIds: ids })}
        />
        <div className="grid gap-2">
          <Label>Image</Label>
          <div className="flex items-center gap-3">
            {previewSrc ? (
              <img src={previewSrc} alt="" className="h-12 w-12 rounded object-cover border" />
            ) : null}
            <Label htmlFor="cat-image" className="cursor-pointer">
              <span className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
                <Upload className="h-4 w-4" />
                {uploading ? 'Uploading…' : 'Upload'}
              </span>
            </Label>
            <Input id="cat-image" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Name</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Slug</Label>
          <Input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="auto from name"
          />
        </div>
        <div className="grid gap-2">
          <Label>Sort Order</Label>
          <Input
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
          />
        </div>
        <div className="flex items-center justify-between rounded-md border px-3 py-2">
          <Label htmlFor="visible">Visible on website</Label>
          <Switch
            id="visible"
            checked={form.isVisible}
            onCheckedChange={(v) => setForm({ ...form, isVisible: v })}
          />
        </div>
      </FormDialog>

      {/* ---- Bulk Edit dialog ---- */}
      <FormDialog
        open={bulkEditOpen}
        onOpenChange={(next) => !next && closeBulkEdit()}
        title={`Edit ${selectedIds.length} categor${selectedIds.length === 1 ? 'y' : 'ies'}`}
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
        <FormSection title="Visibility & order">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Visible on website</Label>
              <Select
                value={bulkForm.isVisible}
                onValueChange={(v) => setBulkForm({ ...bulkForm, isVisible: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNCHANGED}>Keep current</SelectItem>
                  <SelectItem value="yes">Visible</SelectItem>
                  <SelectItem value="no">Hidden</SelectItem>
                </SelectContent>
              </Select>
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
      </FormDialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Category"
        description="Delete this category?"
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={(next) => !next && setBulkDeleteOpen(false)}
        title={`Delete ${selectedIds.length} categor${selectedIds.length === 1 ? 'y' : 'ies'}?`}
        description="This will permanently remove the selected categories. This action cannot be undone."
        onConfirm={handleBulkDelete}
      />
    </div>
  )
}