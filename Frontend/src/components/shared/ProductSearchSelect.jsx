import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/formatters'
import { resolveMediaUrl } from '@/lib/api'

function ProductThumb({ image }) {
  const src = resolveMediaUrl(image)
  if (!src) {
    return <div className="h-6 w-6 shrink-0 rounded bg-muted border" aria-hidden />
  }
  return (
    <img
      src={src}
      alt=""
      className="h-6 w-6 shrink-0 rounded object-cover border"
    />
  )
}

export function ProductSearchSelect({
  products = [],
  value = '',
  productId = '',
  onSelect,
  onNameChange,
  placeholder = 'Select a product...',
  searchPlaceholder = 'Search products...',
  emptyLabel = 'No products found',
  showBranch = false,
  branchNames = {},
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const searchRef = useRef(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = products.filter((p) => p.status === 'active' || !p.status)
    if (!q) return list
    return list.filter((p) => {
      const name = (p.name || '').toLowerCase()
      const kind = (p.kind || p.itemType || '').toLowerCase()
      const branch = showBranch && p.branchId ? (branchNames[p.branchId] || p.branchId).toLowerCase() : ''
      return name.includes(q) || kind.includes(q) || branch.includes(q)
    })
  }, [products, query, showBranch, branchNames])

  useEffect(() => {
    if (open) {
      setQuery('')
      const t = setTimeout(() => searchRef.current?.focus(), 0)
      return () => clearTimeout(t)
    }
  }, [open])

  const handlePick = (product) => {
    onSelect?.(product)
    setOpen(false)
  }

  const selectedLabel = value || placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'h-9 w-full justify-between font-normal',
            !value && 'text-muted-foreground',
          )}
        >
          <span className="truncate text-left">{selectedLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] min-w-[280px] p-0"
        align="start"
      >
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="max-h-60 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="space-y-2 px-3 py-4">
              <p className="text-sm text-muted-foreground">{emptyLabel}</p>
              {query.trim() && onNameChange && (
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => {
                    onNameChange(query.trim())
                    setOpen(false)
                  }}
                >
                  Use “{query.trim()}” as custom item
                </button>
              )}
            </div>
          ) : (
            filtered.map((product) => {
              const kind = product.kind || product.itemType
              const kindLabel =
                kind === 'drink' ? 'Drink' : kind === 'addon' ? 'Add-on' : null
              const branchLabel =
                showBranch && product.branchId ? branchNames[product.branchId] || product.branchId : null
              return (
                <button
                  key={product.id}
                  type="button"
                  className={cn(
                    'flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm hover:bg-accent',
                    productId === product.id && 'bg-accent',
                  )}
                  onClick={() => handlePick(product)}
                >
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <Check
                      className={cn(
                        'h-3.5 w-3.5 shrink-0',
                        productId === product.id ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <ProductThumb image={product.image} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{product.name}</span>
                      {kindLabel ? (
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          {kindLabel}
                        </span>
                      ) : null}
                      {branchLabel ? (
                        <span className="text-[10px] text-muted-foreground truncate block">
                          {branchLabel}
                        </span>
                      ) : null}
                    </span>
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {formatCurrency(
                      product.discountedPrice != null ? product.discountedPrice : product.price,
                    )}
                  </span>
                </button>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
