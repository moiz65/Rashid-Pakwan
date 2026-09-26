import { useState } from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormDialog } from '@/components/shared/FormDialog'
import {
  BranchScopeField,
  branchScopeFromRecord,
  branchScopeToApi,
  useDefaultBranchScope,
} from '@/components/shared/BranchScopeField'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addBrand, updateBrand, deleteBrand } from '@/store/slices/brandsSlice'
import { selectAuth, selectBranchBrands } from '@/store/selectors'
import {
  createBrandRequest,
  updateBrandRequest,
  deleteBrandRequest,
} from '@/lib/api'
import { usePermission } from '@/hooks/usePermission'

const emptyForm = { name: '', logo: '🏷️', branchScope: 'all' }

export default function BrandsPage() {
  const dispatch = useAppDispatch()
  const { canManage } = usePermission()
  const canEdit = canManage('products')

  const brands = useAppSelector(selectBranchBrands)
  const { token } = useAppSelector(selectAuth)
  const defaultBranchScope = useDefaultBranchScope()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

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

  const openEdit = (b) => {
    setEditing(b)
    setForm({
      name: b.name,
      logo: b.logo || '',
      branchScope: branchScopeFromRecord(b.branchId),
    })
    setOpen(true)
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
      logo: form.logo || '',
      branchId: branchScopeToApi(form.branchScope),
    }
    try {
      if (editing) {
        const brand = await updateBrandRequest(token, editing.id, payload)
        dispatch(updateBrand(brand))
        toast.success('Brand updated')
      } else {
        const brand = await createBrandRequest(token, payload)
        dispatch(addBrand(brand))
        toast.success('Brand created')
      }
      resetAndClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save brand')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId || !token) return
    try {
      await deleteBrandRequest(token, deleteId)
      dispatch(deleteBrand(deleteId))
      toast.success('Deleted')
    } catch (err) {
      toast.error(err.message || 'Failed to delete brand')
    } finally {
      setDeleteId(null)
    }
  }

  const columns = [
    { header: '', render: (r) => <span className="text-xl">{r.logo}</span> },
    { header: 'Name', key: 'name' },
    { header: 'Products', key: 'productCount' },
    ...(canEdit
      ? [
          {
            header: 'Actions',
            render: (r) => (
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(r)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => setDeleteId(r.id)}>
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
        title="Brands / Collections"
        description="Manage product brands and collections"
        actionLabel={canEdit ? 'Add Brand' : undefined}
        onAction={canEdit ? openCreate : undefined}
      />
      <DataTable data={brands} columns={columns} searchKey="name" />
      <FormDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={`${editing ? 'Edit' : 'Add'} Brand`}
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
        <div className="grid gap-2">
          <Label>Logo (emoji)</Label>
          <Input value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} />
        </div>
      </FormDialog>
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Brand"
        description="Delete this brand?"
        onConfirm={handleDelete}
      />
    </div>
  )
}
