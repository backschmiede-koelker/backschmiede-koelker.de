// app/components/daily-deal.tsx
import { headers } from "next/headers";
import OfferRenderer, { type OfferDTO } from "./offer-renderer";

type LocationKey = "RECKE" | "METTINGEN";

async function getBaseUrl() {
  const envBase = process.env.SITE_URL?.replace(/\/+$/, "");
  if (envBase) return envBase;
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export default async function DailyDeal({ location }: { location?: LocationKey }) {
  try {
    const base = await getBaseUrl();
    const qs = new URLSearchParams({ type: "daily" });
    if (location) qs.set("location", location);
    const res = await fetch(`${base}/api/offers?${qs.toString()}`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Failed daily");
    const j = await res.json() as { items: OfferDTO[] };
    const item = j.items?.[0];
    if (!item) {
      return (
        <div className="rounded-2xl p-5 ring-1 ring-emerald-600/20 bg-emerald-50/60 dark:bg-emerald-900/10">
          <p className="text-sm opacity-70">Heute gibt es leider keine Tagesangebote.</p>
        </div>
      );
    }
    return <OfferRenderer item={item} />;
  } catch {
    return (
      <div className="rounded-2xl p-5 ring-1 ring-emerald-600/20 bg-emerald-50/60 dark:bg-emerald-900/10">
        <p className="text-sm opacity-70">Tagesangebot konnte gerade nicht geladen werden.</p>
      </div>
    );
  }
}
