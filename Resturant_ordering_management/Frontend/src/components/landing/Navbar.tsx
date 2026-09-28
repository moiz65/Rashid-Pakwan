
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

  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  /* -----------------------------------------
     Active section / hash
  ----------------------------------------- */
  useEffect(() => {
    const syncHash = () => {
      setActiveHash(window.location.hash || "#menu-products");
    };

    syncHash();

    window.addEventListener("hashchange", syncHash);

    return () => {
      window.removeEventListener("hashchange", syncHash);
    };
  }, []);

  /* -----------------------------------------
     Branch
  ----------------------------------------- */
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

    return () => {
      window.removeEventListener("branch-selected", syncBranch);
    };
  }, [selectedBranchId]);

  /* -----------------------------------------
     Phone
  ----------------------------------------- */
  useEffect(() => {
    let active = true;

    fetchTrackingSettings()
      .then((s) => {
        if (active && s.phone?.trim()) {
          setPhone(s.phone.trim());
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  /* -----------------------------------------
     Open branch picker
  ----------------------------------------- */
  const openBranchPicker = () => {
    setOpen(false);

    window.dispatchEvent(
      new Event("open-branch-picker")
    );
  };

  /* -----------------------------------------
     Checkout
  ----------------------------------------- */
  const handleCheckout = () => {
    setIsCartOpen(false);

    navigate({
      to: "/checkout",
    });
  };

  /* -----------------------------------------
     Track order
  ----------------------------------------- */
  const handleTrackOrder = () => {
    const id = trackOrderId
      .trim()
      .replace(/^#/, "")
      .toUpperCase();

    if (!id) return;

    setOpen(false);

    navigate({
      to: "/track/$orderId",
      params: {
        orderId: id,
      },
      search: {},
    } as any);
  };

  /* -----------------------------------------
     Desktop nav link
  ----------------------------------------- */
  const navLinkClass = (href: string) =>
    `
      px-3
      py-1.5
      rounded-full
      text-sm
      font-medium
      transition-colors

      ${
        activeHash === href
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
      }
    `;

  return (
    <>
      <motion.header
        initial={{
          y: -24,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.4,
          ease: "easeOut",
        }}
        className="
          fixed
          top-0
          inset-x-0
          z-50

          backdrop-blur-xl
          bg-background/90

          border-b
          border-border/60
        "
      >
        {/* =====================================
            MAIN HEADER
        ===================================== */}
        <div
          className="
            mx-auto
            max-w-7xl

            px-3
            sm:px-6
            lg:px-8

            pt-2
            sm:pt-4
            lg:pt-5
          "
        >
          <div
            className="
              relative
              flex
              items-center
              justify-between

              gap-2
              sm:gap-3

              h-14
              sm:h-16
            "
          >
            {/* =================================
                LEFT SIDE
            ================================= */}
            <div
              className="
                flex
                items-center
                gap-1.5
                sm:gap-2

                min-w-0
                flex-1
              "
            >
              {/* Phone - desktop/tablet */}
              {phone ? (
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="
                    hidden
                    sm:inline-flex

                    items-center
                    gap-1.5

                    h-8
                    px-3

                    rounded-full

                    bg-primary/10
                    text-primary

                    text-xs
                    font-medium

                    border
                    border-primary/20

                    shrink-0
                  "
                >
                  <Phone className="h-3.5 w-3.5" />

                  <span>{phone}</span>
                </a>
              ) : null}

              {/* Branch */}
              <button
                type="button"
                onClick={openBranchPicker}
                className="
                  inline-flex
                  items-center
                  gap-1

                  h-8

                  max-w-[8.5rem]
                  sm:max-w-[14rem]

                  px-2
                  sm:px-3

                  rounded-full

                  bg-surface
                  text-foreground

                  text-[11px]
                  sm:text-xs

                  border
                  border-border

                  hover:border-primary/40
                  hover:bg-primary/5

                  transition-colors

                  cursor-pointer
                  shrink-0
                "
                title="Change branch"
              >
                <MapPin
                  className="
                    h-3
                    w-3
                    sm:h-3.5
                    sm:w-3.5

                    text-primary
                    shrink-0
                  "
                />

                <span className="truncate font-medium">
                  {branchLabel}
                </span>

                <ChevronDown
                  className="
                    h-2.5
                    w-2.5
                    sm:h-3
                    sm:w-3

                    text-muted-foreground
                    shrink-0
                  "
                />
              </button>
            </div>

            {/* =================================
                CENTER LOGO
            ================================= */}
            <div
              className="
                absolute
                left-1/2
                -translate-x-1/2

                z-20
              "
            >
              <Link
                to="/"
                className="
                  flex
                  items-center
                  justify-center
                "
              >
                <div
                  className="
                    h-12
                    w-12

                    sm:h-[70px]
                    sm:w-[70px]

                    lg:h-[80px]
                    lg:w-[80px]

                    rounded-full

                    bg-white

                    flex
                    items-center
                    justify-center

                    shadow-[0_0_18px_0_#96000280]

                    overflow-hidden
                  "
                >
                  <img
                    src={logo}
                    alt="Studio 7teas"
                    className="
                      h-12
                      w-12

                      sm:h-[85px]
                      sm:w-[85px]

                      lg:h-[80px]
                      lg:w-[80px]

                      object-cover
                    "
                  />
                </div>
              </Link>
            </div>

            {/* =================================
                RIGHT SIDE
            ================================= */}
            <div
              className="
                flex
                items-center
                justify-end

                gap-1.5
                sm:gap-2

                ml-auto
                flex-1
              "
            >
              {/* Desktop track order */}
              <div
                className="
                  hidden
                  lg:flex

                  items-center
                  gap-2
                  mr-1
                "
              >
                <input
                  type="text"
                  placeholder="e.g. K7M2XP"
                  value={trackOrderId}
                  onChange={(e) =>
                    setTrackOrderId(
                      e.target.value.toUpperCase()
                    )
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    handleTrackOrder()
                  }
                  className="
                    h-8
                    w-32

                    rounded-full

                    border
                    border-border

                    bg-surface

                    px-3

                    text-xs

                    focus:outline-none
                    focus:ring-1
                    focus:ring-primary
                  "
                />

                <button
                  onClick={handleTrackOrder}
                  className="
                    inline-flex
                    items-center
                    gap-1

                    h-8
                    px-3

                    rounded-full

                    border
                    border-border

                    bg-surface

                    hover:bg-primary/10

                    text-xs
                    font-medium

                    transition-colors

                    cursor-pointer
                  "
                >
                  <Search className="h-3.5 w-3.5" />

                  Track
                </button>
              </div>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                aria-label="Open cart"
                className="
                  relative

                  inline-flex
                  items-center
                  justify-center

                  gap-2

                  h-9
                  w-9

                  sm:w-auto
                  sm:px-4

                  rounded-full

                  bg-gradient-primary
                  text-primary-foreground

                  text-sm
                  font-medium

                  shadow-glow

                  hover:scale-[1.02]
                  active:scale-[0.98]

                  transition-transform

                  cursor-pointer
                "
              >
                <ShoppingCart className="h-4 w-4" />

                <span className="hidden sm:inline">
                  Cart
                </span>

                {totalItems > 0 && (
                  <span
                    className="
                      absolute
                      -top-1
                      -right-1

                      h-5
                      w-5

                      rounded-full

                      bg-red-500
                      text-white

                      text-[10px]
                      font-bold

                      flex
                      items-center
                      justify-center
                    "
                  >
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile menu */}
              <button
                onClick={() => setOpen((v) => !v)}
                className="
                  md:hidden

                  grid
                  place-items-center

                  h-9
                  w-9

                  rounded-full

                  border
                  border-border

                  bg-surface

                  cursor-pointer
                "
                aria-label="Toggle menu"
                aria-expanded={open}
              >
                {open ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* =====================================
              DESKTOP NAVIGATION
          ===================================== */}
          <nav
            aria-label="Page sections"
            className="
              hidden
              md:flex

              items-center
              justify-center

              gap-1

              pb-3
              pt-2

              border-t
              border-border/50
            "
          >
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={navLinkClass(l.href)}
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>

        {/* =====================================
            MOBILE MENU
        ===================================== */}
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              y: -8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.2,
            }}
            className="
              md:hidden

              border-t
              border-border

              bg-background/95
              backdrop-blur-xl

              shadow-lg
            "
          >
            <nav
              className="
                flex
                flex-col

                p-3
                sm:p-4

                gap-1
              "
            >
              {/* Branch */}
              <button
                type="button"
                onClick={openBranchPicker}
                className="
                  flex
                  items-center
                  gap-2

                  px-3
                  py-3

                  rounded-lg

                  text-sm
                  text-left

                  bg-primary/5
                  text-primary

                  font-medium

                  cursor-pointer
                "
              >
                <MapPin className="h-4 w-4 shrink-0" />

                <span className="truncate">
                  Change branch · {branchLabel}
                </span>

                <ChevronDown
                  className="
                    h-3.5
                    w-3.5
                    ml-auto
                    shrink-0
                  "
                />
              </button>

              {/* Navigation links */}
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`
                    px-3
                    py-3

                    rounded-lg

                    text-sm

                    transition-colors

                    ${
                      activeHash === l.href
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-card hover:text-foreground"
                    }
                  `}
                >
                  {l.label}
                </a>
              ))}

              {/* Track order */}
              <div
                className="
                  px-1
                  sm:px-3

                  pt-2
                  pb-1

                  flex
                  gap-2
                "
              >
                <input
                  type="text"
                  placeholder="Enter order ID"
                  value={trackOrderId}
                  onChange={(e) =>
                    setTrackOrderId(
                      e.target.value.toUpperCase()
                    )
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    handleTrackOrder()
                  }
                  className="
                    flex-1

                    h-10

                    min-w-0

                    rounded-lg

                    border
                    border-border

                    bg-surface

                    px-3

                    text-sm

                    focus:outline-none
                    focus:ring-1
                    focus:ring-primary
                  "
                />

                <button
                  onClick={handleTrackOrder}
                  className="
                    h-10
                    px-4

                    rounded-lg

                    bg-primary/10
                    text-primary

                    text-sm
                    font-medium

                    cursor-pointer

                    shrink-0
                  "
                >
                  <span className="hidden xs:inline">
                    Track
                  </span>

                  <Search className="h-4 w-4 xs:hidden" />
                </button>
              </div>

              {/* Mobile phone */}
              {phone && (
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  onClick={() => setOpen(false)}
                  className="
                    sm:hidden

                    flex
                    items-center
                    gap-2

                    px-3
                    py-3

                    rounded-lg

                    text-sm

                    text-muted-foreground

                    hover:bg-card
                    hover:text-foreground
                  "
                >
                  <Phone className="h-4 w-4 text-primary" />

                  <span>
                    {phone}
                  </span>
                </a>
              )}
            </nav>
          </motion.div>
        )}
      </motion.header>

      {/* =====================================
          CART
      ===================================== */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={handleCheckout}
      />

      {/* =====================================
          DELIVERY POPUP
      ===================================== */}
      <DeliveryPopup />
    </>
  );
}
