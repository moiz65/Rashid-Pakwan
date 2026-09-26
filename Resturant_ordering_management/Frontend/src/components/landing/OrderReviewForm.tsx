import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Star } from "lucide-react";
import {
  fetchPublicReviewEligibility,
  submitPublicReview,
  type PublicOrder,
} from "@/lib/api";

type OrderReviewFormProps = {
  order: PublicOrder;
  phone?: string;
};

function StarPicker({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange: (n: number) => void;
  size?: "sm" | "md";
}) {
  const iconClass = size === "sm" ? "h-5 w-5" : "h-7 w-7";
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="p-0.5 rounded transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          <Star
            className={`${iconClass} ${
              n <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function OrderReviewForm({ order, phone }: OrderReviewFormProps) {
  const queryClient = useQueryClient();
  const [overallRating, setOverallRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showProducts, setShowProducts] = useState(true);
  const [productRatings, setProductRatings] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const eligibilityQuery = useQuery({
    queryKey: ["public-order-review", order.id, phone],
    queryFn: () => fetchPublicReviewEligibility(order.id, phone),
    enabled: order.status === "delivered",
  });

  useEffect(() => {
    if (eligibilityQuery.data?.hasReview) {
      setSubmitted(true);
    }
  }, [eligibilityQuery.data?.hasReview]);

  const mutation = useMutation({
    mutationFn: () => {
      const items = (eligibilityQuery.data?.items || [])
        .map((item, index) => {
          const key = `${item.productId || "item"}-${index}`;
          const rating = productRatings[key];
          if (!rating) return null;
          return {
            productId: item.productId,
            productName: item.name,
            rating,
          };
        })
        .filter(Boolean) as Array<{
        productId: string | null;
        productName: string;
        rating: number;
      }>;

      return submitPublicReview(
        order.id,
        {
          overallRating,
          comment: comment.trim(),
          items,
        },
        phone,
      );
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["public-order-review", order.id, phone] });
    },
  });

  if (order.status !== "delivered") return null;

  if (eligibilityQuery.isLoading) {
    return (
      <div className="rounded-2xl border border-border p-5 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading review…</span>
      </div>
    );
  }

  if (submitted || eligibilityQuery.data?.hasReview) {
    return (
      <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-5 flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center shrink-0">
          <Check className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Thanks for your review!</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Your feedback helps us improve. We appreciate you taking the time.
          </p>
        </div>
      </div>
    );
  }

  if (!eligibilityQuery.data?.canReview) return null;

  const items = eligibilityQuery.data.items || [];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
      <div>
        <h3 className="font-semibold text-lg">How was your order?</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Rate your overall experience and the items you ordered.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Overall rating</p>
        <StarPicker value={overallRating} onChange={setOverallRating} />
      </div>

      <div className="space-y-2">
        <label htmlFor="review-comment" className="text-sm font-medium">
          Comment <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Tell us what you liked or what we can improve…"
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {items.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Items in this order</p>
            <button
              type="button"
              onClick={() => setShowProducts((v) => !v)}
              className="text-xs text-primary hover:underline"
            >
              {showProducts ? "Hide" : "Show"}
            </button>
          </div>
          {showProducts && (
            <div className="space-y-3 rounded-xl border border-border divide-y">
              {items.map((item, index) => {
                const key = `${item.productId || "item"}-${index}`;
                return (
                  <div key={key} className="flex items-center justify-between gap-3 px-4 py-3">
                    <span className="text-sm font-medium truncate">{item.name}</span>
                    <StarPicker
                      size="sm"
                      value={productRatings[key] || overallRating || 0}
                      onChange={(n) =>
                        setProductRatings((prev) => ({ ...prev, [key]: n }))
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {mutation.isError && (
        <p className="text-sm text-destructive">
          {mutation.error instanceof Error
            ? mutation.error.message
            : "Failed to submit review"}
        </p>
      )}

      <button
        type="button"
        disabled={overallRating < 1 || mutation.isPending}
        onClick={() => mutation.mutate()}
        className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-gradient-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Submitting…
          </>
        ) : (
          "Submit review"
        )}
      </button>
    </div>
  );
}
