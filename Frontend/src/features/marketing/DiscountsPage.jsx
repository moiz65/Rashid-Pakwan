import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { FormDialog, FormSection } from '@/components/shared/FormDialog'
import {
  BranchScopeField,
  branchScopeFromRecord,
  branchScopeToApi,
  useDefaultBranchScope,
} from '@/components/shared/BranchScopeField'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addDiscount, updateDiscount, deleteDiscount } from '@/store/slices/marketingSlice'
import { selectAuth, selectBranchDiscounts, selectCategories } from '@/store/selectors'
import { formatDate, formatCurrency } from '@/lib/formatters'
import { filterByBranch } from '@/lib/branches'
import {
  createDiscountRequest,
  deleteDiscountRequest,
  updateDiscountRequest,
} from '@/lib/api'
import { usePermission } from '@/hooks/usePermission'
import {
  formatDiscountCategories,
  parseDiscountCategories,
  serializeDiscountCategories,
} from '@/lib/discounts'

const ALL = 'All'

const emptyForm = {
  name: '',
  type: 'percentage',
  value: '',
  categories: [ALL],
  active: true,
  startDate: '',
  endDate: '',
  branchScope: 'all',
}

export default function DiscountsPage() {
  const dispatch = useAppDispatch()
  const discounts = useAppSelector(selectBranchDiscounts)
  const allCategories = useAppSelector(selectCategories)
  const { token } = useAppSelector(selectAuth)
  const { canManage } = usePermission()
  const canEdit = canManage('marketing')
  const defaultBranchScope = useDefaultBranchScope()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const formCategories = useMemo(
    () => filterByBranch(allCategories, form.branchScope || 'all', { includeAllScoped: true }),
    [allCategories, form.branchScope],
  )

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

  const openEdit = (d) => {
    setEditing(d)
    setForm({
      name: d.name,
      type: d.type,
      value: String(d.value),
      categories: parseDiscountCategories(d.category),
      active: d.active,
      startDate: d.startDate ? String(d.startDate).slice(0, 10) : '',
      endDate: d.endDate ? String(d.endDate).slice(0, 10) : '',
      branchScope: branchScopeFromRecord(d.branchId),
    })
    setOpen(true)
  }

  const toggleCategory = (name, checked) => {
    setForm((prev) => {
      if (name === ALL) {
        return { ...prev, categories: checked ? [ALL] : [] }
      }
      const withoutAll = (prev.categories || []).filter((c) => c !== ALL && c !== name)
      const next = checked ? [...withoutAll, name] : withoutAll
      return { ...prev, categories: next.length ? next : [ALL] }
    })
  }

  const handleSave = async () => {
    if (!form.name.trim() || !token) {
      toast.error('Name is required')
      return
    }
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      type: form.type,
      value: parseFloat(form.value) || 0,
      category: serializeDiscountCategories(form.categories),
      active: form.active,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      endDate: form.endDate ? new Date(`${form.endDate}T23:59:59`).toISOString() : null,
      branchId: branchScopeToApi(form.branchScope),
    }
    try {
      if (editing) {
        const discount = await updateDiscountRequest(token, editing.id, payload)
        dispatch(updateDiscount(discount))
        toast.success('Discount updated')
      } else {
        const discount = await createDiscountRequest(token, payload)
        dispatch(addDiscount(discount))
        toast.success('Discount created')
      }
      resetAndClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save discount')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId || !token) return
    try {
      await deleteDiscountRequest(token, deleteId)
      dispatch(deleteDiscount(deleteId))
      toast.success('Deleted')
      setDeleteId(null)
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    }
  }

  const allSelected = (form.categories || []).includes(ALL)

  const columns = [
    { header: 'Name', key: 'name' },
    { header: 'Type', key: 'type' },
    {
      header: 'Value',
      render: (r) => (r.type === 'percentage' ? `${r.value}%` : formatCurrency(r.value)),
    },
    {
      header: 'Category',
      render: (r) => formatDiscountCategories(r),
    },
    {
      header: 'Period',
      render: (r) => `${formatDate(r.startDate)} - ${formatDate(r.endDate)}`,
    },
    {
      header: 'Status',
      render: (r) => <StatusBadge status={r.active ? 'active' : 'inactive'} />,
    },
    ...(canEdit
      ? [{
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
        }]
      : []),
  ]

  return (
    <div>
      <PageHeader
        title="Discounts"
        description="Permanent sale prices on menu items (via product form). No checkout code — different from Offers (auto promos) and Coupons (codes)."
        actionLabel={canEdit ? 'Add Discount' : undefined}
        onAction={canEdit ? openCreate : undefined}
      />
      <DataTable data={discounts} columns={columns} searchKey="name" />

      <FormDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={editing ? 'Edit Discount' : 'Add Discount'}
        description="These appear in the product form Discount dropdown."
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
        <FormSection title="Details">
          <BranchScopeField
            value={form.branchScope}
            onChange={(v) => setForm({ ...form, branchScope: v })}
          />
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Weekend 10% Off"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>{form.type === 'percentage' ? 'Percent' : 'Amount (Rs)'}</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder={form.type === 'percentage' ? '10' : '100'}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Applies to categories</Label>
            <div className="max-h-44 overflow-y-auto rounded-lg border p-3 space-y-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => toggleCategory(ALL, Boolean(checked))}
                />
                <span>All categories</span>
              </label>
              {formCategories.map((c) => {
                const checked = !allSelected && (form.categories || []).includes(c.name)
                return (
                  <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={checked}
                      disabled={allSelected}
                      onCheckedChange={(v) => toggleCategory(c.name, Boolean(v))}
                    />
                    <span className="truncate">{c.name}</span>
                  </label>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Select one or more categories, or All categories.
            </p>
          </div>
        </FormSection>

        <FormSection title="Schedule">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
            <div>
              <Label>Active</Label>
              <p className="text-xs text-muted-foreground">Only active discounts show on products</p>
            </div>
            <Switch
              checked={form.active}
              onCheckedChange={(v) => setForm({ ...form, active: v })}
            />
          </div>
        </FormSection>
      </FormDialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Discount"
        description="Delete this discount?"
        onConfirm={handleDelete}
      />
    </div>
  )
}
