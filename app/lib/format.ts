// /app/lib/format.ts
export const PRICE_RE = /^[0-9]*([,.][0-9]{0,2})?$/;

export function euro(nCents: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(nCents / 100);
}

export function parseEuroToCents(s: string) {
  if (!s) return NaN;
  const norm = s.replace(/\./g, ",");
  if (!PRICE_RE.test(norm)) return NaN;
  const [i, f = ""] = norm.split(",");
  const cents = Number(i || "0") * 100 + Number((f + "00").slice(0, 2));
  return cents;
}

export function centsToEuroString(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",");
}

export function formatEUR(v?: number | null) {
  if (typeof v === "number") {
    return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(v);
  }
  return "";
}
