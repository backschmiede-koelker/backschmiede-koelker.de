// /app/components/events/timeline.tsx
"use client";

import { useEvents } from "../../lib/use-events";
import { fmtDate } from "../../lib/time";

export default function Timeline() {
  const { events } = useEvents();
  const sorted = [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return (
    <ol className="relative border-s border-zinc-200 dark:border-zinc-700 pl-4 md:pl-6">
      {sorted.map((e, idx) => (
        <li key={e.id} className="mb-6 ms-2">
          <span className={[
            "absolute -start-1 size-2.5 rounded-full border",
            "bg-emerald-500 border-emerald-600",
            "dark:bg-emerald-600 dark:border-emerald-700",
          ].join(" ")} />
          <h4 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">{e.title}</h4>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            {fmtDate(e.start, { weekday: "long", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
            {e.end && ` – ${fmtDate(e.end, { hour: "2-digit", minute: "2-digit" })}`}
            {e.location && ` • ${e.location}`}
          </p>
        </li>
      ))}
    </ol>
  );
}
