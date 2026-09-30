import { useEffect, useMemo, useState } from "react";
import { Search, Utensils, Sparkles, Flame, Coffee, Cake, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProductSection } from "./ProductSection";
import { useMenuStore } from "@/store/MenuStore";
import { useMenuLoading } from "@/hooks/useMenuProducts";
import { toDisplayProduct, type DisplayProduct, type MenuCategory } from "@/lib/api";

/*
  Minimal desi biryani palette
  brown  #840608   saffron #F29C1F   cream #FFF1D0 / #FFF8E7   chilli #B93A0E   green #4E8A45
*/
const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F29C1F]";

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

/* ---------- Individual clipart components (reusable, positionable) ---------- */

function ChickenLeg({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 120" className={className} aria-hidden="true">
      <g fill="none" stroke="#840608" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* meat body */}
        <path d="M20 60c0-22 15-40 36-40 12 0 21 5 26 13 7 12 7 30-3 43-7 10-20 15-33 15-15 0-26-12-26-31z"/>
        {/* roast/highlight */}
        <path d="M35 45c3-12 10-22 20-26" opacity="0.55"/>
        {/* char marks */}
        <path d="M28 65h32 M26 74h28" opacity="0.4"/>
        {/* bone out the top-right */}
        <path d="M82 33l18-14"/>
        {/* bone knobs */}
        <circle cx="103" cy="16" r="6"/>
        <circle cx="98" cy="21" r="4"/>
      </g>
    </svg>
  );
}

function BeefShank({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 110" className={className} aria-hidden="true">
      <g fill="none" stroke="#840608" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* shank meat */}
        <path d="M14 55c0-22 15-38 36-38h18c22 0 38 16 38 38 0 26-16 46-42 50-26 4-46-10-50-32-1-5-2-10 0-18z"/>
        {/* highlight */}
        <path d="M30 36c6-10 16-15 28-15" opacity="0.55"/>
        {/* fat marbling */}
        <path d="M30 62c6 6 16 8 26 5" opacity="0.55"/>
        <path d="M28 74c10 6 22 6 34 0" opacity="0.55"/>
        {/* marrow bone sticking up */}
        <ellipse cx="46" cy="8" rx="14" ry="8"/>
        <path d="M32 8c4-3 24-3 28 0"/>
        <path d="M40 4v8 M52 4v8" opacity="0.5"/>
      </g>
    </svg>
  );
}

function MuttonChop({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 130" className={className} aria-hidden="true">
      <g fill="none" stroke="#840608" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* chop meat */}
        <path d="M12 55c0-22 18-38 40-38 14 0 26 6 30 18 4 14-2 28-16 34-12 5-28 7-40 3-9-3-14-9-14-17z"/>
        {/* highlight */}
        <path d="M30 34c6-6 14-10 22-9" opacity="0.55"/>
        {/* rib bone handle down */}
        <path d="M32 74l-4 32"/>
        <ellipse cx="27" cy="108" rx="7" ry="4"/>
        {/* cap cross-line */}
        <path d="M23 105h8" opacity="0.6"/>
      </g>
    </svg>
  );
}

function SteamingHandi({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 140" className={className} aria-hidden="true">
      <g fill="none" stroke="#840608" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* steam */}
        <path d="M45 18c-6-8 6-14 0-22" opacity="0.7"/>
        <path d="M70 14c-6-8 6-14 0-22" opacity="0.7"/>
        <path d="M95 18c-6-8 6-14 0-22" opacity="0.7"/>
        {/* knob */}
        <circle cx="70" cy="22" r="4"/>
        {/* dome lid */}
        <path d="M30 44c0-14 18-22 40-22s40 8 40 22"/>
        {/* rim */}
        <rect x="18" y="44" width="104" height="11" rx="5.5"/>
        {/* rivets */}
        <circle cx="30" cy="49.5" r="1.4" fill="#840608"/>
        <circle cx="46" cy="49.5" r="1.4" fill="#840608"/>
        <circle cx="62" cy="49.5" r="1.4" fill="#840608"/>
        <circle cx="78" cy="49.5" r="1.4" fill="#840608"/>
        <circle cx="94" cy="49.5" r="1.4" fill="#840608"/>
        <circle cx="110" cy="49.5" r="1.4" fill="#840608"/>
        {/* pot body */}
        <path d="M24 55h92c0 34-18 54-46 54S24 89 24 55z"/>
        {/* side handles */}
        <path d="M12 74c-8 0-8 12 0 12"/>
        <path d="M128 74c8 0 8 12 0 12"/>
        {/* highlight stroke on pot */}
        <path d="M46 68c2 18 9 28 20 34" opacity="0.55"/>
      </g>
    </svg>
  );
}

function BiryaniPlate({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 130" className={className} aria-hidden="true">
      <g fill="none" stroke="#840608" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* plate */}
        <ellipse cx="80" cy="106" rx="70" ry="14"/>
        <path d="M10 106c4 12 24 22 70 22s66-10 70-22" opacity="0.7"/>
        {/* rice mound */}
        <path d="M22 100c0-26 22-50 58-50s58 24 58 50"/>
        {/* rice grains */}
        <path d="M38 86l6-6 M56 76l6-6 M76 70l6-6 M96 76l6-6 M114 86l6-6" opacity="0.55"/>
        {/* leg piece resting on top */}
        <g transform="translate(46 38) rotate(-20)">
          <path d="M0 12c0-8 6-15 13-15 5 0 10 3 12 8 2 6 0 12-5 16-4 3-11 3-15 0-3-2-5-6-5-9z"/>
          <path d="M24 0l10-6"/>
          <circle cx="37" cy="-8" r="3"/>
        </g>
        {/* garnish leaf */}
        <path d="M104 62c8-2 14-8 16-16-10-2-18 4-16 16z"/>
        <path d="M106 60c4-4 8-8 12-12" opacity="0.5"/>
      </g>
    </svg>
  );
}

function WholeSpices({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 100" className={className} aria-hidden="true">
      <g fill="none" stroke="#840608" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* star anise */}
        <g transform="translate(30 50)">
          <ellipse cx="0" cy="-16" rx="4" ry="16"/>
          <ellipse cx="0" cy="16" rx="4" ry="16"/>
          <ellipse cx="-16" cy="0" rx="16" ry="4"/>
          <ellipse cx="16" cy="0" rx="16" ry="4"/>
          <ellipse cx="-11" cy="-11" rx="3.5" ry="14" transform="rotate(-45)"/>
          <ellipse cx="11" cy="-11" rx="3.5" ry="14" transform="rotate(45)"/>
          <ellipse cx="-11" cy="11" rx="3.5" ry="14" transform="rotate(45)"/>
          <ellipse cx="11" cy="11" rx="3.5" ry="14" transform="rotate(-45)"/>
          <circle cx="0" cy="0" r="4"/>
        </g>
        {/* cinnamon roll */}
        <g transform="translate(78 40)">
          <path d="M0 12h44c5 0 7 3 7 6s-2 6-7 6H0"/>
          <path d="M0 12c-3 0-3 4 0 4"/>
          <path d="M0 22c-3 0-3-4 0-4"/>
          <path d="M12 15v14 M26 15v14 M40 15v14"/>
        </g>
        {/* cardamom pods */}
        <ellipse cx="132" cy="44" rx="7" ry="11" transform="rotate(-20 132 44)"/>
        <path d="M126 36c-2-3 2-5 3-2"/>
        <ellipse cx="150" cy="50" rx="7" ry="11" transform="rotate(20 150 50)"/>
        <path d="M155 42c2-3-2-5-3-2"/>
      </g>
    </svg>
  );
}

function ChiliAndMint({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 100" className={className} aria-hidden="true">
      <g fill="none" stroke="#840608" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* red chili */}
        <path d="M8 60c8-24 26-42 48-46"/>
        <path d="M8 60c-3-3-2-7 1-5"/>
        <path d="M56 14c3-5 8-5 10 0"/>
        {/* mint sprig */}
        <g transform="translate(90 10)">
          <path d="M20 6v48"/>
          <ellipse cx="8" cy="14" rx="11" ry="6" transform="rotate(-40 8 14)"/>
          <ellipse cx="32" cy="20" rx="11" ry="6" transform="rotate(40 32 20)"/>
          <ellipse cx="8" cy="32" rx="11" ry="6" transform="rotate(-40 8 32)"/>
          <ellipse cx="32" cy="40" rx="11" ry="6" transform="rotate(40 32 40)"/>
          <ellipse cx="20" cy="2" rx="6" ry="9"/>
        </g>
      </g>
    </svg>
  );
}

function KarahiWok({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 120" className={className} aria-hidden="true">
      <g fill="none" stroke="#840608" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* wok */}
        <path d="M10 30h140c0 32-30 58-70 58S10 62 10 30z"/>
        {/* rim highlight */}
        <path d="M18 34h124" opacity="0.5"/>
        {/* handles */}
        <path d="M0 34c-8 0-8 12 0 12"/>
        <path d="M160 34c8 0 8 12 0 12"/>
        {/* ladle sticking out */}
        <path d="M84 24l20-30"/>
        <circle cx="108" cy="-10" r="8"/>
        {/* curry surface texture */}
        <path d="M40 55c6-2 14-2 20 0" opacity="0.55"/>
        <path d="M80 62c8-2 18-2 26 0" opacity="0.55"/>
      </g>
    </svg>
  );
}

function SeekhKebab({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 100" className={className} aria-hidden="true">
      <g fill="none" stroke="#840608" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* skewer */}
        <path d="M4 78L168 6"/>
        <path d="M4 78l-6 4M168 6l6-4" opacity="0.6"/>
        {/* three kebab beads */}
        <ellipse cx="34" cy="62" rx="18" ry="12" transform="rotate(-28 34 62)"/>
        <ellipse cx="78" cy="42" rx="18" ry="12" transform="rotate(-28 78 42)"/>
        <ellipse cx="122" cy="22" rx="18" ry="12" transform="rotate(-28 122 22)"/>
        {/* char marks */}
        <path d="M26 62l6-6 M70 42l6-6 M114 22l6-6" opacity="0.55"/>
      </g>
    </svg>
  );
}

/**
 * Sparse, oversized biryani clipart — placed at specific corners/edges of the
 * section rather than tiled. Uses `absolute` positioning with fixed breakpoint
 * visibility so it never interferes with content or the FABs.
 *
 * Desktop only (lg+). Hidden on mobile and tablet to keep the menu readable.
 */
function BiryaniClipart() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 hidden lg:block overflow-hidden"
    >
      {/* Chicken leg — top-left, rotated slightly, large */}
      <ChickenLeg className="absolute -left-8 top-10 h-40 w-32 opacity-[0.07] -rotate-12" />

      {/* Beef shank — top-right, large */}
      <BeefShank className="absolute -right-10 top-16 h-36 w-44 opacity-[0.07] rotate-12" />

      {/* Steaming handi — top-center-right, background hero */}
      <SteamingHandi className="absolute right-1/4 top-24 h-52 w-52 opacity-[0.05]" />

      {/* Biryani plate — mid-left, large */}
      <BiryaniPlate className="absolute -left-16 top-1/3 h-48 w-56 opacity-[0.06] -rotate-6" />

      {/* Whole spices cluster — mid-right */}
      <WholeSpices className="absolute -right-12 top-1/2 h-32 w-52 opacity-[0.07] rotate-6" />

      {/* Mutton chop — lower-left */}
      <MuttonChop className="absolute left-4 top-2/3 h-40 w-32 opacity-[0.07] rotate-12" />

      {/* Chili and mint — lower-right */}
      <ChiliAndMint className="absolute -right-8 top-3/4 h-32 w-48 opacity-[0.07] -rotate-6" />

      {/* Karahi — bottom-left, large */}
      <KarahiWok className="absolute -left-20 bottom-20 h-40 w-52 opacity-[0.06] rotate-3" />

      {/* Seekh kebab — bottom-right */}
      <SeekhKebab className="absolute -right-16 bottom-32 h-32 w-56 opacity-[0.07] -rotate-12" />
    </div>
  );
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
    <section
      id="menu-products"
      className="relative py-8 lg:py-14 scroll-mt-28 bg-white overflow-hidden"
    >
      {/* Sparse, oversized biryani clipart — corner and edge placements */}
      <BiryaniClipart />

      {/* Legacy hash target used by older Menu / Browse Menu links */}
      <div id="menu" className="relative -top-28 h-0 w-0 overflow-hidden" aria-hidden />

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-36 rounded-3xl bg-[#FFF1D0] animate-pulse border border-[#840608]/10"
              />
            ))}
          </div>
        ) : categorySubsections.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border border-dashed border-[#840608]/25 bg-[#FFF1D0]">
            <Utensils className="h-12 w-12 text-[#840608]/30 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#840608]">No items found</h3>
            <p className="text-sm text-[#840608]/65 mt-1">
              Try adjusting your search query or filter settings.
            </p>
            {(searchQuery || onlySale) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setOnlySale(false);
                }}
                className={`mt-4 inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#840608] text-[#F29C1F] text-xs font-medium cursor-pointer hover:bg-[#5A1A10] transition-colors ${focusRing}`}
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
                <div
                  key={category.id}
                  id={`category-${category.slug || category.id}`}
                  className="scroll-mt-36"
                >
                  <div className="relative rounded-3xl bg-[#840608] border border-[#F29C1F]/40 border-b-4 border-b-[#F29C1F] p-6 sm:p-8 text-[#FFF1D0] overflow-hidden shadow-lg mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative z-10">
                      <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#fff] text-[#840608] border border-[#F29C1F]/30 mb-2 inline-block">
                        CATEGORY SELECTION
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase font-display text-[#F29C1F]">
                        {category.name} RANGE
                      </h2>
                      <p className="text-xs sm:text-sm text-[#FFF]/80 mt-1 max-w-xl">
                        Handcrafted with signature ingredients — order online for quick Karachi delivery.
                      </p>
                    </div>

                    <div className="relative z-10 shrink-0 flex items-center gap-2">
                      <span className="text-xs font-bold bg-[#Fff] text-[#840608] px-3 py-1.5 rounded-full shadow-md border border-[#FFF1D0]/20">
                        {products.length} {products.length === 1 ? "Item" : "Items"}
                      </span>
                    </div>

                    <Icon className="absolute -right-4 -bottom-6 h-36 w-36 text-[#F29C1F]/10 pointer-events-none" />
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
          className={`grid place-items-center h-12 w-12 rounded-full bg-[#840608] text-[#F29C1F] shadow-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer border-2 border-[#F29C1F]/40 ${focusRing}`}
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
              className={`grid place-items-center h-12 w-12 rounded-full bg-[#840608] text-[#F29C1F] shadow-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer border-2 border-[#F29C1F]/40 ${focusRing}`}
            >
              <ChevronUp className="h-5 w-5 stroke-[3]" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}