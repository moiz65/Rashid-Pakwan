import { useMemo } from "react";
import { toDisplayProduct } from "@/lib/api";
import { useMenuStore } from "@/store/MenuStore";

export function useMenuLoading() {
  const loading = useMenuStore((s) => s.loading);
  const loaded = useMenuStore((s) => s.loaded);
  return { loading, loaded, isLoading: !loaded || loading };
}

export function useFeaturedProducts() {
  const products = useMenuStore((s) => s.products);
  const activeCategorySlug = useMenuStore((s) => s.activeCategorySlug);

  return useMemo(() => {
    let list = products;
    if (activeCategorySlug) {
      list = products.filter((p) => p.categorySlug === activeCategorySlug);
    }
    return [...list].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map(toDisplayProduct);
  }, [products, activeCategorySlug]);
}

export function useProductsByCategorySlug(slug: string) {
  const products = useMenuStore((s) => s.products);

  return useMemo(
    () =>
      products
        .filter((p) => p.categorySlug === slug)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map(toDisplayProduct),
    [products, slug]
  );
}
