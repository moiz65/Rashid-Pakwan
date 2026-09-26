import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle } from "lucide-react";
import { formatOrderId } from "@/lib/api";

export const Route = createFileRoute("/order-success")({
  validateSearch: (search: Record<string, unknown>) => ({
    orderId: typeof search.orderId === "string" ? search.orderId : "",
  }),
  component: OrderSuccess,
});

function OrderSuccess() {
  const { orderId } = Route.useSearch();

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-16 bg-surface/30">
      <div className="text-center max-w-md bg-card rounded-3xl p-8 border border-border shadow-elegant">
        <div className="h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
        <p className="text-muted-foreground mb-4">
          Thank you for your order. We'll notify you when it's ready.
        </p>
        {orderId && (
          <p className="text-sm text-muted-foreground mb-8">
            Your order ID:{" "}
            <span className="font-mono font-medium text-foreground">{formatOrderId(orderId)}</span>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {orderId && (
            <Link
              to="/track/$orderId"
              params={{ orderId }}
              className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-gradient-primary text-primary-foreground font-medium shadow-glow hover:scale-[1.02] transition-transform"
            >
              Track your order
            </Link>
          )}
          <Link
            to="/"
            className="inline-flex items-center justify-center h-12 px-8 rounded-full border border-border bg-surface font-medium hover:bg-card transition-colors"
          >
            Back to Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
