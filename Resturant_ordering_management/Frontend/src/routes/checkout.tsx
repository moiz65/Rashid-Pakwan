import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckoutPage } from "../components/landing/Checkout";
import { useCartStore } from "../store/CartStore";
import { useEffect, useRef, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { buildOrderPayload, createOrder, getCheckoutSessionKey, recoverAbandonedCart, type WebsiteOrderData } from "../lib/api";

export const Route = createFileRoute("/checkout")({
  component: CheckoutComponent,
});

function CheckoutComponent() {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const orderPlacedRef = useRef(false);

  const handleConfirm = async (orderData: WebsiteOrderData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const order = await createOrder(buildOrderPayload(orderData));
      orderPlacedRef.current = true;
      await recoverAbandonedCart({
        sessionKey: getCheckoutSessionKey(),
        email: orderData.emailAddress,
      }).catch(() => null);
      clearCart();
      navigate({
        to: "/track/$orderId",
        params: { orderId: order.id },
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // After a successful place-order we clear the cart — don't bounce home.
    if (items.length === 0 && !orderPlacedRef.current) {
      navigate({ to: "/" });
    }
  }, [items.length, navigate]);

  if (items.length === 0) {
    if (orderPlacedRef.current) {
      return (
        <div className="min-h-screen flex items-center justify-center pt-24 pb-16">
          <p className="text-muted-foreground">Opening order tracking…</p>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-16">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground">Redirecting you to menu...</p>
        </div>
      </div>
    );
  }

  return (
    <CheckoutPage
      items={items}
      onConfirm={handleConfirm}
      isSubmitting={isSubmitting}
      submitError={submitError}
    />
  );
}
