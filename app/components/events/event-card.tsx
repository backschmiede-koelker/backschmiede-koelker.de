// /app/components/events/event-card.tsx
"use client";

import { fmtDate } from "../../lib/time";

export type EventItem = {
  id: string;
  title: string;
  start: string;
  end?: string;
  location?: string;
  description?: string;
  category?: string;
  priceCents?: number;
  imageUrl?: string;
  registrationUrl?: string;
  seatsLeft?: number;
  isFeatured?: boolean;
};

export default function EventCard({ item }: { item: EventItem }) {
  const price =
    typeof item.priceCents === "number"
      ? new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(item.priceCents / 100)
      : "Kostenlos";

  return (
    <article
      className={[
        "group rounded-xl ring-1 ring-zinc-200 bg-white shadow-sm p-4",
        "dark:bg-zinc-900/60 dark:ring-zinc-700",
        "transition hover:shadow-md"
      ].join(" ")}
    >
      <div className="flex gap-3">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt=""
            className="hidden sm:block aspect-[4/3] w-40 rounded-lg object-cover ring-1 ring-zinc-200 dark:ring-zinc-700"
          />
        ) : (
          <div className="hidden sm:block aspect-[4/3] w-40 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 ring-1 ring-emerald-200/60 dark:ring-emerald-800/60" />
        )}

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {item.title}
            </h3>
            {item.category && (
              <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-800">
                {item.category}
              </span>
            )}
          </div>

          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            {fmtDate(item.start, { weekday: "long", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
            {item.end && ` – ${fmtDate(item.end, { hour: "2-digit", minute: "2-digit" })}`}
          </p>

          {item.location && (
            <p className="text-sm text-zinc-700 dark:text-zinc-300">📍 {item.location}</p>
          )}

          {item.description && (
            <p className="text-sm text-zinc-700/90 dark:text-zinc-300/90 line-clamp-3">
              {item.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{price}</span>
            {typeof item.seatsLeft === "number" && (
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                {item.seatsLeft > 0 ? `${item.seatsLeft} Plätze frei` : "Ausgebucht"}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <a
              href={item.registrationUrl || "#rsvp"}
              className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 transition"
            >
              Jetzt anmelden
            </a>
            <a
              href="/api/ics"
              className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium bg-emerald-50 text-emerald-900 hover:bg-emerald-100 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-100 dark:hover:bg-emerald-900/60 dark:ring-emerald-800 transition"
            >
              Zum Kalender
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
