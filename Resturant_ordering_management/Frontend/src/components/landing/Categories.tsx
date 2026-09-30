import { motion } from "motion/react";
import { Coffee, IceCream, Pizza, Tag } from "lucide-react";
import { SectionHeader } from "./HotDeals";

/*
  Minimal desi biryani palette
  brown  #840608   saffron #F29C1F   cream #FFF1D0 / #FFF8E7   chilli #B93A0E   green #4E8A45
*/
const categories = [
  { name: "Food", count: "120+ items", icon: Pizza, accent: "chilli" as const },
  { name: "Drinks", count: "48 items", icon: Coffee, accent: "saffron" as const },
  { name: "Desserts", count: "32 items", icon: IceCream, accent: "chilli" as const },
  { name: "Deals", count: "12 active", icon: Tag, accent: "saffron" as const },
];

const accentStyles = {
  chilli: {
    tile: "bg-[#B93A0E]/10 border-[#B93A0E]/30 text-[#B93A0E]",
    glow: "bg-[#B93A0E]/10",
  },
  saffron: {
    tile: "bg-[#F29C1F]/15 border-[#F29C1F]/40 text-[#840608]",
    glow: "bg-[#F29C1F]/15",
  },
} as const;

export function Categories() {
  return (
    <section id="categories" className="py-20 lg:py-28 bg-[#FFF8E7]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Browse"
          title="Shop by category"
          subtitle="Whatever you're craving, we've got a section for it."
        />
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {categories.map((c, i) => {
            const accent = accentStyles[c.accent];
            return (
              <motion.a
                key={c.name}
                href="#"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                whileHover={{ y: -6 }}
                className="group relative rounded-3xl bg-[#FFF1D0] border border-[#840608]/15 p-6 sm:p-8 overflow-hidden hover:border-[#840608]/50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F29C1F]"
              >
                <div
                  className={`grid place-items-center h-14 w-14 rounded-2xl border ${accent.tile} transition-colors`}
                >
                  <c.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-6 text-lg font-bold text-[#840608]">{c.name}</h3>
                <p className="text-xs text-[#840608]/60 mt-1">{c.count}</p>
                <div
                  className={`absolute -bottom-10 -right-10 h-32 w-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity ${accent.glow}`}
                />
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}