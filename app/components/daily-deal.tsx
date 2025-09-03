import { headers } from "next/headers";
import { formatEUR } from "../lib/format";

async function fetchDaily(location?: "RECKE" | "METTINGEN") {
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

  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);

  return (await res.json()) as { items: any[] };
}

export default async function DailyDeal({ location }: { location?: "RECKE" | "METTINGEN" }) {
  const data = await fetchDaily(location);
  const deal = data.items?.[0];

  if (!deal) {
    return (
      <div className="rounded-2xl p-5 ring-1 ring-emerald-600/20 bg-emerald-50/60 dark:bg-emerald-900/10">
        <p className="text-sm opacity-70">Heute gibt es leider keine Tagesangebote.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5 ring-1 ring-emerald-600/20 bg-gradient-to-br from-emerald-50/70 to-emerald-100/40 dark:from-emerald-900/10 dark:to-emerald-800/10">
      <p className="text-xs opacity-70">Heutiges Angebot</p>
      <h3 className="text-xl font-bold">{deal.title}</h3>
      {(deal.description || deal.priceCents != null) && (
        <p className="text-sm">
          {deal.description ?? ""}
          {deal.description && deal.priceCents != null ? " · " : ""}
          {deal.priceCents != null ? (
            <span className="font-semibold">{formatEUR(deal.priceCents / 100)}</span>
          ) : null}
        </p>
      )}
    </div>
  );
}
