import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setOrders } from '@/store/slices/ordersSlice'
import { setCustomers } from '@/store/slices/customersSlice'
import { logout } from '@/store/slices/authSlice'
import { selectAuth, selectSelectedBranchId } from '@/store/selectors'
import { fetchCustomers, fetchOrders, isUnauthorizedError } from '@/lib/api'
import { apiBranchParams } from '@/lib/branches'
import { formatOrderId } from '@/lib/formatters'

const POLL_INTERVAL_MS = 15_000
const NEW_ORDER_TOAST_ID = 'new-pending-orders'

function playNewOrderChime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const now = ctx.currentTime
    ;[880, 1175].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02 + i * 0.08)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25 + i * 0.08)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + i * 0.08)
      osc.stop(now + 0.3 + i * 0.08)
    })
    window.setTimeout(() => ctx.close().catch(() => {}), 600)
  } catch {
    // ignore audio failures (autoplay policy, etc.)
  }
}

export function OrdersCustomersSync() {
  const dispatch = useAppDispatch()
  const { token, isAuthenticated } = useAppSelector(selectAuth)
  const selectedBranchId = useAppSelector(selectSelectedBranchId)
  const knownIdsRef = useRef(null)

  useEffect(() => {
    knownIdsRef.current = null
  }, [selectedBranchId])

  useEffect(() => {
    if (!isAuthenticated || !token) return

    let active = true
    const branchParams = apiBranchParams(selectedBranchId)

    async function load(showError = false) {
      try {
        const safe = (p) =>
          p.catch((err) => {
            if (isUnauthorizedError(err)) throw err
            return []
          })

        const [orders, customers] = await Promise.all([
          safe(fetchOrders(token, branchParams)),
          safe(fetchCustomers(token, branchParams)),
        ])
        if (!active) return

        const pending = orders.filter((o) => o.status === 'pending')
        const isFirstLoad = knownIdsRef.current === null
        const fresh = isFirstLoad
          ? pending
          : pending.filter((o) => !knownIdsRef.current.has(o.id))

        if (fresh.length > 0) {
          const first = fresh[0]
          const title =
            fresh.length === 1
              ? `New order ${formatOrderId(first.id)}`
              : `${fresh.length} new orders waiting`
          toast.warning(title, {
            id: NEW_ORDER_TOAST_ID,
            description:
              'Not received yet — open Incoming Orders and set status to Received.',
            duration: Infinity,
            action: {
              label: 'View',
              onClick: () => {
                window.location.assign('/orders/upcoming')
              },
            },
          })
          if (!isFirstLoad) playNewOrderChime()
        }

        knownIdsRef.current = new Set(orders.map((o) => o.id))

        if (pending.length === 0) {
          toast.dismiss(NEW_ORDER_TOAST_ID)
        }

        dispatch(setOrders(orders))
        dispatch(setCustomers(customers))
      } catch (err) {
        if (!active) return
        if (isUnauthorizedError(err)) {
          dispatch(logout())
          toast.error('Session expired. Please sign in again.')
          return
        }
        if (showError) toast.error('Failed to load orders and customers')
      }
    }

    load(true)
    const intervalId = window.setInterval(() => load(false), POLL_INTERVAL_MS)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [dispatch, isAuthenticated, token, selectedBranchId])

  return null
}
