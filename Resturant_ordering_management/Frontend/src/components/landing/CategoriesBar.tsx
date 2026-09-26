import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useMenuStore } from "@/store/MenuStore";

export function Categories({ sticky = false }: { sticky?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const categories = useMenuStore((s) => s.categories);
  const products = useMenuStore((s) => s.products);
  const activeCategorySlug = useMenuStore((s) => s.activeCategorySlug);
  const setActiveCategorySlug = useMenuStore((s) => s.setActiveCategorySlug);
  const clearCategoryFilter = useMenuStore((s) => s.clearCategoryFilter);
  const loadMenu = useMenuStore((s) => s.loadMenu);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const chips = [
    { id: "all", name: "All Menu", slug: null as string | null, count: products.length, target: "menu-products" },
    { id: "deals-nav", name: "Deals", slug: "__deals__" as string | null, count: 0, target: "deals" },
    ...categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      count: products.filter((p) => p.categoryId === c.id || p.categorySlug === c.slug).length,
      target: `category-${c.slug || c.id}`,
    })),
  ];

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 250;
      const newScrollLeft =
        scrollRef.current.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 20);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  if (chips.length <= 1) return null;

  // Highlight only — do not filter other categories out of the menu.
  const isAllActive = !activeCategorySlug;

  return (
    <div
      className={`w-full bg-gradient-primary shadow-md border-y border-primary/40 ${
        sticky ? "sticky top-[74px] sm:top-[80px] md:top-[128px] lg:top-[136px] z-40" : ""
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative py-2.5 flex items-center">
        {showLeft && (
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll Left"
            className="absolute left-2 z-10 h-7 w-7 rounded-full bg-white/90 text-primary shadow-md flex items-center justify-center hover:bg-white transition-all cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide w-full py-0.5 px-6"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {chips.map((category) => {
            const isActive =
              category.slug === "__deals__"
                ? false
                : category.slug == null
                  ? isAllActive
                  : activeCategorySlug === category.slug;
            return (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (category.slug === "__deals__") {
                    clearCategoryFilter();
                    const dealsEl = document.getElementById("deals");
                    if (dealsEl) dealsEl.scrollIntoView({ behavior: "smooth" });
                    return;
                  }
                  if (category.slug == null) {
                    clearCategoryFilter();
                    const element = document.getElementById("menu-products");
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth" });
                    }
                    return;
                  }
                  // Highlight + scroll only — keep all menu sections visible/active
                  setActiveCategorySlug(category.slug);
                  setTimeout(() => {
                    const targetId = category.target || `category-${category.slug || category.id}`;
                    const element = document.getElementById(targetId);
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth" });
                    } else {
                      const menuEl = document.getElementById("menu-products");
                      if (menuEl) menuEl.scrollIntoView({ behavior: "smooth" });
                    }
                  }, 60);
                }}
                className={`shrink-0 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-white text-primary shadow-lg ring-2 ring-white/50"
                    : "bg-white/10 text-white hover:bg-white/20 hover:text-white"
                }`}
              >
                {category.name}
              </motion.button>
            );
          })}
        </div>

        {showRight && (
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll Right"
            className="absolute right-2 z-10 h-7 w-7 rounded-full bg-white/90 text-primary shadow-md flex items-center justify-center hover:bg-white transition-all cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
