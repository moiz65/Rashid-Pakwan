import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Check, Plus, ShoppingBag } from "lucide-react";
import { SectionHeader } from "./HotDeals";
import { useMenuStore } from "@/store/MenuStore";
import { useMenuLoading } from "@/hooks/useMenuProducts";
import { useCartStore } from "@/store/CartStore";
import { resolveMediaUrl, type MenuAddon } from "@/lib/api";
import { formatPrice } from "@/lib/formatters";

export function AddonsMenu() {
  const loadMenu = useMenuStore((s) => s.loadMenu);
  const addons = useMenuStore((s) => s.addons);
  const { isLoading, loaded } = useMenuLoading();
  const addItem = useCartStore((s) => s.addItem);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const handleAdd = (addon: MenuAddon) => {
    const src = resolveMediaUrl(addon.image);
    addItem({
      productId: `addon:${addon.id}`,
      name: addon.name,
      desc: "Extra / addon",
      price: Number(addon.price || 0),
      currency: "Rs ",
      src,
      quantity: 1,
    });
    setAddedId(addon.id);
    window.setTimeout(() => setAddedId((cur) => (cur === addon.id ? null : cur)), 1400);
  };

  if (loaded && !isLoading && addons.length === 0) return null;

  return (
    <section id="addons" className="py-10 lg:py-14 scroll-mt-28 md:scroll-mt-[7.25rem]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Extras"
          title="Add-ons"
          subtitle="Order extras alone, or pick them when customizing a meal."
        />

        {isLoading ? (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-56 rounded-2xl bg-muted/40 animate-pulse border" />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {addons.map((addon, i) => {
              const src = resolveMediaUrl(addon.image);
              return (
                <motion.div
                  key={addon.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  className="rounded-2xl border bg-card overflow-hidden flex flex-col"
                >
                  <div className="relative aspect-[4/3] bg-muted">
                    {src ? (
                      <img
                        src={src}
                        alt={addon.name}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center text-muted-foreground">
                        <Plus className="h-8 w-8 opacity-40" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{addon.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {addon.originalPrice != null &&
                          Number(addon.originalPrice) > Number(addon.price) ? (
                            <>
                              <span className="line-through mr-1.5">
                                {formatPrice(addon.originalPrice)}
                              </span>
                              <span className="text-foreground font-medium">
                                {formatPrice(addon.price)}
                              </span>
                            </>
                          ) : (
                            formatPrice(addon.price)
                          )}
                        </p>
                      </div>
                      <div className="grid place-items-center h-9 w-9 rounded-xl bg-primary/10 text-primary shrink-0">
                        <Plus className="h-4 w-4" />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAdd(addon)}
                      className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-3 py-2 text-sm font-semibold hover:opacity-90 transition"
                    >
                      {addedId === addon.id ? (
                        <>
                          <Check className="h-4 w-4" /> Added
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-4 w-4" /> Add to cart
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
