import { motion, AnimatePresence } from "motion/react";
import { Plus, Star, Minus, X, ShoppingBag, Utensils, Tag } from "lucide-react";
import { SectionHeader } from "./HotDeals";
import { Skeleton } from "../ui/skeleton";
import { useState } from "react";
import { useCartStore } from "../../store/CartStore";
import { useMenuStore } from "@/store/MenuStore";
import { resolveMediaUrl, type DisplayProduct, type MenuAddon, type MenuDrink, type ProductVariation } from "@/lib/api";
import { formatAmount, formatPrice } from "@/lib/formatters";

type ProductSectionProps = {
  title?: string;
  eyebrow?: string;
  subtitle?: string;
  products: DisplayProduct[];
  loading?: boolean;
  emptyMessage?: string;
  showHeader?: boolean;
  /** Optional drink picker in the product modal (offers). */
  enableDrinks?: boolean;
};

export function ProductSection({
  title = "Popular Items",
  eyebrow = "Featured",
  subtitle = "Hand-picked favorites trending this week.",
  products,
  loading = false,
  emptyMessage = "No items available right now.",
  showHeader = true,
  enableDrinks = false,
}: ProductSectionProps) {
  const [selectedProduct, setSelectedProduct] = useState<DisplayProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({});
  const [selectedVariationId, setSelectedVariationId] = useState("");
  const [selectedDrinkId, setSelectedDrinkId] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const { addItem } = useCartStore();
  const menuDrinks = useMenuStore((s) => s.drinks);

  const availableAddons: MenuAddon[] = selectedProduct?.addons || [];
  const variations: ProductVariation[] = Array.isArray(selectedProduct?.variations)
    ? selectedProduct!.variations!
    : [];
  const selectedVariation =
    variations.find((v) => v.id === selectedVariationId) || variations[0] || null;
  const drinkOptions: MenuDrink[] = enableDrinks
    ? [...menuDrinks]
        .filter((d) => d.status !== "inactive")
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    : [];
  const selectedDrink = drinkOptions.find((d) => d.id === selectedDrinkId) || null;

  const openPopup = (product: DisplayProduct, variationId?: string) => {
    setSelectedProduct(product);
    setQuantity(1);
    setSpecialInstructions("");
    setSelectedAddons({});
    setSelectedVariationId(variationId || product.variations?.[0]?.id || "");
    setSelectedDrinkId("");
    setShowSuccess(false);
    document.body.style.overflow = "hidden";
  };

  const closePopup = () => {
    setSelectedProduct(null);
    document.body.style.overflow = "auto";
  };

  const changeAddonQuantity = (addonId: string, change: number) => {
    setSelectedAddons((prev) => {
      const nextQuantity = (prev[addonId] || 0) + change;
      const next = { ...prev };
      if (nextQuantity <= 0) delete next[addonId];
      else next[addonId] = nextQuantity;
      return next;
    });
  };

  const getProductUnitPrice = () => {
    if (!selectedProduct) return 0;
    let basePrice = selectedProduct.price;
    let salePrice = selectedProduct.discountedPrice;
    if (selectedVariation) {
      basePrice = Number(selectedVariation.price || 0);
      const varSale = selectedVariation.discountedPrice;
      salePrice =
        varSale != null && Number(varSale) > 0 && Number(varSale) < basePrice
          ? Number(varSale)
          : undefined;
    }
    const hasDiscount =
      salePrice != null && salePrice > 0 && salePrice < basePrice;
    return hasDiscount ? salePrice! : basePrice;
  };

  const getUnitPrice = () => {
    if (!selectedProduct) return 0;
    const addonsTotal = availableAddons
      .reduce((sum, addon) => sum + addon.price * (selectedAddons[addon.id] || 0), 0);
    const drinkPrice = selectedDrink ? Number(selectedDrink.price || 0) : 0;
    return getProductUnitPrice() + addonsTotal + drinkPrice;
  };

  const getOriginalTotalPrice = () => {
    if (!selectedProduct) return 0;
    const basePrice = selectedVariation
      ? Number(selectedVariation.price || 0)
      : selectedProduct.price;
    const addonsTotal = availableAddons
      .reduce((sum, addon) => sum + addon.price * (selectedAddons[addon.id] || 0), 0);
    const drinkPrice = selectedDrink ? Number(selectedDrink.price || 0) : 0;
    return (basePrice + addonsTotal + drinkPrice) * quantity;
  };

  const getTotalPrice = () => getUnitPrice() * quantity;

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    const chosen = availableAddons
      .filter((addon) => (selectedAddons[addon.id] || 0) > 0)
      .map((addon) => ({
        ...addon,
        quantity: selectedAddons[addon.id],
      }));
    const addonNames = chosen.map(
      (addon) => `${addon.name}${addon.quantity > 1 ? ` × ${addon.quantity}` : ""}`,
    );
    const drinkNote = selectedDrink ? `Drink: ${selectedDrink.name}` : null;
    const variationNote = selectedVariation ? `Size: ${selectedVariation.name}` : null;
    const notes = [specialInstructions.trim(), variationNote, drinkNote].filter(Boolean).join(" · ");

    const displayName = selectedVariation
      ? `${selectedProduct.name} (${selectedVariation.name})`
      : selectedProduct.name;

    addItem({
      productId: selectedProduct.id,
      name: selectedDrink ? `${displayName} + ${selectedDrink.name}` : displayName,
      desc: selectedProduct.desc,
      price: getUnitPrice(),
      productPrice: getProductUnitPrice(),
      productLabel: displayName,
      currency: selectedProduct.currency,
      src: selectedProduct.src,
      addons: addonNames,
      selectedAddons: chosen,
      selectedDrink: selectedDrink
        ? { name: selectedDrink.name, price: Number(selectedDrink.price || 0) }
        : undefined,
      specialInstructions: notes || undefined,
      quantity,
    });

    setShowSuccess(true);
    setTimeout(() => closePopup(), 1200);
  };

  return (
    <>
      <section className={showHeader ? "py-10 lg:py-14" : "py-4 lg:py-6"}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {showHeader && <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />}
          {/* TWO COLUMN LIST */}
          <div className={`${showHeader ? "mt-10" : "mt-4"} grid grid-cols-1 sm:grid-cols-2 gap-4`}>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)
              : products.length === 0
                ? (
                  emptyMessage ? (
                    <p className="col-span-full text-center text-muted-foreground py-12">{emptyMessage}</p>
                  ) : null
                )
                : products.map((p, i) => (
                    <ProductCard
                      key={p.id}
                      p={p}
                      i={i}
                      onAddToCart={(variationId) => openPopup(p, variationId)}
                    />
                  ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closePopup}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-card rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-border shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closePopup}
                className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="grid md:grid-cols-2 gap-6 p-6">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-surface to-card border border-border">
                  {selectedProduct.src ? (
                    <img
                      src={selectedProduct.src}
                      alt={selectedProduct.name}
                      className="h-full w-full object-contain"
                    />
                  ) : null}
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{selectedProduct.desc}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-primary">
                      {selectedProduct.currency}
                      {formatAmount(getTotalPrice())}
                    </span>
                    {((selectedVariation
                      ? selectedVariation.discountedPrice != null &&
                        Number(selectedVariation.discountedPrice) > 0 &&
                        Number(selectedVariation.discountedPrice) < Number(selectedVariation.price)
                      : selectedProduct.discountedPrice != null &&
                        selectedProduct.discountedPrice > 0 &&
                        selectedProduct.discountedPrice < selectedProduct.price)) && (
                        <span className="text-sm font-semibold text-red-500 line-through decoration-red-500/80 decoration-2">
                          {selectedProduct.currency}
                          {formatAmount(getOriginalTotalPrice())}
                        </span>
                      )}
                  </div>

                  {variations.length > 0 && (
                    <div className="border-t border-border pt-4">
                      <h3 className="text-sm font-semibold mb-3">Choose size</h3>
                      <div className="space-y-2">
                        {variations.map((v) => {
                          const checked =
                            (selectedVariationId || variations[0]?.id) === v.id;
                          const sale =
                            v.discountedPrice != null &&
                            Number(v.discountedPrice) > 0 &&
                            Number(v.discountedPrice) < Number(v.price)
                              ? Number(v.discountedPrice)
                              : null;
                          return (
                            <label
                              key={v.id}
                              className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/50 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="product-variation"
                                  checked={checked}
                                  onChange={() => setSelectedVariationId(v.id)}
                                  className="h-4 w-4 border-border text-primary focus:ring-primary cursor-pointer"
                                />
                                <span className="text-sm font-medium">{v.name}</span>
                              </div>
                              <span className="text-sm font-medium tabular-nums">
                                {sale != null ? (
                                  <>
                                    <span className="text-muted-foreground line-through mr-1.5">
                                      {selectedProduct.currency}
                                      {formatAmount(v.price)}
                                    </span>
                                    {selectedProduct.currency}
                                    {formatAmount(sale)}
                                  </>
                                ) : (
                                  <>
                                    {selectedProduct.currency}
                                    {formatAmount(v.price)}
                                  </>
                                )}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {drinkOptions.length > 0 && (
                    <div className="border-t border-border pt-4">
                      <h3 className="text-sm font-semibold mb-2">Add a drink</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        Optional — pick one to add with this item.
                      </p>
                      <select
                        value={selectedDrinkId}
                        onChange={(e) => setSelectedDrinkId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary"
                      >
                        <option value="">No drink</option>
                        {drinkOptions.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} — {selectedProduct.currency}
                            {formatAmount(d.price || 0)}
                          </option>
                        ))}
                      </select>
                      {selectedDrink?.image ? (
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <img
                            src={resolveMediaUrl(selectedDrink.image)}
                            alt=""
                            className="h-8 w-8 rounded-lg object-cover"
                          />
                          {selectedDrink.name}
                        </div>
                      ) : null}
                    </div>
                  )}

                  {availableAddons.length > 0 && (
                    <div className="border-t border-border pt-4">
                      <h3 className="text-sm font-semibold mb-3">Add-ons</h3>
                      <div className="space-y-2">
                        {availableAddons.map((addon) => (
                          <div
                            key={addon.id}
                            className="flex items-center justify-between p-3 rounded-xl border border-border"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="text-sm">{addon.name}</span>
                            </div>
                            <div className="flex shrink-0 items-center gap-3">
                              <span className="text-sm font-medium tabular-nums">
                                {addon.originalPrice != null &&
                                Number(addon.originalPrice) > Number(addon.price) ? (
                                  <>
                                    <span className="text-muted-foreground line-through mr-1.5">
                                      {selectedProduct.currency}
                                      {formatAmount(addon.originalPrice)}
                                    </span>
                                    {selectedProduct.currency}
                                    {formatAmount(addon.price)}
                                  </>
                                ) : (
                                  <>
                                    {selectedProduct.currency}
                                    {formatAmount(addon.price)}
                                  </>
                                )}
                              </span>
                              <div className="flex items-center gap-1 rounded-full border border-border bg-card p-0.5">
                                <button
                                  type="button"
                                  onClick={() => changeAddonQuantity(addon.id, -1)}
                                  disabled={!selectedAddons[addon.id]}
                                  aria-label={`Remove one ${addon.name}`}
                                  className="grid h-7 w-7 place-items-center rounded-full hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-6 text-center text-sm tabular-nums">
                                  {selectedAddons[addon.id] || 0}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => changeAddonQuantity(addon.id, 1)}
                                  aria-label={`Add one ${addon.name}`}
                                  className="grid h-7 w-7 place-items-center rounded-full hover:bg-primary/10"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-border pt-4">
                    <h3 className="text-sm font-semibold mb-2">Special Instructions</h3>
                    <textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="Add any special requests..."
                      className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                      rows={2}
                    />
                  </div>

                  <div className="border-t border-border pt-4 mt-auto">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-surface rounded-full border border-border p-1">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="h-8 w-8 rounded-full hover:bg-primary/10 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center font-medium text-sm">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="h-8 w-8 rounded-full hover:bg-primary/10 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={handleAddToCart}
                        className="flex-1 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-gradient-primary text-primary-foreground font-medium shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        Add to Cart — {selectedProduct.currency}
                        {formatAmount(getTotalPrice())}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {showSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg font-medium text-sm"
                      >
                        Added to cart!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ProductCard({
  p,
  i,
  onAddToCart,
}: {
  p: DisplayProduct;
  i: number;
  onAddToCart: (variationId?: string) => void;
}) {
  // Local variation selection so the price on the card updates live
  const hasVariations = Array.isArray(p.variations) && p.variations.length > 0;
  const [activeVariationId, setActiveVariationId] = useState<string>(
    hasVariations ? p.variations![0].id : ""
  );

  const activeVariation =
    hasVariations ? p.variations!.find((v) => v.id === activeVariationId) || p.variations![0] : null;

  // Effective price — variation price if a variation is active, else product price
  const basePrice = activeVariation ? Number(activeVariation.price || 0) : p.price;
  const varSaleRaw = activeVariation ? activeVariation.discountedPrice : p.discountedPrice;
  const salePrice =
    varSaleRaw != null && Number(varSaleRaw) > 0 && Number(varSaleRaw) < basePrice
      ? Number(varSaleRaw)
      : null;
  const currentPrice = salePrice != null ? salePrice : basePrice;
  const hasDiscount = salePrice != null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.35, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onAddToCart(activeVariation?.id)}
      className="group relative flex items-center gap-4 px-4 py-3 sm:px-5 sm:py-4 rounded-2xl border border-border/60 bg-card hover:bg-surface/60 hover:border-primary/40 transition-colors cursor-pointer"
    >
      {/* Thumbnail — small square */}
      <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-xl overflow-hidden bg-surface border border-border/60">
        {p.src ? (
          <img
            src={p.src}
            alt={p.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full grid place-items-center">
            <Utensils className="h-6 w-6 text-muted-foreground/40" />
          </div>
        )}
        {hasDiscount ? (
          <span className="absolute top-1 left-1 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-primary text-primary-foreground text-[9px] font-bold">
            <Tag className="h-2.5 w-2.5" />
            %
          </span>
        ) : null}
      </div>

      {/* Middle — name + desc + rating + variations */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm sm:text-[15px] leading-snug line-clamp-1 group-hover:text-primary transition-colors">
            {p.name}
          </h3>
          <span className="inline-flex items-center gap-0.5 shrink-0 text-[11px] text-muted-foreground">
            <Star className="h-3 w-3 fill-primary text-primary" />
            {p.rating}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 sm:line-clamp-2 leading-relaxed">
          {p.desc || "Prepared fresh with signature ingredients."}
        </p>

        {/* Variations chips */}
        {hasVariations ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {p.variations!.map((v) => {
              const isActive = v.id === activeVariationId;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveVariationId(v.id);
                  }}
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border/60 hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {v.name}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* Right — price stacked above add button */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <div className="flex items-baseline gap-1.5">
          {hasDiscount ? (
            <span className="text-[10px] text-muted-foreground line-through">
              {p.currency}
              {formatAmount(basePrice)}
            </span>
          ) : null}
          <span className="text-sm font-bold text-foreground tabular-nums">
            {p.currency}
            {formatAmount(currentPrice)}
          </span>
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.06 }}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(activeVariation?.id);
          }}
          aria-label={`Add ${p.name} to cart`}
          className="grid place-items-center h-8 w-8 rounded-full border border-border bg-card text-foreground/70 hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
        >
          <Plus className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}

function ProductSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 sm:px-5 sm:py-4 rounded-2xl border border-border/60 bg-card">
      <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-1.5 pt-0.5">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}