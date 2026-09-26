import { useMemo } from 'react'
import { useAppSelector } from '@/store/hooks'
import { selectAddons, selectDrinks, selectProducts } from '@/store/selectors'
import { filterByBranch } from '@/lib/branches'

const BRANCH_CATALOG_OPTS = { includeAllScoped: true }

/** Products, drinks, and add-ons available for a deal/offer branch scope (not the header switcher). */
export function useCatalogForBranchScope(branchScope) {
  const products = useAppSelector(selectProducts)
  const drinks = useAppSelector(selectDrinks)
  const addons = useAppSelector(selectAddons)

  return useMemo(
    () => ({
      products: filterByBranch(products, branchScope, BRANCH_CATALOG_OPTS),
      drinks: filterByBranch(drinks, branchScope, BRANCH_CATALOG_OPTS),
      addons: filterByBranch(addons, branchScope, BRANCH_CATALOG_OPTS),
    }),
    [products, drinks, addons, branchScope],
  )

}
