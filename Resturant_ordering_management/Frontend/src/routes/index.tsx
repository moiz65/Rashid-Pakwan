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

/*
  Minimal desi biryani palette
  brown  #840608   saffron #F29C1F   cream #FFF1D0 / #FFF8E7   chilli #B93A0E   green #4E8A45
*/

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rashid Pakwan — Online Ordering & Full Menu" },
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
    <main className="relative min-h-screen bg-[#FFF8E7] text-[#840608] flex flex-col">
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