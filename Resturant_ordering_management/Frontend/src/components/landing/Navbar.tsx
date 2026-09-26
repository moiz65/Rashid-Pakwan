import { motion } from "motion/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X, Phone, MapPin, ShoppingCart, Search, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import logo from "@/assets/main_logo.png";
import { Cart } from "./Cart";
import { DeliveryPopup } from "./DeliveryPopup";
import { useCartStore } from "../../store/CartStore";
import { getStoredDeliveryLocation } from "@/lib/branchSelection";
import { useMenuStore } from "@/store/MenuStore";
import { fetchTrackingSettings } from "@/lib/api";

const links = [
  { label: "Deals", href: "#deals" },
  { label: "Offers", href: "#offers" },
  { label: "Menu", href: "#menu-products" },
  { label: "Reviews", href: "#reviews" },
];

export function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [trackOrderId, setTrackOrderId] = useState("");
  const [activeHash, setActiveHash] = useState("");
  const [branchLabel, setBranchLabel] = useState("Select branch");
  const [phone, setPhone] = useState("");
  const { items, updateQuantity, removeItem } = useCartStore();
  const selectedBranchId = useMenuStore((s) => s.selectedBranchId);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash || "#menu-products");
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    const syncBranch = () => {
      const stored = getStoredDeliveryLocation();
      if (stored?.type === "delivery" && stored.areaName) {
        setBranchLabel(`${stored.areaName}`);
      } else {
        setBranchLabel(stored?.branchName || "Select branch");
      }
    };
    syncBranch();
    window.addEventListener("branch-selected", syncBranch);
    return () => window.removeEventListener("branch-selected", syncBranch);
  }, [selectedBranchId]);

  useEffect(() => {
    let active = true;
    fetchTrackingSettings()
      .then((s) => {
        if (active && s.phone?.trim()) setPhone(s.phone.trim());
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const openBranchPicker = () => {
    setOpen(false);
    window.dispatchEvent(new Event("open-branch-picker"));
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate({ to: "/checkout" });
  };

  const handleTrackOrder = () => {
    const id = trackOrderId.trim().replace(/^#/, "").toUpperCase();
    if (!id) return;
    setOpen(false);
    navigate({ to: "/track/$orderId", params: { orderId: id }, search: {} } as any);
  };

  const navLinkClass = (href: string) =>
    `px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
      activeHash === href
        ? "bg-primary/15 text-primary"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
    }`;

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/90 border-b border-border/60"
      >
        <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-3 relative">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {phone ? (
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20 shrink-0"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {phone}
                </a>
              ) : null}
              <button
                type="button"
                onClick={openBranchPicker}
                className="inline-flex items-center gap-1.5 h-8 max-w-[11rem] sm:max-w-[14rem] px-3 rounded-full bg-surface text-foreground text-xs border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer shrink-0"
                title="Change branch"
              >
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate font-medium">{branchLabel}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
              </button>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 shrink-0">
              <Link to="/" className="flex items-center justify-center">
                <div className="h-14 w-14 sm:h-[80px] sm:w-[80px] rounded-full bg-white flex items-center justify-center shadow-[0_0_18px_0_#96000280] overflow-hidden">
                  <img src={logo} alt="Studio 7teas" className="h-11 w-11 sm:h-[150px] sm:w-[150px] object-contain" />
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-2 ml-auto flex-1 justify-end">
              <div className="hidden lg:flex items-center gap-2 mr-1">
                <input
                  type="text"
                  placeholder="e.g. K7M2XP"
                  value={trackOrderId}
                  onChange={(e) => setTrackOrderId(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleTrackOrder()}
                  className="h-8 w-32 rounded-full border border-border bg-surface px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={handleTrackOrder}
                  className="inline-flex items-center gap-1 h-8 px-3 rounded-full border border-border bg-surface hover:bg-primary/10 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Search className="h-3.5 w-3.5" />
                  Track
                </button>
              </div>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative inline-flex items-center gap-2 h-9 px-3 sm:px-4 rounded-full bg-gradient-primary text-primary-foreground text-sm font-medium shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Cart</span>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              <button
                onClick={() => setOpen((v) => !v)}
                className="md:hidden grid place-items-center h-9 w-9 rounded-full border border-border bg-surface cursor-pointer"
                aria-label="Toggle menu"
              >
                {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <nav
            aria-label="Page sections"
            className="hidden md:flex items-center justify-center gap-1 pt-5 pb-3 -mt-1 border-t border-border/50 pt-2"
          >
            {links.map((l) => (
              <a key={l.href} href={l.href} className={navLinkClass(l.href)}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>

        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl"
          >
            <nav className="flex flex-col p-4 gap-1">
              <button
                type="button"
                onClick={openBranchPicker}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left bg-primary/5 text-primary font-medium cursor-pointer"
              >
                <MapPin className="h-4 w-4" />
                Change branch · {branchLabel}
              </button>
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    activeHash === l.href
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-card hover:text-foreground"
                  }`}
                >
                  {l.label}
                </a>
              ))}
              <div className="px-3 py-2 flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. K7M2XP"
                  value={trackOrderId}
                  onChange={(e) => setTrackOrderId(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleTrackOrder()}
                  className="flex-1 h-10 rounded-lg border border-border bg-surface px-3 text-sm"
                />
                <button
                  onClick={handleTrackOrder}
                  className="h-10 px-4 rounded-lg bg-primary/10 text-primary text-sm font-medium cursor-pointer"
                >
                  Track
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </motion.header>

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={handleCheckout}
      />
      <DeliveryPopup />
    </>
  );
}
