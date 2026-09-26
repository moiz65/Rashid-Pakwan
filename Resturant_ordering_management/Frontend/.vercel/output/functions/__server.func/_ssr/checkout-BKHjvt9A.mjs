import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { M as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as main_logo_default, o as useCartStore, r as getStoredDeliveryLocation, t as formatAmount } from "./CartStore-DvzXC6en.mjs";
import { C as validatePublicCoupon, S as upsertAbandonedCart, _ as getCheckoutSessionKey, a as fetchPublicBranches, d as fetchPublicPaymentGateways, i as fetchCheckoutQuote, m as fetchPublicShippingMethods, n as createOrder, r as expandCartItemsForApi, t as buildOrderPayload, v as recoverAbandonedCart } from "./api-DXmjlFkY.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { A as CreditCard, B as ArrowLeft, E as Mail, K as CircleCheckBig, P as ChevronRight, W as House, c as Store, f as ShoppingBag, i as Truck, k as FileText, n as Users, r as User, v as Phone, w as Map } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/checkout-BKHjvt9A.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CheckoutPage({ items, onConfirm, isSubmitting = false, submitError = null }) {
	const navigate = useNavigate();
	const storedLocation = typeof window !== "undefined" ? getStoredDeliveryLocation() : null;
	const [step, setStep] = (0, import_react.useState)(1);
	const [deliveryType, setDeliveryType] = (0, import_react.useState)(storedLocation?.type === "pickup" ? "pickup" : "delivery");
	const [branchId, setBranchId] = (0, import_react.useState)(storedLocation?.branchId || "");
	const [deliveryAreaId, setDeliveryAreaId] = (0, import_react.useState)(storedLocation?.areaId || "");
	const [deliveryAreaName, setDeliveryAreaName] = (0, import_react.useState)(storedLocation?.areaName || "");
	const [branches, setBranches] = (0, import_react.useState)([]);
	const [shippingMethods, setShippingMethods] = (0, import_react.useState)([]);
	const [shippingMethodId, setShippingMethodId] = (0, import_react.useState)("");
	const [paymentGateways, setPaymentGateways] = (0, import_react.useState)([]);
	const [paymentLoading, setPaymentLoading] = (0, import_react.useState)(true);
	const [paymentMethodId, setPaymentMethodId] = (0, import_react.useState)("");
	const [paymentMethod, setPaymentMethod] = (0, import_react.useState)("");
	const [taxExclusive, setTaxExclusive] = (0, import_react.useState)(0);
	const [taxInclusive, setTaxInclusive] = (0, import_react.useState)(0);
	const [quotedSubtotal, setQuotedSubtotal] = (0, import_react.useState)(null);
	const [offerDiscount, setOfferDiscount] = (0, import_react.useState)(0);
	const [appliedOfferTitle, setAppliedOfferTitle] = (0, import_react.useState)("");
	const [appliedOfferDetail, setAppliedOfferDetail] = (0, import_react.useState)("");
	const [shippingFee, setShippingFee] = (0, import_react.useState)(0);
	const [freeDeliveryMessage, setFreeDeliveryMessage] = (0, import_react.useState)("");
	const [quotedTotal, setQuotedTotal] = (0, import_react.useState)(null);
	const [couponDiscount, setCouponDiscount] = (0, import_react.useState)(0);
	const [couponCode, setCouponCode] = (0, import_react.useState)("");
	const [appliedCoupon, setAppliedCoupon] = (0, import_react.useState)("");
	const [couponMsg, setCouponMsg] = (0, import_react.useState)("");
	const [couponBusy, setCouponBusy] = (0, import_react.useState)(false);
	const [coversFullSubtotal, setCoversFullSubtotal] = (0, import_react.useState)(false);
	const [title, setTitle] = (0, import_react.useState)("Mr.");
	const [fullName, setFullName] = (0, import_react.useState)("");
	const [mobileNumber, setMobileNumber] = (0, import_react.useState)("");
	const [alternateMobile, setAlternateMobile] = (0, import_react.useState)("");
	const [deliveryAddress, setDeliveryAddress] = (0, import_react.useState)("");
	const [nearestLandmark, setNearestLandmark] = (0, import_react.useState)("");
	const [emailAddress, setEmailAddress] = (0, import_react.useState)("");
	const [deliveryInstructions, setDeliveryInstructions] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const syncLocation = () => {
			const stored = getStoredDeliveryLocation();
			if (!stored) return;
			if (stored.type) setDeliveryType(stored.type === "pickup" ? "pickup" : "delivery");
			if (stored.branchId) setBranchId(stored.branchId);
			setDeliveryAreaId(stored.areaId || "");
			setDeliveryAreaName(stored.areaName || "");
			if (stored.type === "delivery" && stored.areaName && !deliveryAddress.trim()) setDeliveryAddress(stored.areaName);
		};
		syncLocation();
		window.addEventListener("branch-selected", syncLocation);
		return () => window.removeEventListener("branch-selected", syncLocation);
	}, []);
	(0, import_react.useEffect)(() => {
		let active = true;
		(async () => {
			setPaymentLoading(true);
			try {
				const [gateways, branchList, shipList] = await Promise.all([
					fetchPublicPaymentGateways(),
					fetchPublicBranches(),
					fetchPublicShippingMethods()
				]);
				if (!active) return;
				setPaymentGateways(gateways);
				setBranches(branchList);
				setShippingMethods(shipList);
				if (gateways.length > 0) {
					setPaymentMethodId(gateways[0].id);
					setPaymentMethod(gateways[0].name);
				}
				const preferred = storedLocation?.branchId && branchList.some((b) => b.id === storedLocation.branchId) ? storedLocation.branchId : branchList.find((b) => b.isPrimary)?.id || branchList[0]?.id || "";
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
	(0, import_react.useEffect)(() => {
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
					deliveryAreaId: deliveryType === "delivery" ? deliveryAreaId || null : null
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
					setAppliedOfferDetail(buy && get ? `Buy ${quote.appliedOffer.buyQty || 1}× ${buy} → Get ${quote.appliedOffer.getQty || 1}× ${get} free` : "");
				} else setAppliedOfferDetail(quote.freeDeliveryMessage || "");
				setShippingFee(quote.shippingFee || 0);
				setFreeDeliveryMessage(quote.freeDeliveryMessage || "");
				setQuotedTotal(quote.total);
				setCouponDiscount(quote.couponDiscount);
				setCoversFullSubtotal(Boolean(quote.coversFullSubtotal));
				if (appliedCoupon && quote.couponDiscount <= 0) setCouponMsg("Coupon could not be applied to this cart");
				else if (appliedCoupon && quote.couponDiscount > 0) setCouponMsg(quote.coversFullSubtotal ? "100% off items — delivery fee still applies" : "Coupon applied to items (not delivery)");
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
	}, [
		items,
		appliedCoupon,
		deliveryType,
		shippingMethodId,
		deliveryAreaId
	]);
	(0, import_react.useEffect)(() => {
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
				price: item.price
			}));
			const value = cartItems.reduce((s, i) => s + i.qty * i.price, 0);
			upsertAbandonedCart({
				sessionKey: getCheckoutSessionKey(),
				customerName: name ? `${title} ${name}`.trim() : void 0,
				email,
				phone,
				address: deliveryAddress.trim(),
				landmark: nearestLandmark.trim(),
				deliveryType,
				branchId: branchId || branches.find((b) => b.isPrimary)?.id || branches[0]?.id,
				items: cartItems,
				value,
				details: {
					title,
					alternateMobile: alternateMobile.trim() || null,
					deliveryInstructions: deliveryInstructions.trim() || null,
					branch: branches.find((b) => b.id === branchId)?.name || null,
					paymentMethod: paymentMethod || null,
					couponCode: appliedCoupon || null
				}
			}).catch(() => {});
		}, 800);
		return () => window.clearTimeout(timer);
	}, [
		items,
		title,
		fullName,
		emailAddress,
		mobileNumber,
		alternateMobile,
		deliveryAddress,
		nearestLandmark,
		deliveryType,
		branchId,
		deliveryInstructions,
		paymentMethod,
		appliedCoupon
	]);
	const selectPayment = (gw) => {
		setPaymentMethodId(gw.id);
		setPaymentMethod(gw.name);
	};
	const cartSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
	const subtotal = quotedSubtotal != null ? quotedSubtotal : cartSubtotal;
	const deliveryFee = deliveryType === "pickup" ? 0 : shippingFee;
	const tax = taxExclusive;
	const total = quotedTotal != null ? quotedTotal : Math.max(0, subtotal - offerDiscount - couponDiscount) + deliveryFee + tax;
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
			title,
			fullName,
			mobileNumber,
			alternateMobile,
			deliveryAddress,
			nearestLandmark,
			emailAddress,
			deliveryInstructions,
			deliveryType,
			branch: selectedBranch?.name,
			branchId: branchId || void 0,
			shippingMethodId: deliveryType === "delivery" ? shippingMethodId : void 0,
			deliveryAreaId: deliveryType === "delivery" ? deliveryAreaId || void 0 : void 0,
			deliveryAreaName: deliveryType === "delivery" ? deliveryAreaName || void 0 : void 0,
			paymentMethod,
			items,
			total,
			couponCode: appliedCoupon || void 0
		});
	};
	const handleBack = () => {
		navigate({ to: "/" });
	};
	const isStep1Valid = () => {
		return fullName.trim() !== "" && mobileNumber.trim() !== "" && deliveryAddress.trim() !== "" && emailAddress.trim() !== "" && (deliveryType === "pickup" ? branchId !== "" : true);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-surface/30 pt-10 pb-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-5xl px-4 sm:px-6 lg:px-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between mb-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: handleBack,
							className: "inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), "Back to Menu"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center gap-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: main_logo_default,
								alt: "Studio 7teas",
								className: "h-12 w-12 rounded-full object-contain bg-black p-1"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-20" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center justify-center gap-2 mb-8",
					children: [
						1,
						2,
						3
					].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${s === step ? "bg-gradient-primary text-primary-foreground shadow-glow" : s < step ? "bg-primary/20 text-primary" : "bg-surface text-muted-foreground"}`,
							children: s < step ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "h-5 w-5" }) : s
						}), s < 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `h-0.5 w-12 transition-colors ${s < step ? "bg-primary" : "bg-border"}` })]
					}, s))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid lg:grid-cols-3 gap-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "lg:col-span-2 space-y-6",
						children: [
							step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
								initial: {
									opacity: 0,
									y: 20
								},
								animate: {
									opacity: 1,
									y: 0
								},
								className: "bg-card rounded-3xl border border-border p-6 shadow-elegant",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
										className: "text-lg font-semibold mb-4 flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-5 w-5 text-primary" }), "Customer Details"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-3 gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													className: "text-sm font-semibold block mb-2",
													children: "Title"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
													value: title,
													onChange: (e) => setTitle(e.target.value),
													className: "w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:border-primary transition-colors text-sm",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "Mr.",
															children: "Mr."
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "Ms.",
															children: "Miss."
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "Mrs.",
															children: "Mrs."
														})
													]
												})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "col-span-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
														className: "text-sm font-semibold block mb-2",
														children: "Full Name *"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "relative",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
															type: "text",
															value: fullName,
															onChange: (e) => setFullName(e.target.value),
															placeholder: "Enter your full name",
															className: "w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:border-primary transition-colors text-sm"
														})]
													})]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													className: "text-sm font-semibold block mb-2",
													children: "Mobile Number *"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "relative",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "tel",
														value: mobileNumber,
														onChange: (e) => setMobileNumber(e.target.value),
														placeholder: "03XX-XXXXXXX",
														className: "w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:border-primary transition-colors text-sm"
													})]
												})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													className: "text-sm font-semibold block mb-2",
													children: "Alternate Mobile"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "relative",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "tel",
														value: alternateMobile,
														onChange: (e) => setAlternateMobile(e.target.value),
														placeholder: "03XX-XXXXXXX",
														className: "w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:border-primary transition-colors text-sm"
													})]
												})] })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "text-sm font-semibold block mb-2",
												children: "Email Address *"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "relative",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "email",
													value: emailAddress,
													onChange: (e) => setEmailAddress(e.target.value),
													placeholder: "your@email.com",
													className: "w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:border-primary transition-colors text-sm"
												})]
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "text-sm font-semibold block mb-2",
												children: "Delivery Address *"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "relative",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "text",
													value: deliveryAddress,
													onChange: (e) => setDeliveryAddress(e.target.value),
													placeholder: "House #, Street, Area",
													className: "w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:border-primary transition-colors text-sm"
												})]
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "text-sm font-semibold block mb-2",
												children: "Nearest Landmark"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "relative",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "text",
													value: nearestLandmark,
													onChange: (e) => setNearestLandmark(e.target.value),
													placeholder: "Nearby mosque, school, or market",
													className: "w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:border-primary transition-colors text-sm"
												})]
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "text-sm font-semibold block mb-2",
												children: "Delivery Type *"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													onClick: () => setDeliveryType("delivery"),
													className: `flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${deliveryType === "delivery" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`,
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: `h-4 w-4 ${deliveryType === "delivery" ? "text-primary" : "text-muted-foreground"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium text-sm",
														children: "Delivery"
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													onClick: () => setDeliveryType("pickup"),
													className: `flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${deliveryType === "pickup" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`,
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, { className: `h-4 w-4 ${deliveryType === "pickup" ? "text-primary" : "text-muted-foreground"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium text-sm",
														children: "Pickup"
													})]
												})]
											})] }),
											deliveryType === "pickup" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
												initial: {
													opacity: 0,
													height: 0
												},
												animate: {
													opacity: 1,
													height: "auto"
												},
												className: "overflow-hidden",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													className: "text-sm font-semibold block mb-2",
													children: "Select Branch *"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
													value: branchId,
													onChange: (e) => setBranchId(e.target.value),
													className: "w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:border-primary transition-colors text-sm",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "",
														children: "Select a branch"
													}), branches.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
														value: b.id,
														children: [b.name, b.city ? ` — ${b.city}` : ""]
													}, b.id))]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "text-sm font-semibold block mb-2",
												children: "Delivery Instructions"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "relative",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
													value: deliveryInstructions,
													onChange: (e) => setDeliveryInstructions(e.target.value),
													placeholder: "Any special delivery instructions...",
													className: "w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:border-primary transition-colors text-sm resize-none",
													rows: 2
												})]
											})] })
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => setStep(2),
										disabled: !isStep1Valid(),
										className: "mt-6 w-full inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-gradient-primary text-primary-foreground font-medium shadow-glow hover:scale-[1.02] transition-transform cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
										children: ["Next Step", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4" })]
									})
								]
							}),
							step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
								initial: {
									opacity: 0,
									y: 20
								},
								animate: {
									opacity: 1,
									y: 0
								},
								className: "bg-card rounded-3xl border border-border p-6 shadow-elegant",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
										className: "text-lg font-semibold mb-4 flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-5 w-5 text-primary" }), "Payment Method"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "space-y-3",
										children: paymentLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "space-y-3",
											children: [
												0,
												1,
												2
											].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-16 rounded-xl border bg-muted/40 animate-pulse" }, i))
										}) : paymentGateways.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted-foreground rounded-xl border border-dashed p-4",
											children: "No payment methods are available right now. Please enable at least one in the admin panel (Settings → Payment Gateways)."
										}) : paymentGateways.map((gw) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => selectPayment(gw),
											className: `w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${paymentMethodId === gw.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-xl leading-none",
													"aria-hidden": true,
													children: gw.icon || "💳"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-left",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-sm font-medium",
														children: gw.name
													}), gw.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-xs text-muted-foreground",
														children: gw.description
													}) : null]
												})]
											}), paymentMethodId === gw.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "h-5 w-5 text-primary" })]
										}, gw.id))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-3 mt-6",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => setStep(1),
											className: "flex-1 inline-flex items-center justify-center h-12 px-6 rounded-full border border-border bg-surface hover:bg-card transition-colors cursor-pointer",
											children: "Back"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => setStep(3),
											disabled: !paymentMethodId || paymentGateways.length === 0,
											className: "flex-1 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-gradient-primary text-primary-foreground font-medium shadow-glow hover:scale-[1.02] transition-transform cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
											children: ["Review Order", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4" })]
										})]
									})
								]
							}),
							step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
								initial: {
									opacity: 0,
									y: 20
								},
								animate: {
									opacity: 1,
									y: 0
								},
								className: "bg-card rounded-3xl border border-border p-6 shadow-elegant",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
										className: "text-lg font-semibold mb-4 flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "h-5 w-5 text-primary" }), "Review Order"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "p-4 rounded-xl bg-surface/50 space-y-2",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "text-sm font-medium",
															children: [
																title,
																" ",
																fullName
															]
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-2",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-4 w-4 text-primary" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-sm",
																children: mobileNumber
															}),
															alternateMobile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "text-sm text-muted-foreground",
																children: [
																	"(Alt: ",
																	alternateMobile,
																	")"
																]
															})
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-sm",
															children: emailAddress
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-start gap-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-4 w-4 text-primary mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-sm",
															children: deliveryAddress
														})]
													}),
													nearestLandmark && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-start gap-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, { className: "h-4 w-4 text-primary mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "text-sm",
															children: ["Near: ", nearestLandmark]
														})]
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-start gap-3 p-3 rounded-xl bg-surface/50",
												children: [deliveryType === "delivery" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "h-5 w-5 text-primary mt-0.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, { className: "h-5 w-5 text-primary mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-sm font-medium",
													children: deliveryType === "delivery" ? "Delivery" : "Pickup"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-sm text-muted-foreground",
													children: deliveryType === "delivery" ? "Home Delivery" : `Branch: ${selectedBranch?.name || "—"}`
												})] })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-start gap-3 p-3 rounded-xl bg-surface/50",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-5 w-5 text-primary mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-sm font-medium",
													children: "Payment Method"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-sm text-muted-foreground",
													children: paymentMethod || "—"
												})] })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "p-4 rounded-xl bg-surface/50",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-sm font-medium mb-3",
													children: "Order Items"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "space-y-3",
													children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-3 p-2 rounded-lg bg-card border border-border/50",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "h-16 w-16 rounded-lg overflow-hidden bg-gradient-to-br from-surface to-card shrink-0",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
																src: item.src,
																alt: item.name,
																className: "h-full w-full object-cover"
															})
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex-1 min-w-0",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																	className: "text-sm font-medium truncate",
																	children: item.name
																}),
																item.includedItems && item.includedItems.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
																	className: "text-xs text-muted-foreground truncate",
																	children: ["Includes: ", item.includedItems.join(", ")]
																}),
																item.addons && item.addons.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
																	className: "text-xs text-muted-foreground truncate",
																	children: [
																		item.includedItems?.length ? "Extras" : "+",
																		" ",
																		item.addons.join(", ")
																	]
																}),
																item.specialInstructions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																	className: "text-xs text-muted-foreground truncate",
																	children: item.specialInstructions
																}) : null,
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																	className: "flex items-center gap-2 mt-0.5",
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																		className: "text-xs text-muted-foreground",
																		children: ["×", item.quantity]
																	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																		className: "text-sm font-bold",
																		children: [item.currency, formatAmount(item.price * item.quantity)]
																	})]
																})
															]
														})]
													}, item.id))
												})]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-3 mt-6",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => setStep(2),
											disabled: isSubmitting,
											className: "flex-1 inline-flex items-center justify-center h-12 px-6 rounded-full border border-border bg-surface hover:bg-card transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
											children: "Back"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: handleConfirm,
											disabled: isSubmitting,
											className: "flex-1 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-gradient-primary text-primary-foreground font-medium shadow-glow hover:scale-[1.02] transition-transform cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "h-4 w-4" }), isSubmitting ? "Placing Order..." : "Confirm Order"]
										})]
									}),
									submitError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-sm text-destructive text-center",
										children: submitError
									})
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "lg:col-span-1 mt-8 lg:mt-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "sticky top-24 lg:top-28 max-h-[calc(100vh-7.5rem)] overflow-y-auto rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-elegant",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3 mb-5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: main_logo_default,
										alt: "Studio 7teas",
										className: "h-10 w-10 rounded-full object-contain bg-black p-1"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-lg font-semibold leading-tight",
										children: "Order Summary"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: [
											items.length,
											" item",
											items.length === 1 ? "" : "s"
										]
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-2 mb-4 max-h-56 sm:max-h-64 overflow-y-auto pr-1",
									children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-muted-foreground truncate",
												children: [
													item.quantity,
													"× ",
													item.name
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "shrink-0 tabular-nums",
												children: [item.currency, formatAmount(item.price * item.quantity)]
											})]
										}), item.includedItems?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-[11px] text-muted-foreground truncate pl-3",
											children: ["Includes: ", item.includedItems.join(", ")]
										}) : null]
									}, item.id))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3 text-sm border-t border-border pt-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Subtotal"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "tabular-nums",
												children: [items[0]?.currency || "Rs ", formatAmount(subtotal)]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2 rounded-xl border border-border p-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													className: "text-xs font-semibold text-muted-foreground",
													children: "Coupon code"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "text",
														value: couponCode,
														onChange: (e) => setCouponCode(e.target.value.toUpperCase()),
														placeholder: "e.g. WELCOME10",
														className: "flex-1 min-w-0 px-3 py-2 rounded-lg border border-border bg-surface text-sm font-mono uppercase focus:outline-none focus:border-primary",
														disabled: Boolean(appliedCoupon)
													}), appliedCoupon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														onClick: clearCoupon,
														className: "shrink-0 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted cursor-pointer",
														children: "Remove"
													}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														onClick: applyCoupon,
														disabled: couponBusy,
														className: "shrink-0 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60 cursor-pointer",
														children: couponBusy ? "…" : "Apply"
													})]
												}),
												couponMsg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: `text-xs ${appliedCoupon && couponDiscount > 0 ? "text-green-500" : "text-muted-foreground"}`,
													children: couponMsg
												}) : null
											]
										}),
										offerDiscount > 0 || appliedOfferTitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col gap-0.5 text-green-600 dark:text-green-400",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "truncate pr-2",
													children: [appliedOfferTitle || "Offer", " discount"]
												}), offerDiscount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "shrink-0 tabular-nums",
													children: [
														"−",
														items[0]?.currency || "Rs ",
														formatAmount(offerDiscount)
													]
												}) : null]
											}), appliedOfferDetail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: appliedOfferDetail
											}) : null]
										}) : null,
										couponDiscount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between text-green-600 dark:text-green-400",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Coupon ", appliedCoupon ? `(${appliedCoupon})` : ""] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "tabular-nums",
												children: [
													"−",
													items[0]?.currency || "Rs ",
													formatAmount(couponDiscount)
												]
											})]
										}) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Delivery"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "tabular-nums",
												children: deliveryFee === 0 ? "Free" : (items[0]?.currency || "Rs ") + formatAmount(deliveryFee)
											})]
										}),
										freeDeliveryMessage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-green-600 dark:text-green-400",
											children: freeDeliveryMessage
										}) : null,
										tax > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "GST (extra)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "tabular-nums",
												children: [items[0]?.currency || "Rs ", formatAmount(tax)]
											})]
										}) : taxInclusive > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between text-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Tax"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Included in prices"
											})]
										}) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between pt-3 border-t border-border font-bold text-base",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-primary tabular-nums",
												children: [items[0]?.currency || "Rs ", formatAmount(total)]
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 text-xs text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-3 w-3 text-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Need help? Call ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
											href: "tel:02136349898",
											className: "text-foreground font-medium hover:underline",
											children: "021-36349898"
										})] })]
									})
								})
							]
						})
					})]
				})
			]
		})
	});
}
function CheckoutComponent() {
	const navigate = useNavigate();
	const { items, clearCart } = useCartStore();
	const [isSubmitting, setIsSubmitting] = (0, import_react.useState)(false);
	const [submitError, setSubmitError] = (0, import_react.useState)(null);
	const orderPlacedRef = (0, import_react.useRef)(false);
	const handleConfirm = async (orderData) => {
		setIsSubmitting(true);
		setSubmitError(null);
		try {
			const order = await createOrder(buildOrderPayload(orderData));
			orderPlacedRef.current = true;
			await recoverAbandonedCart({
				sessionKey: getCheckoutSessionKey(),
				email: orderData.emailAddress
			}).catch(() => null);
			clearCart();
			navigate({
				to: "/track/$orderId",
				params: { orderId: order.id }
			});
		} catch (error) {
			setSubmitError(error instanceof Error ? error.message : "Failed to place order");
		} finally {
			setIsSubmitting(false);
		}
	};
	(0, import_react.useEffect)(() => {
		if (items.length === 0 && !orderPlacedRef.current) navigate({ to: "/" });
	}, [items.length, navigate]);
	if (items.length === 0) {
		if (orderPlacedRef.current) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "min-h-screen flex items-center justify-center pt-24 pb-16",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground",
				children: "Opening order tracking…"
			})
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "min-h-screen flex items-center justify-center pt-24 pb-16",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "h-8 w-8 text-primary" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl font-semibold mb-2",
						children: "Your cart is empty"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted-foreground",
						children: "Redirecting you to menu..."
					})
				]
			})
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckoutPage, {
		items,
		onConfirm: handleConfirm,
		isSubmitting,
		submitError
	});
}
//#endregion
export { CheckoutComponent as component };
