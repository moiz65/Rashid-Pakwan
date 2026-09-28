
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

  /* Auto slide every 60 seconds */
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
    setCurrentSlide(
      (prev) => (prev - 1 + slides.length) % slides.length
    );
  };

  const active = slides[currentSlide];

  return (
    <section
      className="
        relative
        pt-20
        sm:pt-24
        md:pt-28
        lg:pt-36
        pb-3
        sm:pb-4
        lg:pb-6
      "
    >
      <div className="relative w-full">
        <div
          className="
            relative
            w-full
            overflow-hidden
            bg-card
            border-y
            border-border/60
            shadow-xl

            /* Mobile */
            h-[430px]

            /* Small tablets */
            sm:h-[500px]

            /* Tablets */
            md:h-[600px]

            /* Desktop */
            lg:h-[700px]

            /* Large desktop */
            xl:h-[750px]
          "
        >
          <AnimatePresence
            initial={false}
            custom={direction}
            mode="wait"
          >
            <motion.div
              key={currentSlide}
              custom={direction}
              initial={{
                opacity: 0,
                scale: 1.02,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.98,
              }}
              transition={{
                duration: 0.4,
              }}
              className="absolute inset-0"
            >
              <img
                src={active.image}
                alt={active.title}
                className="
                  h-full
                  w-full
                  object-cover

                  /* Better mobile positioning */
                  object-center

                  sm:object-top
                "
              />

              {/* Subtle gradient */}
              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-[#960002]/45
                  via-transparent
                  to-transparent
                "
              />

              <SteamWisps />
            </motion.div>
          </AnimatePresence>

          {/* Today's special badge */}
          {/*
          <div
            className="
              absolute
              left-3
              top-3
              sm:left-6
              sm:top-6
              z-10
              flex
              items-center
              gap-1.5
              rounded-full
              bg-[#960002]/90
              backdrop-blur
              px-2.5
              py-1.5
              sm:px-3
              sm:py-1.5
              text-[10px]
              sm:text-xs
              font-semibold
              text-white
              shadow-md
            "
          >
            <Flame className="h-3.5 w-3.5 text-white" />
            <span>Today's Biryani Special</span>
          </div>
          */}

          {/* Pagination Indicators */}
          <div
            className="
              absolute
              inset-x-0
              bottom-3
              sm:bottom-4
              flex
              justify-center
              items-center
              gap-1.5
              sm:gap-2
              z-10
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
                  h-1.5
                  sm:h-2
                  rounded-full
                  transition-all
                  cursor-pointer

                  ${
                    index === currentSlide
                      ? "w-6 sm:w-8 bg-white shadow-glow"
                      : "w-1.5 sm:w-2 bg-white/70 hover:bg-white"
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
              absolute
              left-2
              sm:left-4
              md:left-5
              top-1/2
              -translate-y-1/2
              z-10

              h-8
              w-8

              sm:h-10
              sm:w-10

              rounded-full
              bg-white/90
              backdrop-blur
              border
              border-border/80

              flex
              items-center
              justify-center

              hover:bg-[#960002]
              hover:text-white

              transition-colors
              cursor-pointer
              shadow-md
            "
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          {/* Next Arrow */}
          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="
              absolute
              right-2
              sm:right-4
              md:right-5
              top-1/2
              -translate-y-1/2
              z-10

              h-8
              w-8

              sm:h-10
              sm:w-10

              rounded-full
              bg-white/90
              backdrop-blur
              border
              border-border/80

              flex
              items-center
              justify-center

              hover:bg-[#960002]
              hover:text-white

              transition-colors
              cursor-pointer
              shadow-md
            "
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          {/* Secure Payments Badge */}
          {/*
          <div
            className="
              hidden
              sm:flex
              absolute
              bottom-4
              right-4
              z-10
              items-center
              gap-2
              px-3
              py-1.5
              rounded-2xl
              bg-background/90
              backdrop-blur
              border
              border-border/80
              text-[11px]
              font-semibold
              text-muted-foreground
              shadow-md
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

