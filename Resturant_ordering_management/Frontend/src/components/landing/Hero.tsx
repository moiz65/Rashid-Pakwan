import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, ShieldCheck, Flame } from "lucide-react";
import { useEffect, useState } from "react";

import bannerSteak from "@/assets/Banner2.png";
import bannerHandi from "@/assets/Banner4.png";
import bannerSizzler from "@/assets/banner3.png";

const slides = [
  {
    id: 1,
    image: bannerSteak,
    title: "7Tea's Special Chicken Steak",
    tag: "Sizzling hot, straight off the grill",
  },
  {
    id: 2,
    image: bannerHandi,
    title: "7Tea's Special Makhni Handi",
    tag: "Slow-cooked in a rich, buttery gravy",
  },
  {
    id: 3,
    image: bannerSizzler,
    title: "7Tea's Special Chicken Sizzler",
    tag: "Served sizzling at your table",
  },
];

/* Rising steam wisps */
function SteamWisps() {
  const wisps = [0, 1, 2, 3];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {wisps.map((i) => (
        <motion.div
          key={i}
          className="absolute bottom-0 rounded-full bg-white/40 blur-xl"
          style={{
            left: `${18 + i * 22}%`,
            width: 26 + (i % 2) * 10,
            height: 26 + (i % 2) * 10,
          }}
          initial={{ y: 40, opacity: 0, scale: 0.6 }}
          animate={{
            y: [40, -160, -260],
            opacity: [0, 0.55, 0],
            scale: [0.6, 1.1, 1.4],
          }}
          transition={{
            duration: 5 + i,
            repeat: Infinity,
            delay: i * 1.1,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 60000);

    return () => window.clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const active = slides[currentSlide];

  return (
    <section
      className="
        relative
        w-full
        max-w-none
        overflow-x-hidden

        /* top offset under fixed header */
        pt-[72px]
        min-[420px]:pt-[80px]
        sm:pt-[92px]
        md:pt-[100px]
        lg:pt-[110px]
        xl:pt-[115px]
        2xl:pt-[115px]

      
      "
    >
      {/* Full-bleed wrapper — no padding, no max-width, no rounding */}
      <div className="relative w-full max-w-none">
        <div
          className="
            relative
            w-full
            max-w-none
            overflow-hidden
            bg-card
            
            border-border/60
            shadow-xl

            /* ---------- Height scale (full-width friendly) ---------- */
            /* Mobile */
            h-[220px]
            min-[420px]:h-[260px]
            /* Phones landscape / small tablets */
            sm:h-[320px]
            /* Tablets */
            md:h-[420px]
            /* Small laptops */
            lg:h-[500px]
            /* Desktop */
            xl:h-[600px]
            /* Large desktop */
            2xl:h-[680px]
            /* Ultrawide (21:9, 32:9) */
            min-[1800px]:h-[740px]
            min-[2400px]:h-[820px]
          "
        >
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentSlide}
              custom={direction}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <img
                src={active.image}
                alt={active.title}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="
                  absolute inset-0
                  h-full w-full
                  max-w-none
                  object-cover

                  /* Mobile: center on the dish */
                  object-center

                  /* Small+ : bias toward the top for banners with text at bottom */
                  sm:object-top
                  md:object-center
                  xl:object-top
                "
              />

              {/* Responsive gradient — stronger on mobile, softer on desktop */}
              <div
                className="
                  absolute inset-0
                  bg-gradient-to-t
                  from-[#960002]/55
                  via-[#960002]/10
                  to-transparent

                  sm:from-[#960002]/45
                  sm:via-transparent

                  lg:from-[#960002]/50
                "
              />

              <SteamWisps />
            </motion.div>
          </AnimatePresence>

          {/* Today's special badge (optional) */}
          {/*
          <div
            className="
              absolute z-10 flex items-center gap-1.5 rounded-full
              bg-[#960002]/90 backdrop-blur text-white shadow-md
              left-2 top-2 px-2 py-1 text-[10px]
              sm:left-5 sm:top-5 sm:px-3 sm:py-1.5 sm:text-xs
              lg:left-8 lg:top-8
            "
          >
            <Flame className="h-3.5 w-3.5 text-white" />
            <span>Today's Biryani Special</span>
          </div>
          */}

          {/* Pagination Indicators */}
          <div
            className="
              absolute inset-x-0 z-10 flex justify-center items-center

              bottom-2 gap-1
              sm:bottom-3 sm:gap-1.5
              md:bottom-4 md:gap-2
              lg:bottom-6
            "
          >
            {slides.map((s, index) => (
              <button
                key={s.id}
                onClick={() => {
                  setDirection(index > currentSlide ? 1 : -1);
                  setCurrentSlide(index);
                }}
                aria-label={`Go to slide ${index + 1}`}
                className={`
                  rounded-full transition-all cursor-pointer

                  h-1 w-1
                  sm:h-1.5 sm:w-1.5
                  md:h-2 md:w-2

                  ${
                    index === currentSlide
                      ? "w-5 sm:w-6 md:w-8 lg:w-10 bg-white shadow-glow"
                      : "bg-white/70 hover:bg-white"
                  }
                `}
              />
            ))}
          </div>

          {/* Previous Arrow */}
          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="
              absolute z-10 top-1/2 -translate-y-1/2
              flex items-center justify-center
              rounded-full bg-white/90 backdrop-blur
              border border-border/80 shadow-md
              hover:bg-[#960002] hover:text-white
              transition-colors cursor-pointer

              left-1.5 h-7 w-7
              sm:left-4 sm:h-9 sm:w-9
              md:left-6 md:h-10 md:w-10
              lg:left-8 lg:h-11 lg:w-11
              xl:left-10 xl:h-12 xl:w-12
            "
          >
            <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
          </button>

          {/* Next Arrow */}
          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="
              absolute z-10 top-1/2 -translate-y-1/2
              flex items-center justify-center
              rounded-full bg-white/90 backdrop-blur
              border border-border/80 shadow-md
              hover:bg-[#960002] hover:text-white
              transition-colors cursor-pointer

              right-1.5 h-7 w-7
              sm:right-4 sm:h-9 sm:w-9
              md:right-6 md:h-10 md:w-10
              lg:right-8 lg:h-11 lg:w-11
              xl:right-10 xl:h-12 xl:w-12
            "
          >
            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
          </button>

          {/* Secure Payments Badge (optional) */}
          {/*
          <div
            className="
              hidden sm:flex absolute z-10 items-center gap-2
              rounded-2xl bg-background/90 backdrop-blur
              border border-border/80 shadow-md
              text-[11px] font-semibold text-muted-foreground
              bottom-3 right-4 px-3 py-1.5
              md:bottom-4 md:right-6
              lg:bottom-6 lg:right-8
            "
          >
            <ShieldCheck className="h-4 w-4 text-[#960002]" />
            <span>SECURE PAYMENTS</span>
          </div>
          */}
        </div>
      </div>
    </section>
  );
}