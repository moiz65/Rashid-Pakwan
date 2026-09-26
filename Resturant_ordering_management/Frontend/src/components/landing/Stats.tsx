import { motion, useInView, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect, useRef } from "react";

const stats = [
  { value: 250000, suffix: "+", label: "Orders delivered" },
  { value: 120, suffix: "+", label: "Partner restaurants" },
  { value: 30, suffix: " min", label: "Avg delivery time" },
  { value: 99.9, suffix: "%", label: "Uptime SLA" },
];

export function Stats() {
  return (
    <section className="py-20 lg:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-card border border-border p-8 sm:p-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s) => (
            <Counter key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Counter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) =>
    value % 1 === 0 ? Math.floor(v).toLocaleString() : v.toFixed(1),
  );

  useEffect(() => {
    if (inView) animate(mv, value, { duration: 1.8, ease: "easeOut" });
  }, [inView, mv, value]);

  return (
    <div ref={ref} className="text-center sm:text-left">
      <div className="text-4xl sm:text-5xl font-display font-bold text-gradient-primary flex items-baseline gap-1 justify-center sm:justify-start">
        <motion.span>{display}</motion.span>
        <span>{suffix}</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
