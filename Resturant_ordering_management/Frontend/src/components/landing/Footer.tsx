import { useEffect, useState } from "react";
import { fetchTrackingSettings } from "@/lib/api";

export function Footer() {
  const [phone, setPhone] = useState("");
  const [brand, setBrand] = useState("Rashid Pakwan");

  useEffect(() => {
    let active = true;
    fetchTrackingSettings()
      .then((s) => {
        if (!active) return;
        if (s.restaurantName?.trim()) setBrand(s.restaurantName.trim());
        if (s.phone?.trim()) setPhone(s.phone.trim());
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const telHref = phone ? `tel:${phone.replace(/\s+/g, "")}` : undefined;

  return (
    <footer className="border-t border-border bg-surface/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-display font-bold text-lg">{brand}</p>
          <p className="text-sm text-muted-foreground mt-1">Order online · Fresh · Fast</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <a href="#deals" className="hover:text-primary transition-colors">
            Deals
          </a>
          <a href="#offers" className="hover:text-primary transition-colors">
            Offers
          </a>
          <a href="#menu-products" className="hover:text-primary transition-colors">
            Menu
          </a>
          {telHref ? (
            <a href={telHref} className="hover:text-primary transition-colors">
              Call us{phone ? ` · ${phone}` : ""}
            </a>
          ) : null}
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {brand}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
