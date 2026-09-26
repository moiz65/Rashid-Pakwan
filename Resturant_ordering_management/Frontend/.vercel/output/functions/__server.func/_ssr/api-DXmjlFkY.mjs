//#region node_modules/.nitro/vite/services/ssr/assets/api-DXmjlFkY.js
var API_BASE = "/api";
var API_KEY = "restaurant-public-api-key";
/** Expand offer/deal bundles into product lines for pricing & order create. */
function expandCartItemsForApi(items) {
	const out = [];
	for (const item of items) {
		if (item.offerBundle?.lines?.length) {
			const mult = Math.max(1, item.quantity || 1);
			for (const line of item.offerBundle.lines) out.push({
				productId: line.productId,
				name: line.name,
				qty: line.qty * mult,
				price: line.price,
				selectedAddons: []
			});
			continue;
		}
		out.push({
			productId: item.productId || item.id,
			name: item.name,
			qty: item.quantity,
			price: item.price,
			selectedAddons: item.selectedAddons || []
		});
	}
	return out;
}
async function parseResponse(response) {
	const body = await response.json().catch(() => ({}));
	if (!response.ok) throw new Error(body.message || "Request failed");
	return body.data;
}
function buildOrderPayload(orderData) {
	const noteLines = [
		`Delivery type: ${orderData.deliveryType}`,
		orderData.deliveryType === "pickup" && orderData.branch ? `Branch: ${orderData.branch}` : `Address: ${orderData.deliveryAddress}`,
		orderData.deliveryAreaName ? `Delivery area: ${orderData.deliveryAreaName}` : null,
		orderData.nearestLandmark ? `Landmark: ${orderData.nearestLandmark}` : null,
		`Payment: ${orderData.paymentMethod}`,
		orderData.alternateMobile ? `Alternate phone: ${orderData.alternateMobile}` : null,
		orderData.deliveryInstructions ? `Instructions: ${orderData.deliveryInstructions}` : null,
		...orderData.items.flatMap((item) => {
			const lines = [];
			if (item.includedItems?.length) lines.push(`${item.name} includes: ${item.includedItems.join(", ")}`);
			if (item.addons?.length) lines.push(`${item.name} extras: ${item.addons.join(", ")}`);
			if (item.specialInstructions) lines.push(`${item.name} note: ${item.specialInstructions}`);
			return lines;
		})
	].filter(Boolean);
	return {
		customerName: `${orderData.title} ${orderData.fullName}`.trim(),
		customerEmail: orderData.emailAddress.trim(),
		customerPhone: orderData.mobileNumber.trim(),
		items: expandCartItemsForApi(orderData.items),
		notes: noteLines.join("\n"),
		status: "pending",
		source: "website",
		couponCode: orderData.couponCode?.trim() || void 0,
		branchId: orderData.branchId || void 0,
		deliveryType: orderData.deliveryType,
		shippingMethodId: orderData.shippingMethodId || void 0,
		deliveryAreaId: orderData.deliveryAreaId || void 0
	};
}
async function fetchCheckoutQuote(items, couponCode, options) {
	const quote = (await parseResponse(await fetch(`${API_BASE}/public/checkout/quote`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": API_KEY
		},
		body: JSON.stringify({
			items,
			couponCode: couponCode || null,
			deliveryType: options?.deliveryType || "delivery",
			shippingMethodId: options?.shippingMethodId || null,
			deliveryAreaId: options?.deliveryAreaId || null
		})
	}))).quote;
	return {
		subtotal: Number(quote.subtotal || 0),
		offerDiscount: Number(quote.offerDiscount || 0),
		couponDiscount: Number(quote.couponDiscount || 0),
		taxAmount: Number(quote.taxAmount || 0),
		taxExclusive: Number(quote.taxExclusive || 0),
		taxInclusive: Number(quote.taxInclusive || 0),
		shippingFee: Number(quote.shippingFee || 0),
		freeDeliveryApplied: Boolean(quote.freeDeliveryApplied),
		freeDeliveryMessage: quote.freeDeliveryMessage || null,
		total: Number(quote.total || 0),
		couponCode: quote.couponCode || null,
		coversFullSubtotal: Boolean(quote.coversFullSubtotal),
		appliedOffer: quote.appliedOffer || null,
		shippingMethod: quote.shippingMethod || null
	};
}
async function validatePublicCoupon(code, subtotal = 0) {
	const data = await parseResponse(await fetch(`${API_BASE}/public/coupons/validate`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": API_KEY
		},
		body: JSON.stringify({
			code,
			subtotal
		})
	}));
	return {
		valid: Boolean(data.valid),
		discount: Number(data.discount || 0),
		message: String(data.message || ""),
		coupon: data.coupon || null
	};
}
var CHECKOUT_SESSION_KEY = "checkout-session-key";
function getCheckoutSessionKey() {
	if (typeof window === "undefined") return "";
	let key = localStorage.getItem(CHECKOUT_SESSION_KEY);
	if (!key) {
		key = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
		localStorage.setItem(CHECKOUT_SESSION_KEY, key);
	}
	return key;
}
async function upsertAbandonedCart(payload) {
	return (await parseResponse(await fetch(`${API_BASE}/public/abandoned-carts`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": API_KEY
		},
		body: JSON.stringify(payload)
	}))).cart;
}
async function recoverAbandonedCart(payload) {
	return (await parseResponse(await fetch(`${API_BASE}/public/abandoned-carts/recover`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": API_KEY
		},
		body: JSON.stringify(payload)
	}))).cart;
}
async function createOrder(payload) {
	return (await parseResponse(await fetch(`${API_BASE}/public/orders`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": API_KEY
		},
		body: JSON.stringify(payload)
	}))).order;
}
async function fetchPublicReviewEligibility(orderId, phone) {
	const query = phone ? `?phone=${encodeURIComponent(phone)}` : "";
	return parseResponse(await fetch(`${API_BASE}/public/orders/${orderId}/review${query}`));
}
async function submitPublicReview(orderId, payload, phone) {
	const query = phone ? `?phone=${encodeURIComponent(phone)}` : "";
	return (await parseResponse(await fetch(`${API_BASE}/public/orders/${orderId}/review${query}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload)
	}))).review;
}
async function fetchTrackingSettings() {
	return (await parseResponse(await fetch(`${API_BASE}/public/tracking-settings`))).settings;
}
async function fetchPublicOrder(orderId, phone) {
	const query = phone ? `?phone=${encodeURIComponent(phone)}` : "";
	return (await parseResponse(await fetch(`${API_BASE}/public/orders/${orderId}${query}`))).order;
}
function formatOrderId(id) {
	if (!id) return "";
	const raw = String(id).trim().replace(/^#/, "");
	if (!raw.includes("_") && raw.length <= 12) return raw.toUpperCase();
	const parts = raw.split("_");
	return (parts.length > 1 ? parts[parts.length - 1] : raw).slice(0, 12).toUpperCase();
}
function apiOrigin() {
	const base = "/api";
	if (base.startsWith("http")) return base.replace(/\/api\/?$/, "");
	return "https://red-yak-928925.hostingersite.com";
}
function resolveMediaUrl(path) {
	if (!path) return "";
	if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
	if (path.length <= 4 && !path.startsWith("/")) return "";
	const origin = apiOrigin();
	if (path.startsWith("/uploads")) return `${origin}${path}`;
	if (path.startsWith("/")) return `${origin}${path}`;
	return `${origin}/${path}`;
}
function toDisplayProduct(product) {
	const src = resolveMediaUrl(product.image);
	const price = Number(product.price ?? 0);
	const rawDiscount = product.discountedPrice != null ? Number(product.discountedPrice) : void 0;
	const hasValidDiscount = rawDiscount !== void 0 && rawDiscount > 0 && rawDiscount < price;
	const discountedPrice = hasValidDiscount ? rawDiscount : void 0;
	return {
		id: product.id,
		name: product.name,
		desc: product.description || "",
		price,
		currency: "Rs ",
		rating: Number(product.rating ?? 4.5),
		tag: product.tag || (hasValidDiscount ? "OFFER" : void 0),
		src,
		discountedPrice,
		addons: product.addons || []
	};
}
async function fetchPublicMenu(branchId) {
	const query = branchId ? `?branchId=${encodeURIComponent(branchId)}` : "";
	const data = await parseResponse(await fetch(`${API_BASE}/public/menu${query}`));
	return {
		categories: data.categories || [],
		products: data.products || [],
		addons: data.addons || [],
		drinks: data.drinks || []
	};
}
async function fetchPublicDeals(branchId) {
	const query = branchId ? `?branchId=${encodeURIComponent(branchId)}` : "";
	return (await parseResponse(await fetch(`${API_BASE}/public/deals${query}`))).deals || [];
}
async function fetchPublicBranches() {
	return (await parseResponse(await fetch(`${API_BASE}/public/branches`))).branches || [];
}
async function fetchPublicDeliveryAreas(branchId) {
	if (!branchId) return [];
	const query = `?branchId=${encodeURIComponent(branchId)}`;
	return (await parseResponse(await fetch(`${API_BASE}/public/delivery-areas${query}`))).areas || [];
}
async function fetchPublicShippingMethods() {
	return (await parseResponse(await fetch(`${API_BASE}/public/shipping-methods`))).shippingMethods || [];
}
async function fetchPublicOffers(branchId) {
	const query = branchId ? `?branchId=${encodeURIComponent(branchId)}` : "";
	return (await parseResponse(await fetch(`${API_BASE}/public/offers${query}`))).offers || [];
}
async function fetchPublicReviews(branchId, limit = 12) {
	const params = new URLSearchParams();
	if (branchId) params.set("branchId", branchId);
	params.set("limit", String(limit));
	const data = await parseResponse(await fetch(`${API_BASE}/public/reviews?${params}`));
	return {
		reviews: data.reviews || [],
		stats: data.stats || {
			reviewCount: 0,
			avgRating: null
		}
	};
}
async function fetchPublicPaymentGateways() {
	return (await parseResponse(await fetch(`${API_BASE}/public/payment-gateways`))).paymentGateways || [];
}
//#endregion
export { validatePublicCoupon as C, upsertAbandonedCart as S, getCheckoutSessionKey as _, fetchPublicBranches as a, submitPublicReview as b, fetchPublicMenu as c, fetchPublicPaymentGateways as d, fetchPublicReviewEligibility as f, formatOrderId as g, fetchTrackingSettings as h, fetchCheckoutQuote as i, fetchPublicOffers as l, fetchPublicShippingMethods as m, createOrder as n, fetchPublicDeals as o, fetchPublicReviews as p, expandCartItemsForApi as r, fetchPublicDeliveryAreas as s, buildOrderPayload as t, fetchPublicOrder as u, recoverAbandonedCart as v, toDisplayProduct as x, resolveMediaUrl as y };
