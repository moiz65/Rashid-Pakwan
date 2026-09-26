import { useEffect } from 'react'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setProducts } from '@/store/slices/productsSlice'
import { setCategories } from '@/store/slices/categoriesSlice'
import { setBrands } from '@/store/slices/brandsSlice'
import { setAddons } from '@/store/slices/addonsSlice'
import { setDrinks } from '@/store/slices/drinksSlice'
import { setCarts } from '@/store/slices/cartsSlice'
import { setMarketing } from '@/store/slices/marketingSlice'
import { setSettings } from '@/store/slices/settingsSlice'
import { setBranches } from '@/store/slices/branchesSlice'
import { selectAuth } from '@/store/selectors'
import {
  fetchAdminUsers,
  fetchBranches,
  fetchCatalogAddons,
  fetchCatalogBrands,
  fetchCatalogCarts,
  fetchCatalogCategories,
  fetchCatalogCoupons,
  fetchCatalogDeals,
  fetchCatalogDiscounts,
  fetchCatalogDrinks,
  fetchCatalogOffers,
  fetchCatalogProducts,
  fetchPaymentGateways,
  fetchShippingMethods,
  fetchTaxCodes,
  isUnauthorizedError,
} from '@/lib/api'
import { logout } from '@/store/slices/authSlice'

export function CatalogSync() {
  const dispatch = useAppDispatch()
  const { token, isAuthenticated } = useAppSelector(selectAuth)
  useEffect(() => {
    if (!isAuthenticated || !token) return

    let active = true

    async function load(showError = false) {
      try {
        const safe = (p, fallback = []) =>
          p.catch((err) => {
            if (isUnauthorizedError(err)) throw err
            return fallback
          })

        let branchList = null
        try {
          branchList = await fetchBranches(token)
        } catch (err) {
          if (isUnauthorizedError(err)) throw err
        }

        const [
          products,
          categories,
          brands,
          addons,
          drinks,
          carts,
          coupons,
          discounts,
          offers,
          deals,
          taxCodes,
          paymentGateways,
          shippingMethods,
          users,
        ] = await Promise.all([
          safe(fetchCatalogProducts(token)),
          safe(fetchCatalogCategories(token)),
          safe(fetchCatalogBrands(token)),
          safe(fetchCatalogAddons(token)),
          safe(fetchCatalogDrinks(token)),
          safe(fetchCatalogCarts(token)),
          safe(fetchCatalogCoupons(token)),
          safe(fetchCatalogDiscounts(token)),
          safe(fetchCatalogOffers(token)),
          safe(fetchCatalogDeals(token)),
          safe(fetchTaxCodes(token)),
          safe(fetchPaymentGateways(token)),
          safe(fetchShippingMethods(token)),
          safe(fetchAdminUsers(token)),
        ])

        if (!active) return
        dispatch(setProducts(products))
        dispatch(setCategories(categories))
        dispatch(setBrands(brands))
        dispatch(setAddons(addons))
        dispatch(setDrinks(drinks))
        dispatch(setCarts(carts || []))
        dispatch(setMarketing({ coupons, discounts, offers, deals }))
        dispatch(
          setSettings({
            paymentGateways: paymentGateways || [],
            shippingMethods: shippingMethods || [],
            users: users || [],
            taxCodes: taxCodes || [],
          }),
        )
        if (Array.isArray(branchList)) {
          dispatch(setBranches(branchList))
        }
      } catch (err) {
        if (!active) return
        if (isUnauthorizedError(err)) {
          dispatch(logout())
          toast.error('Session expired. Please sign in again.')
          return
        }
        if (showError) toast.error('Failed to load catalog')
      }
    }

    load(true)
    const intervalId = window.setInterval(() => load(false), 60_000)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [dispatch, isAuthenticated, token])

  return null
}
