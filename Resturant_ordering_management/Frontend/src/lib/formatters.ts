/**
 * Round for display: decimal part > 0.5 → up, otherwise → down.
 * e.g. 41.65 → 42, 679.15 → 679, 10.5 → 10
 */
export function roundPrice(amount: number | string | null | undefined): number {
  const n = Number(amount) || 0;
  const sign = n < 0 ? -1 : 1;
  const abs = Math.abs(n);
  const whole = Math.floor(abs);
  const fraction = abs - whole;
  return sign * (fraction > 0.5 ? whole + 1 : whole);
}

/**
 * Formats a currency amount cleanly as a whole rupee amount.
 */
export function formatPrice(amount: number | string | null | undefined, currency = "Rs "): string {
  return `${currency}${formatAmount(amount)}`;
}

/**
 * Formats a numeric amount without currency prefix (whole rupees after rounding).
 */
export function formatAmount(amount: number | string | null | undefined): string {
  const n = roundPrice(amount);
  return n.toLocaleString("en-PK", { maximumFractionDigits: 0 });
}
