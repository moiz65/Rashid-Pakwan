import { motion } from "motion/react";
import { Apple, Play, Smartphone } from "lucide-react";

export function AppPromo() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-card via-surface to-card border border-border p-8 sm:p-12 lg:p-16 grid lg:grid-cols-2 gap-10 items-center">
          <div
            aria-hidden
            className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-primary/25 blur-3xl"
          />

          <div className="relative space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-xs text-primary">
              <Smartphone className="h-3.5 w-3.5" />
              Mobile app
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Your kitchen, <br />
              in your <span className="text-gradient-primary">pocket.</span>
            </h2>
            <p className="text-muted-foreground max-w-md">
              Track orders in real-time, save your favorites, and unlock app-only
              rewards. Free on iOS & Android.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a className="inline-flex items-center gap-3 h-14 px-5 rounded-2xl bg-foreground text-background hover:scale-[1.03] active:scale-[0.98] transition-transform">
                <Apple className="h-6 w-6" />
                <span className="text-left leading-tight">
                  <span className="block text-[10px] opacity-70">Download on the</span>
                  <span className="block text-sm font-semibold">App Store</span>
                </span>
              </a>
              <a className="inline-flex items-center gap-3 h-14 px-5 rounded-2xl bg-foreground text-background hover:scale-[1.03] active:scale-[0.98] transition-transform">
                <Play className="h-6 w-6" />
                <span className="text-left leading-tight">
                  <span className="block text-[10px] opacity-70">Get it on</span>
                  <span className="block text-sm font-semibold">Google Play</span>
                </span>
              </a>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative mx-auto w-full max-w-[280px] aspect-[9/19]"
          >
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-primary blur-2xl opacity-50" />
            <div className="relative h-full w-full rounded-[2.5rem] border-[6px] border-foreground/90 bg-background overflow-hidden shadow-elegant">
              <div className="h-full w-full bg-gradient-to-b from-surface to-background p-4 flex flex-col gap-3">
                <div className="h-6 w-24 rounded-full bg-card" />
                <div className="h-32 rounded-2xl bg-gradient-primary shadow-glow" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-20 rounded-xl bg-card" />
                  <div className="h-20 rounded-xl bg-card" />
                </div>
                <div className="h-16 rounded-xl bg-card" />
                <div className="h-16 rounded-xl bg-card" />
                <div className="mt-auto h-12 rounded-full bg-gradient-primary" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
