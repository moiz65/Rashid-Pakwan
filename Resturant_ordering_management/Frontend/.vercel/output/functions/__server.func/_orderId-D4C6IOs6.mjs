import { f as lazyRouteComponent, p as createFileRoute } from "./_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_orderId-D4C6IOs6.js
var $$splitComponentImporter = () => import("./_orderId-5FYBvWO_.mjs");
var Route = createFileRoute("/track/$orderId")({
	validateSearch: (search) => ({ phone: typeof search.phone === "string" ? search.phone : void 0 }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
