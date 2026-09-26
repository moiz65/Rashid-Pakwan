import { useState } from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { FormDialog } from '@/components/shared/FormDialog'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  addTaxCode,
  updateTaxCode,
  deleteTaxCode,
} from '@/store/slices/settingsSlice'
import { selectAuth } from '@/store/selectors'
import {
  createTaxCodeRequest,
  deleteTaxCodeRequest,
  updateTaxCodeRequest,
} from '@/lib/api'
import { usePermission } from '@/hooks/usePermission'

const emptyForm = { name: '', code: '', rate: '17', active: true }

export default function TaxCodesPage() {
  const dispatch = useAppDispatch()
  const taxCodes = useAppSelector((s) => s.settings.taxCodes || [])
  const { token } = useAppSelector(selectAuth)
  const { canManage } = usePermission()
  const canEdit = canManage('settings')
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

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  const openEdit = (t) => {
    setEditing(t)
    setForm({
      name: t.name,
      code: t.code,
      rate: String(t.rate ?? 0),
      active: t.active !== false,
    })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.code.trim() || !token) {
      toast.error('Name and code are required')
      return
    }
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      rate: parseFloat(form.rate) || 0,
      active: form.active,
    }
    try {
      if (editing) {
        const taxCode = await updateTaxCodeRequest(token, editing.id, payload)
        dispatch(updateTaxCode(taxCode))
        toast.success('Tax code updated')
      } else {
        const taxCode = await createTaxCodeRequest(token, payload)
        dispatch(addTaxCode(taxCode))
        toast.success('Tax code created')
      }
      resetAndClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save tax code')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId || !token) return
    try {
      await deleteTaxCodeRequest(token, deleteId)
      dispatch(deleteTaxCode(deleteId))
      toast.success('Tax code deleted')
      setDeleteId(null)
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    }
  }

  const columns = [
    { header: 'Name', key: 'name' },
    { header: 'Code', key: 'code' },
    { header: 'Rate', render: (r) => `${r.rate}%` },
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
        title="Tax Codes"
        description="Define tax rates and attach them to products, deals, and offers as included or separate"
        action={canEdit ? <Button onClick={openCreate}>Add Tax Code</Button> : undefined}
      />
      <DataTable data={taxCodes} columns={columns} searchKey="name" searchPlaceholder="Search tax codes..." />

      <FormDialog
        open={open}
        onOpenChange={(n) => !n && resetAndClose()}
        title={editing ? 'Edit Tax Code' : 'Add Tax Code'}
        footer={
          <>
            <Button variant="outline" onClick={resetAndClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !canEdit}>{saving ? 'Saving…' : 'Save'}</Button>
          </>
        }
      >
        <div className="grid gap-2">
          <Label>Name</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="GST 17%"
          />
        </div>
        <div className="grid gap-2">
          <Label>Code</Label>
          <Input
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="GST"
          />
        </div>
        <div className="grid gap-2">
          <Label>Rate (%)</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.rate}
            onChange={(e) => setForm({ ...form, rate: e.target.value })}
          />
        </div>
        <div className="flex items-center justify-between rounded-md border px-3 py-2">
          <Label>Active</Label>
          <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} disabled={!canEdit} />
        </div>
      </FormDialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Tax Code"
        description="Products using this tax will have tax cleared. Continue?"
        onConfirm={handleDelete}
      />
    </div>
  )
}
