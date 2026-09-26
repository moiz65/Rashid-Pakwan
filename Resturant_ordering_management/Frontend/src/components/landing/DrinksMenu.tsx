import { useEffect, useMemo } from "react";
import { ProductSection } from "./ProductSection";
import { useMenuStore } from "@/store/MenuStore";
import { useMenuLoading } from "@/hooks/useMenuProducts";
import { resolveMediaUrl, toDisplayProduct, type DisplayProduct } from "@/lib/api";

export function DrinksMenu() {
  const loadMenu = useMenuStore((s) => s.loadMenu);
  const drinks = useMenuStore((s) => s.drinks);
  const { isLoading, loaded } = useMenuLoading();

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const products: DisplayProduct[] = useMemo(
    () =>
      [...drinks]
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((drink) =>
          toDisplayProduct({
            id: drink.id,
            name: drink.name,
            description: drink.description || "",
            price: drink.price,
            image: drink.image,
            sortOrder: drink.sortOrder,
            addons: [],
          })
        )
        .map((p) => ({
          ...p,
          src: p.src || resolveMediaUrl(drinks.find((d) => d.id === p.id)?.image),
        })),
    [drinks]
  );

  if (loaded && !isLoading && products.length === 0) return null;

  return (
    <div id="drinks" className="scroll-mt-28 md:scroll-mt-[7.25rem]">
      <ProductSection
        title="Drinks"
        eyebrow="Beverages"
        subtitle="Order on their own — or pick one when included with a combo deal."
        products={products}
        loading={isLoading}
      />
    </div>
  );
}
