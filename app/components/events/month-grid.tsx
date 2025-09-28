// /app/components/events/month-grid.tsx
"use client";

import { useMemo } from "react";
import { useEvents } from "../../lib/use-events";
import { fmtDate } from "../../lib/time";

export default function MonthGrid() {
  const { events } = useEvents();

  // sehr einfache Monats-Gruppierung
  const byMonth = useMemo(() => {
    const map = new Map<string, typeof events>();
    for (const e of events) {
      const d = new Date(e.start);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, [...(map.get(key) || []), e]);
    }
    return Array.from(map.entries()).sort(([a], [b]) => (a < b ? -1 : 1));
  }, [events]);

  return (
    <div className="space-y-6">
      {byMonth.map(([key, list]) => {
        const [y, m] = key.split("-");
        const monthName = fmtDate(`${y}-${m}-01`, { month: "long", year: "numeric" });

        return (
          <section key={key} className="rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-700 bg-white dark:bg-zinc-900/60 p-4">
            <h3 className="text-lg font-semibold mb-3 text-emerald-700 dark:text-emerald-300">{monthName}</h3>
            <ul className="grid xs:grid-cols-2 md:grid-cols-3 gap-3">
              {list.map((e) => (
                <li key={e.id} className="rounded-lg px-3 py-2 ring-1 ring-zinc-200 dark:ring-zinc-700 bg-zinc-50 dark:bg-zinc-800/60">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1">{e.title}</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {fmtDate(e.start, { weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
