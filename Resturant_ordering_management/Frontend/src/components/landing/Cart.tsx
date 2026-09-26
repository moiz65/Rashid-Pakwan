import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Truck,
  Clock,
  ChevronRight,
  MessageSquare,
  Tag,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { formatAmount } from "@/lib/formatters";

type CartItem = {
  id: string;
  name: string;
  desc: string;
  price: number;
  productPrice?: number;
  productLabel?: string;
  currency: string;
  quantity: number;
  src: string;
  addons?: string[];
  selectedAddons?: Array<{ id: string; name: string; price: number; quantity?: number }>;
  selectedDrink?: { name: string; price: number };
  includedItems?: string[];
  specialInstructions?: string;
  offerBundle?: {
    offerId: string;
    offerTitle: string;
    lines: Array<{ name: string; qty: number; role: string }>;
  };
};

type CartProps = {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout?: () => void;
};

type DisplayRow =
  | { kind: "single"; item: CartItem }
  | {
      kind: "offer";
      key: string;
      title: string;
      src: string;
      currency: string;
      /** Sum of paid lines only (free items listed under includes) */
      lineTotal: number;
      quantity: number;
      includedItems: string[];
      memberIds: string[];
    };

/** Group legacy multi-line BOGO rows ("Part of offer: …") into one deal card. */
function buildDisplayRows(items: CartItem[]): DisplayRow[] {
  const offerGroups = new Map<
    string,
    {
      title: string;
      src: string;
      currency: string;
      paidTotal: number;
      freeLabels: string[];
      paidLabels: string[];
      memberIds: string[];
      quantity: number;
    }
  >();
  const rows: DisplayRow[] = [];

  for (const item of items) {
    if (item.offerBundle) {
      rows.push({
        kind: "single",
        item: {
          ...item,
          includedItems:
            item.includedItems?.length
              ? item.includedItems
              : item.offerBundle.lines.map(
                  (l) =>
                    `${l.qty}× ${l.name}${l.role === "get" ? " (FREE)" : ""}`
                ),
        },
      });
      continue;
    }

    const match = item.specialInstructions?.match(
      /^Part of offer:\s*(.+?)\s*\((paid|free)/i
    );
    if (match) {
      const title = match[1].trim();
      const isFree = /free/i.test(match[2]);
      const existing = offerGroups.get(title) || {
        title,
        src: item.src,
        currency: item.currency,
        paidTotal: 0,
        freeLabels: [] as string[],
        paidLabels: [] as string[],
        memberIds: [] as string[],
        quantity: 1,
      };
      existing.memberIds.push(item.id);
      if (!existing.src && item.src) existing.src = item.src;
      const label = `${item.quantity}× ${item.name}`;
      if (isFree) {
        existing.freeLabels.push(`${label} (FREE)`);
      } else {
        existing.paidLabels.push(label);
        existing.paidTotal += item.price * item.quantity;
      }
      offerGroups.set(title, existing);
      continue;
    }

    rows.push({ kind: "single", item });
  }

  for (const group of offerGroups.values()) {
    rows.push({
      kind: "offer",
      key: `legacy-offer:${group.title}`,
      title: group.title,
      src: group.src,
      currency: group.currency,
      lineTotal: group.paidTotal,
      quantity: group.quantity,
      includedItems: [...group.paidLabels, ...group.freeLabels],
      memberIds: group.memberIds,
    });
  }

  return rows;
}

export function Cart({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartProps) {
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const displayRows = useMemo(() => buildDisplayRows(items), [items]);

  const subtotal = useMemo(() => {
    return displayRows.reduce((sum, row) => {
      if (row.kind === "single") {
        return sum + row.item.price * row.item.quantity;
      }
      return sum + row.lineTotal;
    }, 0);
  }, [displayRows]);

  const currency =
    items[0]?.currency ||
    displayRows.find((r) => r.kind === "offer")?.currency ||
    "Rs ";

  const itemCount = displayRows.reduce((n, row) => {
    if (row.kind === "single") return n + row.item.quantity;
    return n + row.quantity;
  }, 0);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleCheckout = () => {
    setIsCheckingOut(true);
    onClose();
    setTimeout(() => {
      setIsCheckingOut(false);
      if (onCheckout) onCheckout();
      else navigate({ to: "/checkout" });
    }, 300);
  };

  const removeOfferGroup = (memberIds: string[]) => {
    for (const id of memberIds) onRemoveItem(id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 p-5 border-b border-border bg-card/95 backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">Your Cart</h2>
                  {itemCount > 0 && (
                    <span className="text-xs text-muted-foreground">({itemCount})</span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="h-9 w-9 rounded-full bg-surface hover:bg-primary/10 transition-colors flex items-center justify-center cursor-pointer"
                  aria-label="Close cart"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-20 w-20 rounded-full bg-surface flex items-center justify-center mb-4">
                    <ShoppingBag className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-base font-semibold mb-1">Cart is empty</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add something delicious to get started.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      requestAnimationFrame(() => {
                        const el = document.getElementById("menu-products");
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                      });
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-primary text-primary-foreground text-sm font-medium cursor-pointer"
                  >
                    Browse menu
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                displayRows.map((row) => {
                  if (row.kind === "offer") {
                    return (
                      <div
                        key={row.key}
                        className="flex gap-3 p-3 rounded-2xl bg-surface/50 border border-border"
                      >
                        <div className="h-16 w-16 rounded-xl overflow-hidden bg-surface shrink-0 relative">
                          {row.src ? (
                            <img src={row.src} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full grid place-items-center">
                              <Tag className="h-6 w-6 text-primary" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                                Offer
                              </p>
                              <h4 className="font-semibold text-sm truncate">{row.title}</h4>
                              {row.includedItems.length ? (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Includes: {row.includedItems.join(", ")}
                                </p>
                              ) : null}
                            </div>
                            <button
                              onClick={() => removeOfferGroup(row.memberIds)}
                              className="h-8 w-8 rounded-full hover:bg-red-500/10 text-muted-foreground hover:text-red-500 flex items-center justify-center shrink-0 cursor-pointer"
                              aria-label={`Remove ${row.title}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-bold">
                              {row.currency}
                              {formatAmount(row.lineTotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const item = row.item;
                  const isOffer = Boolean(item.offerBundle);
                  const addonUnitTotal = (item.selectedAddons || []).reduce(
                    (sum, addon) => sum + addon.price * (addon.quantity || 1),
                    0,
                  );
                  const productPrice =
                    item.productPrice ??
                    Math.max(0, item.price - addonUnitTotal - (item.selectedDrink?.price || 0));
                  return (
                    <div
                      key={item.id}
                      className="flex gap-3 p-3 rounded-2xl bg-surface/50 border border-border"
                    >
                      <div className="h-16 w-16 rounded-xl overflow-hidden bg-surface shrink-0">
                        {item.src ? (
                          <img src={item.src} alt="" className="h-full w-full object-cover" />
                        ) : isOffer ? (
                          <div className="h-full w-full grid place-items-center">
                            <Tag className="h-6 w-6 text-primary" />
                          </div>
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            {isOffer ? (
                              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                                Offer
                              </p>
                            ) : null}
                            <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                            {item.includedItems?.length ? (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Includes: {item.includedItems.join(", ")}
                              </p>
                            ) : null}
                            {!isOffer ? (
                              <div className="mt-1 space-y-0.5">
                                <div className="flex justify-between gap-2 text-xs text-muted-foreground">
                                  <span>{item.productLabel || item.name}</span>
                                  <span className="shrink-0 tabular-nums">
                                    {item.currency}
                                    {formatAmount(productPrice * item.quantity)}
                                  </span>
                                </div>
                                {item.selectedDrink ? (
                                  <div className="flex justify-between gap-2 text-xs text-muted-foreground">
                                    <span>
                                      {item.selectedDrink.name}
                                      {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                                    </span>
                                    <span className="shrink-0 tabular-nums">
                                      {item.currency}
                                      {formatAmount(item.selectedDrink.price * item.quantity)}
                                    </span>
                                  </div>
                                ) : null}
                              </div>
                            ) : null}
                            {item.selectedAddons?.length ? (
                              <div className="mt-1 space-y-0.5">
                                {item.selectedAddons.map((addon) => (
                                  <div
                                    key={addon.id}
                                    className="flex justify-between gap-2 text-xs text-muted-foreground"
                                  >
                                    <span>
                                      {addon.name}
                                      {(addon.quantity || 1) * item.quantity > 1
                                        ? ` × ${(addon.quantity || 1) * item.quantity}`
                                        : ""}
                                    </span>
                                    <span className="shrink-0 tabular-nums">
                                      {item.currency}
                                      {formatAmount(addon.price * (addon.quantity || 1) * item.quantity)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : item.addons?.length ? (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Extras: {item.addons.join(", ")}
                              </p>
                            ) : null}
                            {item.specialInstructions && !isOffer ? (
                              <p className="text-xs text-muted-foreground mt-0.5 flex items-start gap-1">
                                <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                                <span>{item.specialInstructions}</span>
                              </p>
                            ) : null}
                          </div>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="h-8 w-8 rounded-full hover:bg-red-500/10 text-muted-foreground hover:text-red-500 flex items-center justify-center shrink-0 cursor-pointer"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-bold">
                            {item.currency}
                            {formatAmount(item.price * item.quantity)}
                          </span>
                          {!isOffer ? (
                            <div className="flex items-center gap-1 bg-card rounded-full border border-border p-0.5">
                              <button
                                onClick={() =>
                                  onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
                                }
                                className="h-7 w-7 rounded-full hover:bg-primary/10 flex items-center justify-center cursor-pointer"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-7 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                className="h-7 w-7 rounded-full hover:bg-primary/10 flex items-center justify-center cursor-pointer"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {items.length > 0 && (
              <div className="sticky bottom-0 p-5 border-t border-border bg-card/95 backdrop-blur space-y-3">
                <div className="flex justify-between text-sm font-bold">
                  <span>Subtotal</span>
                  <span className="text-primary">
                    {currency}
                    {formatAmount(subtotal)}
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-full bg-gradient-primary text-primary-foreground font-medium shadow-glow disabled:opacity-70 cursor-pointer"
                >
                  <CreditCard className="h-4 w-4" />
                  {isCheckingOut ? "Opening checkout…" : "Checkout"}
                </button>

                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Truck className="h-3 w-3" /> Delivery & totals at checkout
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 30–40 min
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
