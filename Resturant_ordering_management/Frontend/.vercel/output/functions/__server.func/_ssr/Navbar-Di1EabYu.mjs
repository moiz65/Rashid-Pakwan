import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { M as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as create } from "../_libs/zustand.mjs";
import { a as saveBranchSelection, i as main_logo_default, n as getStoredBranchId, o as useCartStore, r as getStoredDeliveryLocation, t as formatAmount } from "./CartStore-DvzXC6en.mjs";
import { a as fetchPublicBranches, c as fetchPublicMenu, h as fetchTrackingSettings, s as fetchPublicDeliveryAreas } from "./api-DXmjlFkY.mjs";
import { n as AnimatePresence, t as motion } from "../_libs/framer-motion.mjs";
import { t as motion$1 } from "../_libs/motion.mjs";
import { A as CreditCard, C as Menu, I as ChevronDown, L as Check, M as Clock, P as ChevronRight, S as MessageSquare, T as MapPin, _ as Plus, a as Trash2, c as Store, d as ShoppingCart, f as ShoppingBag, i as Truck, m as Search, s as Tag, t as X, v as Phone, x as Minus } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Navbar-Di1EabYu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Group legacy multi-line BOGO rows ("Part of offer: …") into one deal card. */
function buildDisplayRows(items) {
	const offerGroups = /* @__PURE__ */ new Map();
	const rows = [];
	for (const item of items) {
		if (item.offerBundle) {
			rows.push({
				kind: "single",
				item: {
					...item,
					includedItems: item.includedItems?.length ? item.includedItems : item.offerBundle.lines.map((l) => `${l.qty}× ${l.name}${l.role === "get" ? " (FREE)" : ""}`)
				}
			});
			continue;
		}
		const match = item.specialInstructions?.match(/^Part of offer:\s*(.+?)\s*\((paid|free)/i);
		if (match) {
			const title = match[1].trim();
			const isFree = /free/i.test(match[2]);
			const existing = offerGroups.get(title) || {
				title,
				src: item.src,
				currency: item.currency,
				paidTotal: 0,
				freeLabels: [],
				paidLabels: [],
				memberIds: [],
				quantity: 1
			};
			existing.memberIds.push(item.id);
			if (!existing.src && item.src) existing.src = item.src;
			const label = `${item.quantity}× ${item.name}`;
			if (isFree) existing.freeLabels.push(`${label} (FREE)`);
			else {
				existing.paidLabels.push(label);
				existing.paidTotal += item.price * item.quantity;
			}
			offerGroups.set(title, existing);
			continue;
		}
		rows.push({
			kind: "single",
			item
		});
	}
	for (const group of offerGroups.values()) rows.push({
		kind: "offer",
		key: `legacy-offer:${group.title}`,
		title: group.title,
		src: group.src,
		currency: group.currency,
		lineTotal: group.paidTotal,
		quantity: group.quantity,
		includedItems: [...group.paidLabels, ...group.freeLabels],
		memberIds: group.memberIds
	});
	return rows;
}
function Cart({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem, onCheckout }) {
	const navigate = useNavigate();
	const [isCheckingOut, setIsCheckingOut] = (0, import_react.useState)(false);
	const displayRows = (0, import_react.useMemo)(() => buildDisplayRows(items), [items]);
	const subtotal = (0, import_react.useMemo)(() => {
		return displayRows.reduce((sum, row) => {
			if (row.kind === "single") return sum + row.item.price * row.item.quantity;
			return sum + row.lineTotal;
		}, 0);
	}, [displayRows]);
	const currency = items[0]?.currency || displayRows.find((r) => r.kind === "offer")?.currency || "Rs ";
	const itemCount = displayRows.reduce((n, row) => {
		if (row.kind === "single") return n + row.item.quantity;
		return n + row.quantity;
	}, 0);
	(0, import_react.useEffect)(() => {
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
	const removeOfferGroup = (memberIds) => {
		for (const id of memberIds) onRemoveItem(id);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion$1.div, {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		className: "fixed inset-0 z-50 bg-black/60 backdrop-blur-md",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion$1.div, {
			initial: { x: "100%" },
			animate: { x: 0 },
			exit: { x: "100%" },
			transition: {
				type: "spring",
				damping: 25,
				stiffness: 300
			},
			className: "absolute right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "sticky top-0 z-10 p-5 border-b border-border bg-card/95 backdrop-blur",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "h-5 w-5 text-primary" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-lg font-bold",
									children: "Your Cart"
								}),
								itemCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted-foreground",
									children: [
										"(",
										itemCount,
										")"
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: onClose,
							className: "h-9 w-9 rounded-full bg-surface hover:bg-primary/10 transition-colors flex items-center justify-center cursor-pointer",
							"aria-label": "Close cart",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex-1 overflow-y-auto p-5 space-y-3",
					children: items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center justify-center py-16 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-20 w-20 rounded-full bg-surface flex items-center justify-center mb-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "h-10 w-10 text-muted-foreground/30" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-base font-semibold mb-1",
								children: "Cart is empty"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground mb-4",
								children: "Add something delicious to get started."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: onClose,
								className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-primary text-primary-foreground text-sm font-medium cursor-pointer",
								children: ["Browse menu", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4" })]
							})
						]
					}) : displayRows.map((row) => {
						if (row.kind === "offer") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-3 p-3 rounded-2xl bg-surface/50 border border-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-16 w-16 rounded-xl overflow-hidden bg-surface shrink-0 relative",
								children: row.src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: row.src,
									alt: "",
									className: "h-full w-full object-cover"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full w-full grid place-items-center",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "h-6 w-6 text-primary" })
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] font-bold uppercase tracking-wider text-primary",
												children: "Offer"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
												className: "font-semibold text-sm truncate",
												children: row.title
											}),
											row.includedItems.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-xs text-muted-foreground mt-0.5",
												children: ["Includes: ", row.includedItems.join(", ")]
											}) : null
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => removeOfferGroup(row.memberIds),
										className: "h-8 w-8 rounded-full hover:bg-red-500/10 text-muted-foreground hover:text-red-500 flex items-center justify-center shrink-0 cursor-pointer",
										"aria-label": `Remove ${row.title}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex items-center justify-between mt-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-sm font-bold",
										children: [row.currency, formatAmount(row.lineTotal)]
									})
								})]
							})]
						}, row.key);
						const item = row.item;
						const isOffer = Boolean(item.offerBundle);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-3 p-3 rounded-2xl bg-surface/50 border border-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-16 w-16 rounded-xl overflow-hidden bg-surface shrink-0",
								children: item.src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: item.src,
									alt: "",
									className: "h-full w-full object-cover"
								}) : isOffer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full w-full grid place-items-center",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "h-6 w-6 text-primary" })
								}) : null
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [
											isOffer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] font-bold uppercase tracking-wider text-primary",
												children: "Offer"
											}) : null,
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
												className: "font-semibold text-sm truncate",
												children: item.name
											}),
											item.includedItems?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-xs text-muted-foreground mt-0.5",
												children: ["Includes: ", item.includedItems.join(", ")]
											}) : null,
											item.addons?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-xs text-muted-foreground",
												children: ["Extras: ", item.addons.join(", ")]
											}) : null,
											item.specialInstructions && !isOffer ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-xs text-muted-foreground mt-0.5 flex items-start gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-3 w-3 mt-0.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.specialInstructions })]
											}) : null
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => onRemoveItem(item.id),
										className: "h-8 w-8 rounded-full hover:bg-red-500/10 text-muted-foreground hover:text-red-500 flex items-center justify-center shrink-0 cursor-pointer",
										"aria-label": `Remove ${item.name}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between mt-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-sm font-bold",
										children: [item.currency, formatAmount(item.price * item.quantity)]
									}), !isOffer ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1 bg-card rounded-full border border-border p-0.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1)),
												className: "h-7 w-7 rounded-full hover:bg-primary/10 flex items-center justify-center cursor-pointer",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "h-3 w-3" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "w-7 text-center text-sm font-medium",
												children: item.quantity
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => onUpdateQuantity(item.id, item.quantity + 1),
												className: "h-7 w-7 rounded-full hover:bg-primary/10 flex items-center justify-center cursor-pointer",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3" })
											})
										]
									}) : null]
								})]
							})]
						}, item.id);
					})
				}),
				items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sticky bottom-0 p-5 border-t border-border bg-card/95 backdrop-blur space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between text-sm font-bold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Subtotal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-primary",
								children: [currency, formatAmount(subtotal)]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: handleCheckout,
							disabled: isCheckingOut,
							className: "w-full inline-flex items-center justify-center gap-2 h-12 rounded-full bg-gradient-primary text-primary-foreground font-medium shadow-glow disabled:opacity-70 cursor-pointer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-4 w-4" }), isCheckingOut ? "Opening checkout…" : "Checkout"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-center gap-4 text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "h-3 w-3" }), " Delivery & totals at checkout"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3 w-3" }), " 30–40 min"]
							})]
						})
					]
				})
			]
		})
	}) });
}
var useMenuStore = create((set, get) => ({
	categories: [],
	products: [],
	addons: [],
	drinks: [],
	loading: false,
	error: null,
	loaded: false,
	activeCategorySlug: null,
	selectedCategorySlugs: [],
	selectedBranchId: typeof window !== "undefined" ? getStoredBranchId() : null,
	searchQuery: "",
	onlySale: false,
	setSelectedBranchId: (branchId) => set({ selectedBranchId: branchId }),
	loadMenu: async (options = {}) => {
		const silent = Boolean(options.silent);
		const branchId = options.branchId !== void 0 ? options.branchId : get().selectedBranchId || getStoredBranchId();
		if (get().loading) return;
		set(silent ? {
			error: null,
			selectedBranchId: branchId
		} : {
			loading: true,
			error: null,
			selectedBranchId: branchId
		});
		try {
			const menu = await fetchPublicMenu(branchId);
			set({
				categories: menu.categories,
				products: menu.products,
				addons: menu.addons,
				drinks: menu.drinks,
				loading: false,
				loaded: true,
				selectedBranchId: branchId
			});
		} catch (err) {
			set({
				loading: false,
				loaded: true,
				error: err instanceof Error ? err.message : "Failed to load menu"
			});
		}
	},
	setActiveCategorySlug: (slug) => set({
		activeCategorySlug: slug,
		selectedCategorySlugs: slug ? [slug] : []
	}),
	setSelectedCategorySlugs: (slugs) => set({
		selectedCategorySlugs: slugs,
		activeCategorySlug: slugs.length > 0 ? slugs[0] : null
	}),
	toggleCategorySlug: (slug) => {
		const current = get().selectedCategorySlugs;
		const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
		set({
			selectedCategorySlugs: next,
			activeCategorySlug: next.length > 0 ? next[0] : null
		});
	},
	clearCategoryFilter: () => set({
		activeCategorySlug: null,
		selectedCategorySlugs: []
	}),
	setSearchQuery: (query) => set({ searchQuery: query }),
	setOnlySale: (value) => set({ onlySale: value })
}));
function DeliveryPopup() {
	const [isOpen, setIsOpen] = (0, import_react.useState)(false);
	const [activeTab, setActiveTab] = (0, import_react.useState)("delivery");
	const [branches, setBranches] = (0, import_react.useState)([]);
	const [areas, setAreas] = (0, import_react.useState)([]);
	const [loadingBranches, setLoadingBranches] = (0, import_react.useState)(true);
	const [loadingAreas, setLoadingAreas] = (0, import_react.useState)(true);
	const [selectedBranchId, setSelectedBranchId] = (0, import_react.useState)("");
	const [selectedAreaId, setSelectedAreaId] = (0, import_react.useState)("");
	const [isDropdownOpen, setIsDropdownOpen] = (0, import_react.useState)(false);
	const [searchTerm, setSearchTerm] = (0, import_react.useState)("");
	const [areaSearch, setAreaSearch] = (0, import_react.useState)("");
	const branchSearchRef = (0, import_react.useRef)(null);
	const areaSearchRef = (0, import_react.useRef)(null);
	const setMenuBranchId = useMenuStore((s) => s.setSelectedBranchId);
	const loadMenu = useMenuStore((s) => s.loadMenu);
	const clearCart = useCartStore((s) => s.clearCart);
	(0, import_react.useEffect)(() => {
		let active = true;
		async function load() {
			setLoadingBranches(true);
			try {
				const branchList = await fetchPublicBranches();
				if (!active) return;
				setBranches(branchList.filter((b) => b.status !== "inactive"));
			} catch {
				if (active) setBranches([]);
			} finally {
				if (active) setLoadingBranches(false);
			}
		}
		load();
		return () => {
			active = false;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		let active = true;
		async function loadAreas() {
			if (!selectedBranchId || activeTab !== "delivery") {
				setAreas([]);
				setLoadingAreas(false);
				return;
			}
			setLoadingAreas(true);
			try {
				const areaList = await fetchPublicDeliveryAreas(selectedBranchId);
				if (!active) return;
				setAreas(areaList);
				setSelectedAreaId((prev) => areaList.some((a) => a.id === prev) ? prev : "");
			} catch {
				if (active) setAreas([]);
			} finally {
				if (active) setLoadingAreas(false);
			}
		}
		loadAreas();
		return () => {
			active = false;
		};
	}, [selectedBranchId, activeTab]);
	(0, import_react.useEffect)(() => {
		const stored = getStoredDeliveryLocation();
		const hasSelected = getStoredBranchId();
		if (stored) {
			setActiveTab(stored.type === "pickup" ? "pickup" : "delivery");
			if (stored.branchId) setSelectedBranchId(stored.branchId);
			if (stored.areaId) setSelectedAreaId(stored.areaId);
		}
		if (!hasSelected) {
			const timer = setTimeout(() => {
				setIsOpen(true);
				document.body.style.overflow = "hidden";
			}, 600);
			return () => clearTimeout(timer);
		}
		if (hasSelected) setSelectedBranchId(hasSelected);
	}, []);
	(0, import_react.useEffect)(() => {
		const openPicker = () => {
			const stored = getStoredDeliveryLocation();
			const current = getStoredBranchId();
			if (current) setSelectedBranchId(current);
			if (stored?.type) setActiveTab(stored.type === "pickup" ? "pickup" : "delivery");
			if (stored?.areaId) setSelectedAreaId(stored.areaId);
			setIsOpen(true);
		};
		window.addEventListener("open-branch-picker", openPicker);
		return () => window.removeEventListener("open-branch-picker", openPicker);
	}, []);
	(0, import_react.useEffect)(() => {
		if (isOpen) document.body.style.overflow = "hidden";
		else document.body.style.overflow = "auto";
		return () => {
			document.body.style.overflow = "auto";
		};
	}, [isOpen]);
	(0, import_react.useEffect)(() => {
		if (isDropdownOpen && branchSearchRef.current) setTimeout(() => branchSearchRef.current?.focus(), 100);
	}, [isDropdownOpen]);
	(0, import_react.useEffect)(() => {
		if (isOpen && activeTab === "delivery" && areaSearchRef.current) setTimeout(() => areaSearchRef.current?.focus(), 150);
	}, [isOpen, activeTab]);
	const filteredBranches = branches.filter((branch) => branch.name.toLowerCase().includes(searchTerm.toLowerCase()) || (branch.address || "").toLowerCase().includes(searchTerm.toLowerCase()) || (branch.city || "").toLowerCase().includes(searchTerm.toLowerCase()));
	const filteredAreas = (0, import_react.useMemo)(() => {
		const q = areaSearch.trim().toLowerCase();
		if (!q) return areas;
		return areas.filter((a) => a.name.toLowerCase().includes(q));
	}, [areas, areaSearch]);
	const selectedBranch = branches.find((b) => b.id === selectedBranchId);
	const selectedArea = areas.find((a) => a.id === selectedAreaId);
	const canConfirm = Boolean(selectedBranchId) && (activeTab === "pickup" || Boolean(selectedAreaId));
	const handleConfirm = async () => {
		if (!selectedBranchId || !selectedBranch) {
			alert("Please select a nearby branch");
			return;
		}
		if (activeTab === "delivery" && !selectedArea) {
			alert("Please select your delivery area");
			return;
		}
		const previous = getStoredBranchId();
		saveBranchSelection({
			type: activeTab,
			branchId: selectedBranch.id,
			branchName: selectedBranch.name,
			location: activeTab === "delivery" ? selectedArea?.name : selectedBranch.city || selectedBranch.address || selectedBranch.name,
			areaId: activeTab === "delivery" ? selectedArea?.id : void 0,
			areaName: activeTab === "delivery" ? selectedArea?.name : void 0,
			areaCharge: activeTab === "delivery" ? selectedArea?.charge : void 0
		});
		if (previous && previous !== selectedBranch.id) clearCart();
		setMenuBranchId(selectedBranch.id);
		await loadMenu({ branchId: selectedBranch.id });
		setIsOpen(false);
		document.body.style.overflow = "auto";
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: {
				scale: .9,
				opacity: 0,
				y: 20
			},
			animate: {
				scale: 1,
				opacity: 1,
				y: 0
			},
			exit: {
				scale: .9,
				opacity: 0,
				y: 20
			},
			transition: {
				type: "spring",
				damping: 25,
				stiffness: 300
			},
			className: "relative bg-card rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden border border-border shadow-2xl flex flex-col",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-6 border-b border-border shrink-0 bg-card/95 backdrop-blur z-10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-center gap-2 mb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, { className: "h-6 w-6 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl font-bold text-center",
							children: activeTab === "delivery" ? "Select Your Location" : "Select Your Branch"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground text-center",
						children: activeTab === "delivery" ? "Please select your location." : "Choose a nearby branch for pickup"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-6 pb-0 shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2 bg-surface rounded-xl p-1 border border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setActiveTab("delivery"),
							className: `flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${activeTab === "delivery" ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground hover:bg-card/50"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "h-4 w-4" }), "Delivery"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setActiveTab("pickup"),
							className: `flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${activeTab === "pickup" ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground hover:bg-card/50"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, { className: "h-4 w-4" }), "Pickup"]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-6 space-y-4 overflow-y-auto flex-1 min-h-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-sm font-semibold block mb-2",
							children: "Select Nearby Branch"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setIsDropdownOpen(!isDropdownOpen),
								className: "w-full flex items-center justify-between p-3 rounded-xl border border-border bg-surface hover:border-primary/50 transition-colors cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4 text-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm truncate",
										children: selectedBranch ? `${selectedBranch.name}${selectedBranch.city ? ` · ${selectedBranch.city}` : ""}` : loadingBranches ? "Loading branches..." : "Select a branch"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `h-4 w-4 text-muted-foreground transition-transform ${isDropdownOpen ? "rotate-180" : ""}` })]
							}), isDropdownOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
								initial: {
									opacity: 0,
									y: 10
								},
								animate: {
									opacity: 1,
									y: 0
								},
								className: "absolute z-20 mt-2 w-full bg-card border border-border rounded-xl shadow-elegant overflow-hidden",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative p-2 border-b border-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											ref: branchSearchRef,
											type: "text",
											value: searchTerm,
											onChange: (e) => setSearchTerm(e.target.value),
											placeholder: "Search branches...",
											className: "w-full pl-9 pr-8 py-2 rounded-lg bg-surface border border-border focus:outline-none focus:border-primary text-sm transition-colors"
										}),
										searchTerm && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => {
												setSearchTerm("");
												branchSearchRef.current?.focus();
											},
											className: "absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "max-h-40 overflow-y-auto",
									children: filteredBranches.length > 0 ? filteredBranches.map((branch) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => {
											setSelectedBranchId(branch.id);
											setSelectedAreaId("");
											setIsDropdownOpen(false);
											setSearchTerm("");
										},
										className: "w-full flex items-center justify-between p-2.5 hover:bg-surface/80 transition-colors border-b border-border/50 last:border-0 cursor-pointer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col items-start text-left",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-sm font-medium",
												children: branch.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted-foreground",
												children: [branch.address, branch.city].filter(Boolean).join(", ") || branch.code
											})]
										}), selectedBranchId === branch.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4 text-primary shrink-0" })]
									}, branch.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "p-4 text-center text-sm text-muted-foreground",
										children: loadingBranches ? "Loading..." : "No branches available"
									})
								})]
							})]
						})] }),
						activeTab === "delivery" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-border overflow-hidden bg-surface/40",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "px-3 py-2.5 border-b border-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] font-semibold tracking-wide uppercase text-muted-foreground",
									children: "Please select your location"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative mt-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											ref: areaSearchRef,
											type: "text",
											value: areaSearch,
											onChange: (e) => setAreaSearch(e.target.value),
											placeholder: "Search area (A–Z)…",
											className: "w-full pl-9 pr-8 py-2 rounded-lg bg-card border border-border focus:outline-none focus:border-primary text-sm"
										}),
										areaSearch && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => {
												setAreaSearch("");
												areaSearchRef.current?.focus();
											},
											className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
										})
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "max-h-56 overflow-y-auto bg-card",
								children: loadingAreas ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "p-4 text-center text-sm text-muted-foreground",
									children: "Loading areas…"
								}) : filteredAreas.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "p-4 text-center text-sm text-muted-foreground",
									children: "No areas found"
								}) : filteredAreas.map((area) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setSelectedAreaId(area.id),
									className: `w-full flex items-center justify-between px-4 py-3 text-left border-b border-border/60 last:border-0 transition-colors cursor-pointer ${selectedAreaId === area.id ? "bg-primary/10 text-foreground" : "hover:bg-muted/60"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm font-medium",
										children: area.name
									}), selectedAreaId === area.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4 text-primary shrink-0" }) : null]
								}, area.id))
							})]
						}),
						selectedBranch && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
							initial: {
								opacity: 0,
								y: 10
							},
							animate: {
								opacity: 1,
								y: 0
							},
							className: "flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4 text-primary mt-0.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm font-medium text-primary",
								children: [selectedBranch.name, selectedArea ? ` · ${selectedArea.name}` : ""]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: activeTab === "delivery" && selectedArea ? `Delivery to ${selectedArea.name}` : [
									selectedBranch.address,
									selectedBranch.city,
									selectedBranch.hours
								].filter(Boolean).join(" · ") || "Menu for this branch will load after you confirm"
							})] })]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-6 border-t border-border shrink-0 bg-card/95 backdrop-blur",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: handleConfirm,
						disabled: !canConfirm,
						className: "w-full inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-gradient-primary text-primary-foreground font-medium shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
						children: "Select"
					})
				})
			]
		})
	}) });
}
var links = [
	{
		label: "Deals",
		href: "#deals"
	},
	{
		label: "Offers",
		href: "#offers"
	},
	{
		label: "Menu",
		href: "#menu"
	},
	{
		label: "Reviews",
		href: "#reviews"
	}
];
function Navbar() {
	const navigate = useNavigate();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [isCartOpen, setIsCartOpen] = (0, import_react.useState)(false);
	const [trackOrderId, setTrackOrderId] = (0, import_react.useState)("");
	const [activeHash, setActiveHash] = (0, import_react.useState)("");
	const [branchLabel, setBranchLabel] = (0, import_react.useState)("Select branch");
	const [phone, setPhone] = (0, import_react.useState)("");
	const { items, updateQuantity, removeItem } = useCartStore();
	const selectedBranchId = useMenuStore((s) => s.selectedBranchId);
	const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
	(0, import_react.useEffect)(() => {
		const syncHash = () => setActiveHash(window.location.hash || "#menu");
		syncHash();
		window.addEventListener("hashchange", syncHash);
		return () => window.removeEventListener("hashchange", syncHash);
	}, []);
	(0, import_react.useEffect)(() => {
		const syncBranch = () => {
			const stored = getStoredDeliveryLocation();
			if (stored?.type === "delivery" && stored.areaName) setBranchLabel(`${stored.areaName}`);
			else setBranchLabel(stored?.branchName || "Select branch");
		};
		syncBranch();
		window.addEventListener("branch-selected", syncBranch);
		return () => window.removeEventListener("branch-selected", syncBranch);
	}, [selectedBranchId]);
	(0, import_react.useEffect)(() => {
		let active = true;
		fetchTrackingSettings().then((s) => {
			if (active && s.phone?.trim()) setPhone(s.phone.trim());
		}).catch(() => {});
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
			search: {}
		});
	};
	const navLinkClass = (href) => `px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${activeHash === href ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion$1.header, {
			initial: {
				y: -24,
				opacity: 0
			},
			animate: {
				y: 0,
				opacity: 1
			},
			transition: {
				duration: .4,
				ease: "easeOut"
			},
			className: "fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/90 border-b border-border/60",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "h-16 flex items-center justify-between gap-3 relative",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 min-w-0 flex-1",
							children: [phone ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: `tel:${phone.replace(/\s+/g, "")}`,
								className: "hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20 shrink-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-3.5 w-3.5" }), phone]
							}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: openBranchPicker,
								className: "inline-flex items-center gap-1.5 h-8 max-w-[11rem] sm:max-w-[14rem] px-3 rounded-full bg-surface text-foreground text-xs border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer shrink-0",
								title: "Change branch",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5 text-primary shrink-0" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate font-medium",
										children: branchLabel
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-3 w-3 text-muted-foreground shrink-0" })
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute left-1/2 -translate-x-1/2 shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								className: "flex items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-14 w-14 sm:h-[80px] sm:w-[80px] rounded-full bg-black flex items-center justify-center shadow-[0_0_18px_0_#ff0000a0] overflow-hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: main_logo_default,
										alt: "Studio 7teas",
										className: "h-11 w-11 sm:h-[150px] sm:w-[150px] object-contain"
									})
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 ml-auto flex-1 justify-end",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "hidden lg:flex items-center gap-2 mr-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										placeholder: "e.g. K7M2XP",
										value: trackOrderId,
										onChange: (e) => setTrackOrderId(e.target.value.toUpperCase()),
										onKeyDown: (e) => e.key === "Enter" && handleTrackOrder(),
										className: "h-8 w-32 rounded-full border border-border bg-surface px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: handleTrackOrder,
										className: "inline-flex items-center gap-1 h-8 px-3 rounded-full border border-border bg-surface hover:bg-primary/10 text-xs font-medium transition-colors cursor-pointer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-3.5 w-3.5" }), "Track"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setIsCartOpen(true),
									className: "relative inline-flex items-center gap-2 h-9 px-3 sm:px-4 rounded-full bg-gradient-primary text-primary-foreground text-sm font-medium shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-4 w-4" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "hidden sm:inline",
											children: "Cart"
										}),
										totalItems > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center",
											children: totalItems
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setOpen((v) => !v),
									className: "md:hidden grid place-items-center h-9 w-9 rounded-full border border-border bg-surface cursor-pointer",
									"aria-label": "Toggle menu",
									children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "h-4 w-4" })
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					"aria-label": "Page sections",
					className: "hidden md:flex items-center justify-center gap-1 pt-5 pb-3 -mt-1 border-t border-border/50 pt-2",
					children: links.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: l.href,
						className: navLinkClass(l.href),
						children: l.label
					}, l.href))
				})]
			}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion$1.div, {
				initial: {
					opacity: 0,
					y: -8
				},
				animate: {
					opacity: 1,
					y: 0
				},
				className: "md:hidden border-t border-border bg-background/95 backdrop-blur-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "flex flex-col p-4 gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: openBranchPicker,
							className: "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left bg-primary/5 text-primary font-medium cursor-pointer",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4" }),
								"Change branch · ",
								branchLabel
							]
						}),
						links.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: l.href,
							onClick: () => setOpen(false),
							className: `px-3 py-2.5 rounded-lg text-sm transition-colors ${activeHash === l.href ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-card hover:text-foreground"}`,
							children: l.label
						}, l.href)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-3 py-2 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								placeholder: "e.g. K7M2XP",
								value: trackOrderId,
								onChange: (e) => setTrackOrderId(e.target.value.toUpperCase()),
								onKeyDown: (e) => e.key === "Enter" && handleTrackOrder(),
								className: "flex-1 h-10 rounded-lg border border-border bg-surface px-3 text-sm"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: handleTrackOrder,
								className: "h-10 px-4 rounded-lg bg-primary/10 text-primary text-sm font-medium cursor-pointer",
								children: "Track"
							})]
						})
					]
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cart, {
			isOpen: isCartOpen,
			onClose: () => setIsCartOpen(false),
			items,
			onUpdateQuantity: updateQuantity,
			onRemoveItem: removeItem,
			onCheckout: handleCheckout
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeliveryPopup, {})
	] });
}
//#endregion
export { useMenuStore as n, Navbar as t };
