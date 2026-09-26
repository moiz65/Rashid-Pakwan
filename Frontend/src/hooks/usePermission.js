import { useAppSelector } from '@/store/hooks'
import { selectAuth } from '@/store/selectors'
import { hasPermission, canManage } from '@/lib/permissions'

export function usePermission() {
  const { user } = useAppSelector(selectAuth)
  const permissions = user?.permissions || []

  return {
    permissions,
    can: (key) => hasPermission(permissions, key),
    canManage: (module) => canManage(permissions, module),
  }
}
