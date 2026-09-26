import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2, RotateCcw, Building2, ShieldCheck, MapPin } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormDialog } from '@/components/shared/FormDialog'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addUser, updateUser, deleteUser, setUsers } from '@/store/slices/settingsSlice'
import { resetDemoData } from '@/store/index'
import { selectAuth, selectActiveBranches, selectCurrentUser } from '@/store/selectors'
import { formatDateTime } from '@/lib/formatters'
import { usePermission } from '@/hooks/usePermission'
import {
  createAdminUserRequest,
  updateAdminUserRequest,
  deleteAdminUserRequest,
  fetchAdminUsers,
  fetchRoles,
} from '@/lib/api'

const emptyForm = {
  name: '',
  email: '',
  password: '',
  roleId: '',
  status: 'active',
  branchMode: 'all', // 'all' | 'specific'
  branchIds: [],
}

export default function UsersPage() {
  const dispatch = useAppDispatch()
  const users = useAppSelector((s) => s.settings.users)
  const branches = useAppSelector(selectActiveBranches)
  const currentUser = useAppSelector(selectCurrentUser)
  const { token } = useAppSelector(selectAuth)
  const { canManage } = usePermission()
  const canEdit = canManage('users')

  const [roles, setRoles] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [resetOpen, setResetOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  // Determine current user's branch access
  const creatorBranchIds = Array.isArray(currentUser?.branchIds)
    ? currentUser.branchIds.filter(Boolean)
    : []
  const isHqCreator = creatorBranchIds.length === 0 || currentUser?.role === 'admin'
  const accessibleBranches = isHqCreator
    ? branches
    : branches.filter((b) => creatorBranchIds.includes(b.id))

  useEffect(() => {
    if (!token) return
    fetchRoles(token)
      .then(setRoles)
      .catch(() => setRoles([]))

    fetchAdminUsers(token)
      .then((data) => {
        if (Array.isArray(data)) dispatch(setUsers(data))
      })
      .catch(() => {})
  }, [token, dispatch])

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
    setForm({
      ...emptyForm,
      roleId: roles[0]?.id || '',
      branchMode: isHqCreator ? 'all' : 'specific',
      branchIds: isHqCreator ? [] : [...creatorBranchIds],
    })
    setOpen(true)
  }

  const openEdit = (u) => {
    setEditing(u)
    const assigned = Array.isArray(u.branchIds) ? u.branchIds.filter(Boolean) : []
    const hasBranches = assigned.length > 0
    setForm({
      name: u.name,
      email: u.email,
      password: '',
      roleId: u.roleId || roles.find((r) => r.slug === u.role)?.id || '',
      status: u.status || 'active',
      branchMode: hasBranches ? 'specific' : isHqCreator ? 'all' : 'specific',
      branchIds: hasBranches ? assigned : isHqCreator ? [] : [...creatorBranchIds],
    })
    setOpen(true)
  }

  const roleName = (u) => u.roleName || roles.find((r) => r.id === u.roleId)?.name || u.role

  const handleBranchToggle = (branchId, checked) => {
    setForm((prev) => {
      const current = new Set(prev.branchIds || [])
      if (checked) current.add(branchId)
      else current.delete(branchId)
      return { ...prev, branchIds: [...current] }
    })
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required')
      return
    }
    if (!editing && !form.password.trim()) {
      toast.error('Password is required for new users')
      return
    }
    if (!form.roleId) {
      toast.error('Select a role')
      return
    }

    let finalBranchIds = []
    if (!isHqCreator) {
      if (!form.branchIds || form.branchIds.length === 0) {
        toast.error('Please assign at least one branch')
        return
      }
      finalBranchIds = form.branchIds.filter((b) => creatorBranchIds.includes(b))
      if (finalBranchIds.length === 0) {
        toast.error('You can only allocate users to branches you have access to')
        return
      }
    } else {
      finalBranchIds = form.branchMode === 'all' ? [] : (form.branchIds || [])
      if (form.branchMode === 'specific' && finalBranchIds.length === 0) {
        toast.error('Select at least one branch or choose All Branches')
        return
      }
    }

    if (!token) return
    setSaving(true)
    try {
      if (editing) {
        const payload = {
          name: form.name.trim(),
          email: form.email.trim(),
          roleId: form.roleId,
          status: form.status,
          branchIds: finalBranchIds,
        }
        if (form.password.trim()) payload.password = form.password.trim()
        const user = await updateAdminUserRequest(token, editing.id, payload)
        dispatch(updateUser(user))
        toast.success('User updated')
      } else {
        const user = await createAdminUserRequest(token, {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password.trim(),
          roleId: form.roleId,
          status: form.status,
          branchIds: finalBranchIds,
        })
        dispatch(addUser(user))
        toast.success('User created')
      }
      resetAndClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save user')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId || !token) return
    try {
      await deleteAdminUserRequest(token, deleteId)
      dispatch(deleteUser(deleteId))
      toast.success('Deleted')
    } catch (err) {
      toast.error(err.message || 'Failed to delete user')
    } finally {
      setDeleteId(null)
    }
  }

  const columns = [
    { header: 'Name', key: 'name' },
    { header: 'Email', key: 'email' },
    {
      header: 'Role',
      render: (r) => (
        <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs font-medium">
          <ShieldCheck className="h-3 w-3 text-primary" />
          {roleName(r)}
        </span>
      ),
    },
    {
      header: 'Branch Allocation',
      render: (r) => {
        const assigned = Array.isArray(r.branchIds) ? r.branchIds.filter(Boolean) : []
        if (assigned.length === 0) {
          return (
            <span className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              <Building2 className="h-3 w-3 text-muted-foreground" />
              All Branches (HQ)
            </span>
          )
        }
        return (
          <div className="flex flex-wrap gap-1 max-w-[240px]">
            {assigned.map((bId) => {
              const b = branches.find((item) => item.id === bId)
              return (
                <span
                  key={bId}
                  className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                >
                  <MapPin className="h-2.5 w-2.5 shrink-0" />
                  {b?.name || bId}
                </span>
              )
            })}
          </div>
        )
      },
    },
    { header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { header: 'Last Login', render: (r) => formatDateTime(r.lastLogin) },
    {
      header: 'Actions',
      render: (r) =>
        canEdit ? (
          <div className="flex gap-1">
            <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(r)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => setDeleteId(r.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ) : null,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage admin users, assign roles to control permissions, and allocate users to specific branches."
        action={
          canEdit ? (
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setResetOpen(true)}>
                <RotateCcw className="mr-2 h-4 w-4" /> Reset Demo Data
              </Button>
              <Button type="button" onClick={openCreate}>
                Add User
              </Button>
            </div>
          ) : null
        }
      />
      <DataTable data={users} columns={columns} searchKey="name" />

      <FormDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={`${editing ? 'Edit' : 'Add'} User`}
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
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label>{editing ? 'New password (optional)' : 'Password'}</Label>
          <Input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="new-password"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Role</Label>
            <Select value={form.roleId} onValueChange={(v) => setForm({ ...form, roleId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles
                  .filter((r) => isHqCreator || r.slug !== 'admin')
                  .map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Branch Allocation Controls */}
        <div className="rounded-lg border p-3 space-y-3 bg-muted/20">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-primary" /> Branch Allocation
            </Label>
          </div>

          {isHqCreator ? (
            <div className="space-y-3">
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="branchMode"
                    value="all"
                    checked={form.branchMode === 'all'}
                    onChange={() => setForm({ ...form, branchMode: 'all', branchIds: [] })}
                    className="accent-primary"
                  />
                  <span>All Branches (Global Access)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="branchMode"
                    value="specific"
                    checked={form.branchMode === 'specific'}
                    onChange={() =>
                      setForm({
                        ...form,
                        branchMode: 'specific',
                        branchIds: form.branchIds.length ? form.branchIds : [branches[0]?.id].filter(Boolean),
                      })
                    }
                    className="accent-primary"
                  />
                  <span>Specific Branch(es)</span>
                </label>
              </div>

              {form.branchMode === 'specific' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {accessibleBranches.map((branch) => {
                    const isChecked = (form.branchIds || []).includes(branch.id)
                    return (
                      <label
                        key={branch.id}
                        className="flex items-center gap-2 rounded border bg-card p-2 text-xs font-medium cursor-pointer hover:bg-accent"
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => handleBranchToggle(branch.id, Boolean(checked))}
                        />
                        <span className="truncate">{branch.name}</span>
                        {branch.isPrimary ? (
                          <span className="ml-auto text-[10px] text-muted-foreground">Primary</span>
                        ) : null}
                      </label>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  User will have access across all restaurant branch locations.
                </p>
              )}
            </div>
          ) : creatorBranchIds.length === 1 ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 rounded border bg-card p-2.5 text-sm font-medium">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{accessibleBranches[0]?.name || creatorBranchIds[0]}</span>
                <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  Locked to your branch
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                As a manager of this branch, newly created or edited users are allocated strictly to your branch location.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Select from the branches you manage to allocate this user:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {accessibleBranches.map((branch) => {
                  const isChecked = (form.branchIds || []).includes(branch.id)
                  return (
                    <label
                      key={branch.id}
                      className="flex items-center gap-2 rounded border bg-card p-2 text-xs font-medium cursor-pointer hover:bg-accent"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => handleBranchToggle(branch.id, Boolean(checked))}
                      />
                      <span className="truncate">{branch.name}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </FormDialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete User"
        description="Delete this user?"
        onConfirm={handleDelete}
      />
      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset Demo Data"
        description="This will clear local cart list placeholders. Catalog data will reload from the API."
        confirmLabel="Reset"
        onConfirm={() => {
          resetDemoData(dispatch)
          toast.success('Demo data reset')
        }}
      />
    </div>
  )
}
