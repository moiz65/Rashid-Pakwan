// src/components/landing/Checkout.tsx
import { motion } from "motion/react";
import { 
  CreditCard, Truck, ChevronRight, 
  CheckCircle, ArrowLeft, 
  Store, Phone, User, Mail, Home, 
  Map, FileText, Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import logo from "@/assets/main_logo.png";
import {
  fetchPublicPaymentGateways,
  fetchPublicBranches,
  fetchPublicShippingMethods,
  fetchCheckoutQuote,
  validatePublicCoupon,
  getCheckoutSessionKey,
  upsertAbandonedCart,
  expandCartItemsForApi,
  type PublicPaymentGateway,
  type PublicBranch,
  type PublicShippingMethod,
} from "@/lib/api";
import { getStoredDeliveryLocation } from "@/lib/branchSelection";
import { formatAmount } from "@/lib/formatters";

/*
  Minimal desi biryani palette
  brown  #840608   saffron #F29C1F   cream #FFF1D0 / #FFF8E7   chilli #B93A0E   green #4E8A45
*/
const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F29C1F]";

type CartItem = {
  id: string;
  productId?: string;
  name: string;
  desc: string;
  price: number;
  productPrice?: number;
  productLabel?: string;
  currency: string;
  quantity: number;
  src: string;
  addons?: string[];
  includedItems?: string[];
  selectedAddons?: Array<{ id: string; name: string; price: number; quantity?: number }>;
  selectedDrink?: { name: string; price: number };
  specialInstructions?: string;
  offerBundle?: {
    offerId: string;
    offerTitle: string;
    lines: Array<{
      productId: string;
      name: string;
      price: number;
      qty: number;
      role: "buy" | "get";
    }>;
  };
};

type CheckoutPageProps = {
  items: CartItem[];
  onConfirm: (orderData: OrderData) => void | Promise<void>;
  isSubmitting?: boolean;
  submitError?: string | null;
};

type OrderData = {
  title: string;
  fullName: string;
  mobileNumber: string;
  alternateMobile?: string;
  deliveryAddress: string;
  nearestLandmark?: string;
  emailAddress: string;
  deliveryInstructions?: string;
  deliveryType: "delivery" | "pickup";
  branch?: string;
  branchId?: string;
  shippingMethodId?: string;
  deliveryAreaId?: string;
  deliveryAreaName?: string;
  paymentMethod: string;
  items: CartItem[];
  total: number;
  couponCode?: string;
};

export function CheckoutPage({ items, onConfirm, isSubmitting = false, submitError = null }: CheckoutPageProps) {
  const navigate = useNavigate();
  const storedLocation = typeof window !== "undefined" ? getStoredDeliveryLocation() : null;
  const [step, setStep] = useState(1);
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">(
    storedLocation?.type === "pickup" ? "pickup" : "delivery"
  );
  const [branchId, setBranchId] = useState(storedLocation?.branchId || "");
  const [deliveryAreaId, setDeliveryAreaId] = useState(storedLocation?.areaId || "");
  const [deliveryAreaName, setDeliveryAreaName] = useState(storedLocation?.areaName || "");
  const [branches, setBranches] = useState<PublicBranch[]>([]);
  const [shippingMethods, setShippingMethods] = useState<PublicShippingMethod[]>([]);
  const [shippingMethodId, setShippingMethodId] = useState("");
  const [paymentGateways, setPaymentGateways] = useState<PublicPaymentGateway[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [taxExclusive, setTaxExclusive] = useState(0);
  const [taxInclusive, setTaxInclusive] = useState(0);
  const [quotedSubtotal, setQuotedSubtotal] = useState<number | null>(null);
  const [offerDiscount, setOfferDiscount] = useState(0);
  const [appliedOfferTitle, setAppliedOfferTitle] = useState("");
  const [appliedOfferDetail, setAppliedOfferDetail] = useState("");
  const [shippingFee, setShippingFee] = useState(0);
  const [freeDeliveryMessage, setFreeDeliveryMessage] = useState("");
  const [quotedTotal, setQuotedTotal] = useState<number | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);
  const [coversFullSubtotal, setCoversFullSubtotal] = useState(false);

  const [title, setTitle] = useState("Mr.");
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [alternateMobile, setAlternateMobile] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [nearestLandmark, setNearestLandmark] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  useEffect(() => {
    const syncLocation = () => {
      const stored = getStoredDeliveryLocation();
      if (!stored) return;
      if (stored.type) setDeliveryType(stored.type === "pickup" ? "pickup" : "delivery");
      if (stored.branchId) setBranchId(stored.branchId);
      setDeliveryAreaId(stored.areaId || "");
      setDeliveryAreaName(stored.areaName || "");
      if (stored.type === "delivery" && stored.areaName && !deliveryAddress.trim()) {
        setDeliveryAddress(stored.areaName);
      }
    };
    syncLocation();
    window.addEventListener("branch-selected", syncLocation);
    return () => window.removeEventListener("branch-selected", syncLocation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setPaymentLoading(true);
      try {
        const [gateways, branchList, shipList] = await Promise.all([
          fetchPublicPaymentGateways(),
          fetchPublicBranches(),
          fetchPublicShippingMethods(),
        ]);
        if (!active) return;
        setPaymentGateways(gateways);
        setBranches(branchList);
        setShippingMethods(shipList);
        if (gateways.length > 0) {
          setPaymentMethodId(gateways[0].id);
          setPaymentMethod(gateways[0].name);
        }
        const preferred =
          storedLocation?.branchId && branchList.some((b) => b.id === storedLocation.branchId)
            ? storedLocation.branchId
            : branchList.find((b) => b.isPrimary)?.id || branchList[0]?.id || "";
        if (preferred) setBranchId(preferred);
        const deliveryMethod = shipList.find((m) => !/pickup/i.test(m.name)) || shipList[0];
        if (deliveryMethod) setShippingMethodId(deliveryMethod.id);
      } catch {
        if (!active) return;
        setPaymentGateways([]);
        setBranches([]);
        setShippingMethods([]);
      } finally {
        if (active) setPaymentLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const quoteItems = () => expandCartItemsForApi(items);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!items.length) {
        setTaxExclusive(0);
        setTaxInclusive(0);
        setQuotedSubtotal(null);
        setOfferDiscount(0);
        setAppliedOfferTitle("");
        setAppliedOfferDetail("");
        setShippingFee(0);
        setFreeDeliveryMessage("");
        setQuotedTotal(null);
        setCouponDiscount(0);
        setCoversFullSubtotal(false);
        return;
      }
      try {
        const quote = await fetchCheckoutQuote(quoteItems(), appliedCoupon || null, {
          deliveryType,
          shippingMethodId: deliveryType === "delivery" ? shippingMethodId : null,
          deliveryAreaId: deliveryType === "delivery" ? deliveryAreaId || null : null,
        });
        if (!active) return;
        setTaxExclusive(quote.taxExclusive);
        setTaxInclusive(quote.taxInclusive);
        setQuotedSubtotal(quote.subtotal);
        setOfferDiscount(quote.offerDiscount || 0);
        setAppliedOfferTitle(quote.appliedOffer?.title || "");
        if (quote.appliedOffer?.type === "bogo") {
          const buy = (quote.appliedOffer.buyProducts || []).map((p) => p.name).join(", ");
          const get = (quote.appliedOffer.getProducts || []).map((p) => p.name).join(", ");
          setAppliedOfferDetail(
            buy && get
              ? `Buy ${quote.appliedOffer.buyQty || 1}× ${buy} → Get ${quote.appliedOffer.getQty || 1}× ${get} free`
              : "",
          );
        } else {
          setAppliedOfferDetail(quote.freeDeliveryMessage || "");
        }
        setShippingFee(quote.shippingFee || 0);
        setFreeDeliveryMessage(quote.freeDeliveryMessage || "");
        setQuotedTotal(quote.total);
        setCouponDiscount(quote.couponDiscount);
        setCoversFullSubtotal(Boolean(quote.coversFullSubtotal));
        if (appliedCoupon && quote.couponDiscount <= 0) {
          setCouponMsg("Coupon could not be applied to this cart");
        } else if (appliedCoupon && quote.couponDiscount > 0) {
          setCouponMsg(
            quote.coversFullSubtotal
              ? "100% off items — delivery fee still applies"
              : "Coupon applied to items (not delivery)",
          );
        }
      } catch (err) {
        if (!active) return;
        setTaxExclusive(0);
        setTaxInclusive(0);
        setQuotedSubtotal(null);
        setOfferDiscount(0);
        setAppliedOfferTitle("");
        setAppliedOfferDetail("");
        setShippingFee(0);
        setQuotedTotal(null);
        setCoversFullSubtotal(false);
        if (appliedCoupon) {
          setCouponDiscount(0);
          setCouponMsg(err instanceof Error ? err.message : "Invalid coupon");
          setAppliedCoupon("");
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [items, appliedCoupon, deliveryType, shippingMethodId, deliveryAreaId]);

  useEffect(() => {
    const name = fullName.trim();
    const email = emailAddress.trim();
    const phone = mobileNumber.trim();
    if (!items.length) return;
    if (!name && !email && !phone) return;

    const timer = window.setTimeout(() => {
      const cartItems = items.map((item) => ({
        productId: item.productId || item.id,
        name: item.name,
        qty: item.quantity,
        price: item.price,
      }));
      const value = cartItems.reduce((s, i) => s + i.qty * i.price, 0);
      upsertAbandonedCart({
        sessionKey: getCheckoutSessionKey(),
        customerName: name ? `${title} ${name}`.trim() : undefined,
        email,
        phone,
        address: deliveryAddress.trim(),
        landmark: nearestLandmark.trim(),
        deliveryType,
        branchId:
          branchId ||
          branches.find((b) => b.isPrimary)?.id ||
          branches[0]?.id,
        items: cartItems,
        value,
        details: {
          title,
          alternateMobile: alternateMobile.trim() || null,
          deliveryInstructions: deliveryInstructions.trim() || null,
          branch: branches.find((b) => b.id === branchId)?.name || null,
          paymentMethod: paymentMethod || null,
          couponCode: appliedCoupon || null,
        },
      }).catch(() => {});
    }, 800);

    return () => window.clearTimeout(timer);
  }, [
    items, title, fullName, emailAddress, mobileNumber, alternateMobile,
    deliveryAddress, nearestLandmark, deliveryType, branchId,
    deliveryInstructions, paymentMethod, appliedCoupon,
  ]);

  const selectPayment = (gw: PublicPaymentGateway) => {
    setPaymentMethodId(gw.id);
    setPaymentMethod(gw.name);
  };

  const cartSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotal = cartSubtotal;
  const deliveryFee = deliveryType === "pickup" ? 0 : shippingFee;
  const tax = taxExclusive;
  const quotedPriceAdjustment = quotedSubtotal != null ? cartSubtotal - quotedSubtotal : 0;
  const total =
    quotedTotal != null
      ? Math.max(0, quotedTotal + quotedPriceAdjustment)
      : Math.max(0, subtotal - offerDiscount - couponDiscount) + deliveryFee + tax;
  const selectedBranch = branches.find((b) => b.id === branchId);

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponMsg("Enter a coupon code");
      return;
    }
    setCouponBusy(true);
    setCouponMsg("");
    try {
      const result = await validatePublicCoupon(code, subtotal);
      if (!result.valid) {
        setAppliedCoupon("");
        setCouponDiscount(0);
        setCouponMsg(result.message || "Invalid coupon");
        return;
      }
      setAppliedCoupon(code);
      setCouponCode(code);
      setCouponMsg(result.message || "Coupon applied");
    } catch (err) {
      setAppliedCoupon("");
      setCouponDiscount(0);
      setCouponMsg(err instanceof Error ? err.message : "Failed to validate coupon");
    } finally {
      setCouponBusy(false);
    }
  };

  const clearCoupon = () => {
    setAppliedCoupon("");
    setCouponCode("");
    setCouponDiscount(0);
    setCoversFullSubtotal(false);
    setCouponMsg("");
  };

  const handleConfirm = async () => {
    await onConfirm({
      title, fullName, mobileNumber, alternateMobile, deliveryAddress,
      nearestLandmark, emailAddress, deliveryInstructions, deliveryType,
      branch: selectedBranch?.name,
      branchId: branchId || undefined,
      shippingMethodId: deliveryType === "delivery" ? shippingMethodId : undefined,
      deliveryAreaId: deliveryType === "delivery" ? deliveryAreaId || undefined : undefined,
      deliveryAreaName: deliveryType === "delivery" ? deliveryAreaName || undefined : undefined,
      paymentMethod, items, total,
      couponCode: appliedCoupon || undefined,
    });
  };

  const handleBack = () => navigate({ to: "/" });

  const isStep1Valid = () =>
    fullName.trim() !== "" &&
    mobileNumber.trim() !== "" &&
    deliveryAddress.trim() !== "" &&
    emailAddress.trim() !== "" &&
    (deliveryType === "pickup" ? branchId !== "" : true);

  // Shared field styles — flat, calm, consistent, black text
  const fieldClass =
    "w-full px-3.5 py-3 rounded-lg border border-black/15 bg-white text-black placeholder:text-black/40 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition-colors text-sm";
  const fieldWithIconClass = `${fieldClass} pl-10`;
  const labelClass = "text-sm font-semibold block mb-1.5 text-black";
  const cardClass = "rounded-2xl bg-white border border-black/10 p-6 sm:p-7";

  return (
    <div className="min-h-screen bg-[#f5f5f5] pt-8 pb-16 text-black">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className={`inline-flex items-center gap-2 text-sm text-black/70 hover:text-black transition-colors cursor-pointer rounded-md px-2 py-1 ${focusRing}`}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Menu
          </button>

          <img
            src={logo}
            alt="Studio 7teas"
            className="h-11 w-11 rounded-full object-contain bg-white p-1 border border-black/10"
          />

          <div className="w-24" />
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold border transition-colors ${
                  s === step
                    ? "bg-[#840608] text-[#F29C1F] border-[#840608]"
                    : s < step
                    ? "bg-[#F29C1F] text-black border-[#F29C1F]"
                    : "bg-white text-black/40 border-black/15"
                }`}
              >
                {s < step ? <CheckCircle className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`h-px w-14 sm:w-20 transition-colors ${
                    s < step ? "bg-black" : "bg-black/15"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Customer Details */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cardClass}
              >
                <h3 className="text-base font-semibold mb-5 flex items-center gap-2 text-black">
                  <Users className="h-4 w-4" />
                  Customer Details
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={labelClass}>Title</label>
                      <select
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={fieldClass}
                      >
                        <option value="Mr.">Mr.</option>
                        <option value="Ms.">Miss.</option>
                        <option value="Mrs.">Mrs.</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className={labelClass}>Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                          className={fieldWithIconClass}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Mobile Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                        <input
                          type="tel"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          placeholder="03XX-XXXXXXX"
                          className={fieldWithIconClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Alternate Mobile</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                        <input
                          type="tel"
                          value={alternateMobile}
                          onChange={(e) => setAlternateMobile(e.target.value)}
                          placeholder="03XX-XXXXXXX"
                          className={fieldWithIconClass}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                      <input
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="your@email.com"
                        className={fieldWithIconClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Delivery Address *</label>
                    <div className="relative">
                      <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="House #, Street, Area"
                        className={fieldWithIconClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Nearest Landmark</label>
                    <div className="relative">
                      <Map className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                      <input
                        type="text"
                        value={nearestLandmark}
                        onChange={(e) => setNearestLandmark(e.target.value)}
                        placeholder="Nearby mosque, school, or market"
                        className={fieldWithIconClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Delivery Type *</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setDeliveryType("delivery")}
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors cursor-pointer ${focusRing} ${
                          deliveryType === "delivery"
                            ? "border-[#840608] bg-[#FFF1D0]"
                            : "border-black/15 bg-white hover:border-black/30"
                        }`}
                      >
                        <Truck className={`h-4 w-4 ${deliveryType === "delivery" ? "text-[#840608]" : "text-black/50"}`} />
                        <span className={`text-sm font-medium ${deliveryType === "delivery" ? "text-black" : "text-black/60"}`}>
                          Delivery
                        </span>
                      </button>
                      <button
                        onClick={() => setDeliveryType("pickup")}
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors cursor-pointer ${focusRing} ${
                          deliveryType === "pickup"
                            ? "border-[#840608] bg-[#FFF1D0]"
                            : "border-black/15 bg-white hover:border-black/30"
                        }`}
                      >
                        <Store className={`h-4 w-4 ${deliveryType === "pickup" ? "text-[#840608]" : "text-black/50"}`} />
                        <span className={`text-sm font-medium ${deliveryType === "pickup" ? "text-black" : "text-black/60"}`}>
                          Pickup
                        </span>
                      </button>
                    </div>
                  </div>

                  {deliveryType === "pickup" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="overflow-hidden"
                    >
                      <label className={labelClass}>Select Branch *</label>
                      <select
                        value={branchId}
                        onChange={(e) => setBranchId(e.target.value)}
                        className={fieldClass}
                      >
                        <option value="">Select a branch</option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}{b.city ? ` — ${b.city}` : ""}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  )}

                  <div>
                    <label className={labelClass}>Delivery Instructions</label>
                    <textarea
                      value={deliveryInstructions}
                      onChange={(e) => setDeliveryInstructions(e.target.value)}
                      placeholder="Any special delivery instructions..."
                      className={`${fieldClass} resize-none`}
                      rows={2}
                    />
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!isStep1Valid()}
                  className={`mt-6 w-full inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-[#840608] text-[#F29C1F] text-sm font-semibold hover:bg-[#5A1A10] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${focusRing}`}
                >
                  Continue to Payment
                  <ChevronRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cardClass}
              >
                <h3 className="text-base font-semibold mb-5 flex items-center gap-2 text-black">
                  <CreditCard className="h-4 w-4" />
                  Payment Method
                </h3>

                <div className="space-y-2.5">
                  {paymentLoading ? (
                    <div className="space-y-2.5">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="h-16 rounded-lg border border-black/10 bg-[#f5f5f5] animate-pulse"
                        />
                      ))}
                    </div>
                  ) : paymentGateways.length === 0 ? (
                    <p className="text-sm text-black/70 rounded-lg border border-dashed border-black/20 p-4">
                      No payment methods are available right now. Please enable at least one in the admin panel.
                    </p>
                  ) : (
                    paymentGateways.map((gw) => (
                      <button
                        key={gw.id}
                        type="button"
                        onClick={() => selectPayment(gw)}
                        className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer ${focusRing} ${
                          paymentMethodId === gw.id
                            ? "border-[#840608] bg-[#FFF1D0]"
                            : "border-black/15 bg-white hover:border-black/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl leading-none" aria-hidden>
                            {gw.icon || "💳"}
                          </span>
                          <div className="text-left">
                            <p className="text-sm font-medium text-black">{gw.name}</p>
                            {gw.description ? (
                              <p className="text-xs text-black/60">{gw.description}</p>
                            ) : null}
                          </div>
                        </div>
                        {paymentMethodId === gw.id && (
                          <CheckCircle className="h-5 w-5 text-[#840608]" />
                        )}
                      </button>
                    ))
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className={`flex-1 inline-flex items-center justify-center h-12 px-6 rounded-lg border border-black/15 bg-white text-black text-sm font-semibold hover:bg-[#f5f5f5] transition-colors cursor-pointer ${focusRing}`}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!paymentMethodId || paymentGateways.length === 0}
                    className={`flex-1 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-[#840608] text-[#F29C1F] text-sm font-semibold hover:bg-[#5A1A10] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${focusRing}`}
                  >
                    Review Order
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cardClass}
              >
                <h3 className="text-base font-semibold mb-5 flex items-center gap-2 text-black">
                  <CheckCircle className="h-4 w-4" />
                  Review Order
                </h3>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-[#f5f5f5] border border-black/10 space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-black/60" />
                      <span className="text-sm font-medium text-black">{title} {fullName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-black/60" />
                      <span className="text-sm text-black">{mobileNumber}</span>
                      {alternateMobile && (
                        <span className="text-sm text-black/55">(Alt: {alternateMobile})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-black/60" />
                      <span className="text-sm text-black">{emailAddress}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Home className="h-4 w-4 text-black/60 mt-0.5" />
                      <span className="text-sm text-black">{deliveryAddress}</span>
                    </div>
                    {nearestLandmark && (
                      <div className="flex items-start gap-2">
                        <Map className="h-4 w-4 text-black/60 mt-0.5" />
                        <span className="text-sm text-black">Near: {nearestLandmark}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-[#f5f5f5] border border-black/10">
                    {deliveryType === "delivery" ? (
                      <Truck className="h-4 w-4 text-black/60 mt-0.5" />
                    ) : (
                      <Store className="h-4 w-4 text-black/60 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-black">
                        {deliveryType === "delivery" ? "Delivery" : "Pickup"}
                      </p>
                      <p className="text-sm text-black/60">
                        {deliveryType === "delivery"
                          ? "Home Delivery"
                          : `Branch: ${selectedBranch?.name || "—"}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-[#f5f5f5] border border-black/10">
                    <CreditCard className="h-4 w-4 text-black/60 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-black">Payment Method</p>
                      <p className="text-sm text-black/60">{paymentMethod || "—"}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-[#f5f5f5] border border-black/10">
                    <p className="text-sm font-medium mb-3 text-black">Order Items</p>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="h-14 w-14 rounded-lg overflow-hidden bg-white shrink-0 border border-black/10">
                            <img
                              src={item.src}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-black">{item.name}</p>
                            {item.includedItems && item.includedItems.length > 0 && (
                              <p className="text-xs text-black/60 truncate">
                                Includes: {item.includedItems.join(", ")}
                              </p>
                            )}
                            {item.addons && item.addons.length > 0 && (
                              <p className="text-xs text-black/60 truncate">
                                {item.includedItems?.length ? "Extras" : "+"} {item.addons.join(", ")}
                              </p>
                            )}
                            {item.specialInstructions ? (
                              <p className="text-xs text-black/60 truncate">{item.specialInstructions}</p>
                            ) : null}
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-black/55">×{item.quantity}</span>
                              <span className="text-sm font-semibold text-black">
                                {item.currency}{formatAmount(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(2)}
                    disabled={isSubmitting}
                    className={`flex-1 inline-flex items-center justify-center h-12 px-6 rounded-lg border border-black/15 bg-white text-black text-sm font-semibold hover:bg-[#f5f5f5] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${focusRing}`}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className={`flex-1 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-[#840608] text-[#F29C1F] text-sm font-semibold hover:bg-[#5A1A10] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${focusRing}`}
                  >
                    <CheckCircle className="h-4 w-4" />
                    {isSubmitting ? "Placing Order..." : "Confirm Order"}
                  </button>
                </div>
                {submitError && (
                  <p className="mt-3 text-sm text-[#B93A0E] text-center font-medium">{submitError}</p>
                )}
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1 mt-6 lg:mt-0">
            <div className="sticky top-24 lg:top-28 rounded-2xl bg-white border border-black/10 p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-black/10">
                <img
                  src={logo}
                  alt="Studio 7teas"
                  className="h-10 w-10 rounded-full object-contain bg-[#f5f5f5] p-1 border border-black/10"
                />
                <div>
                  <h3 className="text-base font-semibold leading-tight text-black">Order Summary</h3>
                  <p className="text-xs text-black/60">
                    {items.length} item{items.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => {
                  const addonUnitTotal = (item.selectedAddons || []).reduce(
                    (sum, addon) => sum + addon.price * (addon.quantity || 1),
                    0,
                  );
                  const productPrice =
                    item.productPrice ??
                    Math.max(0, item.price - addonUnitTotal - (item.selectedDrink?.price || 0));

                  return (
                    <div key={item.id} className="text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="text-black/70 truncate">
                          {item.quantity}× {item.name}
                        </span>
                        <span className="shrink-0 tabular-nums text-black">
                          {item.currency}{formatAmount(item.price * item.quantity)}
                        </span>
                      </div>
                      {!item.offerBundle ? (
                        <>
                          <div className="flex justify-between gap-2 pl-3 text-[11px] text-black/55">
                            <span>{item.productLabel || item.name}</span>
                            <span className="shrink-0 tabular-nums">
                              {item.currency}{formatAmount(productPrice * item.quantity)}
                            </span>
                          </div>
                          {item.selectedDrink ? (
                            <div className="flex justify-between gap-2 pl-3 text-[11px] text-black/55">
                              <span>
                                {item.selectedDrink.name}
                                {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                              </span>
                              <span className="shrink-0 tabular-nums">
                                {item.currency}{formatAmount(item.selectedDrink.price * item.quantity)}
                              </span>
                            </div>
                          ) : null}
                        </>
                      ) : null}
                      {item.includedItems?.length ? (
                        <p className="text-[11px] text-black/55 truncate pl-3">
                          Includes: {item.includedItems.join(", ")}
                        </p>
                      ) : null}
                      {item.selectedAddons?.length ? (
                        <div className="mt-0.5 space-y-0.5 pl-3">
                          {item.selectedAddons.map((addon) => (
                            <div
                              key={addon.id}
                              className="flex justify-between gap-2 text-[11px] text-black/55"
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
                        <p className="text-[11px] text-black/55 pl-3">
                          Extras: {item.addons.join(", ")}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 text-sm border-t border-black/10 pt-4">
                <div className="flex justify-between">
                  <span className="text-black/70">Subtotal</span>
                  <span className="tabular-nums text-black">
                    {items[0]?.currency || "Rs "}{formatAmount(subtotal)}
                  </span>
                </div>

                <div className="space-y-2 rounded-lg border border-black/10 p-3">
                  <label className="text-xs font-semibold text-black/70">Coupon code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="e.g. WELCOME10"
                      className="flex-1 min-w-0 px-3 py-2 rounded-md border border-black/15 bg-[#f5f5f5] text-sm font-mono uppercase text-black placeholder:text-black/40 focus:outline-none focus:border-black"
                      disabled={Boolean(appliedCoupon)}
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={clearCoupon}
                        className={`shrink-0 px-3 py-2 rounded-md border border-black/15 bg-white text-sm text-black hover:bg-[#f5f5f5] cursor-pointer transition-colors ${focusRing}`}
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={applyCoupon}
                        disabled={couponBusy}
                        className={`shrink-0 px-3 py-2 rounded-md bg-[#840608] text-[#F29C1F] text-sm font-medium hover:bg-[#5A1A10] disabled:opacity-60 cursor-pointer transition-colors ${focusRing}`}
                      >
                        {couponBusy ? "…" : "Apply"}
                      </button>
                    )}
                  </div>
                  {couponMsg ? (
                    <p
                      className={`text-xs ${
                        appliedCoupon && couponDiscount > 0
                          ? "text-[#4E8A45] font-medium"
                          : "text-black/60"
                      }`}
                    >
                      {couponMsg}
                    </p>
                  ) : null}
                </div>

                {(offerDiscount > 0 || appliedOfferTitle) ? (
                  <div className="flex flex-col gap-0.5 text-[#4E8A45]">
                    <div className="flex justify-between">
                      <span className="truncate pr-2">
                        {appliedOfferTitle || "Offer"} discount
                      </span>
                      {offerDiscount > 0 ? (
                        <span className="shrink-0 tabular-nums font-medium">
                          −{items[0]?.currency || "Rs "}{formatAmount(offerDiscount)}
                        </span>
                      ) : null}
                    </div>
                    {appliedOfferDetail ? (
                      <p className="text-xs text-black/60">{appliedOfferDetail}</p>
                    ) : null}
                  </div>
                ) : null}

                {couponDiscount > 0 ? (
                  <div className="flex justify-between text-[#4E8A45]">
                    <span>Coupon {appliedCoupon ? `(${appliedCoupon})` : ""}</span>
                    <span className="tabular-nums">
                      −{items[0]?.currency || "Rs "}{formatAmount(couponDiscount)}
                    </span>
                  </div>
                ) : null}

                <div className="flex justify-between">
                  <span className="text-black/70">Delivery</span>
                  <span className="tabular-nums text-black">
                    {deliveryFee === 0
                      ? "Free"
                      : (items[0]?.currency || "Rs ") + formatAmount(deliveryFee)}
                  </span>
                </div>

                {freeDeliveryMessage ? (
                  <p className="text-xs text-[#4E8A45]">{freeDeliveryMessage}</p>
                ) : null}

                {tax > 0 ? (
                  <div className="flex justify-between">
                    <span className="text-black/70">GST (extra)</span>
                    <span className="tabular-nums text-black">
                      {items[0]?.currency || "Rs "}{formatAmount(tax)}
                    </span>
                  </div>
                ) : taxInclusive > 0 ? (
                  <div className="flex justify-between text-xs">
                    <span className="text-black/70">Tax</span>
                    <span className="text-black/60">Included in prices</span>
                  </div>
                ) : null}

                <div className="flex justify-between pt-3 border-t border-black/10 text-base font-bold">
                  <span className="text-black">Total</span>
                  <span className="text-black tabular-nums">
                    {items[0]?.currency || "Rs "}{formatAmount(total)}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-black/10">
                <div className="flex items-center gap-2 text-xs text-black/60">
                  <Phone className="h-3 w-3 shrink-0" />
                  <span>
                    Need help? Call{" "}
                    <a href="tel:02132349898" className="text-black font-medium hover:underline">
                      021-323-49898
                    </a>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}