import { useEffect } from "react";
import { useMenuStore } from "@/store/MenuStore";

const MENU_POLL_MS = 30_000;

/**
 * Keeps the public menu in sync so newly activated products/categories
 * appear without a full page refresh. Scoped to the selected branch.
 */
export function CatalogLiveSync() {
  const loadMenu = useMenuStore((s) => s.loadMenu);
  const selectedBranchId = useMenuStore((s) => s.selectedBranchId);

  useEffect(() => {
    if (!selectedBranchId) return;

    loadMenu({ silent: false, branchId: selectedBranchId });

    const intervalId = window.setInterval(() => {
      loadMenu({ silent: true, branchId: selectedBranchId });
    }, MENU_POLL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        loadMenu({ silent: true, branchId: selectedBranchId });
      }
    };
    const onBranchSelected = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      const branchId = detail?.branchId;
      if (branchId) loadMenu({ silent: false, branchId });
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
