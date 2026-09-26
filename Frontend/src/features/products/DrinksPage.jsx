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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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

  const columns = [
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

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Drink"
        description="Delete this drink?"
        onConfirm={handleDelete}
      />
    </div>
  )
}
