import { format, formatDistanceToNow, parseISO, isWithinInterval } from 'date-fns'

export function formatCurrency(amount) {
  const value = Number(amount ?? 0)
  return `Rs ${value.toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

export function formatCurrencyCompact(amount) {
  const value = Number(amount ?? 0)
  return `Rs ${value.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`
}

export function formatDate(date) {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy')
}

export function formatDateTime(date) {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy h:mm a')
}

export function formatRelative(date) {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function isInDateRange(date, from, to) {
  if (!date) return false
  const d = typeof date === 'string' ? parseISO(date) : date
  if (from && to) return isWithinInterval(d, { start: from, end: to })
  if (from) return d >= from
  if (to) return d <= to
  return true
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

/** Short display for trackable order IDs (e.g. K7M2XP). Legacy ord_… ids show the last segment. */
export function formatOrderId(id) {
  if (!id) return '—'
  const raw = String(id).trim().replace(/^#/, '')
  if (!raw.includes('_') && raw.length <= 12) return raw.toUpperCase()
  const parts = raw.split('_')
  const short = parts.length > 1 ? parts[parts.length - 1] : raw
  return short.slice(0, 12).toUpperCase()
}
