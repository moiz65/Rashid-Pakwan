import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Check, Eye, Pencil, Shield, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { FormDialog, FormSection } from '@/components/shared/FormDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/store/hooks'
import { selectAuth } from '@/store/selectors'
import {
  groupPermissionsByModule,
  moduleLabel,
  permissionActionMeta,
} from '@/lib/permissions'
import { usePermission } from '@/hooks/usePermission'
import {
  createRoleRequest,
  deleteRoleRequest,
  fetchPermissions,
  fetchRoles,
  updateRoleRequest,
} from '@/lib/api'

const emptyForm = {
  name: '',
  description: '',
  permissions: [],
}

const ACTIVE_TAB_KEY = 'roles-permission-tab'

function readStoredTab(fallback) {
  try {
    return sessionStorage.getItem(ACTIVE_TAB_KEY) || fallback
  } catch {
    return fallback
  }
}

function storeTab(tab) {
  try {
    sessionStorage.setItem(ACTIVE_TAB_KEY, tab)
  } catch {
    /* ignore */
  }
}

function PermissionCard({ permission, checked, onToggle, disabled }) {
  const meta = permissionActionMeta(permission.action)
  const Icon = permission.action === 'manage' ? Pencil : Eye

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onToggle(permission.key)}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors',
        checked
          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
          : 'border-border bg-background hover:bg-muted/40',
        disabled && 'cursor-not-allowed opacity-60',
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
          checked ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-sm font-medium">
          {meta.title}
          {checked ? <Check className="h-4 w-4 text-primary" /> : null}
        </span>
        <span className="mt-1 block text-xs text-muted-foreground">{meta.description}</span>
      </span>
    </button>
  )
}

export default function RolesPage() {
  const { token } = useAppSelector(selectAuth)
  const { canManage } = usePermission()
  const canEdit = canManage('roles')

  const [roles, setRoles] = useState([])
  const [allPermissions, setAllPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState(() => readStoredTab('dashboard'))

  const permissionGroups = groupPermissionsByModule(allPermissions)

  const load = async () => {
    if (!token) return
    setLoading(true)
    try {
      const [roleList, permList] = await Promise.all([
        fetchRoles(token),
        fetchPermissions(token),
      ])
      setRoles(roleList)
      setAllPermissions(permList)
    } catch (err) {
      toast.error(err.message || 'Failed to load roles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [token])

  useEffect(() => {
    if (!permissionGroups.length) return
    const exists = permissionGroups.some((g) => g.module === activeTab)
    if (!exists) {
      const next = permissionGroups[0].module
      setActiveTab(next)
      storeTab(next)
    }
  }, [permissionGroups, activeTab])

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

  const openEdit = (role) => {
    setEditing(role)
    setForm({
      name: role.name,
      description: role.description || '',
      permissions: [...(role.permissions || [])],
    })
    setOpen(true)
  }

  const togglePermission = (key) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter((p) => p !== key)
        : [...prev.permissions, key],
    }))
  }

  const toggleModule = (moduleKeys, checked) => {
    setForm((prev) => {
      const set = new Set(prev.permissions)
      for (const key of moduleKeys) {
        if (checked) set.add(key)
        else set.delete(key)
      }
      return { ...prev, permissions: [...set] }
    })
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    storeTab(tab)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !token) {
      toast.error('Role name is required')
      return
    }
    if (!form.permissions.length) {
      toast.error('Select at least one permission')
      return
    }
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      permissions: form.permissions,
    }
    try {
      if (editing) {
        await updateRoleRequest(token, editing.id, payload)
        toast.success('Role updated')
      } else {
        await createRoleRequest(token, payload)
        toast.success('Role created')
      }
      resetAndClose()
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to save role')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId || !token) return
    try {
      await deleteRoleRequest(token, deleteId)
      toast.success('Role deleted')
      setDeleteId(null)
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to delete role')
    }
  }

  const columns = [
    { header: 'Role', key: 'name' },
    {
      header: 'Access areas',
      render: (r) => {
        const count = (r.permissions || []).length
        const areas = new Set((r.permissions || []).map((p) => p.split('.')[0])).size
        return (
          <span className="text-sm text-muted-foreground">
            {areas} area{areas === 1 ? '' : 's'} · {count} permission{count === 1 ? '' : 's'}
          </span>
        )
      },
    },
    {
      header: 'Type',
      render: (r) => (
        <span className="text-xs rounded-md bg-muted px-1.5 py-0.5 text-muted-foreground">
          {r.isSystem ? 'Built-in' : 'Custom'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (r) =>
        canEdit ? (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={r.isSystem}
              onClick={() => setDeleteId(r.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ) : null,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        description="Create roles and choose what each person can see or change. Pick a tab for each area of the admin panel, then assign the role on the Users page."
        action={
          canEdit ? (
            <Button onClick={openCreate}>
              <Shield className="mr-2 h-4 w-4" /> Add Role
            </Button>
          ) : null
        }
      />

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading roles…</p>
      ) : (
        <DataTable data={roles} columns={columns} searchKey="name" searchPlaceholder="Search roles..." />
      )}

      <FormDialog
        open={open}
        onOpenChange={(next) => { if (!next) resetAndClose(); else setOpen(true) }}
        title={editing ? 'Edit Role' : 'Add Role'}
        description="Name the role, then choose what each area of the admin panel can do."
        size="2xl"
        footer={
          <>
            <Button variant="outline" onClick={resetAndClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !canEdit}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      >
        <FormSection title="Role details">
          <div className="grid min-w-0 gap-2">
            <Label htmlFor="role-name">Name</Label>
            <Input
              id="role-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={editing?.isSystem}
              placeholder="e.g. Marketing team"
              className="h-10 border-border bg-background"
            />
          </div>
          <div className="grid min-w-0 gap-2">
            <Label htmlFor="role-description">Description</Label>
            <Textarea
              id="role-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="What is this role for?"
              className="min-h-[80px] resize-none border-border bg-background"
            />
          </div>
        </FormSection>

        <FormSection
          title="What can this role do?"
          description="Pick a module, then turn on view or edit access."
        >
          <div className="flex w-full min-w-0 flex-wrap gap-2 rounded-xl border bg-muted/40 p-2">
            {permissionGroups.map(({ module, label, permissions }) => {
              const keys = permissions.map((p) => p.key)
              const selected = keys.filter((k) => form.permissions.includes(k)).length
              const isActive = activeTab === module
              return (
                <button
                  key={module}
                  type="button"
                  onClick={() => handleTabChange(module)}
                  className={cn(
                    'inline-flex items-center rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                    isActive
                      ? 'border-primary/40 bg-background text-foreground shadow-sm'
                      : 'border-transparent bg-transparent text-muted-foreground hover:bg-background/60 hover:text-foreground',
                  )}
                >
                  {label}
                  {selected > 0 ? (
                    <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      {selected}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>

          {permissionGroups.map(({ module, label, permissions }) => {
            if (module !== activeTab) return null

            const keys = permissions.map((p) => p.key)
            const allChecked = keys.every((k) => form.permissions.includes(k))
            const someChecked = keys.some((k) => form.permissions.includes(k))

            return (
              <div key={module} className="space-y-4">
                <div className="rounded-xl border bg-muted/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">
                        Choose what people with this role can do in {moduleLabel(module).toLowerCase()}.
                      </p>
                    </div>
                    <label className="flex shrink-0 items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-primary"
                        checked={allChecked}
                        ref={(el) => {
                          if (el) el.indeterminate = someChecked && !allChecked
                        }}
                        onChange={(e) => toggleModule(keys, e.target.checked)}
                        disabled={!canEdit}
                      />
                      Allow all for this tab
                    </label>
                  </div>
                </div>

                <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                  {permissions.map((p) => (
                    <PermissionCard
                      key={p.key}
                      permission={p}
                      checked={form.permissions.includes(p.key)}
                      onToggle={togglePermission}
                      disabled={!canEdit}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </FormSection>
      </FormDialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete role"
        description="Users assigned to this role must be moved first. Delete this custom role?"
        onConfirm={handleDelete}
      />
    </div>
  )
}
