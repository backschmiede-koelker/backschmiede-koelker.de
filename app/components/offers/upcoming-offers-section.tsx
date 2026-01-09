// app/components/offers/upcoming-offers-section.tsx
import { headers } from "next/headers";
import OffersCarousel from "./offers-carousel";
import type { OfferDTO } from "../offer-renderer";

async function getBaseUrl() {
  const envBase = process.env.SITE_URL?.replace(/\/+$/, "");
  if (envBase) return envBase;
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export default async function UpcomingOffersSection() {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/offers?type=upcoming`, {
    next: { revalidate: 120 },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { type: string; items: OfferDTO[] };
  const items = data.items ?? [];
  if (items.length === 0) return null;

  return (
    <section
      aria-label="Zukünftige Angebote"
      className="
        mt-6 sm:mt-8
        relative overflow-hidden rounded-3xl
        border border-emerald-700/25
        bg-gradient-to-br from-emerald-50/85 via-white/95 to-amber-50/60
        p-4 shadow-sm
        dark:border-emerald-400/30 dark:from-green-950/60 dark:via-zinc-900/80 dark:to-emerald-900/40
        sm:p-6
      "
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 right-4 h-28 w-28 rounded-full bg-emerald-400/25 blur-[60px] dark:bg-emerald-500/25"
      />

      <header className="relative z-10 mb-2 sm:mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-700/30 bg-white/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 backdrop-blur dark:border-emerald-300/35 dark:bg-white/5 dark:text-emerald-200">
            Bald gültig
          </div>
          <p className="mt-1 text-xs text-zinc-700/80 dark:text-zinc-300/80">
            Angebote zum Vormerken - ideal für deine nächste Bäckerei-Runde.
          </p>
        </div>
      </header>

      <div className="relative z-10 mt-5 sm:mt-6">
        <OffersCarousel
          items={items}
          ariaLabel="Zukünftige Angebote im Überblick"
          context="default"
        />
      </div>
    </section>
  );
}
