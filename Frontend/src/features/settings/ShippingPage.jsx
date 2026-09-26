import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { MapPin, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormDialog } from '@/components/shared/FormDialog'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  addShippingMethod,
  deleteShippingMethod,
  updateShippingMethod,
} from '@/store/slices/settingsSlice'
import { selectAuth, selectCurrentBranch, selectIsAllBranches, selectSelectedBranchId } from '@/store/selectors'
import { formatCurrency } from '@/lib/formatters'
import {
  createDeliveryAreaRequest,
  createShippingMethodRequest,
  deleteDeliveryAreaRequest,
  deleteShippingMethodRequest,
  fetchDeliveryAreas,
  updateDeliveryAreaRequest,
  updateShippingMethodRequest,
} from '@/lib/api'
import { usePermission } from '@/hooks/usePermission'

const emptyForm = { name: '', description: '', price: '', estimatedTime: '', enabled: true }
const emptyAreaForm = { name: '', charge: '149', enabled: true }

export default function ShippingPage() {
  const dispatch = useAppDispatch()
  const methods = useAppSelector((s) => s.settings.shippingMethods)
  const { token } = useAppSelector(selectAuth)
  const { canManage } = usePermission()
  const canEdit = canManage('settings')
  const selectedBranchId = useAppSelector(selectSelectedBranchId)
  const isAllBranches = useAppSelector(selectIsAllBranches)
  const currentBranch = useAppSelector(selectCurrentBranch)

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const [areas, setAreas] = useState([])
  const [areaSearch, setAreaSearch] = useState('')
  const [areaLetter, setAreaLetter] = useState('All')
  const [areasLoading, setAreasLoading] = useState(false)
  const [areaDrafts, setAreaDrafts] = useState({})
  const [savingAreaId, setSavingAreaId] = useState(null)
  const [areaDialogOpen, setAreaDialogOpen] = useState(false)
  const [areaForm, setAreaForm] = useState(emptyAreaForm)
  const [areaSaving, setAreaSaving] = useState(false)
  const [deleteAreaId, setDeleteAreaId] = useState(null)

  useEffect(() => {
    if (!token) return
    if (isAllBranches || !selectedBranchId) {
      setAreas([])
      setAreaDrafts({})
      setAreasLoading(false)
      return
    }
    let active = true
    setAreasLoading(true)
    fetchDeliveryAreas(token, { branchId: selectedBranchId })
      .then((list) => {
        if (!active) return
        setAreas(list)
        const drafts = {}
        for (const a of list) drafts[a.id] = String(a.charge ?? 0)
        setAreaDrafts(drafts)
      })
      .catch((err) => toast.error(err.message || 'Failed to load delivery areas'))
      .finally(() => {
        if (active) setAreasLoading(false)
      })
    return () => {
      active = false
    }
  }, [token, selectedBranchId, isAllBranches])

  const letters = useMemo(() => {
    const set = new Set()
    for (const a of areas) {
      const ch = String(a.name || '').charAt(0).toUpperCase()
      if (ch >= 'A' && ch <= 'Z') set.add(ch)
    }
    return ['All', ...Array.from(set).sort()]
  }, [areas])

  const filteredAreas = useMemo(() => {
    const q = areaSearch.trim().toLowerCase()
    return areas.filter((a) => {
      if (areaLetter !== 'All') {
        const ch = String(a.name || '').charAt(0).toUpperCase()
        if (ch !== areaLetter) return false
      }
      if (!q) return true
      return String(a.name || '').toLowerCase().includes(q)
    })
  }, [areas, areaSearch, areaLetter])

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

  const openEdit = (m) => {
    setEditing(m)
    setForm({
      name: m.name,
      description: m.description || '',
      price: String(m.price ?? 0),
      estimatedTime: m.estimatedTime || '',
      enabled: m.enabled !== false,
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
      description: form.description,
      price: parseFloat(form.price) || 0,
      estimatedTime: form.estimatedTime,
      enabled: form.enabled,
    }
    try {
      if (editing) {
        const method = await updateShippingMethodRequest(token, editing.id, payload)
        dispatch(updateShippingMethod(method))
        toast.success('Delivery method updated — live on website')
      } else {
        const method = await createShippingMethodRequest(token, payload)
        dispatch(addShippingMethod(method))
        toast.success('Delivery method added — live on website')
      }
      resetAndClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save delivery method')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (m) => {
    if (!token) return
    try {
      const method = await updateShippingMethodRequest(token, m.id, {
        name: m.name,
        description: m.description,
        price: m.price,
        estimatedTime: m.estimatedTime,
        enabled: !m.enabled,
      })
      dispatch(updateShippingMethod(method))
      toast.success(method.enabled ? `${method.name} enabled` : `${method.name} disabled`)
    } catch (err) {
      toast.error(err.message || 'Failed to update')
    }
  }

  const handleDelete = async () => {
    if (!deleteId || !token) return
    try {
      await deleteShippingMethodRequest(token, deleteId)
      dispatch(deleteShippingMethod(deleteId))
      toast.success('Delivery method removed')
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    } finally {
      setDeleteId(null)
    }
  }

  const handleSaveAreaCharge = async (area) => {
    if (!token) return
    const charge = parseFloat(areaDrafts[area.id])
    if (Number.isNaN(charge) || charge < 0) {
      toast.error('Enter a valid delivery charge')
      return
    }
    setSavingAreaId(area.id)
    try {
      const updated = await updateDeliveryAreaRequest(token, area.id, { charge })
      setAreas((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
      setAreaDrafts((prev) => ({ ...prev, [updated.id]: String(updated.charge ?? 0) }))
      toast.success(`${updated.name}: ${formatCurrency(updated.charge)}`)
    } catch (err) {
      toast.error(err.message || 'Failed to update area charge')
    } finally {
      setSavingAreaId(null)
    }
  }

  const handleToggleArea = async (area) => {
    if (!token) return
    try {
      const updated = await updateDeliveryAreaRequest(token, area.id, {
        enabled: !(area.enabled !== false),
      })
      setAreas((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
      toast.success(updated.enabled ? `${updated.name} enabled` : `${updated.name} hidden on website`)
    } catch (err) {
      toast.error(err.message || 'Failed to update area')
    }
  }

  const handleCreateArea = async () => {
    if (!token) return
    if (isAllBranches || !selectedBranchId) {
      toast.error('Select a specific branch in the header first')
      return
    }
    if (!areaForm.name.trim()) {
      toast.error('Area name is required')
      return
    }
    setAreaSaving(true)
    try {
      const area = await createDeliveryAreaRequest(token, {
        name: areaForm.name.trim(),
        charge: parseFloat(areaForm.charge) || 0,
        enabled: areaForm.enabled,
        branchId: selectedBranchId,
      })
      setAreas((prev) => [...prev, area].sort((a, b) => a.name.localeCompare(b.name)))
      setAreaDrafts((prev) => ({ ...prev, [area.id]: String(area.charge ?? 0) }))
      setAreaDialogOpen(false)
      setAreaForm(emptyAreaForm)
      toast.success('Area added for this branch')
    } catch (err) {
      toast.error(err.message || 'Failed to add area')
    } finally {
      setAreaSaving(false)
    }
  }

  const handleDeleteArea = async () => {
    if (!token || !deleteAreaId) return
    try {
      await deleteDeliveryAreaRequest(token, deleteAreaId)
      setAreas((prev) => prev.filter((a) => a.id !== deleteAreaId))
      toast.success('Area removed')
    } catch (err) {
      toast.error(err.message || 'Failed to delete area')
    } finally {
      setDeleteAreaId(null)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Delivery Charges"
        description="Delivery areas and fees are per branch. Use the branch switcher in the header — each branch has its own A–Z area list."
        action={
          canEdit ? (
            <Button type="button" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-1" />
              Add method
            </Button>
          ) : undefined
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Delivery areas (A–Z)
                {currentBranch ? (
                  <span className="text-xs font-normal text-muted-foreground">
                    · {currentBranch.name}
                  </span>
                ) : null}
              </CardTitle>
              <CardDescription className="mt-1">
                Areas for this branch only. Remove or disable an area here without affecting other branches.
              </CardDescription>
            </div>
            {canEdit ? (
              <Button
                type="button"
                variant="outline"
                disabled={isAllBranches}
                onClick={() => setAreaDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add area
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAllBranches ? (
            <p className="text-sm text-muted-foreground py-8 text-center border rounded-lg bg-muted/30">
              Select a specific branch in the header to manage that branch&apos;s delivery areas.
            </p>
          ) : (
            <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search area…"
              value={areaSearch}
              onChange={(e) => setAreaSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {letters.map((letter) => (
              <Button
                key={letter}
                type="button"
                size="sm"
                variant={areaLetter === letter ? 'default' : 'outline'}
                className="h-8 min-w-8 px-2"
                onClick={() => setAreaLetter(letter)}
              >
                {letter}
              </Button>
            ))}
          </div>
          <div className="rounded-lg border max-h-[28rem] overflow-y-auto divide-y">
            {areasLoading ? (
              <p className="p-4 text-sm text-muted-foreground">Loading areas…</p>
            ) : filteredAreas.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No areas match your search.</p>
            ) : (
              filteredAreas.map((area) => {
                const dirty = String(areaDrafts[area.id] ?? '') !== String(area.charge ?? 0)
                const charge = parseFloat(areaDrafts[area.id]) || 0
                return (
                  <div
                    key={area.id}
                    className="flex flex-wrap items-center gap-3 px-3 py-2.5 hover:bg-muted/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{area.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Delivery {formatCurrency(charge)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        className="w-24 h-8"
                        value={areaDrafts[area.id] ?? ''}
                        onChange={(e) =>
                          setAreaDrafts((prev) => ({ ...prev, [area.id]: e.target.value }))
                        }
                        disabled={!canEdit}
                      />
                      {canEdit ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            disabled={!dirty || savingAreaId === area.id}
                            onClick={() => handleSaveAreaCharge(area)}
                          >
                            {savingAreaId === area.id ? '…' : 'Save'}
                          </Button>
                          <Switch
                            checked={area.enabled !== false}
                            onCheckedChange={() => handleToggleArea(area)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setDeleteAreaId(area.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>
                )
              })
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {areas.length} areas total · showing {filteredAreas.length}
          </p>
            </>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-sm font-semibold mb-3">Delivery methods (fallback)</h2>
        <div className="grid gap-4">
          {methods.map((m) => (
            <Card key={m.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base">{m.name}</CardTitle>
                  <CardDescription>
                    {m.description || 'No description'}
                    {m.estimatedTime ? ` · ${m.estimatedTime}` : ''}
                  </CardDescription>
                  <p className="text-xs text-muted-foreground mt-1">
                    Used when no area is selected. Base {formatCurrency(m.price)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold tabular-nums">
                    {Number(m.price) === 0 ? 'Free' : formatCurrency(m.price)}
                  </span>
                  {canEdit ? (
                    <>
                      <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(m)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(m.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      <Switch checked={m.enabled !== false} onCheckedChange={() => handleToggle(m)} />
                    </>
                  ) : null}
                </div>
              </CardHeader>
            </Card>
          ))}
          {methods.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No delivery methods yet. Area charges are primary; methods are a fallback.
            </p>
          )}
        </div>
      </div>

      <FormDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={editing ? 'Edit delivery method' : 'Add delivery method'}
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
        <div className="grid gap-2">
          <Label>Name</Label>
          <Input
            placeholder="Standard Delivery"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label>Description</Label>
          <Input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Base price (Rs)</Label>
            <Input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Est. Time</Label>
            <Input
              placeholder="30-45 min"
              value={form.estimatedTime}
              onChange={(e) => setForm({ ...form, estimatedTime: e.target.value })}
            />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border px-3 py-2">
          <Label>Enabled on website</Label>
          <Switch
            checked={form.enabled}
            onCheckedChange={(v) => setForm({ ...form, enabled: v })}
            disabled={!canEdit}
          />
        </div>
      </FormDialog>

      <FormDialog
        open={areaDialogOpen}
        onOpenChange={(next) => {
          if (!next) {
            setAreaDialogOpen(false)
            setAreaForm(emptyAreaForm)
          } else setAreaDialogOpen(true)
        }}
        title="Add delivery area"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAreaDialogOpen(false)
                setAreaForm(emptyAreaForm)
              }}
              disabled={areaSaving}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleCreateArea} disabled={areaSaving || !canEdit}>
              {areaSaving ? 'Saving…' : 'Add area'}
            </Button>
          </>
        }
      >
        <div className="grid gap-2">
          <Label>Area name</Label>
          <Input
            placeholder="e.g. Gulshan-e-Iqbal"
            value={areaForm.name}
            onChange={(e) => setAreaForm({ ...areaForm, name: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label>Delivery charge (Rs)</Label>
          <Input
            type="number"
            min="0"
            value={areaForm.charge}
            onChange={(e) => setAreaForm({ ...areaForm, charge: e.target.value })}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border px-3 py-2">
          <Label>Show on website</Label>
          <Switch
            checked={areaForm.enabled}
            onCheckedChange={(v) => setAreaForm({ ...areaForm, enabled: v })}
            disabled={!canEdit}
          />
        </div>
      </FormDialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(next) => !next && setDeleteId(null)}
        title="Delete delivery method?"
        description="Customers will no longer see this option at checkout."
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={!!deleteAreaId}
        onOpenChange={(next) => !next && setDeleteAreaId(null)}
        title="Delete delivery area?"
        description="This area will disappear from the website location list."
        onConfirm={handleDeleteArea}
      />
    </div>
  )
}
