import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { SectionHeader } from "./HotDeals";

const faqs = [
  { q: "How fast is delivery?", a: "Most orders arrive in under 30 minutes. If we're late, the delivery is on us." },
  { q: "What payment methods do you accept?", a: "Credit/debit cards, Apple Pay, Google Pay, PayPal, and cash on delivery." },
  { q: "Can I customize my order?", a: "Yes — pick variants, add toppings, leave kitchen notes. The full menu supports addons." },
  { q: "Do you offer refunds?", a: "If anything's wrong with your order, refunds are processed within 24 hours, no questions asked." },
  { q: "Is Studio 7teas available in my city?", a: "We're live in 40+ cities and expanding weekly. Enter your address at checkout to confirm." },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 lg:py-28 bg-surface/40">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="FAQ"
          title="Questions, answered"
          subtitle="Can't find what you need? Drop us a line below."
        />
        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className="rounded-2xl bg-card border border-border overflow-hidden"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-5 text-left"
                >
                  <span className="font-medium">{f.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180 text-primary" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 sm:px-6 pb-5 text-sm text-muted-foreground">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
