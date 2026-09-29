import { Search, SlidersHorizontal, X, ArrowRight } from "lucide-react";
import { useMenuStore } from "@/store/MenuStore";

/*
  Minimal desi biryani palette
  brown  #3A0F0A   saffron #F29C1F   cream #FFF1D0
*/
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
    <div
      id="search-bar"
      className="scroll-mt-28 md:scroll-mt-[7.25rem] py-6 lg:py-8 bg-[#FFF1D0] border-b border-[#3A0F0A]/15"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center rounded-full bg-white border border-[#3A0F0A]/30 p-1.5 transition-colors focus-within:border-[#3A0F0A]">
            <Search className="h-4 w-4 text-[#3A0F0A]/60 ml-3 shrink-0" />
            <input
              type="text"
              aria-label="Search the menu"
              value={searchQuery}
              onChange={(e) => applySearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") focusMenu();
              }}
              placeholder="Search biryani, karahi, raita..."
              className="w-full px-3 py-2 bg-transparent text-sm text-[#3A0F0A] focus:outline-none placeholder:text-[#3A0F0A]/45"
            />
            {searchQuery ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchQuery("")}
                className="p-1.5 mr-1 rounded-full text-[#3A0F0A]/60 hover:text-[#3A0F0A] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#F29C1F]"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={focusMenu}
              aria-label="Search"
              className="grid place-items-center h-9 w-9 rounded-full bg-[#F29C1F] text-[#3A0F0A] shrink-0 hover:brightness-95 active:scale-95 transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3A0F0A]"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 flex justify-center">
            <button
              type="button"
              aria-pressed={onlySale}
              onClick={() => {
                setOnlySale(!onlySale);
                focusMenu();
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F29C1F] ${
                onlySale
                  ? "bg-[#3A0F0A] text-[#F29C1F] border-[#3A0F0A]"
                  : "border-[#3A0F0A]/30 text-[#3A0F0A]/70 hover:border-[#3A0F0A]"
              }`}
            >
              <SlidersHorizontal className="h-3 w-3" />
              Discounts and special offers only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}