import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { g as formatOrderId } from "./api-DXmjlFkY.mjs";
import { K as CircleCheckBig } from "../_libs/lucide-react.mjs";
import { t as Route } from "./order-success-Dyd-dg1L.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/order-success-BfBnfLWn.js
var import_jsx_runtime = require_jsx_runtime();
function OrderSuccess() {
	const { orderId } = Route.useSearch();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen flex items-center justify-center pt-24 pb-16 bg-surface/30",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center max-w-md bg-card rounded-3xl p-8 border border-border shadow-elegant",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "h-12 w-12 text-green-500" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-bold mb-4",
					children: "Order Placed Successfully!"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground mb-4",
					children: "Thank you for your order. We'll notify you when it's ready."
				}),
				orderId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground mb-8",
					children: [
						"Your order ID:",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono font-medium text-foreground",
							children: formatOrderId(orderId)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col sm:flex-row gap-3 justify-center",
					children: [orderId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/track/$orderId",
						params: { orderId },
						className: "inline-flex items-center justify-center h-12 px-8 rounded-full bg-gradient-primary text-primary-foreground font-medium shadow-glow hover:scale-[1.02] transition-transform",
						children: "Track your order"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center h-12 px-8 rounded-full border border-border bg-surface font-medium hover:bg-card transition-colors",
						children: "Back to Menu"
					})]
				})
			]
		})
	});
}
//#endregion
export { OrderSuccess as component };
