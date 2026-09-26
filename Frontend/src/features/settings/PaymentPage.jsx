import { useState } from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormDialog } from '@/components/shared/FormDialog'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  addPaymentGateway,
  updatePaymentGateway,
  deletePaymentGateway,
} from '@/store/slices/settingsSlice'
import { selectAuth } from '@/store/selectors'
import {
  createPaymentGatewayRequest,
  updatePaymentGatewayRequest,
  deletePaymentGatewayRequest,
} from '@/lib/api'
import { usePermission } from '@/hooks/usePermission'

const emptyForm = {
  name: '',
  description: '',
  icon: '💳',
  enabled: true,
}

export default function PaymentPage() {
  const dispatch = useAppDispatch()
  const { token } = useAppSelector(selectAuth)
  const { canManage } = usePermission()
  const canEdit = canManage('settings')
  const gateways = useAppSelector((s) => s.settings.paymentGateways)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

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
    setForm(emptyForm)
    setOpen(true)
  }

  const openEdit = (gw) => {
    setEditing(gw)
    setForm({
      name: gw.name || '',
      description: gw.description || '',
      icon: gw.icon || '💳',
      enabled: gw.enabled !== false,
    })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!token) return
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      icon: form.icon.trim() || '💳',
      enabled: form.enabled,
    }
    try {
      if (editing) {
        const updated = await updatePaymentGatewayRequest(token, editing.id, payload)
        dispatch(updatePaymentGateway(updated))
        toast.success('Payment method updated')
      } else {
        const created = await createPaymentGatewayRequest(token, payload)
        dispatch(addPaymentGateway(created))
        toast.success('Payment method added')
      }
      resetAndClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save payment method')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (gw) => {
    if (!token) return
    try {
      const updated = await updatePaymentGatewayRequest(token, gw.id, {
        name: gw.name,
        description: gw.description,
        icon: gw.icon,
        enabled: !gw.enabled,
      })
      dispatch(updatePaymentGateway(updated))
      toast.success(
        updated.enabled
          ? `${updated.name} enabled on the ordering website`
          : `${updated.name} hidden from the ordering website`
      )
    } catch (err) {
      toast.error(err.message || 'Failed to update gateway')
    }
  }

  const handleDelete = async () => {
    if (!token || !deleteId) return
    try {
      await deletePaymentGatewayRequest(token, deleteId)
      dispatch(deletePaymentGateway(deleteId))
      toast.success('Payment method deleted')
      setDeleteId(null)
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    }
  }

  const enabledCount = gateways.filter((g) => g.enabled).length

  return (
    <div>
      <PageHeader
        title="Payment Gateways"
        description="Add and toggle methods shown at checkout on the ordering website."
        action={canEdit ? <Button onClick={openCreate}>Add Payment Method</Button> : undefined}
      />
      <p className="text-sm text-muted-foreground mb-4">
        {enabledCount} of {gateways.length} method{gateways.length === 1 ? '' : 's'} visible on the
        website.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {gateways.map((gw) => (
          <Card key={gw.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl shrink-0">{gw.icon || '💳'}</span>
                <div className="min-w-0">
                  <CardTitle className="text-base truncate">{gw.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {gw.description || 'No description'}
                  </CardDescription>
                  <p className="text-xs mt-1 text-muted-foreground">
                    {gw.enabled ? 'Shown at website checkout' : 'Hidden on website'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {canEdit ? (
                  <>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(gw)} aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(gw.id)}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </>
                ) : null}
                <Switch
                  checked={Boolean(gw.enabled)}
                  onCheckedChange={() => handleToggle(gw)}
                  disabled={!canEdit}
                />
              </div>
            </CardHeader>
          </Card>
        ))}
        {gateways.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-2 py-8 text-center">
            No payment methods yet. Click “Add Payment Method” to create one.
          </p>
        )}
      </div>

      <FormDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={editing ? 'Edit Payment Method' : 'Add Payment Method'}
        description="Customers see enabled methods at checkout on the ordering website."
        footer={
          <>
            <Button type="button" variant="outline" onClick={resetAndClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving || !canEdit}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add method'}
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="pay-name">Name</Label>
            <Input
              id="pay-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. JazzCash, Card, Cash on Delivery"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pay-desc">Description</Label>
            <Input
              id="pay-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Short note shown under the name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pay-icon">Icon (emoji)</Label>
            <Input
              id="pay-icon"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="💳"
              maxLength={8}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <div>
              <p className="text-sm font-medium">Enabled on website</p>
              <p className="text-xs text-muted-foreground">Show this method at checkout</p>
            </div>
            <Switch
              checked={form.enabled}
              onCheckedChange={(checked) => setForm({ ...form, enabled: checked })}
              disabled={!canEdit}
            />
          </div>
        </div>
      </FormDialog>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(next) => !next && setDeleteId(null)}
        title="Delete Payment Method"
        description="Remove this payment method? It will no longer appear at checkout."
        onConfirm={handleDelete}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  )
}
