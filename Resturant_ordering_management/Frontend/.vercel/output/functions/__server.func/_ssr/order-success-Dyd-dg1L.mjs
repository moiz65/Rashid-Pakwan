import { f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/order-success-Dyd-dg1L.js
var $$splitComponentImporter = () => import("./order-success-BfBnfLWn.mjs");
var Route = createFileRoute("/order-success")({
	validateSearch: (search) => ({ orderId: typeof search.orderId === "string" ? search.orderId : "" }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
