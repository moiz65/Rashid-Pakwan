import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Quote, Star } from "lucide-react";
import { SectionHeader } from "./HotDeals";
import {
  fetchPublicReviews,
  type PublicReviewStats,
  type PublicWebsiteReview,
} from "@/lib/api";
import { useMenuStore } from "@/store/MenuStore";
import { getStoredDeliveryLocation } from "@/lib/branchSelection";

function Stars({ rating }: { rating: number }) {
  const n = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return (
    <div className="flex gap-1 text-primary">
      {Array.from({ length: 5 }).map((_, idx) => (
        <Star
          key={idx}
          className={`h-4 w-4 ${idx < n ? "fill-primary" : "fill-transparent opacity-30"}`}
        />
      ))}
    </div>
  );
}

export function Reviews() {
  const selectedBranchId = useMenuStore((s) => s.selectedBranchId);
  const [reviews, setReviews] = useState<PublicWebsiteReview[]>([]);
  const [stats, setStats] = useState<PublicReviewStats>({ reviewCount: 0, avgRating: null });
  const [loading, setLoading] = useState(true);
  const branchName = getStoredDeliveryLocation()?.branchName;

  useEffect(() => {
    let active = true;
    async function load() {
      if (!selectedBranchId) {
        setReviews([]);
        setStats({ reviewCount: 0, avgRating: null });
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await fetchPublicReviews(selectedBranchId, 9);
        if (!active) return;
        setReviews(data.reviews);
        setStats(data.stats);
      } catch {
        if (!active) return;
        setReviews([]);
        setStats({ reviewCount: 0, avgRating: null });
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [selectedBranchId]);

  if (!loading && reviews.length === 0) return null;

  const subtitle =
    stats.reviewCount > 0
      ? `${stats.reviewCount} approved review${stats.reviewCount === 1 ? "" : "s"}${
          stats.avgRating != null ? ` · ${stats.avgRating}★ average` : ""
        }${branchName ? ` for ${branchName}` : ""} — from real customers via admin.`
      : "Customer feedback approved in the admin panel.";

  return (
    <section id="reviews" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Reviews"
          title="What customers say"
          subtitle={subtitle}
        />

        {loading ? (
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-48 rounded-3xl bg-muted/30 animate-pulse border border-border"
              />
            ))}
          </div>
        ) : (
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {reviews.map((r, i) => (
              <motion.figure
                key={r.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="relative rounded-3xl bg-card border border-border p-6 sm:p-8 hover:border-primary/40 transition-colors"
              >
                <Quote className="absolute top-6 right-6 h-8 w-8 text-primary/30" />
                <Stars rating={r.overallRating} />
                <blockquote className="mt-4 text-base leading-relaxed">
                  &ldquo;{r.comment}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <div className="grid place-items-center h-10 w-10 rounded-full bg-gradient-primary text-primary-foreground font-bold">
                    {(r.customerName || "G").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{r.customerName || "Guest"}</div>
                    <div className="text-xs text-muted-foreground">Verified order review</div>
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
