import { motion } from "motion/react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Menu,
  X,
  Phone,
  MapPin,
  ShoppingCart,
  Search,
  ChevronDown,
} from "lucide-react";
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
  { label: "Biryani menu", href: "#menu-products" },
  { label: "Reviews", href: "#reviews" },
];

/*
  Palette, straight from the pot
  --dn-deg      #3A0F0A  birista-brown / dark deg copper
  --dn-deg-2    #5A1A10  lifted brown for chips and hover
  --dn-zafran   #F29C1F  saffron rice
  --dn-zarda    #E4571B  orange zarda grains / chilli
  --dn-malai    #FFF1D0  cream, like basmati and raita
  --dn-pudina   #7FB069  mint and coriander green
*/
/* ---------- Clip art (original inline SVGs, no image files needed) ---------- */
function Handi({ steam = true, className = "" }: { steam?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 80 72" className={`dn-clip ${className}`} aria-hidden="true">
      {steam && (
        <g className="dn-steam" fill="none" stroke="#FFF1D0" strokeWidth="2.6" strokeLinecap="round">
          <path d="M28 21c-4-5 4-8 0-14" />
          <path d="M40 19c-4-5 4-8 0-14" />
          <path d="M52 21c-4-5 4-8 0-14" />
        </g>
      )}
      <circle cx="40" cy="26" r="3.6" fill="#F29C1F" />
      <path d="M18 38c0-9 10-12 22-12s22 3 22 12z" fill="#C8651B" />
      <rect x="13" y="36" width="54" height="7" rx="3.5" fill="#F29C1F" />
      {[20, 28, 36, 44, 52, 60].map((x) => (
        <circle key={x} cx={x} cy="39.5" r="1.2" fill="#3A0F0A" />
      ))}
      <path d="M17 43h46c0 14-8 24-23 24S17 57 17 43z" fill="#B5541A" />
      <circle cx="11" cy="47" r="4" fill="none" stroke="#F29C1F" strokeWidth="3" />
      <circle cx="69" cy="47" r="4" fill="none" stroke="#F29C1F" strokeWidth="3" />
      <path d="M24 49c1 7 4 11 8 13" stroke="#F6B04A" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".6" />
    </svg>
  );
}

function Chili({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={`dn-clip ${className}`} aria-hidden="true">
      <path d="M10 52C18 32 32 22 50 20" fill="none" stroke="#D7261E" strokeWidth="10" strokeLinecap="round" />
      <path d="M14 46C22 33 33 26 46 23" fill="none" stroke="#F0554A" strokeWidth="2" strokeLinecap="round" opacity=".7" />
      <path d="M52 19l6-8" fill="none" stroke="#7FB069" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function Lemon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 44" className={`dn-clip ${className}`} aria-hidden="true">
      <path d="M6 38a26 26 0 0 1 52 0z" fill="#F2D64B" />
      <path d="M11 38a21 21 0 0 1 42 0z" fill="#FFF3A8" />
      <g stroke="#F2D64B" strokeWidth="1.6" strokeLinecap="round">
        <path d="M32 38V17M32 38L12.3 30.8M32 38L24.8 18.3M32 38L39.2 18.3M32 38L51.7 30.8" />
      </g>
    </svg>
  );
}

function Mint({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={`dn-clip ${className}`} aria-hidden="true">
      <path d="M8 44C8 24 24 10 46 10c0 22-12 36-38 34z" fill="#7FB069" />
      <path d="M12 42C20 30 30 22 42 14" fill="none" stroke="#4E8A45" strokeWidth="2" strokeLinecap="round" />
      <path d="M34 56C32 44 40 34 56 32c2 14-6 24-22 24z" fill="#5E9A55" />
    </svg>
  );
}

function StarAnise({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={`dn-clip ${className}`} aria-hidden="true">
      <g fill="#A4501F">
        {[0, 45, 90, 135].map((a) => (
          <ellipse key={a} cx="32" cy="32" rx="6.5" ry="26" transform={`rotate(${a} 32 32)`} />
        ))}
      </g>
      <circle cx="32" cy="32" r="7" fill="#5A1A10" />
      <circle cx="32" cy="32" r="2.5" fill="#F29C1F" />
    </svg>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Yatra+One&family=Hind:wght@400;500;600&display=swap');

.dn-header {
  --dn-deg: #3A0F0A;
  --dn-deg-2: #5A1A10;
  --dn-zafran: #F29C1F;
  --dn-zarda: #E4571B;
  --dn-malai: #FFF1D0;
  --dn-pudina: #7FB069;
  background: var(--dn-deg);
  color: var(--dn-malai);
  font-family: 'Hind', system-ui, sans-serif;
  border-bottom: 2px solid var(--dn-zafran);
}

.dn-display { font-family: 'Yatra One', 'Hind', serif; letter-spacing: 0.01em; }

/* The one memorable thing: a stripe of zarda rice, saffron, orange, cream and mint grains */
.dn-lattice {
  height: 10px;
  background:
    repeating-linear-gradient(115deg,
      var(--dn-zafran) 0 7px, transparent 7px 10px,
      var(--dn-malai) 10px 16px, transparent 16px 19px,
      var(--dn-zarda) 19px 25px, transparent 25px 28px,
      var(--dn-pudina) 28px 32px, transparent 32px 35px),
    var(--dn-deg-2);
}

/* Logo is the deg lid: saffron rim, a dotted ring of rivets outside it (the dum seal) */
.dn-thali {
  border: 3px solid var(--dn-zafran);
  outline: 3px dotted var(--dn-zafran);
  outline-offset: 3px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
}

.dn-chip {
  display: inline-flex; align-items: center; gap: 0.375rem;
  height: 2rem; padding: 0 0.75rem; border-radius: 9999px;
  font-size: 0.75rem; font-weight: 500; color: var(--dn-malai);
  background: var(--dn-deg-2);
  border: 1px solid color-mix(in srgb, var(--dn-zafran) 45%, transparent);
  transition: background-color .15s, border-color .15s;
}
.dn-chip:hover { background: #722212; border-color: var(--dn-zafran); }
.dn-chip:focus-visible, .dn-cart:focus-visible, .dn-icon-btn:focus-visible,
.dn-input:focus-visible, .dn-link:focus-visible, .dn-mlink:focus-visible {
  outline: 2px solid var(--dn-zafran); outline-offset: 2px;
}

.dn-input {
  background: var(--dn-malai); color: var(--dn-deg);
  border: 1px solid var(--dn-zafran); border-radius: 9999px;
  padding: 0 0.85rem; font-size: 0.75rem; font-weight: 500;
}
.dn-input::placeholder { color: color-mix(in srgb, var(--dn-deg) 50%, transparent); }

.dn-cart {
  background: var(--dn-zafran); color: var(--dn-deg);
  font-family: 'Yatra One', serif; font-size: 0.9rem;
  box-shadow: 0 0 0 2px var(--dn-deg), 0 0 0 3.5px var(--dn-zafran);
  transition: transform .15s;
}
.dn-cart:hover { transform: scale(1.04); }
.dn-cart:active { transform: scale(0.97); }

.dn-icon-btn {
  background: var(--dn-deg-2); color: var(--dn-malai);
  border: 1px solid color-mix(in srgb, var(--dn-zafran) 45%, transparent);
}

/* Desktop links: a saffron diamond marks the current section */
.dn-link {
  position: relative; padding: 0.35rem 1rem;
  font-family: 'Yatra One', serif; font-size: 1rem;
  color: color-mix(in srgb, var(--dn-malai) 75%, transparent);
  transition: color .15s;
}
.dn-link:hover { color: var(--dn-zafran); }
.dn-link[data-active="true"] { color: var(--dn-zafran); }
.dn-link[data-active="true"]::before,
.dn-link[data-active="true"]::after {
  content: ""; position: absolute; top: 50%; width: 6px; height: 6px;
  background: var(--dn-zafran); transform: translateY(-50%) rotate(45deg);
}
.dn-link[data-active="true"]::before { left: 0; }
.dn-link[data-active="true"]::after { right: 0; }

/* Mobile drawer reads like a menu card */
.dn-drawer { background: var(--dn-malai); color: var(--dn-deg); border-top: 2px solid var(--dn-zafran); }
.dn-mlink {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.8rem 0.75rem; border-radius: 0.5rem;
  font-family: 'Yatra One', serif; font-size: 1.05rem; color: var(--dn-deg);
  border-bottom: 1px dashed color-mix(in srgb, var(--dn-deg) 25%, transparent);
}
.dn-mlink[data-active="true"] { background: var(--dn-deg); color: var(--dn-zafran); }

/* Clip art */
.dn-clip { display: block; filter: drop-shadow(0 2px 2px rgba(0,0,0,.35)); }
.dn-steam path { animation: dn-rise 3.2s ease-in-out infinite; transform-origin: center; }
.dn-steam path:nth-child(2) { animation-delay: .5s; }
.dn-steam path:nth-child(3) { animation-delay: 1s; }
@keyframes dn-rise {
  0%   { opacity: 0;   transform: translateY(4px); }
  40%  { opacity: .9; }
  100% { opacity: 0;   transform: translateY(-5px); }
}

@media (prefers-reduced-motion: reduce) {
  .dn-steam path { animation: none; opacity: .7; }
  .dn-cart, .dn-chip, .dn-link { transition: none; }
}
`;

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

  /* Active section / hash */
  useEffect(() => {
    const syncHash = () => {
      setActiveHash(window.location.hash || "#menu-products");
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  /* Branch */
  useEffect(() => {
    const syncBranch = () => {
      const stored = getStoredDeliveryLocation();
      if (stored?.type === "delivery" && stored.areaName) {
        setBranchLabel(stored.areaName);
      } else {
        setBranchLabel(stored?.branchName || "Select branch");
      }
    };
    syncBranch();
    window.addEventListener("branch-selected", syncBranch);
    return () => window.removeEventListener("branch-selected", syncBranch);
  }, [selectedBranchId]);

  /* Phone */
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
    navigate({
      to: "/track/$orderId",
      params: { orderId: id },
      search: {},
    } as any);
  };

  return (
    <>
      <style>{styles}</style>

      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="dn-header fixed top-0 inset-x-0 z-50"
      >
        {/* Zarda rice stripe */}
        <div className="dn-lattice" aria-hidden="true" />

        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-4">
          <div className="relative flex items-center justify-between gap-2 sm:gap-3 h-16 sm:h-[4.5rem]">
            {/* LEFT: phone + branch */}
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
              {phone ? (
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="dn-chip hidden sm:inline-flex shrink-0"
                >
                  <Phone className="h-3.5 w-3.5" style={{ color: "var(--dn-zafran)" }} />
                  <span>{phone}</span>
                </a>
              ) : null}

              <button
                type="button"
                onClick={openBranchPicker}
                title="Change branch"
                className="dn-chip max-w-[8.5rem] sm:max-w-[14rem] shrink-0 cursor-pointer"
              >
                <MapPin
                  className="h-3.5 w-3.5 shrink-0"
                  style={{ color: "var(--dn-zafran)" }}
                />
                <span className="truncate">{branchLabel}</span>
                <ChevronDown className="h-3 w-3 shrink-0 opacity-70" />
              </button>
            </div>

            {/* CENTER: logo as the deg lid */}
            <div className="absolute left-1/2 -translate-x-1/2 z-20">
              <Link to="/" className="flex items-center justify-center" aria-label="Studio 7teas home">
                <div className="dn-thali h-12 w-12 sm:h-[62px] sm:w-[62px] lg:h-[70px] lg:w-[70px] rounded-full flex items-center justify-center overflow-hidden">
                  <img
                    src={logo}
                    alt="Studio 7teas"
                    className="h-full w-full object-cover"
                  />
                </div>
              </Link>
            </div>

            {/* CLIP ART flanking the logo (wide screens) */}
            <div className="pointer-events-none absolute right-1/2 mr-[58px] top-1/2 -translate-y-1/2 hidden xl:flex items-end gap-3" aria-hidden="true">
              <StarAnise className="h-7 w-7 -rotate-12" />
              <Handi className="h-14 w-14" />
            </div>
            <div className="pointer-events-none absolute left-1/2 ml-[58px] top-1/2 -translate-y-1/2 hidden xl:flex items-end gap-3" aria-hidden="true">
              <Chili className="h-10 w-10" />
              <Lemon className="h-8 w-9" />
              <Mint className="h-9 w-9 -rotate-6" />
            </div>

            {/* RIGHT: track, cart, menu */}
            <div className="flex items-center justify-end gap-1.5 sm:gap-2 ml-auto flex-1">
              <div className="hidden lg:flex items-center gap-2 mr-1">
                <input
                  type="text"
                  aria-label="Order ID"
                  placeholder="Order ID, e.g. K7M2XP"
                  value={trackOrderId}
                  onChange={(e) => setTrackOrderId(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleTrackOrder()}
                  className="dn-input h-8 w-44"
                />
                <button onClick={handleTrackOrder} className="dn-chip cursor-pointer">
                  <Search className="h-3.5 w-3.5" />
                  Track
                </button>
              </div>

              <button
                onClick={() => setIsCartOpen(true)}
                aria-label="Open cart"
                className="dn-cart relative inline-flex items-center justify-center gap-2 h-9 w-9 sm:w-auto sm:px-4 rounded-full cursor-pointer"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Cart</span>

                {totalItems > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
                    style={{
                      background: "var(--dn-malai)",
                      color: "var(--dn-deg)",
                      border: "1.5px solid var(--dn-deg)",
                    }}
                  >
                    {totalItems}
                  </span>
                )}
              </button>

              <button
                onClick={() => setOpen((v) => !v)}
                className="dn-icon-btn md:hidden grid place-items-center h-9 w-9 rounded-full cursor-pointer"
                aria-label="Toggle menu"
                aria-expanded={open}
              >
                {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* DESKTOP NAV (kept commented out, as in your version) */}
          {/*           <nav
            aria-label="Page sections"
            className="hidden md:flex items-center justify-center gap-3 pb-2.5 pt-1"
          >
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                data-active={activeHash === l.href}
                aria-current={activeHash === l.href ? "location" : undefined}
                className="dn-link"
              >
                {l.label}
              </a>
            ))}
          </nav> */}
        </div>

        {/* MOBILE MENU */}
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="dn-drawer md:hidden shadow-lg"
          >
            <nav className="flex flex-col p-3 sm:p-4 gap-0.5">
              <button
                type="button"
                onClick={openBranchPicker}
                className="dn-mlink text-left cursor-pointer"
                style={{ background: "color-mix(in srgb, var(--dn-zafran) 28%, transparent)" }}
              >
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">Change branch · {branchLabel}</span>
                <ChevronDown className="h-3.5 w-3.5 ml-auto shrink-0" />
              </button>

              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  data-active={activeHash === l.href}
                  className="dn-mlink"
                >
                  {l.label}
                </a>
              ))}

              <div className="flex gap-2 pt-3 pb-1">
                <input
                  type="text"
                  aria-label="Order ID"
                  placeholder="Enter order ID"
                  value={trackOrderId}
                  onChange={(e) => setTrackOrderId(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleTrackOrder()}
                  className="dn-input flex-1 h-10 min-w-0 text-sm"
                  style={{ background: "#fff", borderColor: "var(--dn-deg)" }}
                />
                <button
                  onClick={handleTrackOrder}
                  className="h-10 px-4 rounded-full text-sm font-medium cursor-pointer shrink-0 inline-flex items-center gap-1.5"
                  style={{ background: "var(--dn-deg)", color: "var(--dn-zafran)" }}
                >
                  <Search className="h-4 w-4" />
                  Track
                </button>
              </div>

              {phone && (
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  onClick={() => setOpen(false)}
                  className="dn-mlink sm:hidden"
                  style={{ borderBottom: "none" }}
                >
                  <Phone className="h-4 w-4" />
                  <span>{phone}</span>
                </a>
              )}
            </nav>
            <div className="dn-lattice" aria-hidden="true" />
          </motion.div>
        )}
        {/* Garnish hanging under the header (smaller screens) */}
        <div className="pointer-events-none absolute top-full inset-x-0 flex justify-between px-3 sm:px-6 xl:hidden" aria-hidden="true">
          <div className="flex items-start gap-2">
            <Handi steam={false} className="h-9 w-9 -mt-0.5" />
            <Chili className="hidden sm:block h-7 w-7 mt-1" />
          </div>
          <div className="flex items-start gap-2">
            <Mint className="hidden sm:block h-7 w-7 mt-1 -rotate-6" />
            <Lemon className="h-6 w-7 mt-1" />
          </div>
        </div>
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