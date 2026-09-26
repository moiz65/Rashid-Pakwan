import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { OrderTracking } from "@/components/landing/OrderTracking";

export const Route = createFileRoute("/track/$orderId")({
  validateSearch: (search: Record<string, unknown>) => ({
    phone: typeof search.phone === "string" ? search.phone : undefined,
  }),
  component: TrackOrderPage,
});

function TrackOrderPage() {
  const { orderId } = Route.useParams();
  const { phone } = Route.useSearch();

  return (
    <>
      <Navbar />
      <OrderTracking orderId={orderId} phone={phone} />
    </>
  );
}
