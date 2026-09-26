import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  ShoppingBag,
  BarChart3,
  Megaphone,
  Settings,
  ChevronRight,
  UtensilsCrossed,
  Layers,
} from 'lucide-react'
import { useAppSelector } from '@/store/hooks'
import { selectCurrentBranch, selectIsAllBranches, selectPendingOrders, selectAuth } from '@/store/selectors'
import { NAV_CHILD_PERMISSIONS, NAV_PERMISSIONS, hasPermission } from '@/lib/permissions'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

const navItems = [
  { title: 'Dashboard', icon: LayoutDashboard, href: '/' },
  {
    title: 'Orders',
    icon: ShoppingCart,
    children: [
      { title: 'Incoming Orders', href: '/orders/upcoming' },
      { title: 'Sales & Delivered', href: '/orders/sales' },
      { title: 'Rejected Orders', href: '/orders/rejected' },
    ],
  },
  { title: 'Customers', icon: Users, href: '/customers' },
  {
    title: 'Products',
    icon: Package,
    children: [
      { title: 'All Products', href: '/products' },
      { title: 'Categories', href: '/products/categories' },
      { title: 'Drinks', href: '/products/drinks' },
      { title: 'Addons', href: '/products/addons' },
      { title: 'Brands/Collections', href: '/products/brands' },
      { title: 'Order Reviews', href: '/products/reviews' },
    ],
  },
  { title: 'Abandoned Carts', icon: ShoppingBag, href: '/abandoned-carts' },
  {
    title: 'Reports',
    icon: BarChart3,
    children: [
      { title: 'Branch reports', href: '/reports' },
      { title: 'Combined report', href: '/reports/combined' },
    ],
  },
  {
    title: 'Marketing & Promotions',
    icon: Megaphone,
    children: [
      { title: 'Deals', href: '/marketing/deals' },
      { title: 'Coupons', href: '/marketing/coupons' },
      { title: 'Discounts', href: '/marketing/discounts' },
      { title: 'Offers', href: '/marketing/offers' },
    ],
  },
  {
    title: 'Settings',
    icon: Settings,
    children: [
      { title: 'Payment Gateways', href: '/settings/payment' },
      { title: 'Delivery Charges', href: '/settings/shipping' },
      { title: 'Tax Codes', href: '/settings/tax-codes' },
      { title: 'Order Tracking', href: '/settings/tracking' },
      { title: 'Review Invites', href: '/settings/reviews' },
      { title: 'Users & Roles', href: '/settings/users' },
      { title: 'Roles', href: '/settings/roles' },
      { title: 'Branches', href: '/settings/branches' },
    ],
  },
]

function PendingBadge({ count }) {
  if (!count) return null
  return (
    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-amber-500 px-1 text-[10px] font-bold text-amber-950">
      {count}
    </span>
  )
}

function NavItem({ item, pendingCount = 0 }) {
  const location = useLocation()
  const isOrders = item.title === 'Orders'
  const isActive = item.href
    ? location.pathname === item.href
    : item.children?.some((c) => location.pathname === c.href)

  if (item.children) {
    return (
      <Collapsible defaultOpen={isActive || (isOrders && pendingCount > 0)} className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={item.title}>
              <item.icon />
              <span>{item.title}</span>
              <span className="ml-auto flex items-center gap-1">
                {isOrders ? <PendingBadge count={pendingCount} /> : null}
                <ChevronRight className="transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </span>
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.children.map((child) => (
                <SidebarMenuSubItem key={child.href}>
                  <SidebarMenuSubButton asChild isActive={location.pathname === child.href}>
                    <Link to={child.href} className="flex w-full items-center justify-between gap-2">
                      <span>{child.title}</span>
                      {child.href === '/orders/upcoming' ? (
                        <PendingBadge count={pendingCount} />
                      ) : null}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    )
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
        <Link to={item.href}>
          <item.icon />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function AppSidebar() {
  const pendingCount = useAppSelector(selectPendingOrders).length
  const allMode = useAppSelector(selectIsAllBranches)
  const currentBranch = useAppSelector(selectCurrentBranch)
  const { user } = useAppSelector(selectAuth)
  const permissions = user?.permissions || []

  const visibleNav = navItems
    .map((item) => {
      const parentPerm = NAV_PERMISSIONS[item.title]
      if (item.children) {
        const children = item.children.filter((child) => {
          const perm = NAV_CHILD_PERMISSIONS[child.title]
          return !perm || hasPermission(permissions, perm)
        })
        if (!children.length) return null
        if (parentPerm && !hasPermission(permissions, parentPerm)) {
          const anyChild = children.length > 0
          if (!anyChild) return null
        }
        return { ...item, children }
      }
      if (parentPerm && !hasPermission(permissions, parentPerm)) return null
      return item
    })
    .filter(Boolean)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <UtensilsCrossed className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Rashid Pakwan Admin</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {allMode ? 'All locations' : currentBranch?.name || 'Restaurant Portal'}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNav.map((item) => (
                <NavItem key={item.title} item={item} pendingCount={pendingCount} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground px-2">
          <Layers className="h-3 w-3" />
          {allMode ? 'Combined network view' : currentBranch?.name || 'Branch view'}
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
