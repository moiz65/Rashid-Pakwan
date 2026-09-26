const BRANCH_ID_KEY = "selectedBranchId";
const LOCATION_KEY = "deliveryLocation";

export type StoredDeliveryLocation = {
  type: "delivery" | "pickup";
  branchId: string;
  branchName: string;
  location?: string;
  areaId?: string;
  areaName?: string;
  areaCharge?: number;
};

export function getStoredBranchId(): string | null {
  if (typeof window === "undefined") return null;
  const direct = localStorage.getItem(BRANCH_ID_KEY);
  if (direct) return direct;
  try {
    const raw = localStorage.getItem(LOCATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDeliveryLocation;
    return parsed?.branchId || null;
  } catch {
    return null;
  }
}

export function getStoredDeliveryLocation(): StoredDeliveryLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCATION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredDeliveryLocation;
  } catch {
    return null;
  }
}

export function saveBranchSelection(selection: StoredDeliveryLocation) {
  localStorage.setItem(BRANCH_ID_KEY, selection.branchId);
  localStorage.setItem(LOCATION_KEY, JSON.stringify(selection));
  window.dispatchEvent(
    new CustomEvent("branch-selected", { detail: selection })
  );
}

export function clearBranchSelection() {
  localStorage.removeItem(BRANCH_ID_KEY);
  localStorage.removeItem(LOCATION_KEY);
}
