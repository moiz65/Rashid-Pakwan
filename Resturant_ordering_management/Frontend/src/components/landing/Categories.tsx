import { motion } from "motion/react";
import { Coffee, IceCream, Pizza, Tag } from "lucide-react";
import { SectionHeader } from "./HotDeals";

const categories = [
  { name: "Food", count: "120+ items", icon: Pizza, hue: "from-primary to-primary-glow" },
  { name: "Drinks", count: "48 items", icon: Coffee, hue: "from-primary-glow to-primary" },
  { name: "Desserts", count: "32 items", icon: IceCream, hue: "from-primary to-primary-glow" },
  { name: "Deals", count: "12 active", icon: Tag, hue: "from-primary-glow to-primary" },
];

export function Categories() {
  return (
    <section id="categories" className="py-20 lg:py-28 bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Browse"
          title="Shop by category"
          subtitle="Whatever you're craving, we've got a section for it."
        />
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {categories.map((c, i) => (
            <motion.a
              key={c.name}
              href="#"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              whileHover={{ y: -6 }}
              className="group relative rounded-3xl bg-card border border-border p-6 sm:p-8 overflow-hidden hover:border-primary/50 transition-colors"
            >
              <div
                className={`grid place-items-center h-14 w-14 rounded-2xl bg-gradient-to-br ${c.hue} shadow-glow`}
              >
                <c.icon className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="mt-6 text-lg font-bold">{c.name}</h3>
              <p className="text-xs text-muted-foreground">{c.count}</p>
              <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
