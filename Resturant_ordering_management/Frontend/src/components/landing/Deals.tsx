import { useEffect } from "react";
import { ProductSection } from "./ProductSection";
import { useMenuStore } from "@/store/MenuStore";
import { useMenuLoading, useProductsByCategorySlug } from "@/hooks/useMenuProducts";

export function Deals() {
  const loadMenu = useMenuStore((s) => s.loadMenu);
  const { isLoading, loaded } = useMenuLoading();
  const products = useProductsByCategorySlug("deals");

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  if (loaded && !isLoading && products.length === 0) return null;

  return (
    <ProductSection
      title="Deals"
      eyebrow="Value Combos"
      subtitle="Special deals and value meals for every craving."
      products={products}
      loading={isLoading}
    />
  );
}
