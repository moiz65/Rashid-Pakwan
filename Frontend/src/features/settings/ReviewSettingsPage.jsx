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
import { fetchReviewSettings, updateReviewSettings } from '@/lib/api'
import { usePermission } from '@/hooks/usePermission'

const emptyForm = {
  emailEnabled: false,
  whatsappEnabled: false,
  emailSubject: '',
  emailBodyTemplate: '',
  whatsappTemplate: '',
  delayMinutes: 30,
  inviteOnDelivered: true,
}

export default function ReviewSettingsPage() {
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
        const settings = await fetchReviewSettings(token)
        if (!cancelled) {
          setForm({
            emailEnabled: Boolean(settings.emailEnabled),
            whatsappEnabled: Boolean(settings.whatsappEnabled),
            emailSubject: settings.emailSubject || '',
            emailBodyTemplate: settings.emailBodyTemplate || '',
            whatsappTemplate: settings.whatsappTemplate || '',
            delayMinutes: settings.delayMinutes ?? 30,
            inviteOnDelivered: settings.inviteOnDelivered !== false,
          })
        }
      } catch (err) {
        if (!cancelled) toast.error(err.message || 'Failed to load review settings')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token])

  const handleSave = async () => {
    setSaving(true)
    try {
      const settings = await updateReviewSettings(token, form)
      setForm({
        emailEnabled: Boolean(settings.emailEnabled),
        whatsappEnabled: Boolean(settings.whatsappEnabled),
        emailSubject: settings.emailSubject || '',
        emailBodyTemplate: settings.emailBodyTemplate || '',
        whatsappTemplate: settings.whatsappTemplate || '',
        delayMinutes: settings.delayMinutes ?? 30,
        inviteOnDelivered: settings.inviteOnDelivered !== false,
      })
      toast.success('Review settings saved')
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
        title="Review Invites"
        description="Configure email and WhatsApp review invite templates. Sending is not enabled yet — settings are saved for future use."
      />

      <div className="grid gap-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Channels</CardTitle>
            <CardDescription>
              Placeholders only — no messages are sent until email/WhatsApp integrations are connected
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label>Email invites</Label>
                <p className="text-sm text-muted-foreground">Send a review link by email after delivery</p>
              </div>
              <Switch
                checked={form.emailEnabled}
                onCheckedChange={(checked) => setForm({ ...form, emailEnabled: checked })}
                disabled={!canEdit}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label>WhatsApp invites</Label>
                <p className="text-sm text-muted-foreground">Send a review link via WhatsApp after delivery</p>
              </div>
              <Switch
                checked={form.whatsappEnabled}
                onCheckedChange={(checked) => setForm({ ...form, whatsappEnabled: checked })}
                disabled={!canEdit}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label>Invite when delivered</Label>
                <p className="text-sm text-muted-foreground">
                  Queue an invite when order status becomes delivered (future automation)
                </p>
              </div>
              <Switch
                checked={form.inviteOnDelivered}
                onCheckedChange={(checked) => setForm({ ...form, inviteOnDelivered: checked })}
                disabled={!canEdit}
              />
            </div>
            <div className="grid gap-2 max-w-xs">
              <Label>Delay (minutes)</Label>
              <Input
                type="number"
                min={0}
                max={10080}
                value={form.delayMinutes}
                onChange={(e) => setForm({ ...form, delayMinutes: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">
                Wait this long after delivery before sending (when sending is enabled)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Email template</CardTitle>
            <CardDescription>
              Tokens: {'{{customerName}}'}, {'{{orderId}}'}, {'{{trackingUrl}}'}, {'{{restaurantName}}'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>Subject</Label>
              <Input
                value={form.emailSubject}
                onChange={(e) => setForm({ ...form, emailSubject: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Body</Label>
              <Textarea
                rows={6}
                value={form.emailBodyTemplate}
                onChange={(e) => setForm({ ...form, emailBodyTemplate: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">WhatsApp template</CardTitle>
            <CardDescription>
              Tokens: {'{{customerName}}'}, {'{{orderId}}'}, {'{{trackingUrl}}'}, {'{{restaurantName}}'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>Message</Label>
              <Textarea
                rows={4}
                value={form.whatsappTemplate}
                onChange={(e) => setForm({ ...form, whatsappTemplate: e.target.value })}
              />
            </div>
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
