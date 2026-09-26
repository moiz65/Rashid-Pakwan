import { useState } from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2, Upload } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { FormDialog } from '@/components/shared/FormDialog'
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

  const columns = [
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
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Category"
        description="Delete this category?"
        onConfirm={handleDelete}
      />
    </div>
  )
}
