import { resolveMediaUrl, type MenuDrink } from "@/lib/api";

type DrinkChoicePickerProps = {
  label: string;
  hint?: string;
  value: string;
  options: MenuDrink[];
  onChange: (drinkId: string) => void;
  required?: boolean;
};

/** Included drink — customer picks one from available options (no extra charge). */
export function DrinkChoicePicker({
  label,
  hint = "Included with your meal — pick any available drink below.",
  value,
  options,
  onChange,
  required = true,
}: DrinkChoicePickerProps) {
  const selected = options.find((d) => d.id === value) || null;

  return (
    <div className="rounded-xl border border-primary/40 bg-primary/5 p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
        </div>
        <span className="text-[10px] uppercase tracking-wide text-primary shrink-0 font-semibold">
          Included
        </span>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
      >
        <option value="">Select a drink…</option>
        {options.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>
      {selected?.image ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <img
            src={resolveMediaUrl(selected.image)}
            alt=""
            className="h-8 w-8 rounded-lg object-cover"
          />
          {selected.name}
        </div>
      ) : null}
    </div>
  );
}
