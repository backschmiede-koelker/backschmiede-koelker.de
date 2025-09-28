// /app/components/events/event-list.tsx
"use client";

import { useMemo, useState } from "react";
import { InViewReveal, StaggerContainer, StaggerItem } from "../../components/animations";
import SelectBox from "../../components/select-box";
import EventCard, { EventItem } from "./event-card";
import { useEvents } from "../../lib/use-events";

export default function EventList() {
  const { events, isLoading } = useEvents(); // heute Dummy, später API
  const [category, setCategory] = useState<string>("");
  const [query, setQuery] = useState("");

  const categories = useMemo(() => {
    const all = new Set(events.map(e => e.category).filter(Boolean) as string[]);
    return ["Alle", ...Array.from(all)];
  }, [events]);

  const filtered = useMemo(() => {
    let list = [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    if (category && category !== "Alle") list = list.filter(e => e.category === category);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(e =>
        [e.title, e.description, e.location].filter(Boolean).some(x => x!.toLowerCase().includes(q))
      );
    }
    return list;
  }, [events, category, query]);

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 sm:h-32 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <div className="sm:w-48">
          <SelectBox
            ariaLabel="Kategorie wählen"
            value={category || "Alle"}
            onChange={(v) => setCategory(v === "Alle" ? "" : v)}
            options={categories}
          />
        </div>
        <div className="flex-1">
          <input
            type="text"
            inputMode="search"
            placeholder="Suche nach Titel, Ort, Beschreibung…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={[
              "w-full rounded-md px-3 py-2 ring-1 transition",
              "bg-white ring-zinc-300 placeholder:text-zinc-400 shadow-sm",
              "focus:ring-emerald-400 focus:outline-none",
              "dark:bg-zinc-900/60 dark:ring-zinc-700 dark:placeholder:text-zinc-500"
            ].join(" ")}
          />
        </div>
      </div>

      <StaggerContainer className="grid gap-3 sm:gap-4">
        {filtered.map((e: EventItem) => (
          <StaggerItem key={e.id}>
            <EventCard item={e} />
          </StaggerItem>
        ))}
        {filtered.length === 0 && (
          <InViewReveal className="rounded-xl p-6 text-sm text-zinc-600 dark:text-zinc-400 ring-1 ring-zinc-200 dark:ring-zinc-700 bg-white dark:bg-zinc-900/60">
            Keine passenden Termine gefunden.
          </InViewReveal>
        )}
      </StaggerContainer>
    </div>
  );
}
