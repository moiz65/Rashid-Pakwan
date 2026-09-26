import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Percent, ShoppingBag, Tag, Timer, Check, X, Minus, Plus } from "lucide-react";
import { fetchPublicDeals, resolveMediaUrl, type MenuAddon, type PublicDeal } from "@/lib/api";
import { buildDrinkChoiceSlots, drinksForDealSlot } from "@/lib/dealDrinks";
import { formatAmount } from "@/lib/formatters";
import { DrinkChoicePicker } from "./DrinkChoicePicker";
import { useCartStore } from "@/store/CartStore";
import { useMenuStore } from "@/store/MenuStore";

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
        ? `Rs ${deal.discountValue} OFF`
        : `${deal.discountValue}% OFF`
      : deal.offerTitle || "Special Deal");
  const items = deal.items || [];
  const hasPrice = deal.price != null && Number(deal.price) > 0;
  const hasCompare =
    deal.originalPrice != null && Number(deal.originalPrice) > Number(deal.price ?? 0);
  const canAdd = hasPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="group relative text-left rounded-3xl bg-card border border-border p-6 overflow-hidden hover:border-primary/50 transition-colors flex flex-col"
    >
      <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
      {deal.image ? (
        <div className="relative mb-4 overflow-hidden rounded-2xl aspect-[16/9]">
          <img
            src={resolveMediaUrl(deal.image)}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}
      <div className="relative flex items-start justify-between gap-3">
        <div className="grid place-items-center h-12 w-12 rounded-2xl bg-gradient-primary shadow-glow">
          {code ? (
            <Tag className="h-6 w-6 text-primary-foreground" />
          ) : deal.showCountdown ? (
            <Timer className="h-6 w-6 text-primary-foreground" />
          ) : (
            <Percent className="h-6 w-6 text-primary-foreground" />
          )}
        </div>
        {code ? (
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/30">
            {code}
          </span>
        ) : null}
      </div>
      <h3 className="relative mt-6 text-xl font-bold">{deal.title}</h3>
      {deal.description ? (
        <p className="relative mt-1 text-sm text-muted-foreground">{deal.description}</p>
      ) : null}
      {items.length > 0 ? (
        <ul className="relative mt-3 space-y-1 text-sm text-muted-foreground">
          {items.slice(0, 4).map((item) => (
            <li key={item.id || `${item.name}-${item.qty}`}>
              {item.qty}×{" "}
              {item.customerChoice && item.itemType === "drink"
                ? "Choose your drink"
                : item.name}
              {item.itemType && item.itemType !== "product" && !item.customerChoice ? (
                <span className="ml-1 text-[10px] uppercase tracking-wide opacity-70">
                  ({item.itemType})
                </span>
              ) : null}
            </li>
          ))}
          {items.length > 4 ? <li>+{items.length - 4} more</li> : null}
        </ul>
      ) : null}
      <div className="relative mt-auto pt-6">
        {hasPrice ? (
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-display font-bold text-gradient-primary">
              Rs {formatAmount(deal.price)}
            </p>
            {hasCompare ? (
              <span className="text-sm font-semibold text-red-500 line-through decoration-red-500/80 decoration-2">
                Rs {formatAmount(deal.originalPrice)}
              </span>
            ) : null}
          </div>
        ) : (
          <p className="text-3xl font-display font-bold text-gradient-primary">{badge}</p>
        )}
        {hasPrice && badge ? (
          <p className="mt-1 text-sm font-medium text-primary">{badge}</p>
        ) : null}
        {showTimer ? (
          <p className="mt-3 text-xs font-mono text-muted-foreground flex items-center gap-1.5">
            <Timer className="h-3.5 w-3.5" />
            Ends in {formatCountdown(remaining!)}
          </p>
        ) : null}
        {canAdd ? (
          <button
            type="button"
            onClick={() => onAdd(deal)}
            disabled={justAdded}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition disabled:opacity-70"
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
      className="py-8 lg:py-12 scroll-mt-28 md:scroll-mt-[7.25rem]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Same category-style banner as Breakfast / Menu sections */}
        <div className="relative rounded-3xl bg-gradient-to-r from-primary via-primary/95 to-red-950 p-6 sm:p-8 text-primary-foreground overflow-hidden shadow-xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/15 text-white border border-white/20 mb-2 inline-block">
              CATEGORY SELECTION
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase font-display text-white">
              DEALS RANGE
            </h2>
            <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl">
              Limited-time combo meals — pick your drink and extras, then add to cart.
            </p>
          </div>
          <div className="relative z-10 shrink-0 flex items-center gap-2">
            <span className="text-xs font-bold bg-white text-primary px-3 py-1.5 rounded-full shadow-md">
              {loading ? "…" : `${visible.length} ${visible.length === 1 ? "Deal" : "Deals"}`}
            </span>
          </div>
          <Percent className="absolute -right-4 -bottom-6 h-36 w-36 text-white/10 pointer-events-none" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-72 rounded-3xl bg-muted/40 animate-pulse border border-border"
              />
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeDealModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-card rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-border shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeDealModal}
                className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="grid md:grid-cols-2 gap-0 min-h-0 flex-1 overflow-hidden">
                <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[420px] overflow-hidden bg-gradient-to-br from-surface to-card border-b md:border-b-0 md:border-r border-border">
                  {dealImage ? (
                    <img
                      src={dealImage}
                      alt={selectedDeal.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center bg-gradient-primary/20">
                      <Timer className="h-16 w-16 text-primary opacity-60" />
                    </div>
                  )}
                  {selectedDeal.badgeText ? (
                    <span className="absolute top-3 left-3 text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-primary text-primary-foreground shadow-glow">
                      {selectedDeal.badgeText}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-col min-h-0 max-h-[90vh] md:max-h-none">
                  <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                  <div>
                    <h2 className="text-2xl font-bold pr-10">{selectedDeal.title}</h2>
                    {selectedDeal.description ? (
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedDeal.description}
                      </p>
                    ) : null}
                    <div className="flex items-baseline gap-2 mt-3">
                      <span className="text-2xl font-bold text-primary">
                        Rs {formatAmount(dealTotalPrice())}
                      </span>
                      {hasCompare ? (
                        <span className="text-sm font-semibold text-red-500 line-through decoration-red-500/80 decoration-2">
                          Rs {formatAmount(Number(selectedDeal.originalPrice) * quantity)}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {(selectedDeal.items || []).length > 0 ? (
                    <section className="rounded-2xl border border-border bg-surface/40 p-4 space-y-3">
                      <div>
                        <h3 className="text-sm font-semibold">Included in deal</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Covered by the deal price — not charged again
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
                              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/50 px-3 py-2.5 text-sm"
                            >
                              <span className="min-w-0 truncate">
                                {item.qty}× {item.name}
                              </span>
                              <span className="text-[10px] uppercase tracking-wide text-muted-foreground shrink-0">
                                Included
                              </span>
                            </li>
                          );
                        })}
                      </ul>

                      {drinkChoiceSlots.length > 0 ? (
                        <div className="space-y-3 pt-1">
                          <p className="text-xs font-medium text-primary">
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
                    <section className="rounded-2xl border border-border p-4 space-y-3">
                      <div>
                        <h3 className="text-sm font-semibold">Add-ons</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Optional — charged on top of the deal
                        </p>
                      </div>
                      <div className="grid gap-2">
                        {extraAddons.map((addon: MenuAddon) => (
                          <label
                            key={addon.id}
                            className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border hover:border-primary/50 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <input
                                type="checkbox"
                                checked={extraAddonIds.includes(addon.id)}
                                onChange={() => toggleExtraAddon(addon.id)}
                                className="h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-primary cursor-pointer"
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
                    <h3 className="text-sm font-semibold">Special Instructions</h3>
                    <textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="Add any special requests..."
                      className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                      rows={2}
                    />
                  </section>
                  </div>

                  <div className="shrink-0 border-t border-border p-4 sm:p-5 bg-card/95 backdrop-blur">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-surface rounded-full border border-border p-1">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="h-8 w-8 rounded-full hover:bg-primary/10 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center font-medium text-sm">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(quantity + 1)}
                          className="h-8 w-8 rounded-full hover:bg-primary/10 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={confirmAddDeal}
                        className="flex-1 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-gradient-primary text-primary-foreground font-medium shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        Add to Cart — Rs {formatAmount(dealTotalPrice())}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {showSuccess ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg font-medium text-sm"
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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl"
    >
      <span className="text-xs font-medium tracking-[0.2em] uppercase text-primary">
        {eyebrow}
      </span>
      <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">{subtitle}</p>
      )}
    </motion.div>
  );
}
