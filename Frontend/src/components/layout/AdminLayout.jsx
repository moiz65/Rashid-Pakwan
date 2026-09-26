import { Outlet } from 'react-router-dom'
import { Layers, MapPin } from 'lucide-react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { AppHeader } from './AppHeader'
import { OrdersCustomersSync } from '@/components/OrdersCustomersSync'
import { NewOrderAlerts } from '@/components/NewOrderAlerts'
import { CatalogSync } from '@/components/CatalogSync'
import { useAppSelector } from '@/store/hooks'
import { selectCurrentBranch, selectIsAllBranches } from '@/store/selectors'
import { useScrollRestoration } from '@/hooks/useScrollRestoration'

function BranchScopeBanner() {
  const allMode = useAppSelector(selectIsAllBranches)
  const branch = useAppSelector(selectCurrentBranch)

  return (
    <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-1.5 text-xs text-muted-foreground">
      {allMode ? <Layers className="h-3.5 w-3.5 text-primary" /> : <MapPin className="h-3.5 w-3.5 text-primary" />}
      <span>
        {allMode
          ? 'All locations — orders, customers, products, and reports are combined.'
          : `${branch?.name || 'Branch'} · ${branch?.address || ''}`}
      </span>
    </div>
  )
}

export function AdminLayout() {
  const scrollRef = useScrollRestoration()

  return (
    <SidebarProvider>
      <OrdersCustomersSync />
      <CatalogSync />
      <AppSidebar />
      <SidebarInset>
        <NewOrderAlerts />
        <AppHeader />
        <BranchScopeBanner />
        <div ref={scrollRef} className="flex-1 p-4 md:p-6 overflow-auto min-h-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
