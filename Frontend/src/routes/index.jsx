import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { ProtectedRoute, GuestRoute } from '@/components/auth/ProtectedRoute'
import LoginPage from '@/features/auth/LoginPage'
import DashboardPage from '@/features/dashboard/DashboardPage'
import UpcomingOrdersPage from '@/features/orders/UpcomingOrdersPage'
import SalesOrdersPage from '@/features/orders/SalesOrdersPage'
import RejectedOrdersPage from '@/features/orders/RejectedOrdersPage'
import CustomersPage from '@/features/customers/CustomersPage'
import ProductsPage from '@/features/products/ProductsPage'
import CategoriesPage from '@/features/products/CategoriesPage'
import AddonsPage from '@/features/products/AddonsPage'
import DrinksPage from '@/features/products/DrinksPage'
import BrandsPage from '@/features/products/BrandsPage'
import ReviewsPage from '@/features/products/ReviewsPage'
import AbandonedCartsPage from '@/features/abandoned-carts/AbandonedCartsPage'
import ReportsPage from '@/features/reports/ReportsPage'
import CombinedReportsPage from '@/features/reports/CombinedReportsPage'
import CouponsPage from '@/features/marketing/CouponsPage'
import DiscountsPage from '@/features/marketing/DiscountsPage'
import OffersPage from '@/features/marketing/OffersPage'
import DealsPage from '@/features/marketing/DealsPage'
import PaymentPage from '@/features/settings/PaymentPage'
import ShippingPage from '@/features/settings/ShippingPage'
import UsersPage from '@/features/settings/UsersPage'
import TaxCodesPage from '@/features/settings/TaxCodesPage'
import OrderTrackingPage from '@/features/settings/OrderTrackingPage'
import ReviewSettingsPage from '@/features/settings/ReviewSettingsPage'
import RolesPage from '@/features/settings/RolesPage'
import BranchesPage from '@/features/settings/BranchesPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'orders/upcoming', element: <UpcomingOrdersPage /> },
      { path: 'orders/sales', element: <SalesOrdersPage /> },
      { path: 'orders/rejected', element: <RejectedOrdersPage /> },
      { path: 'customers', element: <CustomersPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/categories', element: <CategoriesPage /> },
      { path: 'products/drinks', element: <DrinksPage /> },
      { path: 'products/addons', element: <AddonsPage /> },
      { path: 'products/brands', element: <BrandsPage /> },
      { path: 'products/reviews', element: <ReviewsPage /> },
      { path: 'abandoned-carts', element: <AbandonedCartsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'reports/combined', element: <CombinedReportsPage /> },
      { path: 'marketing/deals', element: <DealsPage /> },
      { path: 'marketing/coupons', element: <CouponsPage /> },
      { path: 'marketing/discounts', element: <DiscountsPage /> },
      { path: 'marketing/offers', element: <OffersPage /> },
      { path: 'settings/payment', element: <PaymentPage /> },
      { path: 'settings/shipping', element: <ShippingPage /> },
      { path: 'settings/tax-codes', element: <TaxCodesPage /> },
      { path: 'settings/tracking', element: <OrderTrackingPage /> },
      { path: 'settings/reviews', element: <ReviewSettingsPage /> },
      { path: 'settings/users', element: <UsersPage /> },
      { path: 'settings/roles', element: <RolesPage /> },
      { path: 'settings/branches', element: <BranchesPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
