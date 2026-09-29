import { useEffect, useState } from "react";
import { fetchTrackingSettings } from "@/lib/api";

/*
  Minimal desi biryani palette
  brown  #3A0F0A   saffron #F29C1F   cream #FFF1D0
*/
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

  const linkClass =
    "hover:text-[#F29C1F] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F29C1F] rounded-sm";

  return (
    <footer className="bg-[#3A0F0A] text-[#FFF1D0] border-t-2 border-[#F29C1F]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-display font-bold text-lg text-[#F29C1F]">{brand}</p>
          <p className="text-sm text-[#FFF1D0]/70 mt-1">Fresh biryani, delivered fast.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#FFF1D0]/80">
          <a href="#deals" className={linkClass}>
            Deals
          </a>
          <a href="#offers" className={linkClass}>
            Offers
          </a>
          <a href="#menu-products" className={linkClass}>
            Biryani menu
          </a>
          {telHref ? (
            <a href={telHref} className={linkClass}>
              Call {phone}
            </a>
          ) : null}
        </nav>
      </div>
      <div className="border-t border-[#FFF1D0]/15">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 text-xs text-[#FFF1D0]/60">
          © {new Date().getFullYear()} {brand}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}