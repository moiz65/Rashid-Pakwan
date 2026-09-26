import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { MoreHorizontal, Eye, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ProductSearchSelect } from '@/components/shared/ProductSearchSelect'
import { CustomerSearchSelect } from '@/components/shared/CustomerSearchSelect'
import {
  OrderStatusSelect,
  getUpcomingStatusOptions,
  MANUAL_ORDER_STATUS_OPTIONS,
} from '@/components/shared/OrderStatusSelect'
import { FormDialog, FormSection } from '@/components/shared/FormDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addOrder, setOrders, updateOrderStatus } from '@/store/slices/ordersSlice'
import { addDemoOrder, updateDemoOrderStatus } from '@/store/slices/branchesSlice'
import {
  selectBranchAddons,
  selectAuth,
  selectBranchDrinks,
  selectBranchProducts,
  selectCustomers,
  selectIsAllBranches,
  selectSelectedBranchId,
  selectUpcomingOrders,
  selectWriteBranchId,
} from '@/store/selectors'
import { formatCurrency, formatDateTime, formatOrderId } from '@/lib/formatters'
import { apiBranchParams, isDemoRecord } from '@/lib/branches'
import { BranchBadge } from '@/components/shared/BranchBadge'
import { createOrder, fetchOrders, updateOrderStatusRequest, validateCouponRequest } from '@/lib/api'
import {
  calcAddonsTotal,
  getAddonNames,
  menuItemsForPicker,
  resolveOrderAddons,
} from '@/lib/orderAddons'
import { buildManualOrderNotes, getItemExtras, parseOrderNotes } from '@/lib/orderNotes'
import { usePermission } from '@/hooks/usePermission'

const emptyItem = {
  productId: '',
  name: '',
  qty: '1',
  price: '',
  basePrice: '',
  addons: [],
  itemNote: '',
}

const emptyForm = {
  customerId: '',
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  status: 'pending',
  notes: '',
  couponCode: '',
  items: [{ ...emptyItem }],
}

function DetailRow({ label, value, mono = false, capitalize = false }) {
  if (value == null || value === '') return null
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={`mt-0.5 text-sm font-medium break-words whitespace-pre-wrap ${
          mono ? 'font-mono text-xs' : ''
        } ${capitalize ? 'capitalize' : ''}`}
      >
        {value}
      </p>
    </div>
  )
}

function DetailSection({ title, children }) {
  return (
    <section className="rounded-xl border bg-card/40 p-3.5 space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </section>
  )
}

export default function UpcomingOrdersPage() {
  const dispatch = useAppDispatch()
  const orders = useAppSelector(selectUpcomingOrders)
  const customers = useAppSelector(selectCustomers)
  const products = useAppSelector(selectBranchProducts)
  const drinks = useAppSelector(selectBranchDrinks)
  const catalogAddons = useAppSelector(selectBranchAddons)
  const { token } = useAppSelector(selectAuth)
  const { canManage } = usePermission()
  const canEdit = canManage('orders')
  const allMode = useAppSelector(selectIsAllBranches)
  const writeBranchId = useAppSelector(selectWriteBranchId)
  const selectedBranchId = useAppSelector(selectSelectedBranchId)
  const [selected, setSelected] = useState(null)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [couponMsg, setCouponMsg] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectTarget, setRejectTarget] = useState(null)

  const menuItems = useMemo(
    () => menuItemsForPicker(products, drinks),
    [products, drinks],
  )

  const parsedNotes = selected ? parseOrderNotes(selected.notes) : null

  const refreshOrders = async () => {
    const data = await fetchOrders(token, apiBranchParams(selectedBranchId))
    dispatch(setOrders(data))
  }

  const handleStatus = async (id, status, rejectionReason) => {
    const existing = orders.find((o) => o.id === id)
    if (existing && isDemoRecord(existing)) {
      dispatch(updateDemoOrderStatus({
        id,
        status,
        rejectionReason: rejectionReason ?? null,
      }))
      toast.success('Demo order updated')
      return
    }
    try {
      const order = await updateOrderStatusRequest(token, id, status, rejectionReason)
      dispatch(updateOrderStatus({
        id,
        status,
        rejectionReason: order.rejectionReason ?? null,
      }))
      const label =
        status === 'confirmed'
          ? 'Received'
          : status === 'pending'
            ? 'New (unreceived)'
            : status
      toast.success(`Order updated to ${label}`)
    } catch (err) {
      toast.error(err.message || 'Failed to update order')
    }
  }

  const handleStatusChange = (order, status) => {
    if (status === order.status) return
    if (status === 'rejected' || status === 'cancelled') {
      setRejectTarget({ id: order.id, status })
      setRejectReason('')
      setRejectOpen(true)
      return
    }
    handleStatus(order.id, status)
  }

  const confirmReject = async () => {
    if (!rejectTarget) return
    if (!rejectReason.trim()) {
      toast.error('Please enter a rejection reason')
      return
    }
    await handleStatus(rejectTarget.id, rejectTarget.status, rejectReason.trim())
    setRejectOpen(false)
    setRejectTarget(null)
    setRejectReason('')
  }

  const syncItemPrice = (item, next = {}) => {
    const merged = { ...item, ...next }
    const base = parseFloat(merged.basePrice) || 0
    const addonsTotal = calcAddonsTotal(catalogAddons, merged.addons || [])
    return {
      ...merged,
      price: String(base + addonsTotal),
    }
  }

  const updateItem = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i !== index) return item
        if (field === 'price') {
          return { ...item, price: value, basePrice: value, addons: [] }
        }
        if (field === 'name') {
          return { ...item, name: value, productId: '', itemKind: '' }
        }
        return { ...item, [field]: value }
      }),
    }))
  }

  const handleProductSelect = (index, product) => {
    const unit =
      product.discountedPrice != null ? product.discountedPrice : product.price
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i !== index) return item
        return syncItemPrice(item, {
          productId: product.id,
          name: product.name,
          basePrice: String(unit ?? 0),
          itemKind: product.kind || product.itemType || 'product',
          addons: [],
        })
      }),
    }))
  }

  const toggleAddon = (index, addonId) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i !== index) return item
        const addons = item.addons.includes(addonId)
          ? item.addons.filter((id) => id !== addonId)
          : [...item.addons, addonId]
        return syncItemPrice(item, { addons })
      }),
    }))
  }

  const availableAddonsForItem = (item) => {
    const selectedMenuItem = menuItems.find((p) => p.id === item.productId) || null
    return resolveOrderAddons(catalogAddons, selectedMenuItem)
  }

  const addItemRow = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, { ...emptyItem }] }))
  }

  const removeItemRow = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter((_, i) => i !== index) : prev.items,
    }))
  }

  const handleCustomerPick = (customer) => {
    setForm((prev) => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.name || '',
      customerEmail: customer.email || '',
      customerPhone: customer.phone || '',
    }))
  }

  const handleCustomerClear = () => {
    setForm((prev) => ({
      ...prev,
      customerId: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
    }))
  }

  const itemsSubtotal = form.items.reduce((sum, item) => {
    const qty = parseInt(item.qty, 10) || 1
    const price = parseFloat(item.price) || 0
    return sum + qty * price
  }, 0)

  const applyCoupon = async () => {
    const code = form.couponCode.trim()
    if (!code) {
      setCouponMsg('')
      setCouponDiscount(0)
      return
    }
    try {
      const result = await validateCouponRequest(token, { code, subtotal: itemsSubtotal })
      if (result.valid) {
        setCouponDiscount(Number(result.discount) || 0)
        setCouponMsg(result.message || 'Coupon applied')
        toast.success('Coupon valid')
      } else {
        setCouponDiscount(0)
        setCouponMsg(result.message || 'Invalid coupon')
        toast.error(result.message || 'Invalid coupon')
      }
    } catch (err) {
      setCouponDiscount(0)
      setCouponMsg(err.message || 'Validation failed')
      toast.error(err.message || 'Failed to validate coupon')
    }
  }

  const handleSave = async () => {
    const prepared = form.items
      .filter((item) => item.name.trim())
      .map((item) => ({
        productId: item.productId || undefined,
        name: item.name.trim(),
        qty: parseInt(item.qty, 10) || 1,
        price: parseFloat(item.price) || 0,
        addonNames: getAddonNames(catalogAddons, item.addons),
        itemNote: item.itemNote,
      }))

    if (!prepared.length) {
      toast.error('Add at least one item')
      return
    }

    if (!form.customerId && !form.customerName.trim()) {
      toast.error('Select a customer or enter a customer name')
      return
    }

    setSaving(true)
    try {
      const notes = buildManualOrderNotes({
        freeNotes: form.notes,
        items: prepared,
      })

      const payload = {
        customerId: form.customerId || undefined,
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim() || undefined,
        customerPhone: form.customerPhone.trim() || undefined,
        status: form.status,
        notes,
        couponCode: form.couponCode.trim() || undefined,
        source: 'admin',
        branchId: writeBranchId,
        items: prepared.map(({ productId, name, qty, price }) => ({
          productId,
          name,
          qty,
          price,
        })),
      }

      const order = await createOrder(token, payload)
      dispatch(addOrder(order))
      await refreshOrders()
      toast.success('Manual order created')
      setOpen(false)
      setForm(emptyForm)
      setCouponMsg('')
      setCouponDiscount(0)
    } catch (err) {
      toast.error(err.message || 'Failed to create order')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      header: 'Track ID',
      key: 'id',
      render: (r) => (
        <button
          type="button"
          className="font-mono text-xs font-semibold tracking-wide text-primary hover:underline"
          title="Click to copy track ID"
          onClick={() => {
            navigator.clipboard?.writeText(String(r.id || '')).then(
              () => toast.success(`Copied track ID: ${formatOrderId(r.id)}`),
              () => {},
            )
          }}
        >
          {formatOrderId(r.id)}
        </button>
      ),
    },
    { header: 'Customer', key: 'customerName' },
    ...(allMode
      ? [{ header: 'Branch', render: (r) => <BranchBadge branchId={r.branchId} /> }]
      : []),
    { header: 'Source', render: (r) => <StatusBadge status={r.source || 'admin'} /> },
    { header: 'Items', render: (r) => r.items.length },
    { header: 'Total', render: (r) => formatCurrency(r.total) },
    {
      header: 'Status',
      render: (r) =>
        canEdit ? (
          <OrderStatusSelect
            key={`${r.id}-${r.status}`}
            value={r.status}
            options={getUpcomingStatusOptions(r.status)}
            onChange={(status) => handleStatusChange(r, status)}
          />
        ) : (
          <StatusBadge status={r.status} />
        ),
    },
    { header: 'Date', render: (r) => formatDateTime(r.createdAt) },
    {
      header: 'Actions',
      render: (r) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelected(r)}>
              <Eye className="mr-2 h-4 w-4" /> View
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Upcoming Orders"
        description="Manage pending, confirmed, and preparing orders"
        actionLabel={canEdit ? 'Add Manual Order' : undefined}
        onAction={canEdit ? () => { setForm(emptyForm); setOpen(true) } : undefined}
      />
      <DataTable data={orders} columns={columns} searchKey="customerName" searchPlaceholder="Search customers..." />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Add Manual Order"
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !canEdit}>{saving ? 'Saving...' : 'Create Order'}</Button>
          </>
        }
      >
        <FormSection title="Customer">
          <div className="grid gap-2">
            <Label>Existing Customer</Label>
            <CustomerSearchSelect
              customers={customers}
              customerId={form.customerId}
              customerName={form.customerName}
              onSelect={handleCustomerPick}
              onClear={handleCustomerClear}
              placeholder="Search customer by name, email, or phone..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Customer Name</Label>
              <Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <OrderStatusSelect
                value={form.status}
                options={MANUAL_ORDER_STATUS_OPTIONS}
                onChange={(status) => setForm({ ...form, status })}
                className="w-full h-9 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input type="email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
            </div>
          </div>
        </FormSection>

        <FormSection title="Items">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Order Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItemRow}>
                <Plus className="mr-1 h-4 w-4" /> Add Item
              </Button>
            </div>
            {form.items.map((item, index) => (
              <div key={index} className="rounded-lg border p-3 space-y-3">
                <div className="grid grid-cols-[1fr_80px_120px_40px] gap-2 items-end">
                  <div className="grid gap-1">
                    <Label className="text-xs">Menu item</Label>
                    <ProductSearchSelect
                      products={menuItems}
                      value={item.name}
                      productId={item.productId}
                      onSelect={(product) => handleProductSelect(index, product)}
                      onNameChange={(name) => updateItem(index, 'name', name)}
                      placeholder="Select product or drink..."
                      searchPlaceholder="Search products & drinks..."
                      emptyLabel="No menu items found"
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">Qty</Label>
                    <Input type="number" min="1" value={item.qty} onChange={(e) => updateItem(index, 'qty', e.target.value)} />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">Price (PKR)</Label>
                    <Input type="number" min="0" step="0.01" value={item.price} onChange={(e) => updateItem(index, 'price', e.target.value)} />
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItemRow(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {(() => {
                  const itemAddons = availableAddonsForItem(item)
                  if (!itemAddons.length) {
                    return (
                      <p className="text-xs text-muted-foreground">
                        No catalog add-ons available for this item.
                      </p>
                    )
                  }
                  return (
                    <div className="space-y-2">
                      <Label className="text-xs">Add-ons</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {itemAddons.map((addon) => (
                          <label key={addon.id} className="flex items-center gap-2 text-sm cursor-pointer">
                            <Checkbox
                              checked={item.addons.includes(addon.id)}
                              onCheckedChange={() => toggleAddon(index, addon.id)}
                            />
                            <span>{addon.name}</span>
                            <span className="text-muted-foreground">+{formatCurrency(addon.price)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                })()}
                <div className="grid gap-1">
                  <Label className="text-xs">Item note</Label>
                  <Input
                    placeholder="Special instructions for this item"
                    value={item.itemNote}
                    onChange={(e) => updateItem(index, 'itemNote', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </FormSection>

        <FormSection title="Notes & totals">
          <div className="grid gap-2">
            <Label>Notes</Label>
            <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" />
          </div>
          <div className="grid gap-2">
            <Label>Coupon code</Label>
            <div className="flex gap-2">
              <Input
                value={form.couponCode}
                onChange={(e) => {
                  setForm({ ...form, couponCode: e.target.value.toUpperCase() })
                  setCouponMsg('')
                  setCouponDiscount(0)
                }}
                placeholder="e.g. WELCOME10"
              />
              <Button type="button" variant="outline" onClick={applyCoupon}>
                Apply
              </Button>
            </div>
            {couponMsg && (
              <p className="text-xs text-muted-foreground">
                {couponMsg}
                {couponDiscount > 0 ? ` (−${formatCurrency(couponDiscount)})` : ''}
              </p>
            )}
          </div>
          <div className="rounded-md border px-3 py-2 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items subtotal</span>
              <span className="tabular-nums">{formatCurrency(itemsSubtotal)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Coupon</span>
                <span className="tabular-nums">−{formatCurrency(couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium">
              <span>Est. total</span>
              <span className="tabular-nums">
                {formatCurrency(Math.max(0, itemsSubtotal - couponDiscount))}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Final total (offers + tax) is calculated by the server on create.
            </p>
          </div>
        </FormSection>
      </FormDialog>

      <FormDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Reject order"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmReject}>Confirm Reject</Button>
          </>
        }
      >
        <div className="grid gap-2">
          <Label htmlFor="reject-reason">Why is this order being rejected?</Label>
          <Textarea
            id="reject-reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Item out of stock, invalid address, customer request..."
            rows={4}
          />
        </div>
      </FormDialog>

      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto p-0">
          <SheetHeader className="border-b px-4 py-4 pr-12">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <SheetTitle className="text-lg">Order details</SheetTitle>
                <p className="mt-1 text-xs text-muted-foreground">Track ID</p>
                <button
                  type="button"
                  className="mt-0.5 font-mono text-sm font-semibold text-primary hover:underline"
                  title="Click to copy"
                  onClick={() => {
                    if (!selected?.id) return
                    navigator.clipboard?.writeText(String(selected.id)).then(
                      () => toast.success(`Copied: ${formatOrderId(selected.id)}`),
                      () => {},
                    )
                  }}
                >
                  {selected ? formatOrderId(selected.id) : ''}
                </button>
              </div>
              <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                {selected && <StatusBadge status={selected.status} />}
                {selected && <StatusBadge status={selected.source || 'admin'} />}
                {selected?.branchId ? <BranchBadge branchId={selected.branchId} /> : null}
              </div>
            </div>
          </SheetHeader>
          {selected && parsedNotes && (
            <div className="space-y-3 p-4">
              <DetailSection title="Order info">
                <div className="grid grid-cols-2 gap-3">
                  <DetailRow label="Created" value={formatDateTime(selected.createdAt)} />
                  <DetailRow label="Updated" value={formatDateTime(selected.updatedAt)} />
                </div>
              </DetailSection>

              <DetailSection title="Customer">
                <div className="grid grid-cols-2 gap-3">
                  <DetailRow label="Name" value={selected.customerName} />
                  <DetailRow label="Phone" value={selected.customerPhone} />
                  <DetailRow label="Email" value={selected.customerEmail} />
                  <DetailRow label="Alt. phone" value={parsedNotes.alternatePhone} />
                </div>
              </DetailSection>

              {(parsedNotes.deliveryType || parsedNotes.address || parsedNotes.branch || parsedNotes.payment) && (
                <DetailSection title="Delivery & payment">
                  <div className="grid grid-cols-2 gap-3">
                    <DetailRow label="Type" value={parsedNotes.deliveryType} capitalize />
                    <DetailRow label="Payment" value={parsedNotes.payment} capitalize />
                    <DetailRow label="Address" value={parsedNotes.address} />
                    <DetailRow label="Branch" value={parsedNotes.branch} />
                    <DetailRow label="Landmark" value={parsedNotes.landmark} />
                  </div>
                  {parsedNotes.instructions && (
                    <DetailRow label="Instructions" value={parsedNotes.instructions} />
                  )}
                </DetailSection>
              )}

              <DetailSection title="Items">
                <div className="space-y-2">
                  {selected.items.map((item, i) => {
                    const extras = getItemExtras(parsedNotes, item.name)
                    return (
                      <div
                        key={item.id || i}
                        className="rounded-lg border border-border/60 bg-background/50 px-3 py-2.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium leading-snug">
                              <span className="text-muted-foreground">{item.qty}×</span> {item.name}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {formatCurrency(item.price)} each
                            </p>
                            {extras.addons && (
                              <p className="mt-1 text-xs text-muted-foreground">+ {extras.addons}</p>
                            )}
                            {extras.note && (
                              <p className="mt-0.5 text-xs italic text-muted-foreground">{extras.note}</p>
                            )}
                          </div>
                          <span className="shrink-0 text-sm font-semibold tabular-nums">
                            {formatCurrency(item.qty * item.price)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-sm font-medium text-muted-foreground">Total</span>
                  <span className="text-base font-bold tabular-nums">{formatCurrency(selected.total)}</span>
                </div>
                {(selected.subtotal != null || selected.couponCode || Number(selected.taxAmount) > 0) && (
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {selected.subtotal != null && (
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatCurrency(selected.subtotal)}</span>
                      </div>
                    )}
                    {Number(selected.offerDiscount) > 0 && (
                      <div className="flex justify-between">
                        <span>Offer</span>
                        <span>−{formatCurrency(selected.offerDiscount)}</span>
                      </div>
                    )}
                    {Number(selected.couponDiscount) > 0 && (
                      <div className="flex justify-between">
                        <span>Coupon {selected.couponCode ? `(${selected.couponCode})` : ''}</span>
                        <span>−{formatCurrency(selected.couponDiscount)}</span>
                      </div>
                    )}
                    {Number(selected.taxAmount) > 0 && (
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>{formatCurrency(selected.taxAmount)}</span>
                      </div>
                    )}
                  </div>
                )}
              </DetailSection>

              {parsedNotes.other && (
                <DetailSection title="Other notes">
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">{parsedNotes.other}</p>
                </DetailSection>
              )}

              {!parsedNotes.deliveryType && !parsedNotes.other && selected.notes && (
                <DetailSection title="Notes">
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">{selected.notes}</p>
                </DetailSection>
              )}

              {selected.rejectionReason && (
                <DetailSection title="Rejection reason">
                  <p className="text-sm whitespace-pre-wrap text-destructive">{selected.rejectionReason}</p>
                </DetailSection>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
