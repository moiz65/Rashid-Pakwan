import { Search, SlidersHorizontal, X, ArrowRight } from "lucide-react";
import { useMenuStore } from "@/store/MenuStore";

export function MenuSearchBar() {
  const searchQuery = useMenuStore((s) => s.searchQuery);
  const setSearchQuery = useMenuStore((s) => s.setSearchQuery);
  const onlySale = useMenuStore((s) => s.onlySale);
  const setOnlySale = useMenuStore((s) => s.setOnlySale);
  const clearCategoryFilter = useMenuStore((s) => s.clearCategoryFilter);

  const focusMenu = () => {
    const el = document.getElementById("menu-products");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const applySearch = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      clearCategoryFilter();
      // Defer scroll so filtered results render first
      requestAnimationFrame(() => focusMenu());
    }
  };

  return (
    <div id="search-bar" className="scroll-mt-28 md:scroll-mt-[7.25rem] py-6 lg:py-8 border-b border-border/40 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          <div className="relative flex items-center rounded-full border-2 border-primary bg-card p-1.5 shadow-lg">
            <Search className="h-5 w-5 text-primary ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => applySearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") focusMenu();
              }}
              placeholder="Search for your favorite dish or tea..."
              className="w-full px-3 py-2 bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/70"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1.5 text-muted-foreground hover:text-foreground mr-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={focusMenu}
              aria-label="Search"
              className="grid place-items-center h-9 w-9 rounded-full bg-gradient-primary text-primary-foreground shadow-glow shrink-0 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setOnlySale(!onlySale);
                focusMenu();
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                onlySale
                  ? "bg-primary text-primary-foreground border-primary shadow-glow"
                  : "bg-surface border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              <SlidersHorizontal className="h-3 w-3" />
              On Discount / Special Offers Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
