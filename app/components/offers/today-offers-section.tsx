// app/components/offers/today-offers-section.tsx
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

export default async function TodayOffersSection() {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/offers?type=today`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    type: string;
    date?: string;
    items: OfferDTO[];
  };

  const items = data.items ?? [];
  if (items.length === 0) return null;

  const formattedDate =
    data.date &&
    new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(data.date));

  return (
    <section
      aria-label="Heutige Angebote"
      className="
        relative overflow-hidden rounded-3xl
        border border-amber-500/30
        bg-gradient-to-br from-amber-50/80 via-white/90 to-emerald-50/70
        p-4 shadow-sm
        dark:border-amber-300/30 dark:from-amber-900/25 dark:via-zinc-900/80 dark:to-emerald-900/40
        sm:p-6
      "
    >
      {/* Deko-Blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-12 h-32 w-32 rounded-full bg-amber-300/25 blur-[60px] dark:bg-amber-400/25"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-emerald-300/20 blur-[60px] dark:bg-emerald-500/20"
      />

      <header className="relative z-10 mb-2 sm:mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-white/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700 backdrop-blur dark:border-amber-300/40 dark:bg-white/5 dark:text-amber-200">
            <span aria-hidden className="inline-block h-3 w-3 rounded-full bg-amber-500/80" />
            Heutige Angebote
          </div>
          <p className="mt-1 text-xs text-zinc-700/80 dark:text-zinc-300/80">
            {formattedDate
              ? `Gültig am ${formattedDate}.`
              : "Gültig am heutigen Tag."}
          </p>
        </div>
        <p className="max-w-xs text-xs text-zinc-600/90 dark:text-zinc-300/90">
          Such dir dein Lieblingsangebot aus und komm spontan vorbei.
        </p>
      </header>

      <div className="relative z-10 mt-7 sm:mt-8">
        <OffersCarousel
          items={items}
          ariaLabel="Heutige Angebote im Überblick"
          context="today"
        />
      </div>
    </section>
  );
}
