import { useEffect } from "react";

const STORAGE_KEY = "studio7teas-landing-scroll";

/** Keeps window scroll position on the home page across refresh. */
export function useLandingScrollRestoration() {
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved != null) {
      const top = Number(saved);
      requestAnimationFrame(() => {
        window.scrollTo({ top: Number.isFinite(top) ? top : 0, behavior: "auto" });
      });
    }

    const onScroll = () => {
      sessionStorage.setItem(STORAGE_KEY, String(window.scrollY));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}
