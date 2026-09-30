import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Percent, ShoppingBag, Tag, Timer, Check, X, Minus, Plus } from "lucide-react";
import { fetchPublicDeals, resolveMediaUrl, type MenuAddon, type PublicDeal } from "@/lib/api";
import { buildDrinkChoiceSlots, drinksForDealSlot } from "@/lib/dealDrinks";
import { formatAmount } from "@/lib/formatters";
import { DrinkChoicePicker } from "./DrinkChoicePicker";
import { useCartStore } from "@/store/CartStore";
import { useMenuStore } from "@/store/MenuStore";

/*
  Minimal desi biryani palette
  brown  #840608   saffron #F29C1F   cream #FFF1D0 / #FFF8E7   chilli #B93A0E   green #4E8A45
*/
const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F29C1F]";
const stepBtn = `h-8 w-8 rounded-full text-[#840608] hover:bg-[#F29C1F]/25 flex items-center justify-center transition-colors cursor-pointer ${focusRing}`;

const DEALS_POLL_MS = 20_000;

function formatCountdown(ms: number) {
  if (ms <= 0) return "Ended";
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (d > 0) return `${d}d ${h}h ${pad(m)}m ${pad(s)}s`;
  if (h > 0) return `${h}h ${pad(m)}m ${pad(s)}s`;
  return `${pad(m)}m ${pad(s)}s`;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function currentTimeOfDay(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function normalizeTime(value?: string | null) {
  if (!value) return null;
  const str = String(value).trim();
  if (/^\d{2}:\d{2}$/.test(str)) return `${str}:00`;
  if (/^\d{2}:\d{2}:\d{2}/.test(str)) return str.slice(0, 8);
  return null;
}

/** Client-side mirror of backend schedule so cards hide immediately when the window ends. */
export function isDealLiveNow(deal: PublicDeal, nowMs = Date.now()) {
  const now = new Date(nowMs);
  if (deal.startAt && nowMs < new Date(deal.startAt).getTime()) return false;
  if (deal.endAt && nowMs > new Date(deal.endAt).getTime()) return false;

  const days = deal.daysOfWeek;
  if (Array.isArray(days) && days.length > 0 && !days.map(Number).includes(now.getDay())) {
    return false;
  }

  const t = currentTimeOfDay(now);
  const start = normalizeTime(deal.dailyStartTime);
  const end = normalizeTime(deal.dailyEndTime);
  if (start && end) {
    if (start <= end) {
      if (t < start || t > end) return false;
    } else if (t < start && t > end) {
      return false;
    }
  } else if (start && t < start) {
    return false;
  } else if (end && t > end) {
    return false;
  }
  return true;
}

/* ============================================================
   Biryani clipart — same style as FeaturedProducts, but a
   smaller/leaner set tuned to the deals section's shorter height.
   ============================================================ */

function ChickenLeg({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 120" className={className} aria-hidden="true">
      <g fill="none" stroke="#840608" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 60c0-22 15-40 36-40 12 0 21 5 26 13 7 12 7 30-3 43-7 10-20 15-33 15-15 0-26-12-26-31z"/>
        <path d="M35 45c3-12 10-22 20-26" opacity="0.55"/>
        <path d="M28 65h32 M26 74h28" opacity="0.4"/>
        <path d="M82 33l18-14"/>
        <circle cx="103" cy="16" r="6"/>
        <circle cx="98" cy="21" r="4"/>
      </g>
    </svg>
  );
}

function BiryaniPlate({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 130" className={className} aria-hidden="true">
      <g fill="none" stroke="#840608" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="80" cy="106" rx="70" ry="14"/>
        <path d="M10 106c4 12 24 22 70 22s66-10 70-22" opacity="0.7"/>
        <path d="M22 100c0-26 22-50 58-50s58 24 58 50"/>
        <path d="M38 86l6-6 M56 76l6-6 M76 70l6-6 M96 76l6-6 M114 86l6-6" opacity="0.55"/>
        <g transform="translate(46 38) rotate(-20)">
          <path d="M0 12c0-8 6-15 13-15 5 0 10 3 12 8 2 6 0 12-5 16-4 3-11 3-15 0-3-2-5-6-5-9z"/>
          <path d="M24 0l10-6"/>
          <circle cx="37" cy="-8" r="3"/>
        </g>
        <path d="M104 62c8-2 14-8 16-16-10-2-18 4-16 16z"/>
        <path d="M106 60c4-4 8-8 12-12" opacity="0.5"/>
      </g>
    </svg>
  );
}

function SteamingHandi({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 140" className={className} aria-hidden="true">
      <g fill="none" stroke="#840608" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M45 18c-6-8 6-14 0-22" opacity="0.7"/>
        <path d="M70 14c-6-8 6-14 0-22" opacity="0.7"/>
        <path d="M95 18c-6-8 6-14 0-22" opacity="0.7"/>
        <circle cx="70" cy="22" r="4"/>
        <path d="M30 44c0-14 18-22 40-22s40 8 40 22"/>
        <rect x="18" y="44" width="104" height="11" rx="5.5"/>
        <circle cx="30" cy="49.5" r="1.4" fill="#840608"/>
        <circle cx="46" cy="49.5" r="1.4" fill="#840608"/>
        <circle cx="62" cy="49.5" r="1.4" fill="#840608"/>
        <circle cx="78" cy="49.5" r="1.4" fill="#840608"/>
        <circle cx="94" cy="49.5" r="1.4" fill="#840608"/>
        <circle cx="110" cy="49.5" r="1.4" fill="#840608"/>
        <path d="M24 55h92c0 34-18 54-46 54S24 89 24 55z"/>
        <path d="M12 74c-8 0-8 12 0 12"/>
        <path d="M128 74c8 0 8 12 0 12"/>
        <path d="M46 68c2 18 9 28 20 34" opacity="0.55"/>
      </g>
    </svg>
  );
}

function SeekhKebab({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 100" className={className} aria-hidden="true">
      <g fill="none" stroke="#840608" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 78L168 6"/>
        <path d="M4 78l-6 4M168 6l6-4" opacity="0.6"/>
        <ellipse cx="34" cy="62" rx="18" ry="12" transform="rotate(-28 34 62)"/>
        <ellipse cx="78" cy="42" rx="18" ry="12" transform="rotate(-28 78 42)"/>
        <ellipse cx="122" cy="22" rx="18" ry="12" transform="rotate(-28 122 22)"/>
        <path d="M26 62l6-6 M70 42l6-6 M114 22l6-6" opacity="0.55"/>
      </g>
    </svg>
  );
}

function ChiliAndMint({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 100" className={className} aria-hidden="true">
      <g fill="none" stroke="#840608" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 60c8-24 26-42 48-46"/>
        <path d="M8 60c-3-3-2-7 1-5"/>
        <path d="M56 14c3-5 8-5 10 0"/>
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

/**
 * Deals section clipart — lighter than the menu section's set (fewer icons,
 * tighter placement) so it doesn't compete with the deal cards. Hidden below
 * `lg` so mobile and tablet stay clean.
 */
function DealsClipart() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 hidden lg:block overflow-hidden"
    >
      {/* Steaming handi — top-right, hero of the section */}
      <SteamingHandi className="absolute -right-8 -top-4 h-56 w-56 opacity-[0.05] rotate-6" />

      {/* Chicken leg — top-left */}
      <ChickenLeg className="absolute -left-6 top-6 h-40 w-32 opacity-[0.07] -rotate-12" />

      {/* Biryani plate — mid-left */}
      <BiryaniPlate className="absolute -left-16 top-1/2 h-44 w-52 opacity-[0.055] -rotate-6" />

      {/* Seekh kebab — lower-right */}
      <SeekhKebab className="absolute -right-14 bottom-24 h-28 w-48 opacity-[0.07] -rotate-12" />

      {/* Chili + mint — bottom-left */}
      <ChiliAndMint className="absolute -left-4 bottom-10 h-32 w-48 opacity-[0.07] rotate-3" />
    </div>
  );
}

function DealCard({
  deal,
  now,
  onAdd,
  justAdded,
}: {
  deal: PublicDeal;
  now: number;
  onAdd: (deal: PublicDeal) => void;
  justAdded: boolean;
}) {
  const endMs = deal.endAt ? new Date(deal.endAt).getTime() : null;
  const remaining = endMs != null ? endMs - now : null;
  const showTimer = deal.showCountdown && remaining != null && remaining > 0;
  const code = deal.couponCode || null;
  const badge =
    deal.badgeText ||
    (deal.discountValue != null
      ? deal.discountType === "fixed"
        ? `Rs ${deal.discountValue} off`
        : `${deal.discountValue}% off`
      : deal.offerTitle || "Special deal");
  const items = deal.items || [];
  const hasPrice = deal.price != null && Number(deal.price) > 0;
  const hasCompare =
    deal.originalPrice != null && Number(deal.originalPrice) > Number(deal.price ?? 0);
  const canAdd = hasPrice;
  const dealImage = deal.image ? resolveMediaUrl(deal.image) : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.3 }}
      className="group relative text-left rounded-3xl bg-[#FFF] border border-[#840608]/15 overflow-hidden hover:border-[#840608]/50 transition-colors flex flex-col"
    >
      {/* Hero image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-[#000]">
        {dealImage ? (
          <img
            src={dealImage}
            alt=""
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full grid place-items-center">
            {code ? (
              <Tag className="h-12 w-12 text-[#840608]/30" />
            ) : deal.showCountdown ? (
              <Timer className="h-12 w-12 text-[#840608]/30" />
            ) : (
              <Percent className="h-12 w-12 text-[#840608]/30" />
            )}
          </div>
        )}

        {/* Badge overlay */}
        {badge ? (
          <span className="absolute top-3 left-3 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#840608] text-[#fff] border border-[#FFF1D0]/30 shadow-sm">
            {badge}
          </span>
        ) : null}

        {/* Coupon code overlay */}
        {code ? (
          <span className="absolute top-3 right-3 text-xs font-mono px-2.5 py-1 rounded-md border border-dashed border-[#FFF1D0]/60 text-[#FFF1D0] bg-[#840608]/70 backdrop-blur-sm">
            {code}
          </span>
        ) : null}

        {/* Countdown overlay */}
        {showTimer ? (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full bg-[#840608]/80 backdrop-blur-sm text-[#FFF1D0] border border-[#FFF1D0]/20">
            <Timer className="h-3.5 w-3.5" />
            {formatCountdown(remaining!)}
          </span>
        ) : null}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-5 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-[#840608] leading-snug line-clamp-2">
          {deal.title}
        </h3>
        {deal.description ? (
          <p className="mt-1.5 text-sm text-[#840608]/65 line-clamp-2">
            {deal.description}
          </p>
        ) : null}

        {items.length > 0 ? (
          <ul className="mt-3 space-y-1 text-sm text-[#840608]/70">
            {items.slice(0, 3).map((item) => (
              <li key={item.id || `${item.name}-${item.qty}`} className="truncate">
                <span className="inline-block w-6 font-semibold text-[#840608]">
                  {item.qty}×
                </span>{" "}
                {item.customerChoice && item.itemType === "drink"
                  ? "Choose your drink"
                  : item.name}
                {item.itemType && item.itemType !== "product" && !item.customerChoice ? (
                  <span className="ml-1 text-xs opacity-70">({item.itemType})</span>
                ) : null}
              </li>
            ))}
            {items.length > 3 ? (
              <li className="text-xs text-[#840608]/55 pt-0.5">
                +{items.length - 3} more
              </li>
            ) : null}
          </ul>
        ) : null}

        {/* Price + CTA */}
        <div className="mt-auto pt-5">
          {hasPrice ? (
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-3xl font-display font-bold text-[#840608]">
                Rs {formatAmount(deal.price)}
              </p>
              {hasCompare ? (
                <span className="text-sm font-semibold text-[#840608]/50 line-through decoration-2">
                  Rs {formatAmount(deal.originalPrice)}
                </span>
              ) : null}
            </div>
          ) : (
            <p className="text-2xl sm:text-3xl font-display font-bold text-[#840608]">
              {badge}
            </p>
          )}

          {canAdd ? (
            <button
              type="button"
              onClick={() => onAdd(deal)}
              disabled={justAdded}
              className={`mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#840608] text-[#Fff] px-4 py-3 text-sm font-semibold hover:bg-[#5A1A10] transition-colors disabled:opacity-70 cursor-pointer ${focusRing}`}
            >
              {justAdded ? (
                <>
                  <Check className="h-4 w-4" /> Added to cart
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" /> Add to cart
                </>
              )}
            </button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

export function HotDeals({ embedded = false }: { embedded?: boolean }) {
  const [deals, setDeals] = useState<PublicDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const [addedId, setAddedId] = useState<string | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<PublicDeal | null>(null);
  const [extraAddonIds, setExtraAddonIds] = useState<string[]>([]);
  /** slotKey (item.id) → chosen drink id */
  const [drinkChoices, setDrinkChoices] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const menuDrinks = useMenuStore((s) => s.drinks);
  const loadMenu = useMenuStore((s) => s.loadMenu);
  const selectedBranchId = useMenuStore((s) => s.selectedBranchId);
  const searchQuery = useMenuStore((s) => s.searchQuery);

  const loadDeals = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const list = await fetchPublicDeals(selectedBranchId);
      setDeals(list);
    } catch {
      if (showLoading) setDeals([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [selectedBranchId]);

  useEffect(() => {
    if (!selectedBranchId) {
      setDeals([]);
      setLoading(false);
      return;
    }
    loadMenu({ silent: true, branchId: selectedBranchId });
    loadDeals(true);
    const intervalId = window.setInterval(() => loadDeals(false), DEALS_POLL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") loadDeals(false);
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [loadDeals, loadMenu, selectedBranchId]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const openDealModal = (deal: PublicDeal) => {
    setSelectedDeal(deal);
    setExtraAddonIds([]);
    setDrinkChoices({});
    setQuantity(1);
    setSpecialInstructions("");
    setShowSuccess(false);
    document.body.style.overflow = "hidden";
  };

  const closeDealModal = () => {
    setSelectedDeal(null);
    setExtraAddonIds([]);
    setDrinkChoices({});
    setQuantity(1);
    setSpecialInstructions("");
    setShowSuccess(false);
    document.body.style.overflow = "auto";
  };

  const toggleExtraAddon = (id: string) => {
    setExtraAddonIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const drinksForSlot = (item: Parameters<typeof drinksForDealSlot>[0]) =>
    drinksForDealSlot(item, menuDrinks);

  const drinkChoiceSlots = selectedDeal
    ? buildDrinkChoiceSlots(selectedDeal.items || [])
    : [];

  const dealUnitPrice = () => {
    if (!selectedDeal) return 0;
    const base = Number(selectedDeal.price ?? 0);
    const pool = selectedDeal.addons || [];
    const addonTotal = pool
      .filter((a) => extraAddonIds.includes(a.id))
      .reduce((sum, a) => sum + Number(a.price || 0), 0);
    return base + addonTotal;
  };

  const dealTotalPrice = () => dealUnitPrice() * quantity;

  const confirmAddDeal = () => {
    if (!selectedDeal) return;
    const price = Number(selectedDeal.price ?? 0);
    if (!Number.isFinite(price) || price <= 0) return;

    const items = selectedDeal.items || [];
    const choiceSlots = buildDrinkChoiceSlots(items);
    for (const slot of choiceSlots) {
      if (!drinkChoices[slot.key]) {
        window.alert(`Please select ${slot.label.toLowerCase()} for this deal.`);
        return;
      }
    }

    const includedLabels: string[] = [];
    for (const item of items) {
      if (item.itemType === "drink" && item.customerChoice) {
        const total = Math.max(1, Number(item.qty) || 1);
        for (let i = 0; i < total; i++) {
          const key = `${item.id || item.name || "drink"}-${i}`;
          const drink = menuDrinks.find((d) => d.id === drinkChoices[key]);
          includedLabels.push(`1× ${drink?.name || "Drink"}`);
        }
      } else {
        includedLabels.push(`${item.qty}× ${item.name}`);
      }
    }
    const bundle = includedLabels.join(", ");
    const includedAddonIds = new Set(
      items.filter((i) => i.itemType === "addon" && i.addonId).map((i) => i.addonId as string)
    );
    const chosen = (selectedDeal.addons || []).filter(
      (a) => extraAddonIds.includes(a.id) && !includedAddonIds.has(a.id)
    );
    const addonTotal = chosen.reduce((sum, a) => sum + Number(a.price || 0), 0);
    const addonNames = chosen.map((a) => a.name);
    const chosenDrinkNames = choiceSlots
      .map((slot) => menuDrinks.find((d) => d.id === drinkChoices[slot.key])?.name)
      .filter(Boolean);
    const noteParts = [
      bundle ? `Includes: ${bundle}` : null,
      chosenDrinkNames.length ? `Drink choice: ${chosenDrinkNames.join(", ")}` : null,
      addonNames.length ? `Extras: ${addonNames.join(", ")}` : null,
      selectedDeal.couponCode ? `Promo code: ${selectedDeal.couponCode}` : null,
      specialInstructions.trim() || null,
    ].filter(Boolean);

    addItem({
      productId: `deal:${selectedDeal.id}`,
      name: selectedDeal.title,
      desc: selectedDeal.description || "Deal combo",
      price: price + addonTotal,
      currency: "Rs ",
      src: resolveMediaUrl(selectedDeal.image) || "",
      includedItems: includedLabels,
      addons: addonNames,
      selectedAddons: chosen,
      specialInstructions: noteParts.join(" · ") || undefined,
      quantity,
    });

    setAddedId(selectedDeal.id);
    setShowSuccess(true);
    window.setTimeout(() => closeDealModal(), 1200);
    window.setTimeout(
      () => setAddedId((cur) => (cur === selectedDeal.id ? null : cur)),
      1600
    );
  };

  const visible = deals.filter((d) => isDealLiveNow(d, now));
  const dealImage = selectedDeal ? resolveMediaUrl(selectedDeal.image) : "";
  const hasCompare =
    selectedDeal?.originalPrice != null &&
    Number(selectedDeal.originalPrice) > Number(selectedDeal.price ?? 0);
  const includedAddonIds = new Set(
    (selectedDeal?.items || [])
      .filter((i) => i.itemType === "addon" && i.addonId)
      .map((i) => i.addonId as string)
  );
  const extraAddons = (selectedDeal?.addons || []).filter(
    (a) => !includedAddonIds.has(a.id)
  );

  // While searching menu items, keep deals out of the way so results are visible
  if (searchQuery.trim()) return null;
  if (!loading && visible.length === 0) return null;

  return (
    <section
      id="deals"
      className="relative py-8 lg:py-12 scroll-mt-28 md:scroll-mt-[7.25rem] bg-[#FFF] overflow-hidden"
    >
      {/* Desi biryani clipart — hand-placed, oversized, hidden on mobile */}
      <DealsClipart />

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        {/* Deals banner */}
        <div className="rounded-3xl bg-[#840608] border border-[#F29C1F]/40 border-b-4 border-b-[#F29C1F] p-6 sm:p-8 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-display text-[#F29C1F]">
              Deals
            </h2>
            <p className="text-sm text-[#FFF]/80 mt-1 max-w-xl">
              Limited-time combo meals. Pick your drink and extras, then add to cart.
            </p>
          </div>
          <span className="shrink-0 self-start sm:self-auto text-sm font-semibold bg-[#FfF] text-[#840608] px-3.5 py-1.5 rounded-full border border-[#FFF1D0]/20">
            {loading ? "Loading" : `${visible.length} ${visible.length === 1 ? "deal" : "deals"}`}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-3xl bg-white border border-[#840608]/10 overflow-hidden"
              >
                <div className="aspect-[16/9] bg-[#FFF1D0] animate-pulse" />
                <div className="p-5 sm:p-6 space-y-3">
                  <div className="h-5 w-3/4 rounded bg-[#FFF1D0] animate-pulse" />
                  <div className="h-3 w-full rounded bg-[#FFF1D0] animate-pulse" />
                  <div className="h-3 w-2/3 rounded bg-[#FFF1D0] animate-pulse" />
                  <div className="h-8 w-24 rounded bg-[#FFF1D0] animate-pulse mt-4" />
                  <div className="h-11 w-full rounded-full bg-[#FFF1D0] animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {visible.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                now={now}
                onAdd={openDealModal}
                justAdded={addedId === deal.id}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedDeal ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000]/60"
            onClick={closeDealModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              role="dialog"
              aria-modal="true"
              aria-label={selectedDeal.title}
              className="relative bg-[#FFF8E7] text-[#840608] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-t-4 border-[#F29C1F] shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeDealModal}
                aria-label="Close"
                className={`absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-[#FFF1D0] border border-[#840608]/25 flex items-center justify-center hover:bg-[#840608] hover:text-[#F29C1F] transition-colors cursor-pointer ${focusRing}`}
              >
                <X className="h-4 w-4" />
              </button>

              <div className="grid md:grid-cols-2 gap-0 min-h-0 flex-1 overflow-hidden">
                <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[420px] overflow-hidden bg-[#000] border-b md:border-b-0 md:border-r border-[#840608]/15">
                  {dealImage ? (
                    <img
                      src={dealImage}
                      alt={selectedDeal.title}
                      className="absolute inset-0 h-full w-full object-contain"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center">
                      <Timer className="h-16 w-16 text-[#840608]/30" />
                    </div>
                  )}
                  {selectedDeal.badgeText ? (
                    <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F29C1F] text-[#840608]">
                      {selectedDeal.badgeText}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-col min-h-0 max-h-[90vh] md:max-h-none">
                  <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                  <div>
                    <h2 className="text-2xl font-bold pr-10">{selectedDeal.title}</h2>
                    {selectedDeal.description ? (
                      <p className="text-sm text-[#840608]/65 mt-1">
                        {selectedDeal.description}
                      </p>
                    ) : null}
                    <div className="flex items-baseline gap-2 mt-3">
                      <span className="text-2xl font-bold text-[#B93A0E]">
                        Rs {formatAmount(dealTotalPrice())}
                      </span>
                      {hasCompare ? (
                        <span className="text-sm font-semibold text-[#840608]/50 line-through decoration-2">
                          Rs {formatAmount(Number(selectedDeal.originalPrice) * quantity)}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {(selectedDeal.items || []).length > 0 ? (
                    <section className="rounded-2xl border border-[#840608]/15 bg-[#FFF1D0] p-4 space-y-3">
                      <div>
                        <h3 className="text-sm font-semibold">Included in deal</h3>
                        <p className="text-xs text-[#840608]/65 mt-0.5">
                          Covered by the deal price, not charged again.
                        </p>
                      </div>
                      <ul className="space-y-2">
                        {(selectedDeal.items || []).map((item) => {
                          const key = item.id || item.name;
                          if (item.itemType === "drink" && item.customerChoice) {
                            return null;
                          }
                          return (
                            <li
                              key={key}
                              className="flex items-center justify-between gap-3 rounded-xl border border-[#840608]/15 bg-[#FFF8E7] px-3 py-2.5 text-sm"
                            >
                              <span className="min-w-0 truncate">
                                {item.qty}× {item.name}
                              </span>
                              <span className="text-xs text-[#4E8A45] font-medium shrink-0">
                                Included
                              </span>
                            </li>
                          );
                        })}
                      </ul>

                      {drinkChoiceSlots.length > 0 ? (
                        <div className="space-y-3 pt-1">
                          <p className="text-xs font-semibold text-[#B93A0E]">
                            Pick your included drink{drinkChoiceSlots.length > 1 ? "s" : ""}
                          </p>
                          {drinkChoiceSlots.map((slot) => (
                            <DrinkChoicePicker
                              key={slot.key}
                              label={slot.label}
                              value={drinkChoices[slot.key] || ""}
                              options={drinksForSlot(slot.item)}
                              onChange={(drinkId) =>
                                setDrinkChoices((prev) => ({ ...prev, [slot.key]: drinkId }))
                              }
                            />
                          ))}
                        </div>
                      ) : null}
                    </section>
                  ) : null}

                  {extraAddons.length > 0 ? (
                    <section className="rounded-2xl border border-[#840608]/15 bg-[#FFF1D0] p-4 space-y-3">
                      <div>
                        <h3 className="text-sm font-semibold">Add-ons</h3>
                        <p className="text-xs text-[#840608]/65 mt-0.5">
                          Optional. Charged on top of the deal.
                        </p>
                      </div>
                      <div className="grid gap-2">
                        {extraAddons.map((addon: MenuAddon) => (
                          <label
                            key={addon.id}
                            className={`flex items-center justify-between gap-3 p-3 rounded-xl border bg-[#FFF8E7] cursor-pointer transition-colors ${
                              extraAddonIds.includes(addon.id)
                                ? "border-[#840608] ring-1 ring-[#840608]/30"
                                : "border-[#840608]/15 hover:border-[#840608]/45"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <input
                                type="checkbox"
                                checked={extraAddonIds.includes(addon.id)}
                                onChange={() => toggleExtraAddon(addon.id)}
                                className="h-4 w-4 shrink-0 rounded accent-[#840608] cursor-pointer"
                              />
                              <span className="text-sm truncate">{addon.name}</span>
                            </div>
                            <span className="text-sm font-medium shrink-0 tabular-nums">
                              +Rs {formatAmount(addon.price || 0)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  <section className="space-y-2">
                    <h3 className="text-sm font-semibold">Special instructions</h3>
                    <textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      aria-label="Special instructions"
                      placeholder="Add any special requests..."
                      className={`w-full px-3 py-2 rounded-xl border border-[#840608]/25 bg-[#FFF1D0] text-sm focus:outline-none focus:border-[#840608] transition-colors resize-none ${focusRing}`}
                      rows={2}
                    />
                  </section>
                  </div>

                  <div className="shrink-0 border-t border-dashed border-[#840608]/25 p-4 sm:p-5 bg-[#FFF8E7]">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-[#FFF1D0] rounded-full border border-[#840608]/25 p-1">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          aria-label="Decrease quantity"
                          className={stepBtn}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center font-medium text-sm tabular-nums">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(quantity + 1)}
                          aria-label="Increase quantity"
                          className={stepBtn}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={confirmAddDeal}
                        className={`flex-1 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-[#840608] text-[#F29C1F] font-semibold hover:bg-[#5A1A10] active:scale-[0.99] transition-colors cursor-pointer ${focusRing}`}
                      >
                        <ShoppingBag className="h-4 w-4" />
                        <span>Add to cart</span>
                        <span className="tabular-nums">Rs {formatAmount(dealTotalPrice())}</span>
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {showSuccess ? (
                      <motion.div
                        role="status"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-[#4E8A45] text-[#FFF1D0] px-6 py-3 rounded-full shadow-lg font-medium text-sm border border-[#FFF1D0]/30"
                      >
                        Added to cart!
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.35 }}
      className="max-w-2xl"
    >
      <span className="text-sm font-semibold text-[#B93A0E]">{eyebrow}</span>
      <h2 className="mt-1 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight font-display text-[#840608]">
        {title}
      </h2>
      <span className="mt-3 block h-1 w-12 rounded-full bg-[#F29C1F]" aria-hidden="true" />
      {subtitle && (
        <p className="mt-3 text-sm sm:text-base text-[#840608]/65">{subtitle}</p>
      )}
    </motion.div>
  );
}