import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function matchesCustomer(customer, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const haystack = [customer.name, customer.email, customer.phone, customer.id]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
}

export function CustomerSearchSelect({
  customers = [],
  customerId = '',
  customerName = '',
  onSelect,
  onClear,
  placeholder = 'Search customer by name, email, or phone...',
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const searchRef = useRef(null)

  const filtered = useMemo(() => {
    return customers.filter((c) => matchesCustomer(c, query))
  }, [customers, query])

  useEffect(() => {
    if (open) {
      setQuery('')
      const t = setTimeout(() => searchRef.current?.focus(), 0)
      return () => clearTimeout(t)
    }
  }, [open])

  const selectedLabel = customerId
    ? customers.find((c) => c.id === customerId)?.name || customerName
    : customerName || placeholder

  const handlePick = (customer) => {
    onSelect?.(customer)
    setOpen(false)
  }

  const handleNewCustomer = () => {
    onClear?.()
    setOpen(false)
  }

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
            !customerId && !customerName && 'text-muted-foreground',
          )}
        >
          <span className="truncate text-left">{selectedLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] min-w-[320px] p-0"
        align="start"
      >
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, phone..."
            className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="max-h-60 overflow-y-auto py-1">
          <button
            type="button"
            className={cn(
              'flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-accent',
              !customerId && 'bg-accent',
            )}
            onClick={handleNewCustomer}
          >
            <Check className={cn('h-3.5 w-3.5 shrink-0', !customerId ? 'opacity-100' : 'opacity-0')} />
            <span>New / manual customer</span>
          </button>
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">No customers found</p>
          ) : (
            filtered.map((customer) => (
              <button
                key={customer.id}
                type="button"
                className={cn(
                  'flex w-full flex-col gap-0.5 px-3 py-2.5 text-left text-sm hover:bg-accent',
                  customerId === customer.id && 'bg-accent',
                )}
                onClick={() => handlePick(customer)}
              >
                <span className="flex items-center gap-2 font-medium">
                  <Check
                    className={cn(
                      'h-3.5 w-3.5 shrink-0',
                      customerId === customer.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <span className="truncate">{customer.name}</span>
                </span>
                <span className="pl-5 text-xs text-muted-foreground truncate">
                  {[customer.email, customer.phone].filter(Boolean).join(' · ')}
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
