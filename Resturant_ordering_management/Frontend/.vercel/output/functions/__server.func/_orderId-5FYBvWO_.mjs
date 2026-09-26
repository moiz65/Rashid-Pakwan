import { o as __toESM } from "./_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "./_libs/react+tanstack__react-query.mjs";
import { h as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { t as Route } from "./_orderId-D4C6IOs6.mjs";
import "./_ssr/CartStore-DvzXC6en.mjs";
import { b as submitPublicReview, f as fetchPublicReviewEligibility, g as formatOrderId, u as fetchPublicOrder } from "./_ssr/api-DXmjlFkY.mjs";
import { G as CircleX, L as Check, M as Clock, T as MapPin, U as LoaderCircle, b as Package, h as RefreshCw, i as Truck, l as Star, q as CircleAlert, v as Phone } from "./_libs/lucide-react.mjs";
import { t as Navbar } from "./_ssr/Navbar-Di1EabYu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_orderId-5FYBvWO_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function StarPicker({ value, onChange, size = "md" }) {
	const iconClass = size === "sm" ? "h-5 w-5" : "h-7 w-7";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex items-center gap-1",
		children: [
			1,
			2,
			3,
			4,
			5
		].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => onChange(n),
			className: "p-0.5 rounded transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
			"aria-label": `${n} star${n > 1 ? "s" : ""}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: `${iconClass} ${n <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}` })
		}, n))
	});
}
function OrderReviewForm({ order, phone }) {
	const queryClient = useQueryClient();
	const [overallRating, setOverallRating] = (0, import_react.useState)(0);
	const [comment, setComment] = (0, import_react.useState)("");
	const [showProducts, setShowProducts] = (0, import_react.useState)(true);
	const [productRatings, setProductRatings] = (0, import_react.useState)({});
	const [submitted, setSubmitted] = (0, import_react.useState)(false);
	const eligibilityQuery = useQuery({
		queryKey: [
			"public-order-review",
			order.id,
			phone
		],
		queryFn: () => fetchPublicReviewEligibility(order.id, phone),
		enabled: order.status === "delivered"
	});
	(0, import_react.useEffect)(() => {
		if (eligibilityQuery.data?.hasReview) setSubmitted(true);
	}, [eligibilityQuery.data?.hasReview]);
	const mutation = useMutation({
		mutationFn: () => {
			const items = (eligibilityQuery.data?.items || []).map((item, index) => {
				const rating = productRatings[`${item.productId || "item"}-${index}`];
				if (!rating) return null;
				return {
					productId: item.productId,
					productName: item.name,
					rating
				};
			}).filter(Boolean);
			return submitPublicReview(order.id, {
				overallRating,
				comment: comment.trim(),
				items
			}, phone);
		},
		onSuccess: () => {
			setSubmitted(true);
			queryClient.invalidateQueries({ queryKey: [
				"public-order-review",
				order.id,
				phone
			] });
		}
	});
	if (order.status !== "delivered") return null;
	if (eligibilityQuery.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border p-5 flex items-center justify-center gap-2 text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-sm",
			children: "Loading review…"
		})]
	});
	if (submitted || eligibilityQuery.data?.hasReview) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-green-500/30 bg-green-500/5 p-5 flex items-start gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-10 w-10 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center shrink-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-5 w-5" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "font-semibold text-foreground",
			children: "Thanks for your review!"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground mt-1",
			children: "Your feedback helps us improve. We appreciate you taking the time."
		})] })]
	});
	if (!eligibilityQuery.data?.canReview) return null;
	const items = eligibilityQuery.data.items || [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-5 space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-semibold text-lg",
				children: "How was your order?"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-1",
				children: "Rate your overall experience and the items you ordered."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Overall rating"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StarPicker, {
					value: overallRating,
					onChange: setOverallRating
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					htmlFor: "review-comment",
					className: "text-sm font-medium",
					children: ["Comment ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground font-normal",
						children: "(optional)"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					id: "review-comment",
					value: comment,
					onChange: (e) => setComment(e.target.value),
					rows: 3,
					placeholder: "Tell us what you liked or what we can improve…",
					className: "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
				})]
			}),
			items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "Items in this order"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setShowProducts((v) => !v),
						className: "text-xs text-primary hover:underline",
						children: showProducts ? "Hide" : "Show"
					})]
				}), showProducts && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3 rounded-xl border border-border divide-y",
					children: items.map((item, index) => {
						const key = `${item.productId || "item"}-${index}`;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3 px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium truncate",
								children: item.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StarPicker, {
								size: "sm",
								value: productRatings[key] || overallRating || 0,
								onChange: (n) => setProductRatings((prev) => ({
									...prev,
									[key]: n
								}))
							})]
						}, key);
					})
				})]
			}),
			mutation.isError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-destructive",
				children: mutation.error instanceof Error ? mutation.error.message : "Failed to submit review"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: overallRating < 1 || mutation.isPending,
				onClick: () => mutation.mutate(),
				className: "inline-flex items-center justify-center h-11 px-6 rounded-full bg-gradient-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed",
				children: mutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }), "Submitting…"] }) : "Submit review"
			})
		]
	});
}
function formatCurrency(amount) {
	return `Rs ${Number(amount).toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}
function formatDateTime(date) {
	return new Date(date).toLocaleString("en-PK", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit"
	});
}
function StepIcon({ status, active, done }) {
	const base = "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors";
	if (done) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `${base} border-green-500 bg-green-500/10 text-green-500`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-5 w-5" })
	});
	if (active) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `${base} border-primary bg-primary/10 text-primary shadow-glow`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-5 w-5" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `${base} border-border bg-surface text-muted-foreground`,
		children: status === "delivered" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "h-5 w-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-5 w-5" })
	});
}
function StatusStepper({ order }) {
	const steps = order.trackingSteps || [
		"pending",
		"confirmed",
		"preparing",
		"delivered"
	];
	const isTerminal = ["rejected", "cancelled"].includes(order.status);
	const currentIndex = steps.indexOf(order.status);
	if (isTerminal) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-8 w-8 text-destructive shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-semibold text-destructive",
			children: order.statusLabel
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: order.statusMessage
		})] })]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-4 gap-2 sm:gap-4",
		children: steps.map((step, index) => {
			const done = currentIndex > index;
			const active = currentIndex === index;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center text-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepIcon, {
					status: step,
					active,
					done
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `text-xs font-medium ${active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"}`,
					children: {
						pending: "Placed",
						confirmed: "Received",
						preparing: "Preparing",
						delivered: "Delivered"
					}[step] || step
				})]
			}, step);
		})
	});
}
function OrderTracking({ orderId, phone }) {
	const { data: order, isLoading, isError, error, isFetching, dataUpdatedAt } = useQuery({
		queryKey: [
			"public-order",
			orderId,
			phone
		],
		queryFn: () => fetchPublicOrder(orderId, phone),
		refetchInterval: (query) => {
			return (query.state.data?.pollIntervalSeconds ?? 20) * 1e3;
		},
		retry: 1
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen flex items-center justify-center pt-24",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-10 w-10 animate-spin text-primary" })
	});
	if (isError || !order) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen flex items-center justify-center pt-24 px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md w-full text-center bg-card rounded-3xl p-8 border border-border",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-12 w-12 text-destructive mx-auto mb-4" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-bold mb-2",
					children: "Order not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground text-sm mb-6",
					children: error instanceof Error ? error.message : "We couldn't find this order. Check the order ID and try again."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "inline-flex items-center justify-center h-11 px-6 rounded-full bg-gradient-primary text-primary-foreground text-sm font-medium",
					children: "Back to menu"
				})
			]
		})
	});
	const restaurant = order.restaurant;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen pt-24 pb-16 bg-surface/30",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-3xl px-4 sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-card rounded-3xl border border-border shadow-elegant overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-gradient-primary/10 border-b border-border px-6 py-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: restaurant.logoUrl || "/assets/main_logo-CKsRij2W.png",
								alt: restaurant.name,
								className: "h-14 w-14 rounded-full object-cover border border-border bg-background"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "text-xl font-bold truncate",
									children: restaurant.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground truncate",
									children: restaurant.helpText
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right shrink-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "Order"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono font-semibold",
									children: formatOrderId(order.id)
								})]
							})
						]
					}), (restaurant.phone || restaurant.address) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground",
						children: [restaurant.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-3.5 w-3.5" }), restaurant.phone]
						}), restaurant.address && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5" }), restaurant.address]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-6 space-y-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}` }),
									"Live updates every ",
									order.pollIntervalSeconds,
									"s"
								]
							}), dataUpdatedAt > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Updated ", new Date(dataUpdatedAt).toLocaleTimeString()] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusStepper, { order }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-primary/20 bg-primary/5 p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground mb-1",
									children: "Current status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-2xl font-bold text-primary mb-2",
									children: order.statusLabel
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted-foreground",
									children: order.statusMessage
								}),
								order.eta && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-3 inline-flex items-center gap-2 text-sm font-medium",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 text-primary" }),
										"Estimated: ",
										order.eta
									]
								})
							]
						}),
						order.rejectionReason && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-destructive/30 bg-destructive/5 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium text-destructive mb-1",
								children: "Reason"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: order.rejectionReason
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderReviewForm, {
							order,
							phone
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-semibold mb-3",
								children: "Order details"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border divide-y",
								children: [order.items.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between px-4 py-3 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										item.name,
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-muted-foreground",
											children: ["× ", item.qty]
										})
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium",
										children: formatCurrency(item.price * item.qty)
									})]
								}, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between px-4 py-3 font-semibold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-primary",
										children: formatCurrency(order.total)
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground mt-2",
								children: ["Placed ", formatDateTime(order.createdAt)]
							})
						] }),
						(order.deliveryType || order.payment) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid sm:grid-cols-2 gap-4 text-sm",
							children: [order.deliveryType && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-muted-foreground mb-1",
										children: "Delivery"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium capitalize",
										children: order.deliveryType
									}),
									order.deliveryType === "pickup" && order.branch && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: order.branch }),
									order.deliveryType === "delivery" && order.address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: order.address }),
									order.landmark && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-muted-foreground",
										children: ["Near ", order.landmark]
									})
								]
							}), order.payment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted-foreground mb-1",
									children: "Payment"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium capitalize",
									children: order.payment
								})]
							})]
						}),
						order.instructions && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border p-4 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted-foreground mb-1",
								children: "Instructions"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: order.instructions })]
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-center mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "text-sm text-muted-foreground hover:text-foreground transition-colors",
					children: "← Back to menu"
				})
			})]
		})
	});
}
function TrackOrderPage() {
	const { orderId } = Route.useParams();
	const { phone } = Route.useSearch();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderTracking, {
		orderId,
		phone
	})] });
}
//#endregion
export { TrackOrderPage as component };
