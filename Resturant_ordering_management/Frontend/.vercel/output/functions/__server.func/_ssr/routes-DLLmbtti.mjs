import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { o as useCartStore, r as getStoredDeliveryLocation, t as formatAmount } from "./CartStore-DvzXC6en.mjs";
import { h as fetchTrackingSettings, l as fetchPublicOffers, o as fetchPublicDeals, p as fetchPublicReviews, x as toDisplayProduct, y as resolveMediaUrl } from "./api-DXmjlFkY.mjs";
import { n as AnimatePresence } from "../_libs/framer-motion.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { D as Gift, F as ChevronLeft, H as Sparkles, L as Check, N as ChevronUp, O as Flame, P as ChevronRight, R as Cake, V as Utensils, _ as Plus, d as ShoppingCart, f as ShoppingBag, g as Quote, i as Truck, j as Coffee, l as Star, m as Search, o as Timer, p as ShieldCheck, s as Tag, t as X, u as SlidersHorizontal, x as Minus, y as Percent, z as ArrowRight } from "../_libs/lucide-react.mjs";
import { n as useMenuStore, t as Navbar } from "./Navbar-Di1EabYu.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DLLmbtti.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var slides = [
	{
		id: 1,
		image: "/assets/Banner2-BdLaw1Bv.png",
		title: "7Tea's Special Chicken Steak"
	},
	{
		id: 2,
		image: "/assets/Banner4-DkGggAXz.png",
		title: "7Tea's Special Makhni Handi"
	},
	{
		id: 3,
		image: "/assets/banner3-C8Y27uTL.png",
		title: "7Tea's Special Chicken Sizzler"
	}
];
function Hero() {
	const [currentSlide, setCurrentSlide] = (0, import_react.useState)(0);
	const [direction, setDirection] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const timer = setInterval(() => {
			setDirection(1);
			setCurrentSlide((prev) => (prev + 1) % slides.length);
		}, 4500);
		return () => window.clearInterval(timer);
	}, []);
	const nextSlide = () => {
		setDirection(1);
		setCurrentSlide((prev) => (prev + 1) % slides.length);
	};
	const prevSlide = () => {
		setDirection(-1);
		setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "relative pt-24 sm:pt-28 md:pt-36 lg:pt-40 pb-4 lg:pb-6 overflow-hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative aspect-[2/1] w-full overflow-hidden rounded-3xl sm:rounded-[2.25rem] bg-card border border-border/60 shadow-xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
						initial: false,
						custom: direction,
						mode: "wait",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
							custom: direction,
							initial: {
								opacity: 0,
								scale: 1.02
							},
							animate: {
								opacity: 1,
								scale: 1
							},
							exit: {
								opacity: 0,
								scale: .98
							},
							transition: { duration: .4 },
							className: "absolute inset-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: slides[currentSlide].image,
								alt: slides[currentSlide].title,
								className: "h-full w-full object-cover object-center"
							})
						}, currentSlide)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-x-0 bottom-4 flex justify-center items-center gap-2 z-10",
						children: slides.map((s, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								setDirection(index > currentSlide ? 1 : -1);
								setCurrentSlide(index);
							},
							"aria-label": `Go to slide ${index + 1}`,
							className: `h-2 rounded-full transition-all cursor-pointer ${index === currentSlide ? "w-8 bg-primary shadow-glow" : "w-2 bg-white/60 hover:bg-white"}`
						}, s.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: prevSlide,
						"aria-label": "Previous slide",
						className: "absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur border border-border/80 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer shadow-md",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-5 w-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: nextSlide,
						"aria-label": "Next slide",
						className: "absolute right-3 sm:left-auto sm:right-5 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur border border-border/80 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer shadow-md",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-5 w-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hidden sm:flex absolute bottom-4 right-4 z-10 items-center gap-2 px-3 py-1.5 rounded-2xl bg-background/90 backdrop-blur border border-border/80 text-[11px] font-semibold text-muted-foreground shadow-md",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "SECURE PAYMENTS" })]
					})
				]
			})
		})
	});
}
function Categories({ sticky = false }) {
	const scrollRef = (0, import_react.useRef)(null);
	const [showLeft, setShowLeft] = (0, import_react.useState)(false);
	const [showRight, setShowRight] = (0, import_react.useState)(true);
	const categories = useMenuStore((s) => s.categories);
	const products = useMenuStore((s) => s.products);
	const activeCategorySlug = useMenuStore((s) => s.activeCategorySlug);
	const selectedCategorySlugs = useMenuStore((s) => s.selectedCategorySlugs || []);
	const toggleCategorySlug = useMenuStore((s) => s.toggleCategorySlug);
	const clearCategoryFilter = useMenuStore((s) => s.clearCategoryFilter);
	const loadMenu = useMenuStore((s) => s.loadMenu);
	(0, import_react.useEffect)(() => {
		loadMenu();
	}, [loadMenu]);
	const chips = [
		{
			id: "all",
			name: "All Menu",
			slug: null,
			count: products.length,
			target: "menu-products"
		},
		{
			id: "deals-nav",
			name: "Deals",
			slug: "__deals__",
			count: 0,
			target: "deals"
		},
		...categories.map((c) => ({
			id: c.id,
			name: c.name,
			slug: c.slug,
			count: products.filter((p) => p.categoryId === c.id || p.categorySlug === c.slug).length,
			target: `category-${c.slug || c.id}`
		}))
	];
	const scroll = (direction) => {
		if (scrollRef.current) {
			const newScrollLeft = scrollRef.current.scrollLeft + (direction === "left" ? -250 : 250);
			scrollRef.current.scrollTo({
				left: newScrollLeft,
				behavior: "smooth"
			});
		}
	};
	const handleScroll = () => {
		if (scrollRef.current) {
			const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
			setShowLeft(scrollLeft > 20);
			setShowRight(scrollLeft < scrollWidth - clientWidth - 20);
		}
	};
	if (chips.length <= 1) return null;
	const isAllActive = selectedCategorySlugs.length === 0 && !activeCategorySlug;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `w-full bg-gradient-primary shadow-md border-y border-primary/40 ${sticky ? "sticky top-[74px] sm:top-[80px] md:top-[128px] lg:top-[136px] z-40" : ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative py-2.5 flex items-center",
			children: [
				showLeft && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => scroll("left"),
					"aria-label": "Scroll Left",
					className: "absolute left-2 z-10 h-7 w-7 rounded-full bg-white/90 text-primary shadow-md flex items-center justify-center hover:bg-white transition-all cursor-pointer",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-4 w-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					ref: scrollRef,
					onScroll: handleScroll,
					className: "flex items-center gap-2 overflow-x-auto scrollbar-hide w-full py-0.5 px-6",
					style: {
						scrollbarWidth: "none",
						msOverflowStyle: "none"
					},
					children: chips.map((category) => {
						const isActive = category.slug === "__deals__" ? false : category.slug == null ? isAllActive : selectedCategorySlugs.includes(category.slug) || activeCategorySlug === category.slug;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
							whileHover: { scale: 1.03 },
							whileTap: { scale: .97 },
							onClick: () => {
								if (category.slug === "__deals__") {
									const dealsEl = document.getElementById("deals");
									if (dealsEl) dealsEl.scrollIntoView({ behavior: "smooth" });
									return;
								}
								if (category.slug == null) {
									clearCategoryFilter();
									const element = document.getElementById("menu-products");
									if (element) element.scrollIntoView({ behavior: "smooth" });
									return;
								}
								toggleCategorySlug(category.slug);
								setTimeout(() => {
									const targetId = category.target || `category-${category.slug || category.id}`;
									const element = document.getElementById(targetId);
									if (element) element.scrollIntoView({ behavior: "smooth" });
									else {
										const menuEl = document.getElementById("menu-products");
										if (menuEl) menuEl.scrollIntoView({ behavior: "smooth" });
									}
								}, 60);
							},
							className: `shrink-0 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap cursor-pointer ${isActive ? "bg-white text-primary shadow-lg ring-2 ring-white/50" : "bg-white/10 text-white hover:bg-white/20 hover:text-white"}`,
							children: category.name
						}, category.id);
					})
				}),
				showRight && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => scroll("right"),
					"aria-label": "Scroll Right",
					className: "absolute right-2 z-10 h-7 w-7 rounded-full bg-white/90 text-primary shadow-md flex items-center justify-center hover:bg-white transition-all cursor-pointer",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4" })
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      ` })]
	});
}
function MenuSearchBar() {
	const searchQuery = useMenuStore((s) => s.searchQuery);
	const setSearchQuery = useMenuStore((s) => s.setSearchQuery);
	const onlySale = useMenuStore((s) => s.onlySale);
	const setOnlySale = useMenuStore((s) => s.setOnlySale);
	const focusMenu = () => {
		const el = document.getElementById("menu-products");
		if (el) el.scrollIntoView({
			behavior: "smooth",
			block: "start"
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		id: "search-bar",
		className: "scroll-mt-28 md:scroll-mt-[7.25rem] py-6 lg:py-8 border-b border-border/40 bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-xl mx-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex items-center rounded-full border-2 border-primary bg-card p-1.5 shadow-lg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-5 w-5 text-primary ml-3 shrink-0" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							value: searchQuery,
							onChange: (e) => setSearchQuery(e.target.value),
							onKeyDown: (e) => {
								if (e.key === "Enter") focusMenu();
							},
							placeholder: "Search for your favorite dish or tea...",
							className: "w-full px-3 py-2 bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/70"
						}),
						searchQuery ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setSearchQuery(""),
							className: "p-1.5 text-muted-foreground hover:text-foreground mr-1 cursor-pointer",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: focusMenu,
							"aria-label": "Search",
							className: "grid place-items-center h-9 w-9 rounded-full bg-gradient-primary text-primary-foreground shadow-glow shrink-0 hover:scale-105 active:scale-95 transition-transform cursor-pointer",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex items-center justify-center gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							setOnlySale(!onlySale);
							focusMenu();
						},
						className: `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${onlySale ? "bg-primary text-primary-foreground border-primary shadow-glow" : "bg-surface border-border text-muted-foreground hover:border-primary/50"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "h-3 w-3" }), "On Discount / Special Offers Only"]
					})
				})]
			})
		})
	});
}
/** One picker per included drink when customer chooses (qty 2 = two pickers). */
function buildDrinkChoiceSlots(items = []) {
	const slots = [];
	for (const item of items) {
		if (item.itemType !== "drink" || !item.customerChoice) continue;
		const total = Math.max(1, Number(item.qty) || 1);
		for (let i = 0; i < total; i++) {
			const key = `${item.id || item.name || "drink"}-${i}`;
			slots.push({
				key,
				item,
				slotIndex: i,
				total,
				label: total > 1 ? `Drink ${i + 1} of ${total}` : "Choose your drink"
			});
		}
	}
	return slots;
}
function drinksForDealSlot(item, menuDrinks) {
	const active = menuDrinks.filter((d) => d.status !== "inactive");
	const allowed = Array.isArray(item.choiceIds) ? item.choiceIds.filter(Boolean) : [];
	if (!allowed.length) return active;
	return active.filter((d) => allowed.includes(d.id));
}
/** Included drink — customer picks one from available options (no extra charge). */
function DrinkChoicePicker({ label, hint = "Included with your meal — pick any available drink below.", value, options, onChange, required = true }) {
	const selected = options.find((d) => d.id === value) || null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-primary/40 bg-primary/5 p-3 space-y-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground mt-0.5",
					children: hint
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[10px] uppercase tracking-wide text-primary shrink-0 font-semibold",
					children: "Included"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
				value,
				onChange: (e) => onChange(e.target.value),
				required,
				className: "w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "",
					children: "Select a drink…"
				}), options.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: d.id,
					children: d.name
				}, d.id))]
			}),
			selected?.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-xs text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: resolveMediaUrl(selected.image),
					alt: "",
					className: "h-8 w-8 rounded-lg object-cover"
				}), selected.name]
			}) : null
		]
	});
}
var DEALS_POLL_MS = 2e4;
function formatCountdown(ms) {
	if (ms <= 0) return "Ended";
	const totalSec = Math.floor(ms / 1e3);
	const h = Math.floor(totalSec / 3600);
	const m = Math.floor(totalSec % 3600 / 60);
	const s = totalSec % 60;
	const pad = (n) => String(n).padStart(2, "0");
	if (h > 0) return `${h}h ${pad(m)}m ${pad(s)}s`;
	return `${pad(m)}m ${pad(s)}s`;
}
function pad(n) {
	return String(n).padStart(2, "0");
}
function currentTimeOfDay(date) {
	return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
function normalizeTime(value) {
	if (!value) return null;
	const str = String(value).trim();
	if (/^\d{2}:\d{2}$/.test(str)) return `${str}:00`;
	if (/^\d{2}:\d{2}:\d{2}/.test(str)) return str.slice(0, 8);
	return null;
}
/** Client-side mirror of backend schedule so cards hide immediately when the window ends. */
function isDealLiveNow(deal, nowMs = Date.now()) {
	const now = new Date(nowMs);
	if (deal.startAt && nowMs < new Date(deal.startAt).getTime()) return false;
	if (deal.endAt && nowMs > new Date(deal.endAt).getTime()) return false;
	const days = deal.daysOfWeek;
	if (Array.isArray(days) && days.length > 0 && !days.map(Number).includes(now.getDay())) return false;
	const t = currentTimeOfDay(now);
	const start = normalizeTime(deal.dailyStartTime);
	const end = normalizeTime(deal.dailyEndTime);
	if (start && end) {
		if (start <= end) {
			if (t < start || t > end) return false;
		} else if (t < start && t > end) return false;
	} else if (start && t < start) return false;
	else if (end && t > end) return false;
	return true;
}
function DealCard({ deal, now, onAdd, justAdded }) {
	const endMs = deal.endAt ? new Date(deal.endAt).getTime() : null;
	const remaining = endMs != null ? endMs - now : null;
	const showTimer = deal.showCountdown && remaining != null && remaining > 0;
	const code = deal.couponCode || null;
	const badge = deal.badgeText || (deal.discountValue != null ? deal.discountType === "fixed" ? `Rs ${deal.discountValue} OFF` : `${deal.discountValue}% OFF` : deal.offerTitle || "Special Deal");
	const items = deal.items || [];
	const hasPrice = deal.price != null && Number(deal.price) > 0;
	const hasCompare = deal.originalPrice != null && Number(deal.originalPrice) > Number(deal.price ?? 0);
	const canAdd = hasPrice;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		initial: {
			opacity: 0,
			y: 24
		},
		whileInView: {
			opacity: 1,
			y: 0
		},
		viewport: {
			once: true,
			margin: "-60px"
		},
		transition: { duration: .5 },
		whileHover: { y: -4 },
		className: "group relative text-left rounded-3xl bg-card border border-border p-6 overflow-hidden hover:border-primary/50 transition-colors flex flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" }),
			deal.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative mb-4 overflow-hidden rounded-2xl aspect-[16/9]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: resolveMediaUrl(deal.image),
					alt: "",
					className: "h-full w-full object-cover"
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid place-items-center h-12 w-12 rounded-2xl bg-gradient-primary shadow-glow",
					children: code ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "h-6 w-6 text-primary-foreground" }) : deal.showCountdown ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timer, { className: "h-6 w-6 text-primary-foreground" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Percent, { className: "h-6 w-6 text-primary-foreground" })
				}), code ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-mono px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/30",
					children: code
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "relative mt-6 text-xl font-bold",
				children: deal.title
			}),
			deal.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "relative mt-1 text-sm text-muted-foreground",
				children: deal.description
			}) : null,
			items.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "relative mt-3 space-y-1 text-sm text-muted-foreground",
				children: [items.slice(0, 4).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					item.qty,
					"×",
					" ",
					item.customerChoice && item.itemType === "drink" ? "Choose your drink" : item.name,
					item.itemType && item.itemType !== "product" && !item.customerChoice ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-1 text-[10px] uppercase tracking-wide opacity-70",
						children: [
							"(",
							item.itemType,
							")"
						]
					}) : null
				] }, item.id || `${item.name}-${item.qty}`)), items.length > 4 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					"+",
					items.length - 4,
					" more"
				] }) : null]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mt-auto pt-6",
				children: [
					hasPrice ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-3xl font-display font-bold text-gradient-primary",
							children: ["Rs ", Number(deal.price).toFixed(0)]
						}), hasCompare ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-sm font-semibold text-red-500 line-through decoration-red-500/80 decoration-2",
							children: ["Rs ", Number(deal.originalPrice).toFixed(0)]
						}) : null]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-3xl font-display font-bold text-gradient-primary",
						children: badge
					}),
					hasPrice && badge ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm font-medium text-primary",
						children: badge
					}) : null,
					showTimer ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs font-mono text-muted-foreground flex items-center gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timer, { className: "h-3.5 w-3.5" }),
							"Ends in ",
							formatCountdown(remaining)
						]
					}) : null,
					canAdd ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => onAdd(deal),
						disabled: justAdded,
						className: "mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition disabled:opacity-70",
						children: justAdded ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }), " Added to cart"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "h-4 w-4" }), " Add to cart"] })
					}) : null
				]
			})
		]
	});
}
function HotDeals({ embedded = false }) {
	const [deals, setDeals] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [now, setNow] = (0, import_react.useState)(() => Date.now());
	const [addedId, setAddedId] = (0, import_react.useState)(null);
	const [selectedDeal, setSelectedDeal] = (0, import_react.useState)(null);
	const [extraAddonIds, setExtraAddonIds] = (0, import_react.useState)([]);
	/** slotKey (item.id) → chosen drink id */
	const [drinkChoices, setDrinkChoices] = (0, import_react.useState)({});
	const [quantity, setQuantity] = (0, import_react.useState)(1);
	const [specialInstructions, setSpecialInstructions] = (0, import_react.useState)("");
	const [showSuccess, setShowSuccess] = (0, import_react.useState)(false);
	const addItem = useCartStore((s) => s.addItem);
	const menuDrinks = useMenuStore((s) => s.drinks);
	const loadMenu = useMenuStore((s) => s.loadMenu);
	const selectedBranchId = useMenuStore((s) => s.selectedBranchId);
	const loadDeals = (0, import_react.useCallback)(async (showLoading = false) => {
		if (showLoading) setLoading(true);
		try {
			setDeals(await fetchPublicDeals(selectedBranchId));
		} catch {
			if (showLoading) setDeals([]);
		} finally {
			if (showLoading) setLoading(false);
		}
	}, [selectedBranchId]);
	(0, import_react.useEffect)(() => {
		if (!selectedBranchId) {
			setDeals([]);
			setLoading(false);
			return;
		}
		loadMenu({
			silent: true,
			branchId: selectedBranchId
		});
		loadDeals(true);
		const intervalId = window.setInterval(() => loadDeals(false), DEALS_POLL_MS);
		const onVisible = () => {
			if (document.visibilityState === "visible") loadDeals(false);
		};
		document.addEventListener("visibilitychange", onVisible);
		window.addEventListener("focus", onVisible);
		return () => {
			window.clearInterval(intervalId);
			document.removeEventListener("visibilitychange", onVisible);
			window.removeEventListener("focus", onVisible);
		};
	}, [
		loadDeals,
		loadMenu,
		selectedBranchId
	]);
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => setNow(Date.now()), 1e3);
		return () => window.clearInterval(id);
	}, []);
	const openDealModal = (deal) => {
		setSelectedDeal(deal);
		setExtraAddonIds([]);
		setDrinkChoices({});
		setQuantity(1);
		setSpecialInstructions("");
		setShowSuccess(false);
		document.body.style.overflow = "hidden";
	};
	const closeDealModal = () => {
		setSelectedDeal(null);
		setExtraAddonIds([]);
		setDrinkChoices({});
		setQuantity(1);
		setSpecialInstructions("");
		setShowSuccess(false);
		document.body.style.overflow = "auto";
	};
	const toggleExtraAddon = (id) => {
		setExtraAddonIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
	};
	const drinksForSlot = (item) => drinksForDealSlot(item, menuDrinks);
	const drinkChoiceSlots = selectedDeal ? buildDrinkChoiceSlots(selectedDeal.items || []) : [];
	const dealUnitPrice = () => {
		if (!selectedDeal) return 0;
		return Number(selectedDeal.price ?? 0) + (selectedDeal.addons || []).filter((a) => extraAddonIds.includes(a.id)).reduce((sum, a) => sum + Number(a.price || 0), 0);
	};
	const dealTotalPrice = () => dealUnitPrice() * quantity;
	const confirmAddDeal = () => {
		if (!selectedDeal) return;
		const price = Number(selectedDeal.price ?? 0);
		if (!Number.isFinite(price) || price <= 0) return;
		const items = selectedDeal.items || [];
		const choiceSlots = buildDrinkChoiceSlots(items);
		for (const slot of choiceSlots) if (!drinkChoices[slot.key]) {
			window.alert(`Please select ${slot.label.toLowerCase()} for this deal.`);
			return;
		}
		const includedLabels = [];
		for (const item of items) if (item.itemType === "drink" && item.customerChoice) {
			const total = Math.max(1, Number(item.qty) || 1);
			for (let i = 0; i < total; i++) {
				const key = `${item.id || item.name || "drink"}-${i}`;
				const drink = menuDrinks.find((d) => d.id === drinkChoices[key]);
				includedLabels.push(`1× ${drink?.name || "Drink"}`);
			}
		} else includedLabels.push(`${item.qty}× ${item.name}`);
		const bundle = includedLabels.join(", ");
		const includedAddonIds = new Set(items.filter((i) => i.itemType === "addon" && i.addonId).map((i) => i.addonId));
		const chosen = (selectedDeal.addons || []).filter((a) => extraAddonIds.includes(a.id) && !includedAddonIds.has(a.id));
		const addonTotal = chosen.reduce((sum, a) => sum + Number(a.price || 0), 0);
		const addonNames = chosen.map((a) => a.name);
		const chosenDrinkNames = choiceSlots.map((slot) => menuDrinks.find((d) => d.id === drinkChoices[slot.key])?.name).filter(Boolean);
		const noteParts = [
			bundle ? `Includes: ${bundle}` : null,
			chosenDrinkNames.length ? `Drink choice: ${chosenDrinkNames.join(", ")}` : null,
			addonNames.length ? `Extras: ${addonNames.join(", ")}` : null,
			selectedDeal.couponCode ? `Promo code: ${selectedDeal.couponCode}` : null,
			specialInstructions.trim() || null
		].filter(Boolean);
		addItem({
			productId: `deal:${selectedDeal.id}`,
			name: selectedDeal.title,
			desc: selectedDeal.description || "Deal combo",
			price: price + addonTotal,
			currency: "Rs ",
			src: resolveMediaUrl(selectedDeal.image) || "",
			includedItems: includedLabels,
			addons: addonNames,
			selectedAddons: chosen,
			specialInstructions: noteParts.join(" · ") || void 0,
			quantity
		});
		setAddedId(selectedDeal.id);
		setShowSuccess(true);
		window.setTimeout(() => closeDealModal(), 1200);
		window.setTimeout(() => setAddedId((cur) => cur === selectedDeal.id ? null : cur), 1600);
	};
	const visible = deals.filter((d) => isDealLiveNow(d, now));
	const dealImage = selectedDeal ? resolveMediaUrl(selectedDeal.image) : "";
	const hasCompare = selectedDeal?.originalPrice != null && Number(selectedDeal.originalPrice) > Number(selectedDeal.price ?? 0);
	const includedAddonIds = new Set((selectedDeal?.items || []).filter((i) => i.itemType === "addon" && i.addonId).map((i) => i.addonId));
	const extraAddons = (selectedDeal?.addons || []).filter((a) => !includedAddonIds.has(a.id));
	if (!loading && visible.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "deals",
		className: "py-8 lg:py-12 scroll-mt-28 md:scroll-mt-[7.25rem]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative rounded-3xl bg-gradient-to-r from-primary via-primary/95 to-red-950 p-6 sm:p-8 text-primary-foreground overflow-hidden shadow-xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative z-10",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/15 text-white border border-white/20 mb-2 inline-block",
								children: "CATEGORY SELECTION"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-2xl sm:text-3xl font-extrabold tracking-tight uppercase font-display text-white",
								children: "DEALS RANGE"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs sm:text-sm text-white/80 mt-1 max-w-xl",
								children: "Limited-time combo meals — pick your drink and extras, then add to cart."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative z-10 shrink-0 flex items-center gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-bold bg-white text-primary px-3 py-1.5 rounded-full shadow-md",
							children: loading ? "…" : `${visible.length} ${visible.length === 1 ? "Deal" : "Deals"}`
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Percent, { className: "absolute -right-4 -bottom-6 h-36 w-36 text-white/10 pointer-events-none" })
				]
			}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6",
				children: [
					0,
					1,
					2
				].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-72 rounded-3xl bg-muted/40 animate-pulse border border-border" }, i))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6",
				children: visible.map((deal) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DealCard, {
					deal,
					now,
					onAdd: openDealModal,
					justAdded: addedId === deal.id
				}, deal.id))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: selectedDeal ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
			initial: { opacity: 0 },
			animate: { opacity: 1 },
			exit: { opacity: 0 },
			className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm",
			onClick: closeDealModal,
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
				className: "relative bg-card rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-border shadow-2xl flex flex-col",
				onClick: (e) => e.stopPropagation(),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: closeDealModal,
					className: "absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid md:grid-cols-2 gap-0 min-h-0 flex-1 overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative aspect-[4/3] md:aspect-auto md:min-h-[420px] overflow-hidden bg-gradient-to-br from-surface to-card border-b md:border-b-0 md:border-r border-border",
						children: [dealImage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: dealImage,
							alt: selectedDeal.title,
							className: "absolute inset-0 h-full w-full object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-0 grid place-items-center bg-gradient-primary/20",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timer, { className: "h-16 w-16 text-primary opacity-60" })
						}), selectedDeal.badgeText ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute top-3 left-3 text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-primary text-primary-foreground shadow-glow",
							children: selectedDeal.badgeText
						}) : null]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col min-h-0 max-h-[90vh] md:max-h-none",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 overflow-y-auto p-5 sm:p-6 space-y-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "text-2xl font-bold pr-10",
											children: selectedDeal.title
										}),
										selectedDeal.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted-foreground mt-1",
											children: selectedDeal.description
										}) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-baseline gap-2 mt-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-2xl font-bold text-primary",
												children: ["Rs ", dealTotalPrice().toFixed(0)]
											}), hasCompare ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-sm font-semibold text-red-500 line-through decoration-red-500/80 decoration-2",
												children: ["Rs ", (Number(selectedDeal.originalPrice) * quantity).toFixed(0)]
											}) : null]
										})
									] }),
									(selectedDeal.items || []).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
										className: "rounded-2xl border border-border bg-surface/40 p-4 space-y-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "text-sm font-semibold",
												children: "Included in deal"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground mt-0.5",
												children: "Covered by the deal price — not charged again"
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
												className: "space-y-2",
												children: (selectedDeal.items || []).map((item) => {
													const key = item.id || item.name;
													if (item.itemType === "drink" && item.customerChoice) return null;
													return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
														className: "flex items-center justify-between gap-3 rounded-xl border border-border bg-background/50 px-3 py-2.5 text-sm",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "min-w-0 truncate",
															children: [
																item.qty,
																"× ",
																item.name
															]
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] uppercase tracking-wide text-muted-foreground shrink-0",
															children: "Included"
														})]
													}, key);
												})
											}),
											drinkChoiceSlots.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-3 pt-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-xs font-medium text-primary",
													children: ["Pick your included drink", drinkChoiceSlots.length > 1 ? "s" : ""]
												}), drinkChoiceSlots.map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrinkChoicePicker, {
													label: slot.label,
													value: drinkChoices[slot.key] || "",
													options: drinksForSlot(slot.item),
													onChange: (drinkId) => setDrinkChoices((prev) => ({
														...prev,
														[slot.key]: drinkId
													}))
												}, slot.key))]
											}) : null
										]
									}) : null,
									extraAddons.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
										className: "rounded-2xl border border-border p-4 space-y-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "text-sm font-semibold",
											children: "Add-ons"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground mt-0.5",
											children: "Optional — charged on top of the deal"
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "grid gap-2",
											children: extraAddons.map((addon) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "flex items-center justify-between gap-3 p-3 rounded-xl border border-border hover:border-primary/50 cursor-pointer transition-colors",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-3 min-w-0",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "checkbox",
														checked: extraAddonIds.includes(addon.id),
														onChange: () => toggleExtraAddon(addon.id),
														className: "h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-primary cursor-pointer"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-sm truncate",
														children: addon.name
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-sm font-medium shrink-0 tabular-nums",
													children: ["+Rs ", Number(addon.price || 0).toFixed(0)]
												})]
											}, addon.id))
										})]
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "text-sm font-semibold",
											children: "Special Instructions"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
											value: specialInstructions,
											onChange: (e) => setSpecialInstructions(e.target.value),
											placeholder: "Add any special requests...",
											className: "w-full px-3 py-2 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary transition-colors resize-none",
											rows: 2
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "shrink-0 border-t border-border p-4 sm:p-5 bg-card/95 backdrop-blur",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 bg-surface rounded-full border border-border p-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => setQuantity(Math.max(1, quantity - 1)),
												className: "h-8 w-8 rounded-full hover:bg-primary/10 flex items-center justify-center transition-colors cursor-pointer",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "h-3 w-3" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "w-8 text-center font-medium text-sm",
												children: quantity
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => setQuantity(quantity + 1),
												className: "h-8 w-8 rounded-full hover:bg-primary/10 flex items-center justify-center transition-colors cursor-pointer",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3" })
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: confirmAddDeal,
										className: "flex-1 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-gradient-primary text-primary-foreground font-medium shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "h-4 w-4" }),
											"Add to Cart — Rs ",
											dealTotalPrice().toFixed(0)
										]
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: showSuccess ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
								initial: {
									opacity: 0,
									y: 10
								},
								animate: {
									opacity: 1,
									y: 0
								},
								exit: {
									opacity: 0,
									y: 10
								},
								className: "absolute bottom-24 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg font-medium text-sm",
								children: "Added to cart!"
							}) : null })
						]
					})]
				})]
			})
		}) : null })]
	});
}
function SectionHeader({ eyebrow, title, subtitle }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		initial: {
			opacity: 0,
			y: 16
		},
		whileInView: {
			opacity: 1,
			y: 0
		},
		viewport: {
			once: true,
			margin: "-80px"
		},
		transition: { duration: .5 },
		className: "max-w-2xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs font-medium tracking-[0.2em] uppercase text-primary",
				children: eyebrow
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight",
				children: title
			}),
			subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm sm:text-base text-muted-foreground",
				children: subtitle
			})
		]
	});
}
var OFFERS_POLL_MS = 2e4;
function offerSubtitle(offer) {
	const desc = offer.description?.trim();
	if (desc && desc.toLowerCase() !== offer.title.trim().toLowerCase()) return desc;
	if (offer.type === "percentage") return `${Number(offer.discountValue || 0)}% off eligible items — auto-applied at checkout.`;
	if (offer.type === "fixed") return `Rs ${Number(offer.discountValue || 0)} off eligible items — auto-applied at checkout.`;
	if (offer.type === "bogo") return `Buy any ${offer.buyQty || 1}, get any ${offer.getQty || 1} free — pick from the offer categories.`;
	if (offer.type === "freebie") return "Free item when your order meets the minimum threshold.";
	if (offer.type === "free_delivery") return `Free delivery on all orders over Rs ${Number(offer.minOrder || 0)}.`;
	if (offer.type === "bundle") return offer.conditions?.trim() || "Bundle promotion — auto-applied at checkout.";
	return "Limited-time promotion — available across eligible items.";
}
function getOfferIcon(type) {
	switch (type) {
		case "free_delivery": return Truck;
		case "percentage":
		case "fixed": return Percent;
		case "bogo": return Gift;
		case "freebie": return Sparkles;
		default: return Tag;
	}
}
function productPrice(p) {
	const discounted = Number(p.discountedPrice);
	if (Number.isFinite(discounted) && discounted > 0) return discounted;
	return Number(p.price) || 0;
}
function selectionTotal(map) {
	return Object.values(map).reduce((s, n) => s + (Number(n) || 0), 0);
}
function ProductGridCard({ product, qty, onChange, maxReached, free = false }) {
	const img = resolveMediaUrl(product.image);
	const price = productPrice(product);
	const selected = qty > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `rounded-2xl border overflow-hidden transition-all ${selected ? free ? "border-emerald-500/60 ring-1 ring-emerald-500/30" : "border-primary/60 ring-1 ring-primary/30" : "border-border/70 hover:border-primary/35"} bg-card`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "aspect-[4/3] bg-muted relative overflow-hidden",
			children: [
				img ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: img,
					alt: product.name,
					className: "h-full w-full object-cover"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full w-full grid place-items-center text-muted-foreground text-xs",
					children: "No image"
				}),
				free ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-500 text-white",
					children: "Free"
				}) : null,
				selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute top-2 right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground grid place-items-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5" })
				}) : null
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-3 space-y-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold truncate",
					children: product.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground mt-0.5",
					children: free ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-emerald-600 dark:text-emerald-400 font-medium",
						children: "Included free"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Rs ", price.toFixed(0)] })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: qty <= 0,
						onClick: () => onChange(Math.max(0, qty - 1)),
						className: "h-8 w-8 rounded-full border border-border grid place-items-center disabled:opacity-40 cursor-pointer hover:bg-muted",
						"aria-label": `Decrease ${product.name}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "h-3.5 w-3.5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-semibold tabular-nums min-w-[1.5rem] text-center",
						children: qty
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: maxReached,
						onClick: () => onChange(qty + 1),
						className: "h-8 w-8 rounded-full border border-border grid place-items-center disabled:opacity-40 cursor-pointer hover:bg-muted",
						"aria-label": `Increase ${product.name}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" })
					})
				]
			})]
		})]
	});
}
function BogoOfferBuilder({ offer, onClose }) {
	const addItem = useCartStore((s) => s.addItem);
	const buyNeed = Math.max(1, Number(offer.buyQty) || 1);
	const getNeed = Math.max(1, Number(offer.getQty) || 1);
	const buyProducts = offer.buyProducts || [];
	const getProducts = offer.getProducts || [];
	const [tab, setTab] = (0, import_react.useState)("buy");
	const [buyQty, setBuyQty] = (0, import_react.useState)({});
	const [getQty, setGetQty] = (0, import_react.useState)({});
	const [added, setAdded] = (0, import_react.useState)(false);
	const buyCount = selectionTotal(buyQty);
	const getCount = selectionTotal(getQty);
	const buyReady = buyCount === buyNeed;
	const getReady = getCount === getNeed;
	const canAdd = buyReady && getReady;
	const paidTotal = (0, import_react.useMemo)(() => {
		return buyProducts.reduce((sum, p) => sum + productPrice(p) * (buyQty[p.id] || 0), 0);
	}, [buyProducts, buyQty]);
	const freeValue = (0, import_react.useMemo)(() => {
		return getProducts.reduce((sum, p) => sum + productPrice(p) * (getQty[p.id] || 0), 0);
	}, [getProducts, getQty]);
	const setBuy = (id, next) => {
		const others = buyCount - (buyQty[id] || 0);
		const capped = Math.max(0, Math.min(next, buyNeed - others));
		setBuyQty((prev) => {
			const copy = { ...prev };
			if (capped <= 0) delete copy[id];
			else copy[id] = capped;
			return copy;
		});
	};
	const setGet = (id, next) => {
		const others = getCount - (getQty[id] || 0);
		const capped = Math.max(0, Math.min(next, getNeed - others));
		setGetQty((prev) => {
			const copy = { ...prev };
			if (capped <= 0) delete copy[id];
			else copy[id] = capped;
			return copy;
		});
	};
	(0, import_react.useEffect)(() => {
		if (buyReady && !getReady) setTab("get");
	}, [buyReady, getReady]);
	const handleAdd = () => {
		if (!canAdd) {
			window.alert(`Select ${buyNeed} item${buyNeed > 1 ? "s" : ""} to buy and ${getNeed} free item${getNeed > 1 ? "s" : ""}.`);
			return;
		}
		const buyLines = [];
		const getLines = [];
		const includedLabels = [];
		for (const p of buyProducts) {
			const q = buyQty[p.id] || 0;
			if (q <= 0) continue;
			buyLines.push({
				productId: p.id,
				name: p.name,
				price: productPrice(p),
				qty: q,
				role: "buy"
			});
			includedLabels.push(`${q}× ${p.name}`);
		}
		for (const p of getProducts) {
			const q = getQty[p.id] || 0;
			if (q <= 0) continue;
			getLines.push({
				productId: p.id,
				name: p.name,
				price: productPrice(p),
				qty: q,
				role: "get"
			});
			includedLabels.push(`${q}× ${p.name} (FREE)`);
		}
		const paidTotal = buyLines.reduce((sum, l) => sum + l.price * l.qty, 0);
		const hero = buyProducts.find((p) => (buyQty[p.id] || 0) > 0) || getProducts.find((p) => (getQty[p.id] || 0) > 0);
		addItem({
			productId: `offer:${offer.id}`,
			name: offer.title,
			desc: offer.description || "Special offer",
			price: paidTotal,
			currency: "Rs ",
			src: resolveMediaUrl(hero?.image) || "",
			quantity: 1,
			includedItems: includedLabels,
			offerBundle: {
				offerId: offer.id,
				offerTitle: offer.title,
				lines: [...buyLines, ...getLines]
			}
		});
		setAdded(true);
		window.setTimeout(() => onClose(), 1100);
	};
	const list = tab === "buy" ? buyProducts : getProducts;
	const need = tab === "buy" ? buyNeed : getNeed;
	const count = tab === "buy" ? buyCount : getCount;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		className: "fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: {
				y: 40,
				opacity: 0
			},
			animate: {
				y: 0,
				opacity: 1
			},
			exit: {
				y: 40,
				opacity: 0
			},
			transition: {
				type: "spring",
				damping: 26,
				stiffness: 280
			},
			className: "relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-card border border-border shadow-2xl",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sticky top-0 z-10 p-5 border-b border-border bg-card/95 backdrop-blur space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/25",
								children: offer.badgeText || `Buy ${buyNeed} Get ${getNeed}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-xl font-bold mt-2",
								children: offer.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground mt-1",
								children: "Browse like a menu category — pick paid items, then free items."
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onClose,
							className: "h-9 w-9 rounded-full border border-border grid place-items-center cursor-pointer hover:bg-muted shrink-0",
							"aria-label": "Close",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2 p-1 rounded-full bg-surface border border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setTab("buy"),
							className: `flex-1 h-10 rounded-full text-sm font-semibold transition-colors cursor-pointer ${tab === "buy" ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"}`,
							children: [
								"Buy any ",
								buyNeed,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "ml-1.5 text-xs opacity-80",
									children: [
										buyCount,
										"/",
										buyNeed
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setTab("get"),
							className: `flex-1 h-10 rounded-full text-sm font-semibold transition-colors cursor-pointer ${tab === "get" ? "bg-emerald-600 text-white shadow-md" : "text-muted-foreground hover:text-foreground"}`,
							children: [
								"Free any ",
								getNeed,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "ml-1.5 text-xs opacity-80",
									children: [
										getCount,
										"/",
										getNeed
									]
								})
							]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground mb-3",
						children: [
							tab === "buy" ? `Select any ${need} item${need > 1 ? "s" : ""} from this category` : `Select any ${need} free item${need > 1 ? "s" : ""} from this category`,
							" · ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-medium text-foreground",
								children: [
									count,
									"/",
									need,
									" selected"
								]
							})
						]
					}), list.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 sm:grid-cols-3 gap-3",
						children: list.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductGridCard, {
							product: p,
							qty: (tab === "buy" ? buyQty : getQty)[p.id] || 0,
							maxReached: count >= need,
							free: tab === "get",
							onChange: (n) => tab === "buy" ? setBuy(p.id, n) : setGet(p.id, n)
						}, p.id))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground py-10 text-center",
						children: "No products in this offer category yet."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sticky bottom-0 p-5 border-t border-border bg-card/95 backdrop-blur space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: [
								"You pay ~ ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-semibold text-foreground",
									children: ["Rs ", paidTotal.toFixed(0)]
								}),
								freeValue > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									" ",
									"· Save ~",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-semibold text-emerald-600 dark:text-emerald-400",
										children: ["Rs ", freeValue.toFixed(0)]
									})
								] }) : null
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] text-muted-foreground",
							children: "Discount applied at checkout"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: !canAdd || added,
						onClick: handleAdd,
						className: "w-full h-12 rounded-full bg-gradient-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 shadow-glow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-transform",
						children: added ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }), "Added to cart"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-4 w-4" }), "Add offer to cart"] })
					})]
				})
			]
		})
	});
}
function BogoOfferCard({ offer, index, onOpen }) {
	const buyNeed = Math.max(1, Number(offer.buyQty) || 1);
	const getNeed = Math.max(1, Number(offer.getQty) || 1);
	const buyProducts = offer.buyProducts || [];
	const getProducts = offer.getProducts || [];
	const preview = [...buyProducts, ...getProducts].slice(0, 4);
	const hero = preview[0];
	const heroImg = hero ? resolveMediaUrl(hero.image) : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.article, {
		initial: {
			opacity: 0,
			y: 20
		},
		whileInView: {
			opacity: 1,
			y: 0
		},
		viewport: {
			once: true,
			margin: "-40px"
		},
		transition: {
			duration: .4,
			delay: index * .05
		},
		whileHover: { y: -6 },
		className: "group flex h-full flex-col rounded-3xl bg-card border border-border overflow-hidden hover:border-primary/50 transition-colors shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative aspect-[4/3] grid place-items-center bg-gradient-to-br from-surface to-card overflow-hidden",
			children: [
				heroImg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: heroImg,
					alt: "",
					className: "h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "h-12 w-12 text-muted-foreground/40" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute top-3 left-3 text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-primary text-primary-foreground shadow-glow",
					children: offer.badgeText || `Buy ${buyNeed} Get ${getNeed}`
				}),
				preview.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute bottom-3 left-3 flex -space-x-2",
					children: preview.slice(1).map((p) => {
						const img = resolveMediaUrl(p.image);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-9 w-9 rounded-full border-2 border-card overflow-hidden bg-muted",
							title: p.name,
							children: img ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: img,
								alt: "",
								className: "h-full w-full object-cover"
							}) : null
						}, p.id);
					})
				}) : null
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col gap-3 p-4 sm:p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-bold text-base leading-snug line-clamp-2",
						children: offer.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed",
						children: offer.description?.trim() || `Any ${buyNeed} from paid list · Any ${getNeed} free from free list`
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[11px] px-2.5 py-1 rounded-full bg-surface border border-border text-muted-foreground",
						children: ["Buy · ", buyProducts.length]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400",
						children: ["Free · ", getProducts.length]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onOpen,
					className: "mt-auto inline-flex items-center justify-center gap-2 h-11 w-full rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold shadow-glow cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-transform",
					children: ["Choose items", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
				})
			]
		})]
	});
}
function SimpleOfferCard({ offer, index, onSelectOffer }) {
	const Icon = getOfferIcon(offer.type);
	const badge = offer.badgeText || (offer.type === "free_delivery" ? "Free Delivery" : offer.type === "percentage" ? `${offer.discountValue}% OFF` : "Special Offer");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		initial: {
			opacity: 0,
			y: 20
		},
		whileInView: {
			opacity: 1,
			y: 0
		},
		viewport: {
			once: true,
			margin: "-40px"
		},
		transition: {
			duration: .4,
			delay: index * .08
		},
		whileHover: { y: -4 },
		className: "group relative rounded-3xl bg-card border border-border/80 p-6 flex flex-col justify-between hover:border-primary/60 transition-all duration-300 shadow-sm hover:shadow-glow",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3 mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid place-items-center h-11 w-11 rounded-2xl bg-primary/15 text-primary border border-primary/20 group-hover:bg-gradient-primary group-hover:text-primary-foreground transition-all duration-300",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20",
					children: badge
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-lg font-bold text-foreground group-hover:text-primary transition-colors",
				children: offer.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed",
				children: offerSubtitle(offer)
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 pt-4 border-t border-border/60 flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[11px] font-medium text-muted-foreground/80 uppercase tracking-wide",
				children: "Auto-applied at checkout"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: "#menu",
				onClick: () => onSelectOffer?.(offer),
				className: "inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-glow transition-colors",
				children: ["View Menu", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3.5 w-3.5" })]
			})]
		})]
	});
}
function OffersMenu({ onSelectOffer }) {
	const [offers, setOffers] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [activeBogo, setActiveBogo] = (0, import_react.useState)(null);
	const loadMenu = useMenuStore((s) => s.loadMenu);
	const selectedBranchId = useMenuStore((s) => s.selectedBranchId);
	const loadOffers = (0, import_react.useCallback)(async (showLoading = false) => {
		if (showLoading) setLoading(true);
		try {
			setOffers((await fetchPublicOffers(selectedBranchId)).filter((o) => o.active !== false));
		} catch {
			setOffers([]);
		} finally {
			if (showLoading) setLoading(false);
		}
	}, [selectedBranchId]);
	(0, import_react.useEffect)(() => {
		if (!selectedBranchId) {
			setOffers([]);
			setLoading(false);
			return;
		}
		loadMenu({ branchId: selectedBranchId });
		loadOffers(true);
		const id = window.setInterval(() => loadOffers(false), OFFERS_POLL_MS);
		return () => window.clearInterval(id);
	}, [
		loadMenu,
		loadOffers,
		selectedBranchId
	]);
	(0, import_react.useEffect)(() => {
		if (!activeBogo) return;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = "auto";
		};
	}, [activeBogo]);
	if (!loading && offers.length === 0) return null;
	const bogoOffers = offers.filter((o) => o.type === "bogo");
	const otherOffers = offers.filter((o) => o.type !== "bogo");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "offers",
		className: "py-10 lg:py-16 scroll-mt-28 md:scroll-mt-[7.25rem] bg-surface/30 border-y border-border/40",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				eyebrow: "Special Promotions",
				title: "Active Offers & Discounts",
				subtitle: "Browse offer categories like the menu — pick any paid items, then any free items."
			}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6",
				children: [
					0,
					1,
					2
				].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-72 rounded-3xl bg-muted/30 animate-pulse border border-border" }, i))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10 space-y-6",
				children: [bogoOffers.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6",
					children: bogoOffers.map((offer, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BogoOfferCard, {
						offer,
						index: idx,
						onOpen: () => setActiveBogo(offer)
					}, offer.id))
				}) : null, otherOffers.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6",
					children: otherOffers.map((offer, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SimpleOfferCard, {
						offer,
						index: idx,
						onSelectOffer
					}, offer.id))
				}) : null]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: activeBogo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BogoOfferBuilder, {
			offer: activeBogo,
			onClose: () => setActiveBogo(null)
		}) : null })]
	});
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("shimmer rounded-md bg-card/60 border border-border/40", className),
		...props
	});
}
function ProductSection({ title = "Popular Items", eyebrow = "Featured", subtitle = "Hand-picked favorites trending this week.", products, loading = false, emptyMessage = "No items available right now.", showHeader = true, enableDrinks = false }) {
	const [selectedProduct, setSelectedProduct] = (0, import_react.useState)(null);
	const [quantity, setQuantity] = (0, import_react.useState)(1);
	const [specialInstructions, setSpecialInstructions] = (0, import_react.useState)("");
	const [selectedAddons, setSelectedAddons] = (0, import_react.useState)([]);
	const [selectedDrinkId, setSelectedDrinkId] = (0, import_react.useState)("");
	const [showSuccess, setShowSuccess] = (0, import_react.useState)(false);
	const { addItem } = useCartStore();
	const menuDrinks = useMenuStore((s) => s.drinks);
	const availableAddons = selectedProduct?.addons || [];
	const drinkOptions = enableDrinks ? [...menuDrinks].filter((d) => d.status !== "inactive").sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) : [];
	const selectedDrink = drinkOptions.find((d) => d.id === selectedDrinkId) || null;
	const openPopup = (product) => {
		setSelectedProduct(product);
		setQuantity(1);
		setSpecialInstructions("");
		setSelectedAddons([]);
		setSelectedDrinkId("");
		setShowSuccess(false);
		document.body.style.overflow = "hidden";
	};
	const closePopup = () => {
		setSelectedProduct(null);
		document.body.style.overflow = "auto";
	};
	const toggleAddon = (addonId) => {
		setSelectedAddons((prev) => prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]);
	};
	const getUnitPrice = () => {
		if (!selectedProduct) return 0;
		const basePrice = selectedProduct.discountedPrice != null && selectedProduct.discountedPrice > 0 && selectedProduct.discountedPrice < selectedProduct.price ? selectedProduct.discountedPrice : selectedProduct.price;
		const addonsTotal = availableAddons.filter((a) => selectedAddons.includes(a.id)).reduce((sum, a) => sum + a.price, 0);
		const drinkPrice = selectedDrink ? Number(selectedDrink.price || 0) : 0;
		return basePrice + addonsTotal + drinkPrice;
	};
	const getOriginalTotalPrice = () => {
		if (!selectedProduct) return 0;
		const addonsTotal = availableAddons.filter((a) => selectedAddons.includes(a.id)).reduce((sum, a) => sum + a.price, 0);
		const drinkPrice = selectedDrink ? Number(selectedDrink.price || 0) : 0;
		return (selectedProduct.price + addonsTotal + drinkPrice) * quantity;
	};
	const getTotalPrice = () => getUnitPrice() * quantity;
	const handleAddToCart = () => {
		if (!selectedProduct) return;
		const chosen = availableAddons.filter((a) => selectedAddons.includes(a.id));
		const addonNames = chosen.map((a) => a.name);
		const drinkNote = selectedDrink ? `Drink: ${selectedDrink.name}` : null;
		const notes = [specialInstructions.trim(), drinkNote].filter(Boolean).join(" · ");
		addItem({
			productId: selectedProduct.id,
			name: selectedDrink ? `${selectedProduct.name} + ${selectedDrink.name}` : selectedProduct.name,
			desc: selectedProduct.desc,
			price: getUnitPrice(),
			currency: selectedProduct.currency,
			src: selectedProduct.src,
			addons: addonNames,
			selectedAddons: chosen,
			specialInstructions: notes || void 0,
			quantity
		});
		setShowSuccess(true);
		setTimeout(() => closePopup(), 1200);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: showHeader ? "py-10 lg:py-14" : "py-4 lg:py-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
			children: [showHeader && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				eyebrow,
				title,
				subtitle
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `${showHeader ? "mt-12" : "mt-6"} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6`,
				children: loading ? Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductSkeleton, {}, i)) : products.length === 0 ? emptyMessage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "col-span-full text-center text-muted-foreground py-12",
					children: emptyMessage
				}) : null : products.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
					p,
					i,
					onAddToCart: () => openPopup(p)
				}, p.id))
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: selectedProduct && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm",
		onClick: closePopup,
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
			className: "relative bg-card rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-border shadow-2xl",
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: closePopup,
				className: "absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid md:grid-cols-2 gap-6 p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-surface to-card border border-border",
					children: selectedProduct.src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: selectedProduct.src,
						alt: selectedProduct.name,
						className: "h-full w-full object-cover"
					}) : null
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl font-bold",
							children: selectedProduct.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground mt-1",
							children: selectedProduct.desc
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-2xl font-bold text-primary",
								children: [selectedProduct.currency, formatAmount(getTotalPrice())]
							}), selectedProduct.discountedPrice != null && selectedProduct.discountedPrice > 0 && selectedProduct.discountedPrice < selectedProduct.price && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm font-semibold text-red-500 line-through decoration-red-500/80 decoration-2",
								children: [selectedProduct.currency, formatAmount(getOriginalTotalPrice())]
							})]
						}),
						drinkOptions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-t border-border pt-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-sm font-semibold mb-2",
									children: "Add a drink"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground mb-2",
									children: "Optional — pick one to add with this item."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: selectedDrinkId,
									onChange: (e) => setSelectedDrinkId(e.target.value),
									className: "w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "No drink"
									}), drinkOptions.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: d.id,
										children: [
											d.name,
											" — ",
											selectedProduct.currency,
											Number(d.price || 0).toFixed(0)
										]
									}, d.id))]
								}),
								selectedDrink?.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex items-center gap-2 text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: resolveMediaUrl(selectedDrink.image),
										alt: "",
										className: "h-8 w-8 rounded-lg object-cover"
									}), selectedDrink.name]
								}) : null
							]
						}),
						availableAddons.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-t border-border pt-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-sm font-semibold mb-3",
								children: "Add-ons"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-2",
								children: availableAddons.map((addon) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/50 cursor-pointer transition-colors",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: selectedAddons.includes(addon.id),
											onChange: () => toggleAddon(addon.id),
											className: "h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm",
											children: addon.name
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-sm font-medium",
										children: [selectedProduct.currency, formatAmount(addon.price)]
									})]
								}, addon.id))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-t border-border pt-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-sm font-semibold mb-2",
								children: "Special Instructions"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								value: specialInstructions,
								onChange: (e) => setSpecialInstructions(e.target.value),
								placeholder: "Add any special requests...",
								className: "w-full px-3 py-2 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary transition-colors resize-none",
								rows: 2
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "border-t border-border pt-4 mt-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 bg-surface rounded-full border border-border p-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => setQuantity(Math.max(1, quantity - 1)),
											className: "h-8 w-8 rounded-full hover:bg-primary/10 flex items-center justify-center transition-colors cursor-pointer",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "h-3 w-3" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "w-8 text-center font-medium text-sm",
											children: quantity
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => setQuantity(quantity + 1),
											className: "h-8 w-8 rounded-full hover:bg-primary/10 flex items-center justify-center transition-colors cursor-pointer",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3" })
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: handleAddToCart,
									className: "flex-1 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-gradient-primary text-primary-foreground font-medium shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "h-4 w-4" }),
										"Add to Cart — ",
										selectedProduct.currency,
										formatAmount(getTotalPrice())
									]
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: showSuccess && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
							initial: {
								opacity: 0,
								y: 10
							},
							animate: {
								opacity: 1,
								y: 0
							},
							exit: {
								opacity: 0,
								y: 10
							},
							className: "absolute bottom-24 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg font-medium text-sm",
							children: "Added to cart!"
						}) })
					]
				})]
			})]
		})
	}) })] });
}
function ProductCard({ p, i, onAddToCart }) {
	const hasDiscount = p.discountedPrice != null && p.discountedPrice > 0 && p.discountedPrice < p.price;
	const currentPrice = hasDiscount ? p.discountedPrice : p.price;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.article, {
		initial: {
			opacity: 0,
			y: 20
		},
		whileInView: {
			opacity: 1,
			y: 0
		},
		viewport: {
			once: true,
			margin: "-40px"
		},
		transition: {
			duration: .45,
			delay: i * .05
		},
		whileHover: { y: -6 },
		className: "group flex flex-col rounded-3xl bg-card border border-border overflow-hidden hover:border-primary/50 transition-colors shadow-sm h-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative aspect-[4/3] grid place-items-center bg-gradient-to-br from-surface to-card overflow-hidden cursor-pointer",
			onClick: onAddToCart,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-radial-glow opacity-30" }),
				p.src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: p.src,
					alt: p.name,
					className: "h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Utensils, { className: "h-12 w-12 text-muted-foreground/40 relative z-10" }),
				hasDiscount ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute top-3 left-3 text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-primary text-primary-foreground shadow-glow",
					children: "Offer"
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 backdrop-blur text-xs font-medium",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-3 w-3 fill-primary text-primary" }), p.rating]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col gap-3 p-4 sm:p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-bold text-base leading-snug line-clamp-2",
					children: p.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed",
					children: p.desc || "Prepared fresh with signature ingredients."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-auto flex items-end justify-between gap-3 pt-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5",
						children: "From"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-baseline gap-x-2 gap-y-0.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-lg font-display font-bold text-foreground",
							children: [p.currency, formatAmount(currentPrice)]
						}), hasDiscount ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-muted-foreground line-through",
							children: [p.currency, formatAmount(p.price)]
						}) : null]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onAddToCart,
					"aria-label": `Add ${p.name} to cart`,
					className: "grid place-items-center h-11 w-11 shrink-0 rounded-full bg-gradient-primary text-primary-foreground shadow-glow active:scale-90 hover:scale-110 transition-transform cursor-pointer",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-5 w-5" })
				})]
			})]
		})]
	});
}
function ProductSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-3xl bg-card border border-border overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "aspect-[4/3] rounded-none border-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-5 space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-3/4" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-full" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-2/3" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between items-center pt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-6 w-20" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-11 w-11 rounded-full" })]
				})
			]
		})]
	});
}
function useMenuLoading() {
	const loading = useMenuStore((s) => s.loading);
	const loaded = useMenuStore((s) => s.loaded);
	return {
		loading,
		loaded,
		isLoading: !loaded || loading
	};
}
function getCategoryIcon(slug) {
	switch (slug) {
		case "burgers":
		case "pizza":
		case "pasta": return Utensils;
		case "beverages":
		case "drinks": return Coffee;
		case "desserts": return Cake;
		case "deals":
		case "featured": return Flame;
		default: return Sparkles;
	}
}
function FeaturedProducts() {
	const loadMenu = useMenuStore((s) => s.loadMenu);
	const categories = useMenuStore((s) => s.categories);
	const rawProducts = useMenuStore((s) => s.products);
	const activeCategorySlug = useMenuStore((s) => s.activeCategorySlug);
	const selectedCategorySlugs = useMenuStore((s) => s.selectedCategorySlugs || []);
	const searchQuery = useMenuStore((s) => s.searchQuery);
	const setSearchQuery = useMenuStore((s) => s.setSearchQuery);
	const onlySale = useMenuStore((s) => s.onlySale);
	const setOnlySale = useMenuStore((s) => s.setOnlySale);
	const { isLoading } = useMenuLoading();
	const [showScrollTop, setShowScrollTop] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		loadMenu();
		const handleScroll = () => {
			setShowScrollTop(window.scrollY > 400);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [loadMenu]);
	const displayProducts = (0, import_react.useMemo)(() => {
		return rawProducts.map(toDisplayProduct);
	}, [rawProducts]);
	const filteredProducts = (0, import_react.useMemo)(() => {
		let list = displayProducts;
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			list = list.filter((p) => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
		}
		if (onlySale) list = list.filter((p) => p.discountedPrice != null && p.discountedPrice > 0 && p.discountedPrice < p.price || Boolean(p.tag));
		return list;
	}, [
		displayProducts,
		searchQuery,
		onlySale
	]);
	const categorySubsections = (0, import_react.useMemo)(() => {
		const filterSlugs = selectedCategorySlugs.length > 0 ? selectedCategorySlugs : activeCategorySlug ? [activeCategorySlug] : [];
		const isFiltered = filterSlugs.length > 0;
		const targetCategories = isFiltered ? categories.filter((c) => filterSlugs.includes(c.slug)) : [...categories];
		const map = /* @__PURE__ */ new Map();
		targetCategories.forEach((cat) => {
			map.set(cat.id, {
				category: cat,
				products: []
			});
		});
		if (isFiltered) filterSlugs.forEach((slug) => {
			if (!targetCategories.some((c) => c.slug === slug)) {
				const fallbackCat = {
					id: slug,
					name: slug.charAt(0).toUpperCase() + slug.slice(1),
					slug,
					sortOrder: 0
				};
				map.set(slug, {
					category: fallbackCat,
					products: []
				});
				targetCategories.push(fallbackCat);
			}
		});
		const uncategorizedProducts = [];
		filteredProducts.forEach((p) => {
			const raw = rawProducts.find((r) => r.id === p.id);
			let assigned = false;
			if (raw?.categoryId && map.has(raw.categoryId)) {
				map.get(raw.categoryId).products.push(p);
				assigned = true;
			} else if (raw?.categorySlug) {
				const match = targetCategories.find((c) => c.slug === raw.categorySlug);
				if (match && map.has(match.id)) {
					map.get(match.id).products.push(p);
					assigned = true;
				}
			}
			if (!assigned && !isFiltered) uncategorizedProducts.push(p);
		});
		const result = [];
		targetCategories.forEach((cat) => {
			const entry = map.get(cat.id);
			if (entry && entry.products.length > 0) result.push(entry);
		});
		if (uncategorizedProducts.length > 0 && !isFiltered) result.push({
			category: {
				id: "uncategorized",
				name: "Other Delights",
				slug: "other",
				sortOrder: 999
			},
			products: uncategorizedProducts
		});
		return result;
	}, [
		categories,
		rawProducts,
		filteredProducts,
		activeCategorySlug,
		selectedCategorySlugs
	]);
	const scrollToSearch = () => {
		const el = document.getElementById("search-bar");
		if (el) {
			el.scrollIntoView({ behavior: "smooth" });
			const input = el.querySelector("input");
			if (input) input.focus();
		}
	};
	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth"
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "menu-products",
		className: "py-8 lg:py-14 scroll-mt-28",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
				children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5",
					children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-36 rounded-3xl bg-muted/30 animate-pulse border border-border" }, i))
				}) : categorySubsections.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center py-16 rounded-3xl border border-dashed border-border bg-surface/20",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Utensils, { className: "h-12 w-12 text-muted-foreground/40 mx-auto mb-3" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-lg font-bold",
							children: "No items found"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground mt-1",
							children: "Try adjusting your search query or filter settings."
						}),
						(searchQuery || onlySale) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setSearchQuery("");
								setOnlySale(false);
							},
							className: "mt-4 inline-flex items-center justify-center px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-medium cursor-pointer",
							children: "Clear Filters"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-12",
					children: categorySubsections.map(({ category, products }) => {
						const Icon = getCategoryIcon(category.slug);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							id: `category-${category.slug || category.id}`,
							className: "scroll-mt-36",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative rounded-3xl bg-gradient-to-r from-primary via-primary/95 to-red-950 p-6 sm:p-8 text-primary-foreground overflow-hidden shadow-xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative z-10",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/15 text-white border border-white/20 mb-2 inline-block",
												children: "CATEGORY SELECTION"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
												className: "text-2xl sm:text-3xl font-extrabold tracking-tight uppercase font-display text-white",
												children: [category.name, " RANGE"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs sm:text-sm text-white/80 mt-1 max-w-xl",
												children: "Handcrafted with signature ingredients — order online for quick Karachi delivery."
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "relative z-10 shrink-0 flex items-center gap-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs font-bold bg-white text-primary px-3 py-1.5 rounded-full shadow-md",
											children: [
												products.length,
												" ",
												products.length === 1 ? "Item" : "Items"
											]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "absolute -right-4 -bottom-6 h-36 w-36 text-white/10 pointer-events-none" })
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductSection, {
								showHeader: false,
								products,
								loading: false,
								emptyMessage: "No items in this section."
							})]
						}, category.id);
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed bottom-6 left-6 z-40",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: scrollToSearch,
					"aria-label": "Quick Search",
					className: "grid place-items-center h-12 w-12 rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:scale-110 active:scale-95 transition-transform cursor-pointer border-2 border-white/20",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-5 w-5" })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: showScrollTop && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				initial: {
					opacity: 0,
					scale: .8
				},
				animate: {
					opacity: 1,
					scale: 1
				},
				exit: {
					opacity: 0,
					scale: .8
				},
				className: "fixed bottom-6 right-6 z-40",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: scrollToTop,
					"aria-label": "Scroll to Top",
					className: "grid place-items-center h-12 w-12 rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:scale-110 active:scale-95 transition-transform cursor-pointer border-2 border-white/20",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-5 w-5 stroke-[3]" })
				})
			}) })
		]
	});
}
function Stars({ rating }) {
	const n = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex gap-1 text-primary",
		children: Array.from({ length: 5 }).map((_, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: `h-4 w-4 ${idx < n ? "fill-primary" : "fill-transparent opacity-30"}` }, idx))
	});
}
function Reviews() {
	const selectedBranchId = useMenuStore((s) => s.selectedBranchId);
	const [reviews, setReviews] = (0, import_react.useState)([]);
	const [stats, setStats] = (0, import_react.useState)({
		reviewCount: 0,
		avgRating: null
	});
	const [loading, setLoading] = (0, import_react.useState)(true);
	const branchName = getStoredDeliveryLocation()?.branchName;
	(0, import_react.useEffect)(() => {
		let active = true;
		async function load() {
			if (!selectedBranchId) {
				setReviews([]);
				setStats({
					reviewCount: 0,
					avgRating: null
				});
				setLoading(false);
				return;
			}
			setLoading(true);
			try {
				const data = await fetchPublicReviews(selectedBranchId, 9);
				if (!active) return;
				setReviews(data.reviews);
				setStats(data.stats);
			} catch {
				if (!active) return;
				setReviews([]);
				setStats({
					reviewCount: 0,
					avgRating: null
				});
			} finally {
				if (active) setLoading(false);
			}
		}
		load();
		return () => {
			active = false;
		};
	}, [selectedBranchId]);
	if (!loading && reviews.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "reviews",
		className: "py-20 lg:py-28",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				eyebrow: "Reviews",
				title: "What customers say",
				subtitle: stats.reviewCount > 0 ? `${stats.reviewCount} approved review${stats.reviewCount === 1 ? "" : "s"}${stats.avgRating != null ? ` · ${stats.avgRating}★ average` : ""}${branchName ? ` for ${branchName}` : ""} — from real customers via admin.` : "Customer feedback approved in the admin panel."
			}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-12 grid md:grid-cols-3 gap-5",
				children: [
					0,
					1,
					2
				].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-48 rounded-3xl bg-muted/30 animate-pulse border border-border" }, i))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-12 grid md:grid-cols-3 gap-5",
				children: reviews.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.figure, {
					initial: {
						opacity: 0,
						y: 24
					},
					whileInView: {
						opacity: 1,
						y: 0
					},
					viewport: {
						once: true,
						margin: "-60px"
					},
					transition: {
						duration: .5,
						delay: i * .06
					},
					className: "relative rounded-3xl bg-card border border-border p-6 sm:p-8 hover:border-primary/40 transition-colors",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Quote, { className: "absolute top-6 right-6 h-8 w-8 text-primary/30" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, { rating: r.overallRating }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("blockquote", {
							className: "mt-4 text-base leading-relaxed",
							children: [
								"“",
								r.comment,
								"”"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figcaption", {
							className: "mt-6 flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid place-items-center h-10 w-10 rounded-full bg-gradient-primary text-primary-foreground font-bold",
								children: (r.customerName || "G").charAt(0).toUpperCase()
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-semibold",
								children: r.customerName || "Guest"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground",
								children: "Verified order review"
							})] })]
						})
					]
				}, r.id))
			})]
		})
	});
}
function Footer() {
	const [phone, setPhone] = (0, import_react.useState)("");
	const [brand, setBrand] = (0, import_react.useState)("Studio 7teas");
	(0, import_react.useEffect)(() => {
		let active = true;
		fetchTrackingSettings().then((s) => {
			if (!active) return;
			if (s.restaurantName?.trim()) setBrand(s.restaurantName.trim());
			if (s.phone?.trim()) setPhone(s.phone.trim());
		}).catch(() => {});
		return () => {
			active = false;
		};
	}, []);
	const telHref = phone ? `tel:${phone.replace(/\s+/g, "")}` : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "border-t border-border bg-surface/60",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display font-bold text-lg",
				children: brand
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-1",
				children: "Order online · Fresh · Fast"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-4 text-sm text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#deals",
						className: "hover:text-primary transition-colors",
						children: "Deals"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#offers",
						className: "hover:text-primary transition-colors",
						children: "Offers"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#menu",
						className: "hover:text-primary transition-colors",
						children: "Menu"
					}),
					telHref ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: telHref,
						className: "hover:text-primary transition-colors",
						children: ["Call us", phone ? ` · ${phone}` : ""]
					}) : null
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-t border-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 text-xs text-muted-foreground",
				children: [
					"© ",
					(/* @__PURE__ */ new Date()).getFullYear(),
					" ",
					brand,
					". All rights reserved."
				]
			})
		})]
	});
}
var MENU_POLL_MS = 3e4;
/**
* Keeps the public menu in sync so newly activated products/categories
* appear without a full page refresh. Scoped to the selected branch.
*/
function CatalogLiveSync() {
	const loadMenu = useMenuStore((s) => s.loadMenu);
	const selectedBranchId = useMenuStore((s) => s.selectedBranchId);
	(0, import_react.useEffect)(() => {
		if (!selectedBranchId) return;
		loadMenu({
			silent: false,
			branchId: selectedBranchId
		});
		const intervalId = window.setInterval(() => {
			loadMenu({
				silent: true,
				branchId: selectedBranchId
			});
		}, MENU_POLL_MS);
		const onVisible = () => {
			if (document.visibilityState === "visible") loadMenu({
				silent: true,
				branchId: selectedBranchId
			});
		};
		const onBranchSelected = (event) => {
			const branchId = event.detail?.branchId;
			if (branchId) loadMenu({
				silent: false,
				branchId
			});
		};
		document.addEventListener("visibilitychange", onVisible);
		window.addEventListener("focus", onVisible);
		window.addEventListener("branch-selected", onBranchSelected);
		return () => {
			window.clearInterval(intervalId);
			document.removeEventListener("visibilitychange", onVisible);
			window.removeEventListener("focus", onVisible);
			window.removeEventListener("branch-selected", onBranchSelected);
		};
	}, [loadMenu, selectedBranchId]);
	return null;
}
var STORAGE_KEY = "studio7teas-landing-scroll";
/** Keeps window scroll position on the home page across refresh. */
function useLandingScrollRestoration() {
	(0, import_react.useEffect)(() => {
		const saved = sessionStorage.getItem(STORAGE_KEY);
		if (saved != null) {
			const top = Number(saved);
			requestAnimationFrame(() => {
				window.scrollTo({
					top: Number.isFinite(top) ? top : 0,
					behavior: "auto"
				});
			});
		}
		const onScroll = () => {
			sessionStorage.setItem(STORAGE_KEY, String(window.scrollY));
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);
}
function Landing() {
	useLandingScrollRestoration();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-background text-foreground flex flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CatalogLiveSync, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hero, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Categories, { sticky: true }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuSearchBar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HotDeals, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OffersMenu, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeaturedProducts, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				id: "reviews",
				className: "scroll-mt-28 md:scroll-mt-[7.25rem]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reviews, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
		]
	});
}
//#endregion
export { Landing as component };
