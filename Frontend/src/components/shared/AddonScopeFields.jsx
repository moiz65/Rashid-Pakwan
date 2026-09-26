import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/formatters'

/**
 * Admin control: show no / all / selected add-ons on product or deal.
 */
export function AddonScopeFields({
  addons = [],
  addonMode = 'all',
  addonIds = [],
  onChange,
  description = 'Control which add-ons customers see when customizing this item.',
}) {
  const active = addons.filter((a) => a.status === 'active' || !a.status)

  const toggleId = (id, checked) => {
    const next = checked
      ? [...new Set([...(addonIds || []), id])]
      : (addonIds || []).filter((x) => x !== id)
    onChange?.({ addonMode: 'selected', addonIds: next })
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        <Label>Add-ons display</Label>
        <Select
          value={addonMode || 'all'}
          onValueChange={(v) =>
            onChange?.({
              addonMode: v,
              addonIds: v === 'selected' ? addonIds || [] : [],
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No add-ons</SelectItem>
            <SelectItem value="all">All active add-ons</SelectItem>
            <SelectItem value="selected">Selected add-ons only</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      {addonMode === 'selected' ? (
        <div className="max-h-40 overflow-y-auto rounded-lg border p-3 space-y-2">
          {active.length === 0 ? (
            <p className="text-sm text-muted-foreground">No add-ons in catalog yet.</p>
          ) : (
            active.map((addon) => (
              <label key={addon.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={(addonIds || []).includes(addon.id)}
                  onCheckedChange={(checked) => toggleId(addon.id, Boolean(checked))}
                />
                <span className="flex-1 truncate">{addon.name}</span>
                <span className="text-muted-foreground tabular-nums shrink-0">
                  {formatCurrency(addon.price)}
                </span>
              </label>
            ))
          )}
        </div>
      ) : null}

      {addonMode === 'all' ? (
        <p className="text-xs text-muted-foreground rounded-md border px-3 py-2">
          Customers will see every active add-on ({active.length}).
        </p>
      ) : null}

      {addonMode === 'none' ? (
        <p className="text-xs text-muted-foreground rounded-md border px-3 py-2">
          No add-on section will appear for customers.
        </p>
      ) : null}
    </div>
  )
}
