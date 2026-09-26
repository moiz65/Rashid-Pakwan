import { useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormDialog } from '@/components/shared/FormDialog'
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

  const columns = [
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
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Addon"
        description="Delete this addon?"
        onConfirm={handleDelete}
      />
    </div>
  )
}
