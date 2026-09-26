import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Categories } from "@/components/landing/CategoriesBar";
import { MenuSearchBar } from "@/components/landing/MenuSearchBar";
import { HotDeals } from "@/components/landing/HotDeals";
import { OffersMenu } from "@/components/landing/OffersMenu";
import { FeaturedProducts } from "@/components/landing/FeaturedProducts";
import { Reviews } from "@/components/landing/Reviews";
import { Footer } from "@/components/landing/Footer";
import { CatalogLiveSync } from "@/components/landing/CatalogLiveSync";
import { useLandingScrollRestoration } from "@/hooks/useLandingScrollRestoration";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Studio 7teas — Online Ordering & Full Menu" },
      {
        name: "description",
        content: "Order food and tea online — hot deals, exclusive offers, categorized menu, and fast Karachi delivery.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  useLandingScrollRestoration();

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <CatalogLiveSync />
      <Navbar />
      <Hero />
      <Categories sticky />
      <MenuSearchBar />
      <HotDeals />
      <OffersMenu />
      <FeaturedProducts />
      <div id="reviews" className="scroll-mt-28 md:scroll-mt-[7.25rem]">
        <Reviews />
      </div>
      <Footer />
    </main>
  );
}
