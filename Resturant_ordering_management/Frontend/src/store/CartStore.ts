// store/CartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartAddon = {
  id: string;
  name: string;
  price: number;
  quantity?: number;
};

/** Expanded product lines for BOGO/offer bundles (used at checkout pricing). */
export type OfferBundleLine = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  role: "buy" | "get";
};

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  desc: string;
  price: number;
  productPrice?: number;
  productLabel?: string;
  currency: string;
  quantity: number;
  src: string;
  /** Paid extras (addon names) */
  addons?: string[];
  /** Bundle contents already covered by deal/product price */
  includedItems?: string[];
  selectedAddons?: CartAddon[];
  selectedDrink?: { name: string; price: number };
  specialInstructions?: string;
  /** When set, cart shows one deal line; checkout expands to these products */
  offerBundle?: {
    offerId: string;
    offerTitle: string;
    lines: OfferBundleLine[];
  };
};

type CartStore = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity" | "id"> & { id?: string; quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

function buildLineId(item: {
  productId: string;
  selectedAddons?: CartAddon[];
  specialInstructions?: string;
  offerBundle?: CartItem["offerBundle"];
}) {
  if (item.offerBundle?.offerId) {
    const lineKey = item.offerBundle.lines
      .map((l) => `${l.role}:${l.productId}x${l.qty}`)
      .sort()
      .join(",");
    return `offer:${item.offerBundle.offerId}|${lineKey}`;
  }
  const addonKey = (item.selectedAddons || [])
    .map((a) => `${a.id}x${a.quantity || 1}`)
    .sort()
    .join(",");
  const note = item.specialInstructions?.trim() || "";
  return `${item.productId}|${addonKey}|${note}`;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const productId = item.productId || item.id || "";
          const lineId = item.id || buildLineId({ ...item, productId });
          const quantity = item.quantity || 1;
          const existing = state.items.find((i) => i.id === lineId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === lineId ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                ...item,
                id: lineId,
                productId,
                quantity,
              },
            ],
          };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
    }
  )
);
