import { headers } from "next/headers";
import { euro } from "../lib/format";

type LocationKey = "RECKE" | "METTINGEN";

async function fetchDaily(location?: LocationKey) {
  const h = (await headers()) as unknown as Headers;

  const host =
    h.get("x-forwarded-host") ??
    h.get("host") ??
    process.env.VERCEL_URL ??
    "192.168.178.163:3000";

  const proto = h.get("x-forwarded-proto") ?? (process.env.VERCEL_URL ? "https" : "http");

  const qs = new URLSearchParams({ type: "daily" });
  if (location) qs.set("location", location);

  const url = `${proto}://${host}/api/offers?${qs.toString()}`;

  const res = await fetch(url, { next: { revalidate: 60, tags: ["offers"] } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);

  return (await res.json()) as { items: Array<{
    id: string;
    title: string;
    description?: string | null;
    priceCents?: number | null;
    unit?: string | null;
  }> };
}

export default async function DailyDeal({ location }: { location?: LocationKey }) {
  try {
    const data = await fetchDaily(location);
    const deal = data.items?.[0];

    if (!deal) {
      return (
        <div className="rounded-2xl p-5 ring-1 ring-emerald-600/20 bg-emerald-50/60 dark:bg-emerald-900/10">
          <p className="text-sm opacity-70">Heute gibt es leider keine Tagesangebote.</p>
        </div>
      );
    }

    const hasPrice = typeof deal.priceCents === "number";
    const unit = (deal.unit || "").trim();

    return (
      <div className="rounded-2xl p-5 ring-1 ring-emerald-600/20 bg-gradient-to-br from-emerald-50/70 to-emerald-100/40 dark:from-emerald-900/10 dark:to-emerald-800/10">
        <p className="text-xs opacity-70">Heutiges Angebot</p>
        <h3 className="text-xl font-bold">{deal.title}</h3>

        {(deal.description || hasPrice) && (
          <p className="mt-0.5 text-sm">
            {deal.description ?? ""}
            {deal.description && hasPrice ? " · " : ""}
            {hasPrice ? (
              <span className="font-semibold">
                {euro(deal.priceCents!)}
                {unit ? ` / ${unit}` : ""}
              </span>
            ) : null}
          </p>
        )}
      </div>
    );
  } catch {
    // Fallback bei Netzwerk-/API-Fehlern (keine harte 500 in der UI)
    return (
      <div className="rounded-2xl p-5 ring-1 ring-emerald-600/20 bg-emerald-50/60 dark:bg-emerald-900/10">
        <p className="text-sm opacity-70">Tagesangebot konnte gerade nicht geladen werden.</p>
      </div>
    );
  }
}
