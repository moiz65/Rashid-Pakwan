import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/CartStore-DvzXC6en.js
var main_logo_default = "/assets/main_logo-CKsRij2W.png";
var BRANCH_ID_KEY = "selectedBranchId";
var LOCATION_KEY = "deliveryLocation";
function getStoredBranchId() {
	if (typeof window === "undefined") return null;
	const direct = localStorage.getItem(BRANCH_ID_KEY);
	if (direct) return direct;
	try {
		const raw = localStorage.getItem(LOCATION_KEY);
		if (!raw) return null;
		return JSON.parse(raw)?.branchId || null;
	} catch {
		return null;
	}
}
function getStoredDeliveryLocation() {
	if (typeof window === "undefined") return null;
	try {
		const raw = localStorage.getItem(LOCATION_KEY);
		if (!raw) return null;
		return JSON.parse(raw);
	} catch {
		return null;
	}
}
function saveBranchSelection(selection) {
	localStorage.setItem(BRANCH_ID_KEY, selection.branchId);
	localStorage.setItem(LOCATION_KEY, JSON.stringify(selection));
	window.dispatchEvent(new CustomEvent("branch-selected", { detail: selection }));
}
/**
* Formats a numeric amount without currency prefix.
* Whole integers have 0 decimal places, while fractional numbers have 2 decimal places.
*/
function formatAmount(amount) {
	const n = Number(amount) || 0;
	if (n % 1 === 0) return n.toLocaleString("en-PK", { maximumFractionDigits: 0 });
	return n.toLocaleString("en-PK", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
}
function buildLineId(item) {
	if (item.offerBundle?.offerId) {
		const lineKey = item.offerBundle.lines.map((l) => `${l.role}:${l.productId}x${l.qty}`).sort().join(",");
		return `offer:${item.offerBundle.offerId}|${lineKey}`;
	}
	const addonKey = (item.selectedAddons || []).map((a) => a.id).sort().join(",");
	const note = item.specialInstructions?.trim() || "";
	return `${item.productId}|${addonKey}|${note}`;
}
var useCartStore = create()(persist((set) => ({
	items: [],
	addItem: (item) => set((state) => {
		const productId = item.productId || item.id || "";
		const lineId = item.id || buildLineId({
			...item,
			productId
		});
		const quantity = item.quantity || 1;
		if (state.items.find((i) => i.id === lineId)) return { items: state.items.map((i) => i.id === lineId ? {
			...i,
			quantity: i.quantity + quantity
		} : i) };
		return { items: [...state.items, {
			...item,
			id: lineId,
			productId,
			quantity
		}] };
	}),
	removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
	updateQuantity: (id, quantity) => set((state) => ({ items: quantity <= 0 ? state.items.filter((i) => i.id !== id) : state.items.map((i) => i.id === id ? {
		...i,
		quantity
	} : i) })),
	clearCart: () => set({ items: [] })
}), { name: "cart-storage" }));
//#endregion
export { saveBranchSelection as a, main_logo_default as i, getStoredBranchId as n, useCartStore as o, getStoredDeliveryLocation as r, formatAmount as t };
