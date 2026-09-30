import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Tag,
  Percent,
  Truck,
  Gift,
  Sparkles,
  ArrowRight,
  Check,
  Minus,
  Plus,
  ShoppingCart,
  X,
} from "lucide-react";
import { formatAmount } from "@/lib/formatters";
import { AnimatePresence, motion } from "motion/react";
import {
  fetchPublicOffers,
  resolveMediaUrl,
  type MenuProduct,
  type PublicOffer,
} from "@/lib/api";
import { useMenuStore } from "@/store/MenuStore";
import { useCartStore } from "@/store/CartStore";
import { SectionHeader } from "./HotDeals";

/*
  Minimal desi biryani palette
  brown  #840608   saffron #F29C1F   cream #FFF1D0 / #FFF8E7   chilli #B93A0E   green #4E8A45
*/
const OFFERS_POLL_MS = 20_000;

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F29C1F]";
const primaryBtn = `bg-[#840608] text-[#F29C1F] font-semibold rounded-full hover:bg-[#5A1A10] active:scale-[0.99] transition-colors cursor-pointer ${focusRing}`;

function offerSubtitle(offer: PublicOffer) {
  const desc = offer.description?.trim();
  if (desc && desc.toLowerCase() !== offer.title.trim().toLowerCase()) {
    return desc;
  }
  if (offer.type === "percentage") {
    return `${Number(offer.discountValue || 0)}% off eligible items, applied automatically at checkout.`;
  }
  if (offer.type === "fixed") {
    return `Rs ${Number(offer.discountValue || 0)} off eligible items, applied automatically at checkout.`;
  }
  if (offer.type === "bogo") {
    return `Buy any ${offer.buyQty || 1}, get any ${offer.getQty || 1} free. Pick from the offer categories.`;
  }
  if (offer.type === "freebie") return "Free item when your order meets the minimum threshold.";
  if (offer.type === "free_delivery") {
    return `Free delivery on all orders over Rs ${Number(offer.minOrder || 0)}.`;
  }
  if (offer.type === "bundle") {
    return offer.conditions?.trim() || "Bundle promotion, applied automatically at checkout.";
  }
  return "Limited-time promotion on eligible items.";
}

function getOfferIcon(type?: string) {
  switch (type) {
    case "free_delivery":
      return Truck;
    case "percentage":
    case "fixed":
      return Percent;
    case "bogo":
      return Gift;
    case "freebie":
      return Sparkles;
    default:
      return Tag;
  }
}

function productPrice(p: MenuProduct) {
  const discounted = Number(p.discountedPrice);
  if (Number.isFinite(discounted) && discounted > 0) return discounted;
  return Number(p.price) || 0;
}

function selectionTotal(map: Record<string, number>) {
  return Object.values(map).reduce((s, n) => s + (Number(n) || 0), 0);
}

type OfferTab = "buy" | "get";

function ProductGridCard({
  product,
  qty,
  onChange,
  maxReached,
  free = false,
}: {
  product: MenuProduct;
  qty: number;
  onChange: (next: number) => void;
  maxReached: boolean;
  free?: boolean;
}) {
  const img = resolveMediaUrl(product.image);
  const price = productPrice(product);
  const selected = qty > 0;

  return (
    <div
      className={`rounded-2xl border overflow-hidden bg-[#FFF8E7] transition-colors ${
        selected
          ? free
            ? "border-[#4E8A45] ring-1 ring-[#4E8A45]/40"
            : "border-[#840608] ring-1 ring-[#840608]/30"
          : "border-[#840608]/15 hover:border-[#840608]/40"
      }`}
    >
      <div className="aspect-[4/3] bg-[#FFF1D0] relative overflow-hidden">
        {img ? (
          <img src={img} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full grid place-items-center text-[#840608]/50 text-xs">
            No image
          </div>
        )}
        {free ? (
          <span className="absolute top-2 left-2 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#4E8A45] text-[#FFF1D0]">
            Free
          </span>
        ) : null}
        {selected ? (
          <span className="absolute top-2 right-2 h-6 w-6 rounded-full bg-[#F29C1F] text-[#840608] grid place-items-center">
            <Check className="h-3.5 w-3.5" />
          </span>
        ) : null}
      </div>
      <div className="p-3 space-y-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate text-[#840608]">{product.name}</p>
          <p className="text-xs text-[#840608]/65 mt-0.5">
            {free ? (
              <span className="text-[#4E8A45] font-medium">Included free</span>
            ) : (
              <span>Rs {formatAmount(price)}</span>
            )}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            disabled={qty <= 0}
            onClick={() => onChange(Math.max(0, qty - 1))}
            className={`h-8 w-8 rounded-full border border-[#840608]/30 text-[#840608] grid place-items-center disabled:opacity-40 cursor-pointer hover:bg-[#FFF1D0] ${focusRing}`}
            aria-label={`Decrease ${product.name}`}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="text-sm font-semibold tabular-nums min-w-[1.5rem] text-center text-[#840608]">
            {qty}
          </span>
          <button
            type="button"
            disabled={maxReached}
            onClick={() => onChange(qty + 1)}
            className={`h-8 w-8 rounded-full border border-[#840608]/30 text-[#840608] grid place-items-center disabled:opacity-40 cursor-pointer hover:bg-[#FFF1D0] ${focusRing}`}
            aria-label={`Increase ${product.name}`}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function BogoOfferBuilder({
  offer,
  onClose,
}: {
  offer: PublicOffer;
  onClose: () => void;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const buyNeed = Math.max(1, Number(offer.buyQty) || 1);
  const getNeed = Math.max(1, Number(offer.getQty) || 1);
  const buyProducts = offer.buyProducts || [];
  const getProducts = offer.getProducts || [];

  const [tab, setTab] = useState<OfferTab>("buy");
  const [buyQty, setBuyQty] = useState<Record<string, number>>({});
  const [getQty, setGetQty] = useState<Record<string, number>>({});
  const [added, setAdded] = useState(false);

  const buyCount = selectionTotal(buyQty);
  const getCount = selectionTotal(getQty);
  const buyReady = buyCount === buyNeed;
  const getReady = getCount === getNeed;
  const canAdd = buyReady && getReady;

  const paidTotal = useMemo(() => {
    return buyProducts.reduce((sum, p) => sum + productPrice(p) * (buyQty[p.id] || 0), 0);
  }, [buyProducts, buyQty]);

  const freeValue = useMemo(() => {
    return getProducts.reduce((sum, p) => sum + productPrice(p) * (getQty[p.id] || 0), 0);
  }, [getProducts, getQty]);

  const setBuy = (id: string, next: number) => {
    const others = buyCount - (buyQty[id] || 0);
    const capped = Math.max(0, Math.min(next, buyNeed - others));
    setBuyQty((prev) => {
      const copy = { ...prev };
      if (capped <= 0) delete copy[id];
      else copy[id] = capped;
      return copy;
    });
  };

  const setGet = (id: string, next: number) => {
    const others = getCount - (getQty[id] || 0);
    const capped = Math.max(0, Math.min(next, getNeed - others));
    setGetQty((prev) => {
      const copy = { ...prev };
      if (capped <= 0) delete copy[id];
      else copy[id] = capped;
      return copy;
    });
  };

  useEffect(() => {
    if (buyReady && !getReady) setTab("get");
  }, [buyReady, getReady]);

  const handleAdd = () => {
    if (!canAdd) {
      window.alert(
        `Select ${buyNeed} item${buyNeed > 1 ? "s" : ""} to buy and ${getNeed} free item${getNeed > 1 ? "s" : ""}.`
      );
      return;
    }

    const buyLines: Array<{
      productId: string;
      name: string;
      price: number;
      qty: number;
      role: "buy" | "get";
    }> = [];
    const getLines: typeof buyLines = [];
    const includedLabels: string[] = [];

    for (const p of buyProducts) {
      const q = buyQty[p.id] || 0;
      if (q <= 0) continue;
      buyLines.push({
        productId: p.id,
        name: p.name,
        price: productPrice(p),
        qty: q,
        role: "buy",
      });
      includedLabels.push(`${q}× ${p.name}`);
    }

    for (const p of getProducts) {
      const q = getQty[p.id] || 0;
      if (q <= 0) continue;
      getLines.push({
        productId: p.id,
        name: p.name,
        price: productPrice(p),
        qty: q,
        role: "get",
      });
      includedLabels.push(`${q}× ${p.name} (FREE)`);
    }

    const paidTotal = buyLines.reduce((sum, l) => sum + l.price * l.qty, 0);
    const hero =
      buyProducts.find((p) => (buyQty[p.id] || 0) > 0) ||
      getProducts.find((p) => (getQty[p.id] || 0) > 0);

    addItem({
      productId: `offer:${offer.id}`,
      name: offer.title,
      desc: offer.description || "Special offer",
      price: paidTotal,
      currency: "Rs ",
      src: resolveMediaUrl(hero?.image) || "",
      quantity: 1,
      includedItems: includedLabels,
      offerBundle: {
        offerId: offer.id,
        offerTitle: offer.title,
        lines: [...buyLines, ...getLines],
      },
    });

    setAdded(true);
    window.setTimeout(() => onClose(), 1100);
  };

  const list = tab === "buy" ? buyProducts : getProducts;
  const need = tab === "buy" ? buyNeed : getNeed;
  const count = tab === "buy" ? buyCount : getCount;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#000]/60"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 280 }}
        role="dialog"
        aria-modal="true"
        aria-label={offer.title}
        className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#FFF] border-t-4 border-[#F29C1F] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 p-5 border-b border-[#840608]/15 bg-[#FFF8E7]/95 backdrop-blur space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F29C1F] text-[#840608]">
                {offer.badgeText || `Buy ${buyNeed} get ${getNeed}`}
              </span>
              <h3 className="text-xl font-bold mt-2 text-[#840608]">{offer.title}</h3>
              <p className="text-sm text-[#840608]/65 mt-1">
                Pick your paid items first, then your free items.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={`h-9 w-9 rounded-full border border-[#840608]/30 text-[#840608] grid place-items-center cursor-pointer hover:bg-[#FFF1D0] shrink-0 ${focusRing}`}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex gap-1 p-1 rounded-full bg-[#FFF1D0] border border-[#840608]/15">
            <button
              type="button"
              onClick={() => setTab("buy")}
              className={`flex-1 h-10 rounded-full text-sm font-semibold transition-colors cursor-pointer ${focusRing} ${
                tab === "buy"
                  ? "bg-[#840608] text-[#F29C1F]"
                  : "text-[#840608]/70 hover:text-[#840608]"
              }`}
            >
              Buy any {buyNeed}
              <span className="ml-1.5 text-xs opacity-80">
                {buyCount}/{buyNeed}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTab("get")}
              className={`flex-1 h-10 rounded-full text-sm font-semibold transition-colors cursor-pointer ${focusRing} ${
                tab === "get"
                  ? "bg-[#4E8A45] text-[#FFF1D0]"
                  : "text-[#840608]/70 hover:text-[#840608]"
              }`}
            >
              Free any {getNeed}
              <span className="ml-1.5 text-xs opacity-80">
                {getCount}/{getNeed}
              </span>
            </button>
          </div>
        </div>

        <div className="p-5">
          <p className="text-xs text-[#840608]/65 mb-3">
            {tab === "buy"
              ? `Select any ${need} item${need > 1 ? "s" : ""} from this category.`
              : `Select any ${need} free item${need > 1 ? "s" : ""} from this category.`}{" "}
            <span className="font-semibold text-[#840608]">
              {count}/{need} selected
            </span>
          </p>

          {list.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {list.map((p) => (
                <ProductGridCard
                  key={p.id}
                  product={p}
                  qty={(tab === "buy" ? buyQty : getQty)[p.id] || 0}
                  maxReached={count >= need}
                  free={tab === "get"}
                  onChange={(n) => (tab === "buy" ? setBuy(p.id, n) : setGet(p.id, n))}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#840608]/65 py-10 text-center">
              No products in this offer category yet.
            </p>
          )}
        </div>

        <div className="sticky bottom-0 p-5 border-t border-[#840608]/15 bg-[#FFF8E7]/95 backdrop-blur space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-[#840608]/70">
              You pay about <span className="font-semibold text-[#840608]">Rs {formatAmount(paidTotal)}</span>
              {freeValue > 0 ? (
                <>
                  , saving about{" "}
                  <span className="font-semibold text-[#4E8A45]">Rs {formatAmount(freeValue)}</span>
                </>
              ) : null}
            </span>
            <span className="text-xs text-[#840608]/55">Discount applied at checkout</span>
          </div>
          <button
            type="button"
            disabled={!canAdd || added}
            onClick={handleAdd}
            className={`w-full h-12 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${primaryBtn}`}
          >
            {added ? (
              <>
                <Check className="h-4 w-4" />
                Added to cart
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                Add offer to cart
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function BogoOfferCard({
  offer,
  index,
  onOpen,
}: {
  offer: PublicOffer;
  index: number;
  onOpen: () => void;
}) {
  const buyNeed = Math.max(1, Number(offer.buyQty) || 1);
  const getNeed = Math.max(1, Number(offer.getQty) || 1);
  const buyProducts = offer.buyProducts || [];
  const getProducts = offer.getProducts || [];
  const preview = [...buyProducts, ...getProducts].slice(0, 4);
  const hero = preview[0];
  const heroImg = hero ? resolveMediaUrl(hero.image) : "";

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="group flex h-full flex-col rounded-3xl bg-[#FFF8E7] border border-[#840608]/15 overflow-hidden hover:border-[#840608]/50 transition-colors"
    >
      <div className="relative aspect-[4/3] grid place-items-center bg-[#FFF1D0] overflow-hidden">
        {heroImg ? (
          <img
            src={heroImg}
            alt=""
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <Gift className="h-12 w-12 text-[#840608]/30" />
        )}
        <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F29C1F] text-[#840608]">
          {offer.badgeText || `Buy ${buyNeed} get ${getNeed}`}
        </span>
        {preview.length > 1 ? (
          <div className="absolute bottom-3 left-3 flex -space-x-2">
            {preview.slice(1).map((p) => {
              const img = resolveMediaUrl(p.image);
              return (
                <div
                  key={p.id}
                  className="h-9 w-9 rounded-full border-2 border-[#FFF8E7] overflow-hidden bg-[#FFF1D0]"
                  title={p.name}
                >
                  {img ? <img src={img} alt="" className="h-full w-full object-cover" /> : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="min-w-0">
          <h3 className="font-bold text-base leading-snug line-clamp-2 text-[#840608]">{offer.title}</h3>
          <p className="text-xs text-[#840608]/65 mt-1.5 line-clamp-2 leading-relaxed">
            {offer.description?.trim() ||
              `Any ${buyNeed} from the paid list, any ${getNeed} free from the free list.`}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#FFF1D0] border border-[#840608]/15 text-[#840608]/75">
            {buyProducts.length} to buy
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#4E8A45]/10 border border-[#4E8A45]/30 text-[#3E7038]">
            {getProducts.length} free
          </span>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className={`mt-auto inline-flex items-center justify-center gap-2 h-11 w-full text-sm ${primaryBtn}`}
        >
          Choose items
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.article>
  );
}

function SimpleOfferCard({
  offer,
  index,
  onSelectOffer,
}: {
  offer: PublicOffer;
  index: number;
  onSelectOffer?: (offer: PublicOffer) => void;
}) {
  const Icon = getOfferIcon(offer.type);
  const badge =
    offer.badgeText ||
    (offer.type === "free_delivery"
      ? "Free delivery"
      : offer.type === "percentage"
        ? `${offer.discountValue}% off`
        : "Special offer");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative rounded-3xl bg-[#FFF8E7] border border-[#840608]/15 p-6 flex flex-col justify-between hover:border-[#840608]/50 transition-colors"
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="grid place-items-center h-11 w-11 rounded-2xl bg-[#FFF1D0] text-[#840608] border border-[#F29C1F]/60 group-hover:bg-[#F29C1F] transition-colors">
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F29C1F] text-[#840608]">
            {badge}
          </span>
        </div>
        <h3 className="text-lg font-bold text-[#840608]">{offer.title}</h3>
        <p className="text-xs sm:text-sm text-[#840608]/65 mt-2 leading-relaxed">
          {offerSubtitle(offer)}
        </p>
      </div>
      <div className="mt-6 pt-4 border-t border-dashed border-[#840608]/25 flex items-center justify-between">
        <span className="text-xs text-[#840608]/55">Applied at checkout</span>
        <a
          href="#menu-products"
          onClick={() => onSelectOffer?.(offer)}
          className={`inline-flex items-center gap-1.5 text-sm font-semibold text-[#B93A0E] hover:text-[#840608] transition-colors rounded-sm ${focusRing}`}
        >
          View menu
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </motion.div>
  );
}

export function OffersMenu({ onSelectOffer }: { onSelectOffer?: (offer: PublicOffer) => void }) {
  const [offers, setOffers] = useState<PublicOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBogo, setActiveBogo] = useState<PublicOffer | null>(null);
  const loadMenu = useMenuStore((s) => s.loadMenu);
  const selectedBranchId = useMenuStore((s) => s.selectedBranchId);
  const searchQuery = useMenuStore((s) => s.searchQuery);

  const loadOffers = useCallback(
    async (showLoading = false) => {
      if (showLoading) setLoading(true);
      try {
        const list = await fetchPublicOffers(selectedBranchId);
        setOffers(list.filter((o) => o.active !== false));
      } catch {
        setOffers([]);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [selectedBranchId]
  );

  useEffect(() => {
    if (!selectedBranchId) {
      setOffers([]);
      setLoading(false);
      return;
    }
    loadMenu({ branchId: selectedBranchId });
    loadOffers(true);
    const id = window.setInterval(() => loadOffers(false), OFFERS_POLL_MS);
    return () => window.clearInterval(id);
  }, [loadMenu, loadOffers, selectedBranchId]);

  useEffect(() => {
    if (!activeBogo) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [activeBogo]);

  if (searchQuery.trim()) return null;
  if (!loading && offers.length === 0) return null;

  const bogoOffers = offers.filter((o) => o.type === "bogo");
  const otherOffers = offers.filter((o) => o.type !== "bogo");

  return (
    <section
      id="offers"
      className="py-10 lg:py-16 scroll-mt-28 md:scroll-mt-[7.25rem] bg-[#FFF1D0] border-y border-[#840608]/10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Special promotions"
          title="Active offers and discounts"
          subtitle="Pick any paid items, then any free items."
        />

        {loading ? (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-72 rounded-3xl bg-[#FFF8E7] animate-pulse border border-[#840608]/10"
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 space-y-6">
            {bogoOffers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {bogoOffers.map((offer, idx) => (
                  <BogoOfferCard
                    key={offer.id}
                    offer={offer}
                    index={idx}
                    onOpen={() => setActiveBogo(offer)}
                  />
                ))}
              </div>
            ) : null}

            {otherOffers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {otherOffers.map((offer, idx) => (
                  <SimpleOfferCard
                    key={offer.id}
                    offer={offer}
                    index={idx}
                    onSelectOffer={onSelectOffer}
                  />
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>

      <AnimatePresence>
        {activeBogo ? (
          <BogoOfferBuilder offer={activeBogo} onClose={() => setActiveBogo(null)} />
        ) : null}
      </AnimatePresence>
    </section>
  );
}