import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Store, Truck, ChevronDown, Check, Search, X } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  fetchPublicBranches,
  fetchPublicDeliveryAreas,
  type PublicBranch,
  type PublicDeliveryArea,
} from "@/lib/api";
import {
  getStoredBranchId,
  getStoredDeliveryLocation,
  saveBranchSelection,
} from "@/lib/branchSelection";
import { useMenuStore } from "@/store/MenuStore";
import { useCartStore } from "@/store/CartStore";

export function DeliveryPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"delivery" | "pickup">("delivery");
  const [branches, setBranches] = useState<PublicBranch[]>([]);
  const [areas, setAreas] = useState<PublicDeliveryArea[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [areaSearch, setAreaSearch] = useState("");
  const branchSearchRef = useRef<HTMLInputElement>(null);
  const areaSearchRef = useRef<HTMLInputElement>(null);
  const setMenuBranchId = useMenuStore((s) => s.setSelectedBranchId);
  const loadMenu = useMenuStore((s) => s.loadMenu);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoadingBranches(true);
      try {
        const branchList = await fetchPublicBranches();
        if (!active) return;
        setBranches(branchList.filter((b) => b.status !== "inactive"));
      } catch {
        if (active) setBranches([]);
      } finally {
        if (active) setLoadingBranches(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    async function loadAreas() {
      if (!selectedBranchId || activeTab !== "delivery") {
        setAreas([]);
        setLoadingAreas(false);
        return;
      }
      setLoadingAreas(true);
      try {
        const areaList = await fetchPublicDeliveryAreas(selectedBranchId);
        if (!active) return;
        setAreas(areaList);
        setSelectedAreaId((prev) =>
          areaList.some((a) => a.id === prev) ? prev : ""
        );
      } catch {
        if (active) setAreas([]);
      } finally {
        if (active) setLoadingAreas(false);
      }
    }
    loadAreas();
    return () => {
      active = false;
    };
  }, [selectedBranchId, activeTab]);

  useEffect(() => {
    const stored = getStoredDeliveryLocation();
    const hasSelected = getStoredBranchId();
    if (stored) {
      setActiveTab(stored.type === "pickup" ? "pickup" : "delivery");
      if (stored.branchId) setSelectedBranchId(stored.branchId);
      if (stored.areaId) setSelectedAreaId(stored.areaId);
    }
    if (!hasSelected) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        document.body.style.overflow = "hidden";
      }, 600);
      return () => clearTimeout(timer);
    }
    if (hasSelected) setSelectedBranchId(hasSelected);
  }, []);

  useEffect(() => {
    const openPicker = () => {
      const stored = getStoredDeliveryLocation();
      const current = getStoredBranchId();
      if (current) setSelectedBranchId(current);
      if (stored?.type) setActiveTab(stored.type === "pickup" ? "pickup" : "delivery");
      if (stored?.areaId) setSelectedAreaId(stored.areaId);
      setIsOpen(true);
    };
    window.addEventListener("open-branch-picker", openPicker);
    return () => window.removeEventListener("open-branch-picker", openPicker);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isDropdownOpen && branchSearchRef.current) {
      setTimeout(() => branchSearchRef.current?.focus(), 100);
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    if (isOpen && activeTab === "delivery" && areaSearchRef.current) {
      setTimeout(() => areaSearchRef.current?.focus(), 150);
    }
  }, [isOpen, activeTab]);

  const filteredBranches = branches.filter(
    (branch) =>
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (branch.address || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (branch.city || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAreas = useMemo(() => {
    const q = areaSearch.trim().toLowerCase();
    if (!q) return areas;
    return areas.filter((a) => a.name.toLowerCase().includes(q));
  }, [areas, areaSearch]);

  const selectedBranch = branches.find((b) => b.id === selectedBranchId);
  const selectedArea = areas.find((a) => a.id === selectedAreaId);

  const canConfirm =
    Boolean(selectedBranchId) &&
    (activeTab === "pickup" || Boolean(selectedAreaId));

  const handleConfirm = async () => {
    if (!selectedBranchId || !selectedBranch) {
      alert("Please select a nearby branch");
      return;
    }
    if (activeTab === "delivery" && !selectedArea) {
      alert("Please select your delivery area");
      return;
    }
    const previous = getStoredBranchId();
    saveBranchSelection({
      type: activeTab,
      branchId: selectedBranch.id,
      branchName: selectedBranch.name,
      location:
        activeTab === "delivery"
          ? selectedArea?.name
          : selectedBranch.city || selectedBranch.address || selectedBranch.name,
      areaId: activeTab === "delivery" ? selectedArea?.id : undefined,
      areaName: activeTab === "delivery" ? selectedArea?.name : undefined,
      areaCharge: activeTab === "delivery" ? selectedArea?.charge : undefined,
    });
    if (previous && previous !== selectedBranch.id) {
      clearCart();
    }
    setMenuBranchId(selectedBranch.id);
    await loadMenu({ branchId: selectedBranch.id });
    setIsOpen(false);
    document.body.style.overflow = "auto";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-card rounded-3xl max-w-md w-full max-h-[100vh] overflow-hidden border border-border shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border shrink-0 bg-card/95 backdrop-blur z-10">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Store className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-center">
                  {activeTab === "delivery" ? "Select Your Location" : "Select Your Branch"}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {activeTab === "delivery"
                  ? "Please select your location."
                  : "Choose a nearby branch for pickup"}
              </p>
            </div>

            <div className="p-6 pb-0 shrink-0">
              <div className="grid grid-cols-2 gap-2 bg-surface rounded-xl p-1 border border-border">
                <button
                  onClick={() => setActiveTab("delivery")}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
                    activeTab === "delivery"
                      ? "bg-gradient-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                  }`}
                >
                  <Truck className="h-4 w-4" />
                  Delivery
                </button>
                <button
                  onClick={() => setActiveTab("pickup")}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
                    activeTab === "pickup"
                      ? "bg-gradient-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                  }`}
                >
                  <Store className="h-4 w-4" />
                  Pickup
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-[350px]">
              <div>
                <label className="text-sm font-semibold block mb-2">Select Nearby Branch</label>
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-surface hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm truncate">
                        {selectedBranch
                          ? `${selectedBranch.name}${selectedBranch.city ? ` · ${selectedBranch.city}` : ""}`
                          : loadingBranches
                            ? "Loading branches..."
                            : "Select a branch"}
                      </span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-20 mt-2 w-full bg-card border border-border rounded-xl shadow-elegant overflow-hidden"
                    >
                      <div className="relative p-2 border-b border-border">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          ref={branchSearchRef}
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search branches..."
                          className="w-full pl-9 pr-8 py-2 rounded-lg bg-surface border border-border focus:outline-none focus:border-primary text-sm transition-colors"
                        />
                        {searchTerm && (
                          <button
                            onClick={() => {
                              setSearchTerm("");
                              branchSearchRef.current?.focus();
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="max-h-40 overflow-y-auto">
                        {filteredBranches.length > 0 ? (
                          filteredBranches.map((branch) => (
                            <button
                              key={branch.id}
                              onClick={() => {
                                setSelectedBranchId(branch.id);
                                setSelectedAreaId("");
                                setIsDropdownOpen(false);
                                setSearchTerm("");
                              }}
                              className="w-full flex items-center justify-between p-2.5 hover:bg-surface/80 transition-colors border-b border-border/50 last:border-0 cursor-pointer"
                            >
                              <div className="flex flex-col items-start text-left">
                                <span className="text-sm font-medium">{branch.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {[branch.address, branch.city].filter(Boolean).join(", ") ||
                                    branch.code}
                                </span>
                              </div>
                              {selectedBranchId === branch.id && (
                                <Check className="h-4 w-4 text-primary shrink-0" />
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            {loadingBranches ? "Loading..." : "No branches available"}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {activeTab === "delivery" && (
                <div className="rounded-xl border border-border overflow-hidden bg-surface/40">
                  <div className="px-3 py-2.5 border-b border-border">
                    <p className="text-[11px] font-semibold tracking-wide uppercase text-muted-foreground">
                      Please select your location
                    </p>
                    <div className="relative mt-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        ref={areaSearchRef}
                        type="text"
                        value={areaSearch}
                        onChange={(e) => setAreaSearch(e.target.value)}
                        placeholder="Search area (A–Z)…"
                        className="w-full pl-9 pr-8 py-2 rounded-lg bg-card border border-border focus:outline-none focus:border-primary text-sm"
                      />
                      {areaSearch && (
                        <button
                          onClick={() => {
                            setAreaSearch("");
                            areaSearchRef.current?.focus();
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-56 overflow-y-auto bg-card">
                    {loadingAreas ? (
                      <p className="p-4 text-center text-sm text-muted-foreground">Loading areas…</p>
                    ) : filteredAreas.length === 0 ? (
                      <p className="p-4 text-center text-sm text-muted-foreground">No areas found</p>
                    ) : (
                      filteredAreas.map((area) => (
                        <button
                          key={area.id}
                          type="button"
                          onClick={() => setSelectedAreaId(area.id)}
                          className={`w-full flex items-center justify-between px-4 py-3 text-left border-b border-border/60 last:border-0 transition-colors cursor-pointer ${
                            selectedAreaId === area.id
                              ? "bg-primary/10 text-foreground"
                              : "hover:bg-muted/60"
                          }`}
                        >
                          <span className="text-sm font-medium">{area.name}</span>
                          {selectedAreaId === area.id ? (
                            <Check className="h-4 w-4 text-primary shrink-0" />
                          ) : null}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {selectedBranch && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20"
                >
                  <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-primary">
                      {selectedBranch.name}
                      {selectedArea ? ` · ${selectedArea.name}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activeTab === "delivery" && selectedArea
                        ? `Delivery to ${selectedArea.name}`
                        : [selectedBranch.address, selectedBranch.city, selectedBranch.hours]
                            .filter(Boolean)
                            .join(" · ") || "Menu for this branch will load after you confirm"}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="p-6 border-t border-border shrink-0 bg-card/95 backdrop-blur">
              <button
                onClick={handleConfirm}
                disabled={!canConfirm}
                className="w-full inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-gradient-primary text-primary-foreground font-medium shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Select
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
