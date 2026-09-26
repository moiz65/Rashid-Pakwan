import { useEffect, useMemo, useState } from "react";
import { Search, Utensils, Sparkles, Flame, Coffee, Cake, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProductSection } from "./ProductSection";
import { useMenuStore } from "@/store/MenuStore";
import { useMenuLoading } from "@/hooks/useMenuProducts";
import { toDisplayProduct, type DisplayProduct, type MenuCategory } from "@/lib/api";

function getCategoryIcon(slug?: string) {
  switch (slug) {
    case "burgers":
    case "pizza":
    case "pasta":
      return Utensils;
    case "beverages":
    case "drinks":
      return Coffee;
    case "desserts":
      return Cake;
    case "deals":
    case "featured":
      return Flame;
    default:
      return Sparkles;
  }
}

export function FeaturedProducts() {
  const loadMenu = useMenuStore((s) => s.loadMenu);
  const categories = useMenuStore((s) => s.categories);
  const rawProducts = useMenuStore((s) => s.products);
  const searchQuery = useMenuStore((s) => s.searchQuery);
  const setSearchQuery = useMenuStore((s) => s.setSearchQuery);
  const onlySale = useMenuStore((s) => s.onlySale);
  const setOnlySale = useMenuStore((s) => s.setOnlySale);
  const { isLoading } = useMenuLoading();

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    loadMenu();

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMenu]);

  const displayProducts = useMemo(() => {
    return rawProducts.map(toDisplayProduct);
  }, [rawProducts]);

  const filteredProducts = useMemo(() => {
    let list = displayProducts;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
      );
    }

    if (onlySale) {
      list = list.filter(
        (p) =>
          (p.discountedPrice != null && p.discountedPrice > 0 && p.discountedPrice < p.price) ||
          Boolean(p.tag)
      );
    }

    return list;
  }, [displayProducts, searchQuery, onlySale]);

  const categorySubsections = useMemo(() => {
    // Always show every category section. Category chips only scroll/highlight —
    // they must not hide previously visible menu items.
    const targetCategories = [...categories];
    const map = new Map<string, { category: MenuCategory; products: DisplayProduct[] }>();

    targetCategories.forEach((cat) => {
      map.set(cat.id, { category: cat, products: [] });
    });

    const uncategorizedProducts: DisplayProduct[] = [];

    filteredProducts.forEach((p) => {
      const raw = rawProducts.find((r) => r.id === p.id);
      let assigned = false;
      if (raw?.categoryId && map.has(raw.categoryId)) {
        map.get(raw.categoryId)!.products.push(p);
        assigned = true;
      } else if (raw?.categorySlug) {
        const match = targetCategories.find((c) => c.slug === raw.categorySlug);
        if (match && map.has(match.id)) {
          map.get(match.id)!.products.push(p);
          assigned = true;
        }
      }
      if (!assigned) {
        uncategorizedProducts.push(p);
      }
    });

    const result: Array<{ category: MenuCategory; products: DisplayProduct[] }> = [];

    targetCategories.forEach((cat) => {
      const entry = map.get(cat.id);
      if (entry && entry.products.length > 0) {
        result.push(entry);
      }
    });

    if (uncategorizedProducts.length > 0) {
      result.push({
        category: {
          id: "uncategorized",
          name: "Other Delights",
          slug: "other",
          sortOrder: 999,
        },
        products: uncategorizedProducts,
      });
    }

    return result;
  }, [categories, rawProducts, filteredProducts]);

  const scrollToSearch = () => {
    const el = document.getElementById("search-bar");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      const input = el.querySelector("input");
      if (input) input.focus();
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section id="menu-products" className="py-8 lg:py-14 scroll-mt-28">
      {/* Legacy hash target used by older Menu / Browse Menu links */}
      <div id="menu" className="relative -top-28 h-0 w-0 overflow-hidden" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-36 rounded-3xl bg-muted/30 animate-pulse border border-border" />
            ))}
          </div>
        ) : categorySubsections.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border border-dashed border-border bg-surface/20">
            <Utensils className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="text-lg font-bold">No items found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search query or filter settings.
            </p>
            {(searchQuery || onlySale) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setOnlySale(false);
                }}
                className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-medium cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {categorySubsections.map(({ category, products }) => {
              const Icon = getCategoryIcon(category.slug);

              return (
                <div key={category.id} id={`category-${category.slug || category.id}`} className="scroll-mt-36">
                  <div className="relative rounded-3xl bg-gradient-to-r from-primary via-primary/95 to-red-950 p-6 sm:p-8 text-primary-foreground overflow-hidden shadow-xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative z-10">
                      <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/15 text-white border border-white/20 mb-2 inline-block">
                        CATEGORY SELECTION
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase font-display text-white">
                        {category.name} RANGE
                      </h2>
                      <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl">
                        Handcrafted with signature ingredients — order online for quick Karachi delivery.
                      </p>
                    </div>

                    <div className="relative z-10 shrink-0 flex items-center gap-2">
                      <span className="text-xs font-bold bg-white text-primary px-3 py-1.5 rounded-full shadow-md">
                        {products.length} {products.length === 1 ? "Item" : "Items"}
                      </span>
                    </div>

                    <Icon className="absolute -right-4 -bottom-6 h-36 w-36 text-white/10 pointer-events-none" />
                  </div>

                  <ProductSection
                    showHeader={false}
                    products={products}
                    loading={false}
                    emptyMessage="No items in this section."
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="fixed bottom-6 left-6 z-40">
        <button
          type="button"
          onClick={scrollToSearch}
          aria-label="Quick Search"
          className="grid place-items-center h-12 w-12 rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:scale-110 active:scale-95 transition-transform cursor-pointer border-2 border-white/20"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>

      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Scroll to Top"
              className="grid place-items-center h-12 w-12 rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:scale-110 active:scale-95 transition-transform cursor-pointer border-2 border-white/20"
            >
              <ChevronUp className="h-5 w-5 stroke-[3]" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
