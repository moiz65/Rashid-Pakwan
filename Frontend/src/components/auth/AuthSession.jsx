import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout, loginSuccess } from '@/store/slices/authSlice'
import { setSelectedBranchId } from '@/store/slices/branchesSlice'
import { selectAuth } from '@/store/selectors'
import { fetchProfile, isUnauthorizedError } from '@/lib/api'
import { AppLoader } from '@/components/shared/AppLoader'

/**
 * Validates persisted JWT on boot. Clears stale sessions that cause 401 spam.
 */
export function AuthSession({ children }) {
  const dispatch = useAppDispatch()
  const { token, isAuthenticated } = useAppSelector(selectAuth)
  const [ready, setReady] = useState(!isAuthenticated || !token)

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setReady(true)
      return
    }

    let active = true

    async function validate() {
      try {
        const data = await fetchProfile(token)
        if (!active) return
        if (data?.user) {
          dispatch(loginSuccess({ token, user: data.user }))
          const branchIds = data.user.branchIds || []
          if (branchIds.length === 1) {
            dispatch(setSelectedBranchId(branchIds[0]))
          }
        }
        setReady(true)
      } catch (err) {
        if (!active) return
        if (isUnauthorizedError(err)) {
          dispatch(logout())
        }
        setReady(true)
      }
    }

    validate()
    return () => {
      active = false
    }
  }, [dispatch, isAuthenticated, token])

  if (!ready) return <AppLoader />
  return children
}
