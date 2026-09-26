import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import { ROUTE_PERMISSIONS, hasPermission } from '@/lib/permissions'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, token, user } = useAppSelector((s) => s.auth)
  const location = useLocation()

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const required = ROUTE_PERMISSIONS[location.pathname]
  const permissions = user?.permissions || []
  if (required && !hasPermission(permissions, required)) {
    const fallback = Object.entries(ROUTE_PERMISSIONS).find(([, perm]) =>
      hasPermission(permissions, perm),
    )?.[0]
    return <Navigate to={fallback || '/login'} replace />
  }

  return children
}

export function GuestRoute({ children }) {
  const { isAuthenticated, token } = useAppSelector((s) => s.auth)

  if (isAuthenticated && token) {
    return <Navigate to="/" replace />
  }

  return children
}
