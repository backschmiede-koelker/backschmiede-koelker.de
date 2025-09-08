// app/components/weekly-deals.tsx
import { headers } from "next/headers";
import OfferRenderer, { type OfferDTO } from "./offer-renderer";

async function getBaseUrl() {
  const envBase = process.env.SITE_URL?.replace(/\/+$/, "");
  if (envBase) return envBase;
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

function rangeLabel(fromISO: string, toISO: string) {
  const from = new Date(fromISO), to = new Date(toISO);
  const f = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit" }).format(from);
  const t = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(to);
  return `${f} - ${t}`;
}

export default async function WeeklyDeals() {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/offers?type=weekly`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed weekly");
  const data = await res.json() as { from: string; to: string; items: OfferDTO[] };

  if (!data || data.items.length === 0) {
    return (
      <section className="relative rounded-3xl p-6 ring-1 ring-amber-500/25 bg-gradient-to-br from-amber-50/70 to-amber-100/40 dark:from-amber-900/10 dark:to-amber-800/10">
        <header className="mb-2">
          <h3 className="text-2xl font-semibold leading-tight">Angebote dieser Woche</h3>
          <p className="text-xs opacity-70">Gültig {rangeLabel(data?.from ?? "", data?.to ?? "")}</p>
        </header>
        <div className="rounded-xl border bg-white/70 dark:bg-zinc-900/60 p-5 text-sm shadow-sm">
          Diese Woche sind gerade keine Angebote eingetragen.
        </div>
      </section>
    );
  }

  return (
    <section className="relative rounded-3xl p-6 md:p-7 ring-1 ring-amber-500/25 bg-gradient-to-br from-amber-50/70 to-amber-100/40 dark:from-amber-900/10 dark:to-amber-800/10">
      <header className="mb-4">
        <h3 className="text-2xl font-semibold leading-tight">Angebote dieser Woche</h3>
        <p className="text-xs opacity-70">Gültig {rangeLabel(data.from, data.to)}</p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((it) => (
          <li key={it.id}>
            <OfferRenderer item={it} />
          </li>
        ))}
      </ul>
    </section>
  );
}
