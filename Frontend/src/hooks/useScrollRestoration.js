import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const STORAGE_PREFIX = 'admin-scroll:'

/** Keeps main content scroll position per route across page refresh. */
export function useScrollRestoration() {
  const ref = useRef(null)
  const { pathname } = useLocation()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const key = `${STORAGE_PREFIX}${pathname}`
    const saved = sessionStorage.getItem(key)
    if (saved != null) {
      const top = Number(saved)
      requestAnimationFrame(() => {
        el.scrollTop = Number.isFinite(top) ? top : 0
      })
    }

    const onScroll = () => {
      sessionStorage.setItem(key, String(el.scrollTop))
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [pathname])

  return ref
}
