import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAppSelector } from '@/store/hooks'
import { selectAuth } from '@/store/selectors'
import { fetchTrackingSettings, updateTrackingSettings } from '@/lib/api'
import { usePermission } from '@/hooks/usePermission'

const STATUSES = ['pending', 'confirmed', 'preparing', 'delivered', 'rejected', 'cancelled']

const STATUS_LABELS = {
  pending: 'Placed (awaiting receive)',
  confirmed: 'Received',
  preparing: 'Preparing',
  delivered: 'Delivered',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
}

const emptyForm = {
  restaurantName: '',
  phone: '',
  supportEmail: '',
  address: '',
  logoUrl: '',
  helpText: '',
  pollIntervalSeconds: 20,
  showRejectionReason: true,
  statusMessages: {},
}

export default function OrderTrackingPage() {
  const { token } = useAppSelector(selectAuth)
  const { canManage } = usePermission()
  const canEdit = canManage('settings')
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const settings = await fetchTrackingSettings(token)
        if (!cancelled) {
          setForm({
            restaurantName: settings.restaurantName || '',
            phone: settings.phone || '',
            supportEmail: settings.supportEmail || '',
            address: settings.address || '',
            logoUrl: settings.logoUrl || '',
            helpText: settings.helpText || '',
            pollIntervalSeconds: settings.pollIntervalSeconds ?? 20,
            showRejectionReason: settings.showRejectionReason !== false,
            statusMessages: settings.statusMessages || {},
          })
        }
      } catch (err) {
        if (!cancelled) toast.error(err.message || 'Failed to load tracking settings')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [token])

  const updateStatusField = (status, field, value) => {
    setForm((prev) => ({
      ...prev,
      statusMessages: {
        ...prev.statusMessages,
        [status]: {
          ...prev.statusMessages[status],
          [field]: value,
        },
      },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const settings = await updateTrackingSettings(token, form)
      setForm({
        restaurantName: settings.restaurantName || '',
        phone: settings.phone || '',
        supportEmail: settings.supportEmail || '',
        address: settings.address || '',
        logoUrl: settings.logoUrl || '',
        helpText: settings.helpText || '',
        pollIntervalSeconds: settings.pollIntervalSeconds ?? 20,
        showRejectionReason: settings.showRejectionReason !== false,
        statusMessages: settings.statusMessages || {},
      })
      toast.success('Tracking settings saved')
    } catch (err) {
      toast.error(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Order Tracking"
        description="Configure branding and status messages shown on the customer tracking page"
      />

      <div className="grid gap-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Branding</CardTitle>
            <CardDescription>Restaurant info displayed on the public tracking page</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>Restaurant name</Label>
              <Input
                value={form.restaurantName}
                onChange={(e) => setForm({ ...form, restaurantName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Support email</Label>
                <Input
                  type="email"
                  value={form.supportEmail}
                  onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Logo URL (optional)</Label>
              <Input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Help text</Label>
              <Textarea
                rows={2}
                value={form.helpText}
                onChange={(e) => setForm({ ...form, helpText: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Display</CardTitle>
            <CardDescription>Polling and rejection reason visibility</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>Poll interval (seconds)</Label>
              <Input
                type="number"
                min={5}
                max={120}
                value={form.pollIntervalSeconds}
                onChange={(e) => setForm({ ...form, pollIntervalSeconds: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Show rejection reason</Label>
                <p className="text-sm text-muted-foreground">Display reason when order is rejected or cancelled</p>
              </div>
              <Switch
                checked={form.showRejectionReason}
                onCheckedChange={(checked) => setForm({ ...form, showRejectionReason: checked })}
                disabled={!canEdit}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status messages</CardTitle>
            <CardDescription>Customer-facing label, message, and ETA for each order status</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {STATUSES.map((status) => {
              const msg = form.statusMessages[status] || {}
              return (
                <div key={status} className="rounded-lg border p-4 grid gap-3">
                  <p className="font-medium text-sm">{STATUS_LABELS[status]}</p>
                  <div className="grid gap-2">
                    <Label>Customer label</Label>
                    <Input
                      value={msg.label || ''}
                      onChange={(e) => updateStatusField(status, 'label', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Message</Label>
                    <Textarea
                      rows={2}
                      value={msg.message || ''}
                      onChange={(e) => updateStatusField(status, 'message', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>ETA text (optional)</Label>
                    <Input
                      placeholder="e.g. 20-30 min"
                      value={msg.eta || ''}
                      onChange={(e) => updateStatusField(status, 'eta', e.target.value)}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving || !canEdit} className="w-fit">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save settings
        </Button>
      </div>
    </div>
  )
}
