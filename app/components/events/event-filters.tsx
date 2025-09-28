// /app/components/events/event-filters.tsx
"use client";

import { useState } from "react";
import { InViewReveal } from "../../components/animations";

export default function EventFilters() {
  const [onlyFree, setOnlyFree] = useState(false);
  const [weekendOnly, setWeekendOnly] = useState(false);

  return (
    <InViewReveal as="section" className="rounded-xl ring-1 ring-zinc-200 bg-white dark:bg-zinc-900/60 dark:ring-zinc-700 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
          <input
            type="checkbox"
            checked={onlyFree}
            onChange={(e) => setOnlyFree(e.target.checked)}
            className="size-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-400 dark:border-zinc-600 dark:bg-zinc-800"
          />
          Nur kostenlose Events
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
          <input
            type="checkbox"
            checked={weekendOnly}
            onChange={(e) => setWeekendOnly(e.target.checked)}
            className="size-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-400 dark:border-zinc-600 dark:bg-zinc-800"
          />
          Nur am Wochenende
        </label>
        <p className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">
          Öffnungszeiten & Sondertage kommen automatisch via Google Places.
        </p>
      </div>
    </InViewReveal>
  );
}
