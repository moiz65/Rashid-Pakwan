import type { MenuDrink } from "@/lib/api";

export type DealDrinkItem = {
  id?: string;
  itemType?: "product" | "drink" | "addon";
  name?: string;
  qty?: number;
  customerChoice?: boolean;
  choiceIds?: string[];
};

export type DrinkChoiceSlot = {
  key: string;
  item: DealDrinkItem;
  slotIndex: number;
  total: number;
  label: string;
};

/** One picker per included drink when customer chooses (qty 2 = two pickers). */
export function buildDrinkChoiceSlots(items: DealDrinkItem[] = []): DrinkChoiceSlot[] {
  const slots: DrinkChoiceSlot[] = [];
  for (const item of items) {
    if (item.itemType !== "drink" || !item.customerChoice) continue;
    const total = Math.max(1, Number(item.qty) || 1);
    for (let i = 0; i < total; i++) {
      const key = `${item.id || item.name || "drink"}-${i}`;
      slots.push({
        key,
        item,
        slotIndex: i,
        total,
        label: total > 1 ? `Drink ${i + 1} of ${total}` : "Choose your drink",
      });
    }
  }
  return slots;
}

export function drinksForDealSlot(item: DealDrinkItem, menuDrinks: MenuDrink[]) {
  const active = menuDrinks.filter((d) => d.status !== "inactive");
  const allowed = Array.isArray(item.choiceIds) ? item.choiceIds.filter(Boolean) : [];
  if (!allowed.length) return active;
  return active.filter((d) => allowed.includes(d.id));
}
