import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  Check,
  Clock,
  Loader2,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Truck,
  XCircle,
} from "lucide-react";
import { formatPrice } from "@/lib/formatters";
import { fetchPublicOrder, formatOrderId, type PublicOrder } from "@/lib/api";
import { OrderReviewForm } from "@/components/landing/OrderReviewForm";
import logo from "@/assets/main_logo.png";

type OrderTrackingProps = {
  orderId: string;
  phone?: string;
};

function formatCurrency(amount: number) {
  return formatPrice(amount);
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("en-PK", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StepIcon({ status, active, done }: { status: string; active: boolean; done: boolean }) {
  const base = "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors";
  if (done) {
    return (
      <div className={`${base} border-green-500 bg-green-500/10 text-green-500`}>
        <Check className="h-5 w-5" />
      </div>
    );
  }
  if (active) {
    return (
      <div className={`${base} border-primary bg-primary/10 text-primary shadow-glow`}>
        <Package className="h-5 w-5" />
      </div>
    );
  }
  return (
    <div className={`${base} border-border bg-surface text-muted-foreground`}>
      {status === "delivered" ? <Truck className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
    </div>
  );
}

function StatusStepper({ order }: { order: PublicOrder }) {
  const steps = order.trackingSteps || ["pending", "confirmed", "preparing", "delivered"];
  const isTerminal = ["rejected", "cancelled"].includes(order.status);
  const currentIndex = steps.indexOf(order.status);

  if (isTerminal) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
        <XCircle className="h-8 w-8 text-destructive shrink-0" />
        <div>
          <p className="font-semibold text-destructive">{order.statusLabel}</p>
          <p className="text-sm text-muted-foreground">{order.statusMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4">
      {steps.map((step, index) => {
        const done = currentIndex > index;
        const active = currentIndex === index;
        const labels: Record<string, string> = {
          pending: "Placed",
          confirmed: "Received",
          preparing: "Preparing",
          delivered: "Delivered",
        };
        return (
          <div key={step} className="flex flex-col items-center text-center gap-2">
            <StepIcon status={step} active={active} done={done} />
            <span className={`text-xs font-medium ${active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}>
              {labels[step] || step}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function OrderTracking({ orderId, phone }: OrderTrackingProps) {
  const {
    data: order,
    isLoading,
    isError,
    error,
    isFetching,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["public-order", orderId, phone],
    queryFn: () => fetchPublicOrder(orderId, phone),
    refetchInterval: (query) => {
      const interval = query.state.data?.pollIntervalSeconds ?? 20;
      return interval * 1000;
    },
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 px-4">
        <div className="max-w-md w-full text-center bg-card rounded-3xl p-8 border border-border">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Order not found</h1>
          <p className="text-muted-foreground text-sm mb-6">
            {error instanceof Error ? error.message : "We couldn't find this order. Check the order ID and try again."}
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-gradient-primary text-primary-foreground text-sm font-medium"
          >
            Back to menu
          </Link>
        </div>
      </div>
    );
  }

  const restaurant = order.restaurant;

  return (
    <div className="min-h-screen pt-[200px] pb-16 bg-surface/30">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="bg-card rounded-3xl border border-border shadow-elegant overflow-hidden">
          <div className="bg-gradient-primary/10 border-b border-border px-6 py-5">
            <div className="flex items-center gap-4">
              <img
                src={restaurant.logoUrl || logo}
                alt={restaurant.name}
                className="h-14 w-14 rounded-full object-cover border border-border bg-background"
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold truncate">{restaurant.name}</h1>
                <p className="text-sm text-muted-foreground truncate">{restaurant.helpText}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground">Order</p>
                <p className="font-mono font-semibold">{formatOrderId(order.id)}</p>
              </div>
            </div>
            {(restaurant.phone || restaurant.address) && (
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                {restaurant.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    {restaurant.phone}
                  </span>
                )}
                {restaurant.address && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {restaurant.address}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="p-6 space-y-8">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
                Live updates every {order.pollIntervalSeconds}s
              </span>
              {dataUpdatedAt > 0 && (
                <span>Updated {new Date(dataUpdatedAt).toLocaleTimeString()}</span>
              )}
            </div>

            <StatusStepper order={order} />

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <p className="text-sm text-muted-foreground mb-1">Current status</p>
              <h2 className="text-2xl font-bold text-primary mb-2">{order.statusLabel}</h2>
              <p className="text-muted-foreground">{order.statusMessage}</p>
              {order.eta && (
                <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4 text-primary" />
                  Estimated: {order.eta}
                </p>
              )}
            </div>

            {order.rejectionReason && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
                <p className="text-sm font-medium text-destructive mb-1">Reason</p>
                <p className="text-sm text-muted-foreground">{order.rejectionReason}</p>
              </div>
            )}

            <OrderReviewForm order={order} phone={phone} />

            <div>
              <h3 className="font-semibold mb-3">Order details</h3>
              <div className="rounded-2xl border divide-y">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span>
                      {item.name} <span className="text-muted-foreground">× {item.qty}</span>
                    </span>
                    <span className="font-medium">{formatCurrency(item.price * item.qty)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-4 py-3 font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(order.total)}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Placed {formatDateTime(order.createdAt)}</p>
            </div>

            {(order.deliveryType || order.payment) && (
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {order.deliveryType && (
                  <div className="rounded-xl border p-4">
                    <p className="text-muted-foreground mb-1">Delivery</p>
                    <p className="font-medium capitalize">{order.deliveryType}</p>
                    {order.deliveryType === "pickup" && order.branch && <p>{order.branch}</p>}
                    {order.deliveryType === "delivery" && order.address && <p>{order.address}</p>}
                    {order.landmark && <p className="text-muted-foreground">Near {order.landmark}</p>}
                  </div>
                )}
                {order.payment && (
                  <div className="rounded-xl border p-4">
                    <p className="text-muted-foreground mb-1">Payment</p>
                    <p className="font-medium capitalize">{order.payment}</p>
                  </div>
                )}
              </div>
            )}

            {order.instructions && (
              <div className="rounded-xl border p-4 text-sm">
                <p className="text-muted-foreground mb-1">Instructions</p>
                <p>{order.instructions}</p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to menu
          </Link>
        </div>
      </div>
    </div>
  );
}
