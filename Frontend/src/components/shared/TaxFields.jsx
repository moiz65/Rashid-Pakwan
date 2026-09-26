import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/formatters'

const NONE = '__none__'

/** Same rounding as Backend `pricing.service.js` */
function roundMoney(n) {
  return Math.round((Number(n) || 0) * 100) / 100
}

/**
 * Inclusive GST component (FBR-style): price × rate / (100 + rate)
 * Exclusive GST: price × rate / 100
 */
function computeTax(listedPrice, rate, mode) {
  const amount = roundMoney(listedPrice)
  const r = Number(rate) || 0
  if (!amount || !r) {
    return { net: amount, tax: 0, gross: amount }
  }
  if (mode === 'exclusive') {
    const tax = roundMoney(amount * (r / 100))
    return { net: amount, tax, gross: roundMoney(amount + tax) }
  }
  const tax = roundMoney(amount * (r / (100 + r)))
  return { net: roundMoney(amount - tax), tax, gross: amount }
}

/**
 * Tax code + include/exclude mode, with a live “what customers see” total.
 * Pass `listedPrice` = the amount shown on the ordering website (sale / deal price).
 */
export function TaxFields({
  taxCodes = [],
  taxCodeId,
  taxMode = 'inclusive',
  onChange,
  listedPrice,
  listPrice,
  label = 'Customer total on website',
}) {
  const active = taxCodes.filter((t) => t.active !== false)
  const selected = active.find((t) => t.id === taxCodeId)
  const rate = selected ? Number(selected.rate) || 0 : 0
  const mode = taxMode === 'exclusive' ? 'exclusive' : 'inclusive'
  const hasPrice = listedPrice !== undefined && listedPrice !== null && listedPrice !== ''
  const base = hasPrice ? roundMoney(listedPrice) : 0
  const { net, tax, gross } = computeTax(base, rate, mode)
  const list = listPrice != null && listPrice !== '' ? roundMoney(listPrice) : null
  const showCompare = list != null && list > 0 && Math.abs(list - base) > 0.001

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Tax code</Label>
          <Select
            value={taxCodeId || NONE}
            onValueChange={(v) => onChange({ taxCodeId: v === NONE ? '' : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>None</SelectItem>
              {active.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name} ({Number(t.rate)}%)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Tax in price</Label>
          <Select
            value={mode}
            onValueChange={(v) => onChange({ taxMode: v })}
            disabled={!taxCodeId}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inclusive">Included in price</SelectItem>
              <SelectItem value="exclusive">Charged separately</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasPrice ? (
        <div className="rounded-lg border border-primary/25 bg-primary/5 px-3 py-3 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{label}</p>

          {showCompare ? (
            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>List price</span>
              <span className="tabular-nums line-through">{formatCurrency(list)}</span>
            </div>
          ) : null}

          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-muted-foreground">
              {mode === 'inclusive' ? 'Price on menu (incl. tax)' : 'Price on menu'}
            </span>
            <span className="text-base font-bold tabular-nums">{formatCurrency(base)}</span>
          </div>

          {selected && rate > 0 ? (
            mode === 'inclusive' ? (
              <div className="rounded-md bg-background/60 border px-2.5 py-2 space-y-1 text-xs">
                <div className="flex justify-between gap-2 text-muted-foreground">
                  <span>Amount before GST</span>
                  <span className="tabular-nums">{formatCurrency(net)}</span>
                </div>
                <div className="flex justify-between gap-2 text-muted-foreground">
                  <span>
                    GST {rate}% inside
                    <span className="opacity-70"> (price × {rate}/(100+{rate}))</span>
                  </span>
                  <span className="tabular-nums">{formatCurrency(tax)}</span>
                </div>
                <p className="text-[11px] text-muted-foreground pt-1 border-t">
                  Tax is already inside the menu price — checkout does not add GST again.
                </p>
              </div>
            ) : (
              <div className="rounded-md bg-background/60 border px-2.5 py-2 space-y-1 text-xs">
                <div className="flex justify-between gap-2 text-muted-foreground">
                  <span>GST {rate}% added at checkout</span>
                  <span className="tabular-nums">+ {formatCurrency(tax)}</span>
                </div>
                <p className="text-[11px] text-muted-foreground pt-1 border-t">
                  Menu shows {formatCurrency(base)}; GST is charged on top at checkout.
                </p>
              </div>
            )
          ) : (
            <p className="text-xs text-muted-foreground">No tax code — customers pay the menu price.</p>
          )}

          <div className="flex items-baseline justify-between gap-3 border-t border-primary/15 pt-2">
            <span className="text-sm font-medium">
              {mode === 'exclusive' && selected && rate > 0
                ? 'Estimated checkout total'
                : 'Customer pays'}
            </span>
            <span className="text-lg font-bold tabular-nums text-primary">
              {formatCurrency(gross)}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
