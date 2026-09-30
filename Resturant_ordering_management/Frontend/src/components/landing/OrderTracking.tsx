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

/*
  Minimal desi biryani palette
  brown  #840608   saffron #F29C1F   cream #FFF1D0 / #FFF8E7   chilli #B93A0E   green #4E8A45
*/

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
  const base =
    "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors";
  if (done) {
    return (
      <div
        className={`${base} border-[#4E8A45] bg-[#4E8A45]/10 text-[#4E8A45]`}
      >
        <Check className="h-5 w-5" />
      </div>
    );
  }
  if (active) {
    return (
      <div
        className={`${base} border-[#840608] bg-[#840608] text-[#F29C1F]`}
      >
        <Package className="h-5 w-5" />
      </div>
    );
  }
  return (
    <div
      className={`${base} border-[#840608]/20 bg-[#FFF8E7] text-[#840608]/40`}
    >
      {status === "delivered" ? (
        <Truck className="h-5 w-5" />
      ) : (
        <Clock className="h-5 w-5" />
      )}
    </div>
  );
}

function StatusStepper({ order }: { order: PublicOrder }) {
  const steps = order.trackingSteps || ["pending", "confirmed", "preparing", "delivered"];
  const isTerminal = ["rejected", "cancelled"].includes(order.status);
  const currentIndex = steps.indexOf(order.status);

  if (isTerminal) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-[#B93A0E]/30 bg-[#B93A0E]/5 p-4">
        <XCircle className="h-8 w-8 text-[#B93A0E] shrink-0" />
        <div>
          <p className="font-semibold text-[#B93A0E]">{order.statusLabel}</p>
          <p className="text-sm text-[#840608]/65">{order.statusMessage}</p>
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
            <span
              className={`text-xs font-medium ${
                active
                  ? "text-[#840608] font-semibold"
                  : done
                  ? "text-[#840608]"
                  : "text-[#840608]/50"
              }`}
            >
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
      <div className="min-h-screen flex items-center justify-center pt-24 bg-[#FFF8E7]">
        <Loader2 className="h-10 w-10 animate-spin text-[#B93A0E]" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 px-4 bg-[#FFF8E7]">
        <div className="max-w-md w-full text-center bg-white rounded-2xl p-8 border border-[#840608]/15">
          <AlertCircle className="h-12 w-12 text-[#B93A0E] mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2 text-[#840608]">Order not found</h1>
          <p className="text-[#840608]/65 text-sm mb-6">
            {error instanceof Error
              ? error.message
              : "We couldn't find this order. Check the order ID and try again."}
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-[#840608] text-[#F29C1F] text-sm font-semibold hover:bg-[#5A1A10] transition-colors"
          >
            Back to menu
          </Link>
        </div>
      </div>
    );
  }

  const restaurant = order.restaurant;

  return (
    <div className="min-h-screen pt-[200px] pb-16 bg-[#FFF8E7]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-[#840608]/15 overflow-hidden">
          {/* Restaurant header */}
          <div className="bg-[#FFF1D0] border-b border-[#840608]/12 px-6 py-5">
            <div className="flex items-center gap-4">
              <img
                src={restaurant.logoUrl || logo}
                alt={restaurant.name}
                className="h-14 w-14 rounded-full object-cover border border-[#840608]/12 bg-white"
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold truncate text-[#840608]">
                  {restaurant.name}
                </h1>
                <p className="text-sm text-[#840608]/65 truncate">{restaurant.helpText}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-[#840608]/60">Order</p>
                <p className="font-mono font-semibold text-[#840608]">
                  {formatOrderId(order.id)}
                </p>
              </div>
            </div>
            {(restaurant.phone || restaurant.address) && (
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-[#840608]/65">
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
            {/* Live updates bar */}
            <div className="flex items-center justify-between text-xs text-[#840608]/60">
              <span className="inline-flex items-center gap-1.5">
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
                />
                Live updates every {order.pollIntervalSeconds}s
              </span>
              {dataUpdatedAt > 0 && (
                <span>Updated {new Date(dataUpdatedAt).toLocaleTimeString()}</span>
              )}
            </div>

            {/* Status stepper */}
            <StatusStepper order={order} />

            {/* Current status card */}
            <div className="rounded-2xl border border-[#F29C1F]/40 bg-[#FFF1D0] p-5">
              <p className="text-sm text-[#840608]/65 mb-1">Current status</p>
              <h2 className="text-2xl font-bold text-[#840608] mb-2">
                {order.statusLabel}
              </h2>
              <p className="text-[#840608]/75">{order.statusMessage}</p>
              {order.eta && (
                <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#840608]">
                  <Clock className="h-4 w-4 text-[#B93A0E]" />
                  Estimated: {order.eta}
                </p>
              )}
            </div>

            {/* Rejection reason */}
            {order.rejectionReason && (
              <div className="rounded-2xl border border-[#B93A0E]/30 bg-[#B93A0E]/5 p-4">
                <p className="text-sm font-medium text-[#B93A0E] mb-1">Reason</p>
                <p className="text-sm text-[#840608]/75">{order.rejectionReason}</p>
              </div>
            )}

            {/* Review form (unchanged) */}
            <OrderReviewForm order={order} phone={phone} />

            {/* Order details */}
            <div>
              <h3 className="font-semibold mb-3 text-[#840608]">Order details</h3>
              <div className="rounded-2xl border border-[#840608]/12 divide-y divide-[#840608]/10">
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-3 text-sm"
                  >
                    <span className="text-[#840608]">
                      {item.name}{" "}
                      <span className="text-[#840608]/60">× {item.qty}</span>
                    </span>
                    <span className="font-medium text-[#840608]">
                      {formatCurrency(item.price * item.qty)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-4 py-3 font-semibold bg-[#FFF8E7]">
                  <span className="text-[#840608]">Total</span>
                  <span className="text-[#840608]">{formatCurrency(order.total)}</span>
                </div>
              </div>
              <p className="text-xs text-[#840608]/60 mt-2">
                Placed {formatDateTime(order.createdAt)}
              </p>
            </div>

            {/* Delivery + payment grid */}
            {(order.deliveryType || order.payment) && (
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {order.deliveryType && (
                  <div className="rounded-xl border border-[#840608]/12 p-4 bg-[#FFF8E7]">
                    <p className="text-[#840608]/60 mb-1">Delivery</p>
                    <p className="font-medium capitalize text-[#840608]">
                      {order.deliveryType}
                    </p>
                    {order.deliveryType === "pickup" && order.branch && (
                      <p className="text-[#840608]/75">{order.branch}</p>
                    )}
                    {order.deliveryType === "delivery" && order.address && (
                      <p className="text-[#840608]/75">{order.address}</p>
                    )}
                    {order.landmark && (
                      <p className="text-[#840608]/60">Near {order.landmark}</p>
                    )}
                  </div>
                )}
                {order.payment && (
                  <div className="rounded-xl border border-[#840608]/12 p-4 bg-[#FFF8E7]">
                    <p className="text-[#840608]/60 mb-1">Payment</p>
                    <p className="font-medium capitalize text-[#840608]">
                      {order.payment}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Instructions */}
            {order.instructions && (
              <div className="rounded-xl border border-[#840608]/12 p-4 text-sm bg-[#FFF8E7]">
                <p className="text-[#840608]/60 mb-1">Instructions</p>
                <p className="text-[#840608]">{order.instructions}</p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm text-[#840608]/65 hover:text-[#840608] transition-colors"
          >
            ← Back to menu
          </Link>
        </div>
      </div>
    </div>
  );
}